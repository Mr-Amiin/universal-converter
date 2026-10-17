#!/usr/bin/env python3
"""
build.py - automatic cache-busting build step for a static site.

WHAT THIS DOES
--------------
Run this once before every deploy (or let Netlify run it automatically -
see netlify.toml). It never modifies any file in this source directory.
Instead it produces a ready-to-publish copy of the whole site in ./dist
where the cache-sensitive JS/CSS assets have been renamed to include a
hash of their own content, e.g.:

    styles.css          ->  styles.91ab3fcd12.css
    app.js               ->  app.4f82c1a9de.js

Every reference to those files is rewritten automatically, everywhere they
appear:
    - every *.html page (href=, src=)
    - service-worker.js (the offline precache list + its own CACHE_NAME,
      which is re-derived from the new asset hashes so the browser's
      service-worker cache is also invalidated on every deploy)
    - _headers (the six exact-path Cache-Control rules are regenerated to
      point at the new hashed filenames)
    - sitemap.xml + sitemap-NNNN.xml are (re)generated into dist/ from the
      pages being deployed and validated (see generate_sitemaps.py)

Because the filename itself changes whenever the file's contents change,
it is safe to cache these files "forever":

    Cache-Control: public, max-age=31536000, immutable

A browser holding an old cached copy of "app.4f82c1a9de.js" will simply
never be asked for that URL again once you ship new content under
"app.<new-hash>.js" - there is nothing to go stale, so there is no need
to ever shorten the cache lifetime or add revalidation.

USAGE
-----
    python3 build.py

Then deploy the generated ./dist directory (Netlify does this
automatically for you - see netlify.toml in this same folder).

No arguments, no manual version numbers, nothing to remember between
deploys. Re-running this script always regenerates dist/ from scratch
from the source files, so it is fully idempotent.
"""

import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

SOURCE_DIR = Path(__file__).resolve().parent
DIST_DIR = SOURCE_DIR / "dist"
SEARCH_INDEX_GENERATOR = SOURCE_DIR / "generate_search_index.py"
SITEMAP_GENERATOR = SOURCE_DIR / "generate_sitemaps.py"
SITEMAP_VALIDATOR = SOURCE_DIR / "validate_sitemaps.py"

# The six files that get a content hash baked into their filename.
VERSIONED_ASSETS = [
    "app.js",
    "styles.css",
    "adsense.js",
    "adsense-config.js",
    "analytics-config.js",
    "google-analytics.js",
]

# Not part of the deployed site - just this build script and VCS/build
# housekeeping. Everything else in the source directory is mirrored into
# dist untouched (including the dev/report scripts already in this repo),
# so this build step changes nothing about the deployed site other than
# the six versioned assets and the references to them.
# The sitemap generator/validator and their tests are build tooling only: they run
# against dist/ below and have no reason to be published as public files.
EXCLUDE_NAMES = {"dist", ".git", ".github", "build.py", "generate_sitemaps.py", "validate_sitemaps.py", "update_sitemaps.py", "tests"}

HASH_LEN = 10  # 10 hex chars of sha256 is ample to avoid collisions here

# Deliberate service-worker cache salt. CACHE_NAME is otherwise derived only from the
# hashed asset names above, so a deploy that changes pages but none of those six assets
# (e.g. the AdSense single-account migration) would keep the same CACHE_NAME and the
# cache-first service worker would keep serving the old cached pages. Changing this
# value changes CACHE_NAME on the next build: browsers then install the new worker and
# its activate step deletes the previous cache.
SERVICE_WORKER_CACHE_SALT = "adsense-single-account-1"


def content_hash(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()[:HASH_LEN]


def hashed_name(original_name: str, digest: str) -> str:
    stem, ext = original_name.rsplit(".", 1)
    return f"{stem}.{digest}.{ext}"


def copy_source_to_dist():
    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)
    DIST_DIR.mkdir(parents=True)
    for item in SOURCE_DIR.iterdir():
        if item.name in EXCLUDE_NAMES:
            continue
        dest = DIST_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, dest)
        else:
            shutil.copy2(item, dest)


def rename_versioned_assets() -> dict:
    """Hash + rename each target asset inside dist. Returns a mapping of
    old filename -> new (hashed) filename."""
    mapping = {}
    for name in VERSIONED_ASSETS:
        src = DIST_DIR / name
        if not src.exists():
            print(f"  ! WARNING: {name} not found, skipping", file=sys.stderr)
            continue
        digest = content_hash(src)
        new_name = hashed_name(name, digest)
        src.rename(DIST_DIR / new_name)
        mapping[name] = new_name
        print(f"  {name}  ->  {new_name}")
    return mapping


def rewrite_references(mapping: dict):
    """Rewrite every reference to the old asset filenames in every
    HTML page and in service-worker.js. Only whole-filename matches
    immediately after a '/' or quote, and immediately before a quote or
    '?', are touched - so this can never clip an unrelated substring.

    Returns (changed_files, total_substitutions):
        changed_files       - list of relative paths that were modified
        total_substitutions - total number of individual references
                              rewritten across all files (not just the
                              count of files touched)
    """
    if not mapping:
        return [], 0
    text_suffixes = {".html", ".js"}
    changed_files = []
    total_substitutions = 0
    for path in DIST_DIR.rglob("*"):
        if not path.is_file() or path.suffix not in text_suffixes:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, ValueError):
            continue
        original = text
        file_substitutions = 0
        for old_name, new_name in mapping.items():
            pattern = re.compile(r'(?<=[/"\'])' + re.escape(old_name) + r'(?=["\'\?])')
            text, count = pattern.subn(new_name, text)
            file_substitutions += count
        if text != original:
            path.write_text(text, encoding="utf-8")
            changed_files.append(str(path.relative_to(DIST_DIR)))
            total_substitutions += file_substitutions
    return changed_files, total_substitutions


def rewrite_headers_file(mapping: dict) -> bool:
    """Regenerate the exact-path Cache-Control rules in _headers for the
    new hashed filenames (the old plain-name rules are removed since
    those paths no longer exist once the files are renamed).

    Returns True if _headers exists and every rule was found and updated.
    """
    headers_path = DIST_DIR / "_headers"
    if not headers_path.exists() or not mapping:
        return False
    text = headers_path.read_text(encoding="utf-8")

    # Replace just the "/oldname" path line of each rule in place, leaving
    # its Cache-Control line(s) and the surrounding blank-line spacing/
    # comments exactly where they already were.
    all_found = True
    for old_name, new_name in mapping.items():
        pattern = re.compile(r"^/" + re.escape(old_name) + r"$", re.MULTILINE)
        text, count = pattern.subn(f"/{new_name}", text, count=1)
        if not count:
            print(f"  ! WARNING: no _headers rule found for {old_name}", file=sys.stderr)
            all_found = False

    headers_path.write_text(text, encoding="utf-8")
    return all_found


def update_service_worker_cache_name(mapping: dict) -> bool:
    """Re-derive the service worker's own CACHE_NAME from the new asset
    hashes, so its precache storage is automatically invalidated on every
    deploy too - no manual version bump needed there either.

    Returns True if service-worker.js exists and was updated.
    """
    sw_path = DIST_DIR / "service-worker.js"
    if not sw_path.exists() or not mapping:
        return False
    text = sw_path.read_text(encoding="utf-8")
    build_fingerprint = hashlib.sha256(
        (SERVICE_WORKER_CACHE_SALT + "".join(sorted(mapping.values()))).encode("utf-8")
    ).hexdigest()[:HASH_LEN]
    text, count = re.subn(
        r'const CACHE_NAME = "[^"]*";',
        f'const CACHE_NAME = "universal-converter-{build_fingerprint}";',
        text,
        count=1,
    )
    if count:
        sw_path.write_text(text, encoding="utf-8")
        return True
    return False


def write_manifest(mapping: dict):
    (DIST_DIR / "asset-manifest.json").write_text(json.dumps(mapping, indent=2) + "\n", encoding="utf-8")


# Extensions that make up the actually-published site. Anything else that
# happens to sit in the repo (.py, .ps1, .md, .log, ...) is dev tooling or
# documentation, never served/parsed as part of the live site, so it's
# excluded from validation by construction - not by guessing at comments.
VALIDATE_SUFFIXES = {".html", ".js", ".css", ".json", ".xml", ".webmanifest"}

# The manifest is expected (and supposed) to contain the plain old names -
# that's its entire job, mapping old -> new.
VALIDATE_IGNORE_NAMES = {"asset-manifest.json"}


# --- comment-aware, reference-shaped matching used by validate_dist() ----------------
# validate_dist() used to flag any line containing a plain asset filename as a substring,
# so prose in comments ("see app.js") and diagnostics ("app.js did not populate ...")
# failed the build. It now (1) blanks out comments, keeping line numbers intact, and
# (2) only counts a filename that is shaped like a reference: delimited on the left by
# a quote, "/", "(", "=" or "," and on the right by a quote, "?", "#", ")", ">", "," or
# ";" (or whitespace after an unquoted "=" attribute). Real references in HTML attributes,
# CSS url()/@import and JS strings are still caught. If a file's comments cannot be
# tokenized cleanly it is scanned raw (still reference-shaped), never silently skipped.
_HTML_COMMENT = re.compile(r"<!--.*?-->", re.S)
_STYLE_BLOCK = re.compile(r"(<style\b[^>]*>)(.*?)(</style\s*>)", re.S | re.I)
_SCRIPT_BLOCK = re.compile(r"(<script\b([^>]*)>)(.*?)(</script\s*>)", re.S | re.I)
_JS_TYPE_OK = re.compile(r"type\s*=\s*[\"']?(?:text/javascript|application/javascript|module)", re.I)
_REGEX_KEYWORDS = {"return", "typeof", "case", "in", "of", "delete", "void", "throw", "new", "else", "do"}


def _blank(text: str) -> str:
    """Stand-in for a removed comment: a space plus its newlines, so line numbers stay correct."""
    return " " + "\n" * text.count("\n")


def _regex_can_start(tail: str) -> bool:
    t = tail.rstrip()
    if not t:
        return True
    last = t[-1]
    if last in ")]\"'`":
        return False  # after a value, "/" is division
    if last.isalnum() or last in "_$":
        word = re.search(r"[A-Za-z_$][\w$]*$", t)
        return bool(word) and word.group(0) in _REGEX_KEYWORDS
    return True  # after an operator or other punctuation


def _strip_c_comments(text: str, js: bool):
    """Remove /* */ comments (and // comments when js) that are outside string and regex
    literals. Returns None if the text cannot be tokenized cleanly (caller scans raw)."""
    out, i, n, tail = [], 0, len(text), ""
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "*":
            j = text.find("*/", i + 2)
            if j < 0:
                return None
            out.append(_blank(text[i:j + 2]))
            i = j + 2
            continue
        if js and c == "/" and nxt == "/":
            j = text.find("\n", i)
            j = n if j < 0 else j
            out.append(" ")
            i = j
            continue
        if c in "\"'`":
            j = i + 1
            while j < n and text[j] != c:
                if text[j] == "\\":
                    j += 1
                elif text[j] == "\n" and c != "`":
                    return None
                j += 1
            if j >= n:
                return None
            out.append(text[i:j + 1])
            i = j + 1
            tail = (tail + c)[-32:]
            continue
        if js and c == "/" and _regex_can_start(tail):
            j, in_class = i + 1, False
            while j < n:
                ch = text[j]
                if ch == "\\":
                    j += 2
                    continue
                if ch == "\n":
                    return None
                if ch == "[":
                    in_class = True
                elif ch == "]":
                    in_class = False
                elif ch == "/" and not in_class:
                    break
                j += 1
            if j >= n:
                return None
            j += 1
            while j < n and text[j].isalpha():
                j += 1
            out.append(text[i:j])
            i = j
            tail = (tail + '"')[-32:]
            continue
        out.append(c)
        tail = (tail + c)[-32:]
        i += 1
    return "".join(out)


def _strip_comments_for_validation(suffix: str, text: str) -> str:
    if suffix == ".html":
        text = _HTML_COMMENT.sub(lambda m: _blank(m.group(0)), text)

        def style_sub(m):
            s = _strip_c_comments(m.group(2), js=False)
            return m.group(1) + (m.group(2) if s is None else s) + m.group(3)

        def script_sub(m):
            attrs = m.group(2)
            if re.search(r"\btype\s*=", attrs, re.I) and not _JS_TYPE_OK.search(attrs):
                return m.group(0)  # JSON-LD, text/plain stubs, templates: not JavaScript
            s = _strip_c_comments(m.group(3), js=True)
            return m.group(1) + (m.group(3) if s is None else s) + m.group(4)

        text = _STYLE_BLOCK.sub(style_sub, text)
        return _SCRIPT_BLOCK.sub(script_sub, text)
    if suffix == ".xml":
        return _HTML_COMMENT.sub(lambda m: _blank(m.group(0)), text)
    if suffix in (".css", ".js"):
        stripped = _strip_c_comments(text, js=(suffix == ".js"))
        return text if stripped is None else stripped
    return text


def _reference_patterns(mapping: dict) -> dict:
    pats = {}
    for old_name in mapping:
        n = re.escape(old_name)
        pats[old_name] = re.compile(
            r"""(?:(?<=["'`/(=,])""" + n + r"""(?=["'`?#)>,;])|(?<==)""" + n + r"""(?=\s))"""
        )
    return pats


def validate_dist(mapping: dict) -> list:
    """Recursively scan the built dist/ output for any remaining reference
    to an unversioned (plain) asset filename. Only files that are actually
    part of the published site are scanned (see VALIDATE_SUFFIXES); dev
    scripts, docs, and the manifest itself are skipped.

    Returns a list of (relative_path, line_number, old_name, line_text)
    tuples - empty if everything is clean.
    """
    if not mapping:
        return []
    problems = []
    patterns = _reference_patterns(mapping)
    for path in DIST_DIR.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in VALIDATE_SUFFIXES:
            continue
        if path.name in VALIDATE_IGNORE_NAMES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, ValueError):
            continue
        lines = text.splitlines()
        scan = _strip_comments_for_validation(path.suffix, text).splitlines()
        if len(scan) != len(lines):
            scan = lines  # line numbers would not align: scan the raw text instead
        rel_path = path.relative_to(DIST_DIR)
        for lineno, (line, scan_line) in enumerate(zip(lines, scan), start=1):
            for old_name, pattern in patterns.items():
                # A reference-shaped match (see _reference_patterns): a hashed
                # filename like "app.9022f63c3c.js" can never match "app.js".
                if pattern.search(scan_line):
                    problems.append((rel_path, lineno, old_name, line.strip()))
    return problems


def print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed):
    print()
    print("Build Summary")
    print("-------------")
    print(f"Build duration: {duration:.2f} s")
    print(f"HTML pages processed: {html_page_count}")
    print(f"Assets fingerprinted: {len(mapping)}")
    print(f"References rewritten: {total_substitutions}")
    print(f"Service worker updated: {'Yes' if sw_updated else 'No'}")
    print(f"Headers updated: {'Yes' if headers_updated else 'No'}")
    print(f"Validation: {'PASSED' if validation_passed else 'FAILED'}")
    if mapping:
        print()
        print("Generated assets:")
        for new_name in mapping.values():
            print(new_name)


def build_sitemaps() -> bool:
    """Generate the sitemap INDEX (dist/sitemap.xml) and the numbered sitemap files
    (dist/sitemap-0001.xml, ...) straight into the publish directory, then validate
    them. Runs on every build, so the published sitemaps always match the pages that
    are actually being deployed and can never be a stale hand-made file. Each file
    holds at most 10,000 URLs (Google's hard limits: 50,000 URLs / 50 MB).

    Scope: this only covers a flow that publishes dist/. A host that serves the
    repository root as-is (e.g. GitHub Pages publishing from the root) never runs
    build.py; there the committed sitemap.xml + sitemap-NNNN.xml in the repo root
    are what is served, and they are refreshed with `python3 update_sitemaps.py`.

    Returns True only if generation and validation both succeed."""
    for script in (SITEMAP_GENERATOR, SITEMAP_VALIDATOR):
        if not script.exists():
            print(f"  ! {script.name} not found - cannot build sitemaps", file=sys.stderr)
            return False
    # --previous-dir: the committed sitemap files act as the baseline, so a build that
    # would silently drop pages from the sitemap fails instead of deploying.
    generated = subprocess.run(
        [sys.executable, str(SITEMAP_GENERATOR),
         "--site-dir", str(DIST_DIR), "--out-dir", str(DIST_DIR), "--previous-dir", str(SOURCE_DIR)],
        cwd=SOURCE_DIR,
    )
    if generated.returncode != 0:
        print("  ! sitemap generation FAILED", file=sys.stderr)
        return False
    validated = subprocess.run(
        [sys.executable, str(SITEMAP_VALIDATOR), "--site-dir", str(DIST_DIR), "--source-dir", str(SOURCE_DIR), "--require-canonical"],
        cwd=SOURCE_DIR,
    )
    if validated.returncode != 0:
        print("  ! sitemap validation FAILED", file=sys.stderr)
        return False
    return True


def regenerate_search_index():
    """Rebuild search-index.json from the current SEO conversion registry
    + static page list *before* anything is copied into dist/, so every
    build always ships a search index that matches every other generated
    page. Never hand-edited - always derived at build time."""
    if not SEARCH_INDEX_GENERATOR.exists():
        print("  ! WARNING: generate_search_index.py not found, skipping", file=sys.stderr)
        return False
    result = subprocess.run(
        [sys.executable, str(SEARCH_INDEX_GENERATOR)],
        cwd=SOURCE_DIR,
        capture_output=True,
        text=True,
    )
    if result.stdout:
        print("  " + result.stdout.strip().replace("\n", "\n  "))
    if result.returncode != 0:
        print("  ! search index generation FAILED:", file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        return False
    return True


def main():
    start_time = time.perf_counter()

    print("1. Regenerating search-index.json from the SEO conversion registry ...")
    search_index_ok = regenerate_search_index()
    if not search_index_ok:
        print("\n✗ Aborting build - search index must be up to date before every deploy.", file=sys.stderr)
        sys.exit(1)

    print("2. Copying source -> dist/ ...")
    copy_source_to_dist()

    print("3. Hashing + renaming versioned assets:")
    mapping = rename_versioned_assets()

    print("4. Rewriting references in HTML pages + service-worker.js ...")
    changed, total_substitutions = rewrite_references(mapping)
    for f in changed:
        print(f"     updated {f}")

    print("5. Regenerating _headers rules for hashed filenames ...")
    headers_updated = rewrite_headers_file(mapping)

    print("6. Updating service-worker.js CACHE_NAME ...")
    sw_updated = update_service_worker_cache_name(mapping)

    print("7. Writing dist/asset-manifest.json ...")
    write_manifest(mapping)

    print(f"\nDone. {len(mapping)} asset(s) versioned, {len(changed)} file(s) updated.")

    print("\n8. Validating dist/ for leftover unversioned asset references ...")
    problems = validate_dist(mapping)

    html_page_count = sum(1 for p in DIST_DIR.rglob("*.html") if p.is_file())
    duration = time.perf_counter() - start_time

    if problems:
        print("\n✗ Asset version validation FAILED - unversioned reference(s) found:", file=sys.stderr)
        for rel_path, lineno, old_name, line in problems:
            print(f"  {rel_path}:{lineno}: still references '{old_name}'", file=sys.stderr)
            print(f"      {line}", file=sys.stderr)
        print(
            f"\n{len(problems)} problem(s) found in the published output - failing the build "
            "so this can't ship with a stale/broken asset reference.",
            file=sys.stderr,
        )
        print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed=False)
        sys.exit(1)

    print("✓ Asset version validation passed")

    print("\n9. Generating + validating the sitemap index and split sitemaps in dist/ ...")
    sitemaps_ok = build_sitemaps()
    if not sitemaps_ok:
        print("\n✗ Sitemap generation/validation FAILED - not shipping an invalid sitemap.", file=sys.stderr)
        sys.exit(1)
    print("✓ Sitemaps generated and validated")
    print("Deploy the dist/ directory.")

    print_build_summary(duration, html_page_count, mapping, total_substitutions, sw_updated, headers_updated, validation_passed=True)


if __name__ == "__main__":
    main()
