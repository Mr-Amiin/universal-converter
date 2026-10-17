#!/usr/bin/env python3
"""
generate_sitemaps.py - split-sitemap generator for theuniversalconverter.com

WHAT THIS DOES
--------------
Writes a sitemap INDEX at <out-dir>/sitemap.xml plus numbered sitemap files
(sitemap-0001.xml, sitemap-0002.xml, ...) alongside it.  The index only lists
the sitemap files; every page URL lives in exactly one numbered file.

    sitemap.xml            -> <sitemapindex> (absolute URLs of every part)
    sitemap-0001.xml       -> <urlset>  up to 10,000 URLs
    sitemap-0002.xml       -> <urlset>  ...

Google's hard limits are 50,000 URLs and 50 MB (52,428,800 bytes)
uncompressed per sitemap file.  This script targets 10,000 URLs per file and
additionally refuses to exceed the hard limits (it starts a new file earlier
if a file would get too large), so the "sitemap exceeds the maximum file
size" error cannot come back as the site grows.

WHERE THE URL LIST COMES FROM
-----------------------------
The URL list is derived from the HTML pages that actually exist in the
published directory, not from a hand-maintained list.  The default is the
repository root (the folder GitHub Pages publishes when it serves the
repository root); a build-based flow can point --site-dir at its output
folder (build.py passes ./dist).  It never defaults to ./dist, so a stale
local build folder can't be scanned by accident.  For every *.html file:

    index.html            -> /
    some/dir/index.html   -> /some/dir/
    page.html             -> /page.html

A page is included only if it is indexable and canonical:

    * <meta name="robots" content="...noindex..."> (or "none")  -> excluded
    * <meta http-equiv="refresh"> instant-redirect stubs         -> excluded
    * <link rel="canonical"> pointing at a different URL         -> excluded
      (the page is a duplicate/alias; its canonical URL is covered by the
      page that lives there)
    * canonical that is not an https URL on the canonical host,
      or that carries a query/fragment                           -> excluded
    * pages with no canonical tag are treated as self-canonical

"Orphan canonicals": a page may declare a canonical URL for which no file
exists in the site directory (e.g. area/acres-to-square-feet/index.html
declaring https://theuniversalconverter.com/acres-to-square-feet/ when there
is no acres-to-square-feet/ directory).  Listing such a URL would submit a
page that answers 404, so by default (--orphan-canonicals fail) the run
FAILS and names the pages; fix the canonical tag (or add the missing page /
a redirect).  --orphan-canonicals include / exclude exist for deliberate
overrides and are always reported.

lastmod
-------
No <lastmod> is written unless a reliable date is supplied with
--lastmod-file (JSON object: {"https://.../page/": "YYYY-MM-DD"}).  File
mtimes on a CI checkout are the checkout time, not the edit time, so they are
deliberately NOT used.  changefreq / priority are not written (Google
ignores them).

SAFETY GUARD
------------
Before overwriting existing sitemap files in --previous-dir the script reads
the URL set they contain.  A previously listed URL that is no longer listed is
acceptable only if it is *documented as retired* in --retired-urls (default
TOOLING/sitemap-retired-urls.txt: URLs that never had a page, replaced by a
canonical page that IS listed).  With --honor-redirects it is also acceptable
if the site's _redirects file 301s it to a listed URL - use that flag only on
a host that really applies _redirects (GitHub Pages does not).  If more than
--max-dropped-pct percent of the previous URLs are unaccounted for the run
fails, so pages cannot disappear silently.

RECONCILIATION
--------------
Every run proves:  HTML files - excluded files (+ orphan canonicals, when
deliberately included) == URLs written.  A mismatch (for example two files
resolving to one URL) aborts the run.

USAGE
-----
    python3 generate_sitemaps.py                      # scan the repo root and rewrite the sitemap files there
    python3 generate_sitemaps.py --check              # verify the committed files are current
    python3 update_sitemaps.py                        # generate + validate in one command (see launch-checklist.md)
"""

import argparse
import datetime
import hashlib
import html as html_lib
import json
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
from urllib.parse import quote, urlsplit
from xml.sax.saxutils import escape as xml_escape

BASE_URL = "https://theuniversalconverter.com"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"

DEFAULT_MAX_URLS = 10_000          # project target per sitemap file
GOOGLE_MAX_URLS = 50_000           # Google hard limit per sitemap file
GOOGLE_MAX_BYTES = 52_428_800      # Google hard limit: 50 MB uncompressed
DEFAULT_MAX_BYTES = 40 * 1024 * 1024   # safety margin below the hard limit
GOOGLE_MAX_SITEMAPS_IN_INDEX = 50_000

HEAD_READ_BYTES = 65_536
EXCLUDED_DIRS = {".git", "dist", "node_modules", ".netlify"}
DEFAULT_RETIRED_FILE = Path(__file__).resolve().parent / "TOOLING" / "sitemap-retired-urls.txt"
PART_NAME_RE = re.compile(r"^sitemap-\d{4}\.xml$")
INDEX_NAME = "sitemap.xml"

# Every excluded page must carry one of these documented reasons.
EXCLUSION_REASONS = {
    "noindex": "page is marked noindex (robots/googlebot meta)",
    "meta-refresh-redirect": "page is an instant meta-refresh redirect stub",
    "canonical-elsewhere": "page declares a different canonical URL (duplicate/alias path)",
    "canonical-not-https-absolute": "canonical is not an absolute https URL",
    "canonical-other-host": "canonical points at a different host",
    "canonical-has-query-or-fragment": "canonical carries a query string or fragment",
}

_META_RE = re.compile(r"<meta\b[^>]*>", re.I)
_LINK_RE = re.compile(r"<link\b[^>]*>", re.I)
_ATTR_CACHE = {}


class SitemapError(Exception):
    """Raised for conditions that must fail the build."""


# --------------------------------------------------------------------------
# URL helpers
# --------------------------------------------------------------------------

def encode_path(path: str) -> str:
    """Percent-encode a URL path, keeping existing %XX escapes intact."""
    return quote(path, safe="/-._~!$&'()*+,;=:@%")


def file_url(rel_path: str, base_url: str = BASE_URL) -> str:
    """Map a site-relative html file path (posix) to its public URL."""
    if rel_path == "index.html":
        return base_url + "/"
    if rel_path.endswith("/index.html"):
        return base_url + "/" + encode_path(rel_path[: -len("index.html")])
    return base_url + "/" + encode_path(rel_path)


def normalize_canonical(href: str, base_url: str = BASE_URL):
    """Return (normalized_url, problem). Exactly one of them is None."""
    href = html_lib.unescape(href.strip())
    parts = urlsplit(href)
    base_host = urlsplit(base_url).netloc.lower()
    if parts.scheme.lower() != "https":
        return None, "canonical-not-https-absolute"
    if parts.netloc.lower() != base_host:
        return None, "canonical-other-host"
    if parts.query or parts.fragment:
        return None, "canonical-has-query-or-fragment"
    path = parts.path or "/"
    if path.endswith("/index.html"):
        path = path[: -len("index.html")]
    return base_url + encode_path(path), None


def _attr(tag: str, name: str):
    rx = _ATTR_CACHE.get(name)
    if rx is None:
        rx = re.compile(r"\b" + name + r"""\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))""", re.I)
        _ATTR_CACHE[name] = rx
    m = rx.search(tag)
    if not m:
        return None
    for g in m.groups():
        if g is not None:
            return g
    return None


# --------------------------------------------------------------------------
# Scanning
# --------------------------------------------------------------------------

def parse_head(data: bytes):
    """Extract (noindex, canonical_href, has_refresh) from the page head."""
    text = data.decode("utf-8", "replace")
    low = text.lower()
    end = low.find("</head>")
    head = text if end == -1 else text[:end]
    noindex = False
    refresh = False
    for tag in _META_RE.findall(head):
        name = (_attr(tag, "name") or "").lower()
        if name in ("robots", "googlebot"):
            tokens = re.split(r"[\s,]+", (_attr(tag, "content") or "").lower())
            if "noindex" in tokens or "none" in tokens:
                noindex = True
        if (_attr(tag, "http-equiv") or "").lower() == "refresh":
            refresh = True
    canonical = None
    for tag in _LINK_RE.findall(head):
        rels = (_attr(tag, "rel") or "").lower().split()
        if "canonical" in rels:
            canonical = _attr(tag, "href")
            break
    return noindex, canonical, refresh


def _scan_one(args):
    site_dir, rel = args
    try:
        with open(os.path.join(site_dir, rel), "rb") as fh:
            data = fh.read(HEAD_READ_BYTES)
    except OSError as exc:
        return rel, None, None, None, f"unreadable: {exc}"
    noindex, canonical, refresh = parse_head(data)
    return rel, noindex, canonical, refresh, None


def list_html_files(site_dir: Path):
    out = []
    root = str(site_dir)
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        for name in filenames:
            if name.lower().endswith(".html"):
                full = os.path.join(dirpath, name)
                out.append(os.path.relpath(full, root).replace(os.sep, "/"))
    out.sort()
    return out


class Inventory:
    """Result of scanning a site directory."""

    def __init__(self):
        self.html_files = 0
        self.urls = []                # final sorted URL list
        self.candidates = 0           # self-canonical, file-backed URLs
        self.sources = {}             # listed file-backed URL -> (source file, has explicit canonical tag)
        self.orphans = {}             # orphan canonical URL -> [source files]
        self.orphans_included = False
        self.excluded = []            # (rel_path, reason, detail)
        self.no_canonical = 0
        self.errors = []

    def reconciliation(self):
        """Return (html_files, excluded, orphans_listed, urls); the identity
        html_files - excluded + orphans_listed == urls must hold."""
        orphans = len(self.orphans) if self.orphans_included else 0
        return self.html_files, len(self.excluded), orphans, len(self.urls)

    def excluded_by_reason(self):
        counts = {}
        for _rel, reason, _detail in self.excluded:
            counts[reason] = counts.get(reason, 0) + 1
        return dict(sorted(counts.items()))


def collect_inventory(site_dir, orphan_policy="fail", workers=None, base_url=BASE_URL):
    if orphan_policy not in ("fail", "include", "exclude"):
        raise SitemapError(f"bad orphan policy: {orphan_policy}")
    site_dir = Path(site_dir)
    files = list_html_files(site_dir)
    inv = Inventory()
    inv.html_files = len(files)

    workers = workers or max(1, min(8, os.cpu_count() or 1))
    jobs = [(str(site_dir), rel) for rel in files]
    results = None
    if workers > 1 and len(jobs) > 2000:
        try:
            with ProcessPoolExecutor(workers) as pool:
                results = list(pool.map(_scan_one, jobs, chunksize=500))
        except (OSError, NotImplementedError, RuntimeError) as exc:   # e.g. no multiprocessing on the build host
            print(f"  ! parallel scan unavailable ({exc}); falling back to a single process", file=sys.stderr)
    if results is None:
        results = [_scan_one(j) for j in jobs]

    all_file_urls = set()
    candidates = {}
    alias_targets = {}
    status = {}   # file url -> reason it is not a candidate (for orphan checks)

    for rel, noindex, canonical, refresh, err in results:
        furl = file_url(rel, base_url)
        all_file_urls.add(furl)
        if err:
            inv.errors.append((rel, err))
            continue
        if noindex:
            inv.excluded.append((rel, "noindex", ""))
            status[furl] = "noindex"
            continue
        if refresh:
            inv.excluded.append((rel, "meta-refresh-redirect", ""))
            status[furl] = "meta-refresh-redirect"
            continue
        if not canonical:
            inv.no_canonical += 1
            candidates.setdefault(furl, []).append(rel)
            inv.sources[furl] = (rel, False)
            continue
        norm, problem = normalize_canonical(canonical, base_url)
        if problem:
            inv.excluded.append((rel, problem, canonical))
            status[furl] = problem
            continue
        if norm == furl:
            candidates.setdefault(furl, []).append(rel)
            inv.sources[furl] = (rel, True)
        else:
            inv.excluded.append((rel, "canonical-elsewhere", norm))
            alias_targets.setdefault(norm, []).append(rel)

    if inv.errors:
        sample = "; ".join(f"{r}: {e}" for r, e in inv.errors[:5])
        raise SitemapError(f"{len(inv.errors)} HTML file(s) could not be read ({sample})")

    inv.candidates = len(candidates)
    urls = set(candidates)
    for target, sources in alias_targets.items():
        if target in all_file_urls:
            continue   # a real file lives there; it is judged on its own
        inv.orphans[target] = sorted(sources)
    if inv.orphans and orphan_policy == "fail":
        sample = "; ".join(f"{u} <- {srcs[0]}" for u, srcs in sorted(inv.orphans.items())[:5])
        raise SitemapError(
            f"{len(inv.orphans)} page(s) declare a canonical URL that has no page in {site_dir} and would 404 "
            f"if listed (e.g. {sample}). Fix the canonical tags, add the missing page/redirect, or pass "
            f"--orphan-canonicals include|exclude to override deliberately."
        )
    if orphan_policy == "include":
        urls.update(inv.orphans)
        inv.orphans_included = True
    inv.urls = sorted(urls)
    files_n, excluded_n, orphans_n, urls_n = inv.reconciliation()
    if files_n - excluded_n + orphans_n != urls_n:
        raise SitemapError(
            f"URL counts do not reconcile: {files_n:,} HTML files - {excluded_n:,} excluded + {orphans_n:,} orphan canonicals "
            f"!= {urls_n:,} URLs (two files resolving to the same URL?)"
        )
    unknown = sorted({reason for _r, reason, _d in inv.excluded} - set(EXCLUSION_REASONS))
    if unknown:
        raise SitemapError(f"excluded pages carry undocumented reason(s): {unknown}")
    return inv


# --------------------------------------------------------------------------
# _redirects parsing - only used with --honor-redirects, for hosts that apply it
# (Netlify/Cloudflare-style). GitHub Pages ignores this file.
# --------------------------------------------------------------------------

REDIRECT_STATUSES = {301, 302, 303, 307, 308}


class RedirectRule:
    __slots__ = ("source", "target", "status", "force", "line")

    def __init__(self, source, target, status, force, line):
        self.source, self.target, self.status, self.force, self.line = source, target, status, force, line

    @property
    def is_splat(self):
        return self.source.endswith("*")

    @property
    def is_redirect(self):
        return self.status in REDIRECT_STATUSES


def parse_redirects(text: str):
    """Parse a _redirects file (Netlify syntax). Lines are 'from to [status[!]]'; only
    plain path rules are modelled (query/condition/placeholder rules are kept
    as written and never match here)."""
    rules = []
    for number, raw in enumerate(text.splitlines(), 1):
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        fields = line.split()
        if len(fields) < 2:
            continue
        status_field = fields[2] if len(fields) > 2 and re.fullmatch(r"\d{3}!?", fields[2]) else "301"
        rules.append(RedirectRule(fields[0], fields[1], int(status_field.rstrip("!")), status_field.endswith("!"), number))
    return rules


def load_redirects(site_dir):
    path = Path(site_dir) / "_redirects"
    return parse_redirects(path.read_text(encoding="utf-8", errors="replace")) if path.is_file() else []


def _norm_path(path: str) -> str:
    return "/" + path.strip("/")


class RedirectIndex:
    """Fast lookup: exact rules are matched ignoring a trailing slash (as Netlify
    does); a rule ending in '*' matches that prefix (splat may be empty)."""

    def __init__(self, rules):
        self.rules = list(rules)
        self.exact = {}
        self.splats = []
        for rule in self.rules:
            if rule.is_splat:
                self.splats.append((rule.source[:-1].rstrip("/") or "/", rule))
            elif not any(c in rule.source for c in ":?"):
                self.exact.setdefault(_norm_path(rule.source), rule)

    def match(self, path: str):
        rule = self.exact.get(_norm_path(path))
        if rule is not None:
            return rule
        p = _norm_path(path)
        for prefix, rule in self.splats:
            if p == prefix or p.startswith(prefix.rstrip("/") + "/"):
                return rule
        return None


def path_is_file_backed(site_dir, path: str) -> bool:
    """True if a static file would answer `path` (so a non-forced redirect
    rule for it is shadowed)."""
    rel = path.strip("/")
    base = Path(site_dir)
    if not rel:
        return (base / "index.html").is_file()
    return (base / rel).is_file() or (base / rel / "index.html").is_file() or (base / (rel + ".html")).is_file()


def read_retired_urls(path):
    """URLs deliberately removed from the sitemap (one https URL per line, '#'
    comments allowed).  Returns a set; empty when no file is given/found."""
    if not path or not Path(path).is_file():
        return set()
    urls = set()
    for number, raw in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        line = raw.split("#", 1)[0].strip()
        if not line:
            continue
        if not line.startswith("https://") or any(c.isspace() for c in line):
            raise SitemapError(f"{path}:{number}: not an absolute https URL: {line!r}")
        urls.add(line)
    return urls


# --------------------------------------------------------------------------
# Reading existing sitemap files
# --------------------------------------------------------------------------

_LOC_RE = re.compile(r"<loc>\s*(.*?)\s*</loc>", re.S)


def read_sitemap_urls(directory: Path):
    """URLs listed by the sitemap (index + parts, or a legacy single
    urlset) found in `directory`.  Returns a set; empty if none."""
    directory = Path(directory)
    index = directory / INDEX_NAME
    if not index.is_file():
        return set()
    text = index.read_text(encoding="utf-8")
    urls = set()
    if "<sitemapindex" in text:
        for loc in _LOC_RE.findall(text):
            name = urlsplit(html_lib.unescape(loc)).path.lstrip("/")
            part = directory / name
            if part.is_file():
                urls.update(html_lib.unescape(u) for u in _LOC_RE.findall(part.read_text(encoding="utf-8")))
    else:
        urls.update(html_lib.unescape(u) for u in _LOC_RE.findall(text))
    return urls


# --------------------------------------------------------------------------
# Writing
# --------------------------------------------------------------------------

_ESC = {'"': "&quot;", "'": "&apos;"}
XML_DECL = '<?xml version="1.0" encoding="UTF-8"?>\n'
URLSET_OPEN = f'<urlset xmlns="{SITEMAP_NS}">\n'
URLSET_CLOSE = "</urlset>\n"


def load_lastmod(path):
    if not path:
        return {}
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SitemapError("--lastmod-file must contain a JSON object {url: date}")
    today = datetime.date.today()
    for url, value in data.items():
        if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            raise SitemapError(f"bad lastmod for {url}: {value!r} (expected YYYY-MM-DD)")
        try:
            day = datetime.date.fromisoformat(value)
        except ValueError:
            raise SitemapError(f"bad lastmod for {url}: {value!r}")
        if day > today:
            raise SitemapError(f"lastmod for {url} is in the future: {value}")
    return data


def _url_line(url, lastmod):
    lm = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
    return f"  <url><loc>{xml_escape(url, _ESC)}</loc>{lm}</url>\n"


def split_into_parts(urls, max_urls, max_bytes, lastmod=None):
    """Yield lists of (url, line) so that each part respects both limits."""
    lastmod = lastmod or {}
    overhead = len((XML_DECL + URLSET_OPEN + URLSET_CLOSE).encode("utf-8"))
    part, size = [], overhead
    for url in urls:
        line = _url_line(url, lastmod.get(url))
        n = len(line.encode("utf-8"))
        if part and (len(part) >= max_urls or size + n > max_bytes):
            yield part
            part, size = [], overhead
        part.append(line)
        size += n
    if part:
        yield part


def render_outputs(urls, base_url, max_urls, max_bytes, lastmod=None):
    """Return {filename: bytes} for the index and every part."""
    if not urls:
        raise SitemapError("refusing to write sitemaps: the URL inventory is empty")
    if not 1 <= max_urls <= GOOGLE_MAX_URLS:
        raise SitemapError(f"--max-urls must be between 1 and {GOOGLE_MAX_URLS}")
    if not 1 <= max_bytes <= GOOGLE_MAX_BYTES:
        raise SitemapError(f"--max-bytes must be between 1 and {GOOGLE_MAX_BYTES}")
    files = {}
    for number, lines in enumerate(split_into_parts(urls, max_urls, max_bytes, lastmod), start=1):
        name = f"sitemap-{number:04d}.xml"
        files[name] = (XML_DECL + URLSET_OPEN + "".join(lines) + URLSET_CLOSE).encode("utf-8")
    if len(files) > GOOGLE_MAX_SITEMAPS_IN_INDEX:
        raise SitemapError("too many sitemap files for a single sitemap index")
    entries = "".join(
        f"  <sitemap><loc>{xml_escape(base_url + '/' + name, _ESC)}</loc></sitemap>\n" for name in files
    )
    index = f'{XML_DECL}<sitemapindex xmlns="{SITEMAP_NS}">\n{entries}</sitemapindex>\n'
    files[INDEX_NAME] = index.encode("utf-8")
    return files


def write_outputs(files, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    for old in out_dir.iterdir():
        if old.is_file() and PART_NAME_RE.match(old.name):
            old.unlink()
    for name, data in files.items():
        (out_dir / name).write_bytes(data)


def digest(files):
    h = hashlib.sha256()
    for name in sorted(files):
        h.update(name.encode())
        h.update(b"\0")
        h.update(files[name])
    return h.hexdigest()


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------

def parse_args(argv=None):
    here = Path(__file__).resolve().parent
    p = argparse.ArgumentParser(description="Generate a split sitemap index + sitemap files.")
    p.add_argument("--site-dir", default=None, help="directory to scan (default: the repository root, i.e. the folder next to this script)")
    p.add_argument("--out-dir", default=None, help="where to write sitemap files (default: --site-dir)")
    p.add_argument("--previous-dir", default=None, help="where the previously generated sitemap lives, for the drop guard (default: --out-dir)")
    p.add_argument("--base-url", default=BASE_URL)
    p.add_argument("--max-urls", type=int, default=DEFAULT_MAX_URLS)
    p.add_argument("--max-bytes", type=int, default=DEFAULT_MAX_BYTES)
    p.add_argument("--orphan-canonicals", choices=("fail", "include", "exclude"), default="fail",
                   help="what to do with canonical URLs that have no page (default: fail the run)")
    p.add_argument("--lastmod-file", default=None)
    p.add_argument("--max-dropped-pct", type=float, default=1.0,
                   help="fail if more than this percent of previously listed URLs disappear (default 1.0)")
    p.add_argument("--allow-shrink", action="store_true", help="skip the drop guard")
    p.add_argument("--retired-urls", default=None,
                   help="file of URLs deliberately removed from the sitemap (default: TOOLING/sitemap-retired-urls.txt if present)")
    p.add_argument("--honor-redirects", action="store_true",
                   help="treat a previously listed URL that _redirects 301s to a listed URL as not lost "
                        "(only for hosts that apply _redirects; GitHub Pages does not)")
    p.add_argument("--report", default=None, help="write a JSON report here")
    p.add_argument("--workers", type=int, default=None)
    p.add_argument("--check", action="store_true", help="do not write; fail if files in --out-dir differ from a fresh run")
    args = p.parse_args(argv)
    args.site_dir = Path(args.site_dir) if args.site_dir else here
    if args.retired_urls:
        args.retired_urls = Path(args.retired_urls)
    else:
        args.retired_urls = DEFAULT_RETIRED_FILE if DEFAULT_RETIRED_FILE.is_file() else None
    args.out_dir = Path(args.out_dir) if args.out_dir else args.site_dir
    args.previous_dir = Path(args.previous_dir) if args.previous_dir else args.out_dir
    if not args.base_url.startswith("https://") or args.base_url.endswith("/"):
        p.error("--base-url must be an https URL without a trailing slash")
    return args


def main(argv=None):
    args = parse_args(argv)
    started = time.perf_counter()
    if not args.site_dir.is_dir():
        raise SitemapError(f"site directory not found: {args.site_dir}")

    previous = set() if args.allow_shrink else read_sitemap_urls(args.previous_dir)
    print(f"Scanning {args.site_dir} ...")
    inv = collect_inventory(args.site_dir, args.orphan_canonicals, args.workers, args.base_url)
    lastmod = load_lastmod(args.lastmod_file)

    files = render_outputs(inv.urls, args.base_url, args.max_urls, args.max_bytes, lastmod)
    parts = {n: d for n, d in files.items() if n != INDEX_NAME}
    largest = max((len(d) for d in parts.values()), default=0)

    listed = set(inv.urls)
    missing = sorted(previous - listed) if previous else []
    added = len(listed - previous) if previous else len(inv.urls)

    # A previously listed URL that is no longer listed is accounted for only if it is
    # documented as retired, or (opt-in, hosts that apply _redirects) 301s to a listed URL.
    retired_urls = read_retired_urls(args.retired_urls)
    relisted = sorted(retired_urls & listed)
    if relisted:
        raise SitemapError(f"{len(relisted)} URL(s) are both listed in the sitemap and in the retired list "
                           f"{args.retired_urls} (e.g. {relisted[:3]}); remove them from one of the two")
    redirects = RedirectIndex(load_redirects(args.site_dir) if args.honor_redirects else [])
    redirected, retired, dropped = {}, [], []
    for url in missing:
        if url in retired_urls:
            retired.append(url)
            continue
        path = urlsplit(url).path or "/"
        rule = redirects.match(path)
        if rule is not None and rule.is_redirect and not path_is_file_backed(args.site_dir, path):
            target = rule.target if rule.target.startswith("http") else args.base_url + rule.target
            if target in listed:
                redirected[url] = target
                continue
        dropped.append(url)

    files_n, excluded_n, orphans_n, urls_n = inv.reconciliation()
    print(f"  HTML files scanned:            {inv.html_files:,}")
    print(f"  Excluded files:                {len(inv.excluded):,}  {inv.excluded_by_reason()}")
    print(f"  Orphan canonical URLs:         {len(inv.orphans):,} ({'included' if inv.orphans_included else 'not listed'})")
    print(f"  Reconciliation:                {files_n:,} files - {excluded_n:,} excluded + {orphans_n:,} orphan canonicals = {urls_n:,} URLs")
    print(f"  URLs written:                  {len(inv.urls):,}")
    print(f"  Sitemap files:                 {len(parts)} (+ index)")
    print(f"  Largest sitemap (uncompressed): {largest:,} bytes")
    if previous:
        print(f"  Previously listed URLs:        {len(previous):,}  (kept {len(previous) - len(missing):,}, "
              f"retired/documented {len(retired):,}, redirected to a listed URL {len(redirected):,}, "
              f"dropped {len(dropped):,}; new {added:,})")

    if inv.orphans:
        print(f"  ! WARNING: {len(inv.orphans)} page(s) declare a canonical URL that has no matching file in '{args.site_dir}' (examples below).", file=sys.stderr)
        for url in sorted(inv.orphans)[:5]:
            print(f"      {url}  <- {inv.orphans[url][0]}", file=sys.stderr)

    if dropped and not args.allow_shrink:
        pct = 100.0 * len(dropped) / max(1, len(previous))
        for u in dropped[:20]:
            print(f"      dropped: {u}", file=sys.stderr)
        if pct > args.max_dropped_pct:
            raise SitemapError(
                f"{len(dropped):,} previously listed URLs ({pct:.2f}%) are neither listed, documented as retired nor redirected to a listed URL "
                f"(limit {args.max_dropped_pct}%). Refusing to overwrite; re-run with --allow-shrink if intended."
            )
        print(f"  ! WARNING: {len(dropped):,} previously listed URLs are no longer included ({pct:.2f}%).", file=sys.stderr)

    if args.report:
        excluded_rows = []
        for rel, reason, detail in inv.excluded:
            row = {"file": rel, "file_url": file_url(rel, args.base_url), "reason": reason,
                   "reason_text": EXCLUSION_REASONS[reason], "detail": detail}
            if reason == "canonical-elsewhere":
                row["canonical_target_listed"] = detail in listed
            excluded_rows.append(row)
        Path(args.report).write_text(json.dumps({
            "html_files_scanned": inv.html_files,
            "excluded_files": len(inv.excluded),
            "orphan_canonicals_listed": orphans_n,
            "urls_included": len(inv.urls),
            "reconciles": files_n - excluded_n + orphans_n == urls_n,
            "sitemap_files": len(parts),
            "largest_sitemap_bytes": largest,
            "excluded_by_reason": inv.excluded_by_reason(),
            "excluded": excluded_rows,
            "orphan_canonicals": inv.orphans,
            "previous_urls": len(previous),
            "retired_vs_previous": retired,
            "redirected_vs_previous": redirected,
            "dropped_vs_previous": dropped,
        }, indent=2) + "\n", encoding="utf-8")

    if args.check:
        stale = []
        for name, data in files.items():
            target = args.out_dir / name
            # Compare ignoring line endings: with `* text=auto` a Windows checkout may turn the
            # committed LF files into CRLF, which is not a real difference.
            if not target.is_file() or target.read_bytes().replace(b"\r\n", b"\n") != data:
                stale.append(name)
        extra = [p.name for p in args.out_dir.iterdir() if p.is_file() and PART_NAME_RE.match(p.name) and p.name not in files]
        if stale or extra:
            raise SitemapError(f"sitemap files in {args.out_dir} are out of date: changed/missing={stale[:5]} extra={extra[:5]}")
        print("  Sitemap files are up to date.")
    else:
        write_outputs(files, args.out_dir)
        print(f"  Wrote {len(files)} file(s) to {args.out_dir}  [{time.perf_counter() - started:.1f}s]")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SitemapError as exc:
        print(f"\nSITEMAP GENERATION FAILED: {exc}", file=sys.stderr)
        sys.exit(1)
