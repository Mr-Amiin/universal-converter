#!/usr/bin/env python3
"""
validate_sitemaps.py - verifies the generated sitemap index + sitemap files.

Run it against the directory that is actually published (default: the
repository root, which is what GitHub Pages serves when it publishes the root):

    python3 validate_sitemaps.py
    python3 validate_sitemaps.py --site-dir dist --source-dir .    # a build-based flow

Checks (each failure makes the exit code 1):

  1. sitemap.xml is a valid sitemap index (<sitemapindex>, only <sitemap>
     children, UTF-8, well-formed, within Google's limits).
  2. Every sitemap referenced by the index exists in the site directory, and
     no stray sitemap-NNNN.xml file is left unreferenced.
  3. Every sitemap has <= 10,000 URLs and never exceeds Google's hard limits
     of 50,000 URLs / 50 MB (52,428,800 bytes) uncompressed.
  4. Every URL is absolute, https, on the canonical host, free of
     whitespace/fragments/non-ASCII, and correctly XML-escaped.
  5. No URL appears twice (within a file or across files).
  6. The listed URLs equal the eligible inventory re-derived from the HTML
     pages in the site directory (nothing missing, nothing extra).
  7. Optional --baseline: every URL of an earlier sitemap (a single urlset or
     an index) is still listed - proves no existing page was lost.
  8. Deployment output: robots.txt points at the sitemap index, and no
     _redirects/_headers rule shadows or noindexes the sitemap files.
  9. Optional --source-dir: every HTML page of the source tree is present in
     the site directory (the build did not drop pages).
 10. Every listed URL is backed by exactly one page whose own canonical tag is
     that same URL (with --require-canonical the tag must be explicit), so no
     sitemap entry points at a URL that is not the page's canonical.
 11. Every excluded page has a documented reason, and every duplicate/alias
     (canonical elsewhere) points at a URL that is itself listed.
 12. Counts reconcile: HTML pages - excluded pages == URLs listed.
 13. (only with --honor-redirects, for hosts that apply _redirects) _redirects
     is safe: no loops or chains, every target exists, and no listed URL is one
     that a redirect would actually fire for.
 14. Retired URLs (--retired-urls) are not listed in the sitemaps and have no
     page of their own, so the baseline comparison can't be satisfied by a URL
     that is quietly still live.

_redirects is NOT treated as evidence that a URL still works unless
--honor-redirects is given: GitHub Pages does not apply it.
"""

import argparse
import datetime
import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlsplit

import generate_sitemaps as gs

NS = "{" + gs.SITEMAP_NS + "}"
BARE_AMP_RE = re.compile(r"&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)")
BAD_URL_CHARS_RE = re.compile(r"[\s<>\"'\\^`{|}\x00-\x1f\x7f]")
SITEMAP_RULE_RE = re.compile(r"^/sitemap[^\s]*", re.I)


class Report:
    def __init__(self):
        self.failures = []
        self.warnings = []
        self.metrics = {}

    def fail(self, check, message):
        self.failures.append(f"[{check}] {message}")

    def warn(self, check, message):
        self.warnings.append(f"[{check}] {message}")


def _url_problem(url, base_url):
    if not url:
        return "empty URL"
    if len(url) > 2048:
        return "URL longer than 2,048 characters"
    if BAD_URL_CHARS_RE.search(url):
        return "contains whitespace/control/unsafe characters"
    try:
        url.encode("ascii")
    except UnicodeEncodeError:
        return "contains non-ASCII characters (must be percent-encoded)"
    parts = urlsplit(url)
    if parts.scheme != "https":
        return "not an absolute https URL"
    if parts.netloc != urlsplit(base_url).netloc:
        return f"host {parts.netloc!r} is not the canonical host"
    if parts.fragment:
        return "contains a fragment"
    return None


def parse_index(path: Path, report: Report, max_index_entries=gs.GOOGLE_MAX_SITEMAPS_IN_INDEX):
    """Return the list of <loc> strings in the index, or None on failure."""
    if not path.is_file():
        report.fail("1-index", f"{path.name} is missing")
        return None
    raw = path.read_bytes()
    if len(raw) > gs.GOOGLE_MAX_BYTES:
        report.fail("1-index", f"{path.name} is {len(raw):,} bytes (limit {gs.GOOGLE_MAX_BYTES:,})")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        report.fail("1-index", f"{path.name} is not valid UTF-8: {exc}")
        return None
    if not text.lstrip("\ufeff").startswith("<?xml"):
        report.fail("1-index", "missing XML declaration")
    elif "encoding" in text[:100].lower() and "utf-8" not in text[:100].lower():
        report.fail("1-index", "XML declaration is not UTF-8")
    if BARE_AMP_RE.search(text):
        report.fail("4-escaping", f"{path.name} contains an unescaped '&'")
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        report.fail("1-index", f"{path.name} is not well-formed XML: {exc}")
        return None
    if root.tag != NS + "sitemapindex":
        report.fail("1-index", f"root element is {root.tag!r}, expected a <sitemapindex> in the sitemap namespace")
        return None
    locs = []
    for child in root:
        if child.tag != NS + "sitemap":
            report.fail("1-index", f"unexpected element {child.tag!r} in the index (an index must not list page URLs)")
            continue
        loc = child.find(NS + "loc")
        if loc is None or not (loc.text or "").strip():
            report.fail("1-index", "a <sitemap> entry has no <loc>")
            continue
        locs.append(loc.text.strip())
    if not locs:
        report.fail("1-index", "the index lists no sitemaps")
    if len(locs) > max_index_entries:
        report.fail("1-index", f"{len(locs):,} entries (limit {max_index_entries:,})")
    return locs


def parse_part(path: Path, report: Report, base_url, max_urls):
    """Return (urls, size_bytes) for one sitemap file."""
    name = path.name
    raw = path.read_bytes()
    size = len(raw)
    if size > gs.GOOGLE_MAX_BYTES:
        report.fail("3-limits", f"{name} is {size:,} bytes uncompressed (Google limit {gs.GOOGLE_MAX_BYTES:,})")
    try:
        text = raw.decode("utf-8")
    except UnicodeDecodeError as exc:
        report.fail("1-index", f"{name} is not valid UTF-8: {exc}")
        return [], size
    if BARE_AMP_RE.search(text):
        report.fail("4-escaping", f"{name} contains an unescaped '&'")
    try:
        root = ET.fromstring(raw)
    except ET.ParseError as exc:
        report.fail("1-index", f"{name} is not well-formed XML: {exc}")
        return [], size
    if root.tag != NS + "urlset":
        report.fail("1-index", f"{name}: root element is {root.tag!r}, expected <urlset>")
        return [], size
    urls = []
    problems = 0
    for entry in root:
        if entry.tag != NS + "url":
            report.fail("1-index", f"{name}: unexpected element {entry.tag!r}")
            continue
        locs = entry.findall(NS + "loc")
        if len(locs) != 1 or not (locs[0].text or "").strip():
            report.fail("4-urls", f"{name}: a <url> entry must contain exactly one non-empty <loc>")
            continue
        url = locs[0].text.strip()
        urls.append(url)
        problem = _url_problem(url, base_url)
        if problem and problems < 10:
            report.fail("4-urls", f"{name}: {url!r}: {problem}")
        if problem:
            problems += 1
        lm = entry.find(NS + "lastmod")
        if lm is not None:
            value = (lm.text or "").strip()
            try:
                if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value) or datetime.date.fromisoformat(value) > datetime.date.today():
                    raise ValueError
            except ValueError:
                report.fail("4-urls", f"{name}: {url}: invalid or future <lastmod> {value!r}")
    if problems > 10:
        report.fail("4-urls", f"{name}: {problems:,} URLs failed the URL checks in total")
    if len(urls) > gs.GOOGLE_MAX_URLS:
        report.fail("3-limits", f"{name} has {len(urls):,} URLs (Google hard limit {gs.GOOGLE_MAX_URLS:,})")
    if len(urls) > max_urls:
        report.fail("3-limits", f"{name} has {len(urls):,} URLs (project limit {max_urls:,})")
    return urls, size


def check_deployment_files(site_dir: Path, report: Report, base_url):
    robots = site_dir / "robots.txt"
    expected = f"Sitemap: {base_url}/{gs.INDEX_NAME}"
    if not robots.is_file():
        report.fail("8-deploy", "robots.txt is missing from the site directory")
    else:
        lines = [l.strip() for l in robots.read_text(encoding="utf-8", errors="replace").splitlines()]
        sitemap_lines = [l for l in lines if l.lower().startswith("sitemap:")]
        if expected not in sitemap_lines:
            report.fail("8-deploy", f"robots.txt does not contain {expected!r}")
        others = [l for l in sitemap_lines if l != expected]
        if others:
            report.warn("8-deploy", f"robots.txt has additional Sitemap lines: {others}")
    redirects = site_dir / "_redirects"
    if redirects.is_file():
        for n, line in enumerate(redirects.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if SITEMAP_RULE_RE.match(line):
                report.fail("8-deploy", f"_redirects line {n} touches a sitemap path: {line!r}")
            fields = line.split()
            if len(fields) >= 2 and fields[0] in ("/*", "/sitemap*") and re.search(r"\b30[0-9]!?\b", line):
                report.warn("8-deploy", f"_redirects line {n} is a broad redirect that could apply to sitemap files: {line!r}")
    headers = site_dir / "_headers"
    if headers.is_file():
        current = None
        for line in headers.read_text(encoding="utf-8", errors="replace").splitlines():
            if line and not line[0].isspace() and not line.startswith("#"):
                current = line.strip()
            elif current and re.match(r"^/(sitemap|\*\.xml)", current) and "x-robots-tag" in line.lower() and "noindex" in line.lower():
                report.fail("8-deploy", f"_headers sets noindex for {current}")


def check_redirects(site_dir: Path, listed_paths, report: Report, base_url, index: "gs.RedirectIndex"):
    """Check 13: loops, chains, missing targets, and listed URLs that would redirect."""
    host = urlsplit(base_url).netloc
    problems = 0
    for rule in index.rules:
        if not (rule.is_redirect or rule.status == 200):
            continue
        target = rule.target
        if target.startswith("http"):
            parts = urlsplit(target)
            if parts.netloc != host:
                continue                      # external destination
            target = parts.path or "/"
        target = target.split("?")[0].split("#")[0]
        if ":" in target or "*" in target or not target.startswith("/"):
            continue                          # placeholder / relative targets are not modelled
        backed = gs.path_is_file_backed(site_dir, target)
        nxt = index.match(target)
        if nxt is rule and not backed:
            report.fail("13-redirects", f"_redirects line {rule.line}: {rule.source} -> {rule.target} is a redirect loop")
        elif nxt is not None and nxt is not rule and (nxt.is_redirect or nxt.status == 200) and not backed:
            report.fail("13-redirects", f"_redirects line {rule.line}: {rule.source} -> {rule.target} is a chain "
                                         f"(the target is itself redirected by line {nxt.line})")
        elif not backed and not (nxt is not None and nxt.status == 200):
            report.fail("13-redirects", f"_redirects line {rule.line}: target {rule.target} does not exist in {site_dir}")
    for path in listed_paths:
        rule = index.match(path)
        if rule is None or not rule.is_redirect:
            continue
        if rule.force or not gs.path_is_file_backed(site_dir, path):
            problems += 1
            if problems <= 10:
                report.fail("13-redirects", f"listed URL {path} would be redirected by _redirects line {rule.line} "
                                             f"({rule.source} -> {rule.target})")
    if problems > 10:
        report.fail("13-redirects", f"{problems:,} listed URLs would be redirected in total")


def validate(site_dir, source_dir=None, baseline=None, max_urls=gs.DEFAULT_MAX_URLS,
             base_url=gs.BASE_URL, coverage=True, orphan_policy="fail", workers=None,
             require_canonical=False, honor_redirects=False, retired_urls=None):
    site_dir = Path(site_dir)
    report = Report()
    index_path = site_dir / gs.INDEX_NAME

    # 1 + 2
    locs = parse_index(index_path, report)
    all_urls = []
    part_stats = []
    if locs is not None:
        referenced = set()
        for loc in locs:
            problem = _url_problem(loc, base_url)
            if problem:
                report.fail("1-index", f"index entry {loc!r}: {problem}")
                continue
            rel = urlsplit(loc).path.lstrip("/")
            if not gs.PART_NAME_RE.match(rel):
                report.fail("1-index", f"index entry {loc!r} does not look like /sitemap-NNNN.xml")
                continue
            if rel in referenced:
                report.fail("1-index", f"index lists {rel} more than once")
                continue
            referenced.add(rel)
            part = site_dir / rel
            if not part.is_file():
                report.fail("2-exist", f"{rel} is referenced by the index but missing from {site_dir}")
                continue
            urls, size = parse_part(part, report, base_url, max_urls)
            part_stats.append((rel, len(urls), size))
            all_urls.extend(urls)
        for stray in sorted(p.name for p in site_dir.iterdir() if p.is_file() and gs.PART_NAME_RE.match(p.name)):
            if stray not in referenced:
                report.fail("2-exist", f"{stray} exists but is not referenced by the sitemap index")

    redirect_index = gs.RedirectIndex(gs.load_redirects(site_dir) if honor_redirects else [])
    retired = set(retired_urls or ())

    # 5
    seen, dups = set(), []
    for u in all_urls:
        if u in seen:
            dups.append(u)
        seen.add(u)
    if dups:
        report.fail("5-duplicates", f"{len(dups):,} duplicate URL(s), e.g. {dups[:3]}")

    # 6 + 10 + 11 + 12
    expected = None
    inv = None
    if coverage:
        try:
            inv = gs.collect_inventory(site_dir, orphan_policy, workers, base_url)
        except gs.SitemapError as exc:
            report.fail("6-coverage", str(exc))
    if inv is not None:
        expected = set(inv.urls)
        missing = sorted(expected - seen)
        extra = sorted(seen - expected)
        if missing:
            report.fail("6-coverage", f"{len(missing):,} eligible URL(s) are missing from the sitemaps, e.g. {missing[:3]}")
        if extra:
            report.fail("6-coverage", f"{len(extra):,} sitemap URL(s) are not eligible, e.g. {extra[:3]}")

        # 10: each listed URL is the self-canonical URL of a real page
        no_source = sorted(u for u in seen if u not in inv.sources and u not in inv.orphans)
        if no_source:
            report.fail("10-canonical", f"{len(no_source):,} listed URL(s) have no page whose canonical is that URL, e.g. {no_source[:3]}")
        listed_orphans = sorted(u for u in seen if u in inv.orphans)
        if listed_orphans:
            report.fail("10-canonical", f"{len(listed_orphans):,} listed URL(s) are canonical targets with no page, "
                                         f"e.g. {listed_orphans[:3]} (they would 404)")
        implicit = sorted(u for u in seen if u in inv.sources and not inv.sources[u][1])
        if implicit and require_canonical:
            report.fail("10-canonical", f"{len(implicit):,} listed page(s) have no explicit canonical tag, e.g. {[inv.sources[u][0] for u in implicit[:3]]}")
        report.metrics["listed_with_explicit_canonical"] = sum(1 for u in seen if u in inv.sources and inv.sources[u][1])

        # 11: every exclusion is documented and every alias points at a listed URL
        undocumented = [(r, why) for r, why, _d in inv.excluded if why not in gs.EXCLUSION_REASONS]
        if undocumented:
            report.fail("11-exclusions", f"{len(undocumented):,} excluded page(s) have no documented reason, e.g. {undocumented[:3]}")
        dangling = sorted((r, d) for r, why, d in inv.excluded if why == "canonical-elsewhere" and d not in seen)
        if dangling:
            report.fail("11-exclusions", f"{len(dangling):,} duplicate page(s) declare a canonical URL that is not in the sitemap, e.g. {dangling[:3]}")
        leaked = sorted(gs.file_url(r, base_url) for r, _w, _d in inv.excluded if gs.file_url(r, base_url) in seen)
        if leaked:
            report.fail("11-exclusions", f"{len(leaked):,} excluded page URL(s) are listed in the sitemaps, e.g. {leaked[:3]}")

        # 12: counts reconcile
        files_n, excluded_n, orphans_n, urls_n = inv.reconciliation()
        if files_n - excluded_n + orphans_n != len(seen):
            report.fail("12-reconcile", f"{files_n:,} HTML pages - {excluded_n:,} excluded + {orphans_n:,} orphan canonicals = "
                                         f"{files_n - excluded_n + orphans_n:,}, but the sitemaps list {len(seen):,} URLs")
        report.metrics.update(
            html_files_scanned=inv.html_files,
            eligible_urls=len(expected),
            excluded_files=len(inv.excluded),
            excluded_by_reason=inv.excluded_by_reason(),
            orphan_canonicals=len(inv.orphans),
        )
        if inv.orphans:
            report.warn("6-coverage", f"{len(inv.orphans)} canonical URL(s) have no matching file in {site_dir} "
                                       f"(e.g. {sorted(inv.orphans)[0]}); policy={orphan_policy!r}")
    if baseline:
        base_urls = gs.read_sitemap_urls(Path(baseline))
        if not base_urls:
            report.fail("7-baseline", f"no URLs could be read from baseline directory {baseline}")
        else:
            lost, redirected, retired_n = [], 0, 0
            for u in sorted(base_urls - seen):
                if u in retired:
                    retired_n += 1
                    continue
                path = urlsplit(u).path or "/"
                rule = redirect_index.match(path)
                if rule is not None and rule.is_redirect and not gs.path_is_file_backed(site_dir, path):
                    target = rule.target if rule.target.startswith("http") else base_url + rule.target
                    if target in seen:
                        redirected += 1
                        continue
                lost.append(u)
            report.metrics["baseline_urls"] = len(base_urls)
            report.metrics["baseline_retired_documented"] = retired_n
            if honor_redirects:
                report.metrics["baseline_redirected_to_listed_url"] = redirected
            if lost:
                report.fail("7-baseline", f"{len(lost):,} URL(s) from the baseline sitemap are neither listed, documented as retired"
                                          f"{', nor 301-redirected to a listed URL' if honor_redirects else ''}, e.g. {lost[:3]}")

    # 8 + 13
    check_deployment_files(site_dir, report, base_url)
    if honor_redirects:
        check_redirects(site_dir, [urlsplit(u).path or "/" for u in seen], report, base_url, redirect_index)
        report.metrics["redirect_rules"] = len(redirect_index.rules)
    elif (site_dir / "_redirects").is_file():
        report.warn("13-redirects", "_redirects is present but is not treated as active (redirects are only honoured with "
                                    "--honor-redirects); it has no effect on a host that ignores it, e.g. GitHub Pages")
    if retired:
        listed_retired = sorted(retired & seen)
        if listed_retired:
            report.fail("14-retired", f"{len(listed_retired):,} retired URL(s) are listed in the sitemaps, e.g. {listed_retired[:3]}")
        live = sorted(u for u in retired if gs.path_is_file_backed(site_dir, urlsplit(u).path or "/"))
        if live:
            report.fail("14-retired", f"{len(live):,} retired URL(s) now have a page of their own, e.g. {live[:3]}; "
                                       f"remove them from the retired list and let the sitemap list them")
        report.metrics["retired_urls"] = len(retired)

    # 9
    if source_dir and Path(source_dir).resolve() != site_dir.resolve():
        src = set(gs.list_html_files(Path(source_dir)))
        dst = set(gs.list_html_files(site_dir))
        lost_pages = sorted(src - dst)
        if lost_pages:
            report.fail("9-pages", f"{len(lost_pages):,} HTML page(s) of the source tree are missing from {site_dir}, e.g. {lost_pages[:3]}")
        report.metrics["source_html_files"] = len(src)
        report.metrics["site_html_files"] = len(dst)

    report.metrics.update(
        urls_included=len(all_urls),
        unique_urls=len(seen),
        sitemap_files=len(part_stats),
        largest_sitemap_bytes=max((s for _n, _c, s in part_stats), default=0),
        largest_sitemap_urls=max((c for _n, c, _s in part_stats), default=0),
    )
    return report


def main(argv=None):
    p = argparse.ArgumentParser(description="Validate sitemap.xml (index) and sitemap-NNNN.xml files.")
    p.add_argument("--site-dir", default=str(Path(__file__).resolve().parent),
                   help="published directory to validate (default: the repository root)")
    p.add_argument("--source-dir", default=None, help="source tree, to confirm no page was dropped from the site dir")
    p.add_argument("--baseline", default=None, help="directory holding an earlier sitemap.xml whose URLs must all still be listed")
    p.add_argument("--max-urls", type=int, default=gs.DEFAULT_MAX_URLS)
    p.add_argument("--orphan-canonicals", choices=("fail", "include", "exclude"), default="fail")
    p.add_argument("--require-canonical", action="store_true", help="every listed page must carry an explicit canonical tag")
    p.add_argument("--retired-urls", default=None,
                   help="file of URLs deliberately removed from the sitemap (default: TOOLING/sitemap-retired-urls.txt if present)")
    p.add_argument("--honor-redirects", action="store_true",
                   help="treat _redirects as active (only for hosts that apply it; GitHub Pages does not)")
    p.add_argument("--skip-coverage", action="store_true", help="skip the (slow) re-scan of the site's HTML pages")
    p.add_argument("--workers", type=int, default=None)
    p.add_argument("--json", default=None, help="write the result as JSON")
    args = p.parse_args(argv)

    retired_path = Path(args.retired_urls) if args.retired_urls else (gs.DEFAULT_RETIRED_FILE if gs.DEFAULT_RETIRED_FILE.is_file() else None)
    try:
        retired_urls = gs.read_retired_urls(retired_path)
    except gs.SitemapError as exc:
        print(f"FAILED - {exc}", file=sys.stderr)
        return 1
    report = validate(args.site_dir, args.source_dir, args.baseline, args.max_urls,
                      coverage=not args.skip_coverage, orphan_policy=args.orphan_canonicals, workers=args.workers,
                      require_canonical=args.require_canonical, honor_redirects=args.honor_redirects,
                      retired_urls=retired_urls)
    m = report.metrics
    print("Sitemap validation")
    for key in ("html_files_scanned", "eligible_urls", "urls_included", "unique_urls", "sitemap_files",
                "largest_sitemap_urls", "largest_sitemap_bytes", "excluded_files", "excluded_by_reason",
                "orphan_canonicals", "listed_with_explicit_canonical", "retired_urls", "redirect_rules", "baseline_urls",
                "baseline_retired_documented", "baseline_redirected_to_listed_url", "source_html_files", "site_html_files"):
        if key in m:
            value = m[key]
            print(f"  {key:24s} {value:,}" if isinstance(value, int) else f"  {key:24s} {value}")
    for w in report.warnings:
        print(f"  WARNING {w}", file=sys.stderr)
    if args.json:
        Path(args.json).write_text(json.dumps({"ok": not report.failures, "metrics": m,
                                               "failures": report.failures, "warnings": report.warnings}, indent=2) + "\n")
    if report.failures:
        print(f"\nFAILED - {len(report.failures)} problem(s):", file=sys.stderr)
        for f in report.failures:
            print(f"  - {f}", file=sys.stderr)
        return 1
    print("PASSED - all sitemap checks succeeded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
