#!/usr/bin/env python3
"""
inject_internal_links.py - SEO internal-linking injector for individual conversion pages.

WHAT IT DOES
------------
On every individual SEO conversion page it turns the existing "Related conversions" card into
three cards, in this order:

  1. POPULAR Converters            - links to ~12 existing category hubs (own category first)
  2. More {source unit} Conversions  - up to 5 existing conversions that START at this page's source unit
  3. More {target unit} Conversions  - up to 5 existing conversions that START at this page's destination unit
     (unit names come from the units metadata, e.g. 'More Celsius Conversions' / 'More Fahrenheit Conversions';
      the source unit is always first, so a reverse page automatically gets the reversed headings)

SCOPE (strict)
--------------
  * category conversion pages   /<category>/<from>-to-<to>/      (authoritative: search-index/pairs/*.json)
  * root flagship pages         /<slug>/                          (explicit table FLAGSHIP below, 22 pages)
  * non-canonical TWINS         /<category>/<slug>/ whose canonical points at a root flagship page,
                                updated ONLY because they physically sit inside their category folder
  * NEVER touched: category hubs (/<category>/index.html), the homepage, guides, any other page.
    Hubs are link DESTINATIONS only. Writes are restricted to <cat>/<slug>/index.html or <slug>/index.html
    for slugs in the inventory; a hub path can never match.

LINK RULES
----------
  * Every link target is a canonical, indexable, existing page (verified against each page's own
    <link rel="canonical"> / robots meta). Twin edges are linked via the twin's canonical root URL.
  * No self-links (neither the page's own URL nor its canonical URL; the source-unit box also excludes the
    page's own conversion A->B). No duplicates within a box. Fewer than 5 links when fewer exist;
    a unit box with zero candidates is omitted entirely.
  * Real <a href> markup, root-absolute hrefs (so app.js translation resolves the category from the path).

RANKING (deterministic; no randomness)
--------------------------------------
  Target-unit box: the reverse conversion (B->A) first. Then, for both boxes:
    1. curated popularity tier from search-index/units.json (lower = more common); currency uses the
       project's own currency order (currency-data.json); uncurated units rank after curated ones
    2. word overlap with the source unit (closely related units, e.g. grams-per-cubic-meter vs
       kilograms-per-cubic-meter)
    3. stable crc32 rotation, so inbound links spread evenly instead of piling on alphabetical units

MODES (exactly one; default --dry-run)
--------------------------------------
  --dry-run   read-only. Computes everything, writes nothing, prints/saves a report.
  --check     read-only. Exit 0 = every selected page already up to date; 1 = updates pending;
              2 = an invariant failed (inventory/canonical/hub/link validation).
  --write     rewrites pages in place (atomic per file). Requires an explicit selection.

SELECTION: --category NAME [NAME ...] | --phase small|medium|large | --all   ('root' = the 22 root pages)
OTHER:     --root PATH (sandbox copy for testing), --report FILE.json, --show URL [URL ...],
           --gzip-sample N (gzip sizes for N pages per category; informational only)

Idempotent: injected pages carry data-internal-links="v1"; re-running regenerates the same block from the
inventory (never from page content), so a second run changes nothing.
"""
import argparse
import base64
import collections
import gzip
import html
import json
import os
import re
import subprocess
import sys
import time
import zlib
from pathlib import Path

BASE_URL = "https://theuniversalconverter.com"
REPO_ROOT = Path(__file__).resolve().parent.parent

MARKER = 'data-internal-links="v1"'
H_POPULAR = "POPULAR Converters"
HEADING_PREFIX = "More "
HEADING_SUFFIX = " Conversions"
# Package v1/v2 used the generic headings below. They are only RECOGNISED (never written) so that pages
# injected by an earlier package version can be upgraded in place.
LEGACY_UNIT_HEADING_RE = r"Unit [AB] Related Conversions"
MAX_UNIT_LINKS = 5
POPULAR_HUB_COUNT = 12
# Curated, deterministic hub selection. Own category is always first; the rest follow this order.
CURATED_HUBS = ["length", "weight", "temperature", "volume", "area", "time",
                "speed", "pressure", "energy", "power", "digital", "currency"]

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")

# units.json "tier" values are a global curated search ranking matched by token; a few tokens collide
# with an unrelated unit in another category. These are ignored for ranking.
TIER_IGNORE = {("temperature", "newton")}   # Newton temperature scale, not the force unit
# Everyday units the curated tiers omit. Explicit and tiny on purpose; ranked after the curated tiers.
EXTRA_POPULAR = {"time": ["millisecond", "week", "month", "year"]}
CURRENCY_TOP_N = 20                         # first N entries of currency-data.json count as "popular"
SMALL_CATEGORY_MAX_UNITS = 12               # in a tiny category every unit is closely related
# SI prefixes accepted as "same family" (kilograms ~ grams ~ milligrams). Order = commonness.
COMMON_PREFIXES = ["kilo", "milli", "centi", "micro", "mega", "nano", "giga", "deci", "hecto", "deca", "tera", "pico"]

# Root flagship pages: slug -> (category, source unit token, destination unit token).
# Cross-checked against app.js seoMap in validate_flagship_table(); never guessed.
FLAGSHIP = {
    "acre-to-hectare": ("area", "acres", "hectares"),
    "acres-to-hectares": ("area", "acres", "hectares"),
    "hectares-to-acres": ("area", "hectares", "acres"),
    "square-feet-to-square-meters": ("area", "square-feet", "square-meters"),
    "celsius-to-fahrenheit": ("temperature", "celsius", "fahrenheit"),
    "fahrenheit-to-celsius": ("temperature", "fahrenheit", "celsius"),
    "feet-to-meters": ("length", "feet", "meters"),
    "meters-to-feet": ("length", "meters", "feet"),
    "meter-to-feet": ("length", "meters", "feet"),
    "inches-to-cm": ("length", "inches", "centimeters"),
    "km-to-miles": ("length", "kilometers", "miles"),
    "miles-to-km": ("length", "miles", "kilometers"),
    "gallons-to-liters": ("volume", "gallons", "liters"),
    "liters-to-gallons": ("volume", "liters", "gallons"),
    "liter-to-gallon": ("volume", "liters", "gallons"),
    "grams-to-ounces": ("weight", "grams", "ounces"),
    "kg-to-lbs": ("weight", "kilograms", "pounds"),
    "lbs-to-kg": ("weight", "pounds", "kilograms"),
    "gb-to-mb": ("digital", "gb", "mb"),
    "mph-to-kmh": ("speed", "mile-per-hour", "kilometer-per-hour"),
    "psi-to-bar": ("pressure", "psi", "bar"),
    "watts-to-horsepower": ("power", "watts", "horsepower"),
}
# app.js seoMap ids for the flagship slugs, used only to cross-check the table above.
FLAGSHIP_APPJS_IDS = {
    "mph-to-kmh": ("speed", "mile_per_hour", "kilometer_per_hour"),
    "psi-to-bar": ("pressure", "psi", "bar"),
    "gb-to-mb": ("digital", "gigabyte", "megabyte"),
    "watts-to-horsepower": ("power", "watt", "horsepower_mechanical"),
}

CANON_RE = re.compile(r'<link rel="canonical" href="([^"]*)"')
ROBOTS_RE = re.compile(r'<meta name="robots" content="([^"]*)"')
GRID_COUNT_RE = re.compile(r'class="page-grid"')
ORIG_RE = re.compile(
    r'(?P<indent>[ \t]*)<section class="page-grid">(?P<nl>\r?\n)'
    r'[ \t]*<article class="page-card">\r?\n'
    r'[ \t]*<h2>Related conversions</h2>\r?\n'
    r'[ \t]*<ul class="seo-link-list">(?P<list>.*?)</ul>\r?\n'
    r'[ \t]*</article>\r?\n'
    r'[ \t]*</section>', re.S)
# Older root-page template: the grid also holds Formula / Conversion table cards, so only the Related
# ARTICLE is replaced (marker goes on the first new card).
ART_ORIG_RE = re.compile(
    r'(?P<indent>[ \t]*)<article class="page-card">(?P<nl>\r?\n)'
    r'[ \t]*<h2>Related conversions</h2>\r?\n'
    r'[ \t]*<ul class="seo-link-list">(?P<list>.*?)</ul>\r?\n'
    r'[ \t]*</article>', re.S)
ART_DONE_RE = re.compile(
    r'(?P<indent>[ \t]*)<article class="page-card" ' + re.escape(MARKER) + r'>(?P<nl>\r?\n).*?</article>'
    r'(?:\r?\n[ \t]*<article class="page-card">\r?\n[ \t]*<h2>(?:' + LEGACY_UNIT_HEADING_RE + r'|More [^<]+ Conversions)</h2>.*?</article>){0,2}', re.S)
DONE_RE = re.compile(
    r'(?P<indent>[ \t]*)<section class="page-grid" ' + re.escape(MARKER) + r'>(?P<nl>\r?\n).*?</section>', re.S)


# ----------------------------------------------------------------------------------------------
# inventory
# ----------------------------------------------------------------------------------------------
class Inventory:
    def __init__(self, root):
        self.root = Path(root)
        units = json.loads((self.root / "search-index" / "units.json").read_text(encoding="utf-8"))
        self.cat_ids = [c["id"] for c in units["categories"]]
        self.label = {c["id"]: c["label"] for c in units["categories"]}
        self.toks, self.names, self.tier, self.idx = {}, {}, {}, {}
        self.out = {}          # cat -> {i: [j, ...]} (sorted)
        self.url_override = {}  # (cat, i, j) -> canonical URL path for twin edges
        self.bitmap_urls = set()
        self._rank_cache = {}
        self.disp = {}
        self.hname = {}      # abbreviation-safe unit names used in the 'More ... Conversions' headings
        cur_order = self._currency_order()
        for c in units["categories"]:
            cid = c["id"]
            toks = [u[0] for u in c["u"]]
            self.toks[cid] = toks
            self.names[cid] = [u[1] for u in c["u"]]
            self.disp[cid] = [display_name(n) for n in self.names[cid]]
            self.hname[cid] = [heading_name(u[1], u[2] if len(u) > 2 else "") for u in c["u"]]
            tier = [u[3] for u in c["u"]]
            if cid == "currency":   # project's own currency order; ignore the unrelated 'cup' tier
                tier = [cur_order.get(t, 999) if cur_order.get(t, 999) < CURRENCY_TOP_N else 999 for t in toks]
            else:
                tier = [t if (t < 99 and (cid, toks[k]) not in TIER_IGNORE) else 999 for k, t in enumerate(tier)]
            for n_, t_ in enumerate(EXTRA_POPULAR.get(cid, [])):
                if t_ in toks:
                    tier[toks.index(t_)] = min(tier[toks.index(t_)], 90 + n_)
            self.tier[cid] = tier
            self.idx[cid] = {t: i for i, t in enumerate(toks)}
            shard = json.loads((self.root / "search-index" / "pairs" / f"{cid}.json").read_text(encoding="utf-8"))
            n = shard["n"]
            if n != len(toks):
                raise SystemExit(f"inventory error: {cid} shard n={n} != units {len(toks)}")
            data = base64.b64decode(shard["b"])
            out = collections.defaultdict(list)
            for i in range(n):
                base = i * n
                for j in range(n):
                    k = base + j
                    if (data[k >> 3] >> (k & 7)) & 1:
                        out[i].append(j)
                        self.bitmap_urls.add(f"/{cid}/{toks[i]}-to-{toks[j]}/")
            self.out[cid] = out
        self.cat_page_count = {cid: sum(len(v) for v in self.out[cid].values()) for cid in self.cat_ids}

    def _currency_order(self):
        p = self.root / "currency-data.json"
        if not p.exists():
            return {}
        return {k.lower(): n for n, k in enumerate(json.loads(p.read_text(encoding="utf-8")).keys())}

    def ranked(self, cid, src):
        """Relevant out-neighbours of unit `src`, best first (cached; call only after twin edges are added)."""
        key = (cid, src)
        r = self._rank_cache.get(key)
        if r is None:
            r = self._rank_cache[key] = rank_candidates(self, cid, src, list(self.out[cid].get(src, [])))
        return r

    def edge_url(self, cid, i, j):
        return self.url_override.get((cid, i, j)) or f"/{cid}/{self.toks[cid][i]}-to-{self.toks[cid][j]}/"

    def add_twin_edge(self, cid, i, j, canonical_path):
        if j in self.out[cid].get(i, []):
            raise SystemExit(f"inventory error: twin edge {cid} {i}->{j} already exists in the bitmap")
        self.out[cid][i] = sorted(self.out[cid].get(i, []) + [j])
        self.url_override[(cid, i, j)] = canonical_path
        self._rank_cache.clear()

    def hub_anchor(self, cid):
        return f"{self.label[cid].title()} Converter"


# ----------------------------------------------------------------------------------------------
# link selection + rendering
# ----------------------------------------------------------------------------------------------
def _words(token):
    return {w for w in token.split("-") if w and w not in ("per", "to", "of")}


def _family(token):
    """Strip a common SI prefix: kilograms -> grams. Returns (base, prefix_rank) ; rank 99 = not prefixed."""
    for r, pre in enumerate(COMMON_PREFIXES):
        if token.startswith(pre) and len(token) - len(pre) >= 3:
            return token[len(pre):], r
    return token, 99


def rank_candidates(inv, cid, src, cands, primary=None):
    """Keep only RELEVANT candidates, ranked. A candidate qualifies when it is: the reverse conversion,
    a curated common unit, shares words with the source unit, is in the source's SI-prefix family, or the
    category is tiny. Anything else is dropped rather than used as filler."""
    toks, tier = inv.toks[cid], inv.tier[cid]
    sw = _words(toks[src])
    s_base, _ = _family(toks[src])
    small = len(toks) <= SMALL_CATEGORY_MAX_UNITS
    scored = []
    for x in cands:
        tw = _words(toks[x])
        union = len(sw | tw) or 1
        overlap = (1000 * len(sw & tw)) // union
        x_base, x_rank = _family(toks[x])
        fam = (x_base == s_base) or (x_base == toks[src]) or (s_base == toks[x])
        fam_rank = x_rank if fam else 99
        if fam and x_rank == 99:      # e.g. grams vs kilograms: the unprefixed member of the family
            fam_rank = 50
        if not (x == primary or tier[x] < 999 or overlap > 0 or fam or small):
            continue
        scored.append((0 if x == primary else 1, tier[x], fam_rank, -overlap, zlib.crc32(f"{cid}|{src}|{x}".encode()), x))
    scored.sort()
    return [t[-1] for t in scored]


_LOWER_OK = {"per", "of", "and", "in", "to", "a"}


def display_name(name):
    """Consistent anchor capitalisation: 'Square feet' -> 'Square Feet'; acronyms/symbols untouched."""
    return " ".join(w[:1].upper() + w[1:] if (w[:1].islower() and w not in _LOWER_OK) else w for w in name.split(" "))


def esc(text):
    return html.escape(text, quote=True)


def li(href, text):
    return f'<li><a href="{href}">{esc(text)}</a></li>'


def popular_hubs(inv, own):
    order = [own] + [c for c in CURATED_HUBS if c != own]
    return order[:POPULAR_HUB_COUNT]


def plan_links(inv, cid, a, b, own_urls):
    """Return (popular, unitA, unitB) as lists of (href, text, target_url)."""
    popular = [(f"/{c}/", inv.hub_anchor(c), f"/{c}/") for c in popular_hubs(inv, cid)]
    names = inv.disp[cid]
    out = inv.out[cid]
    # Ranking depends only on the source unit, so it is computed once per (category, unit).
    ranked_a = inv.ranked(cid, a)
    a_cands = [x for x in ranked_a if x != b and inv.edge_url(cid, a, x) not in own_urls]
    ranked_b = inv.ranked(cid, b)
    b_cands = ([a] if a in out.get(b, []) else []) + [x for x in ranked_b if x != a]
    b_cands = [x for x in b_cands if inv.edge_url(cid, b, x) not in own_urls]
    unit_a = [(inv.edge_url(cid, a, x), f"{names[a]} to {names[x]}", inv.edge_url(cid, a, x))
              for x in a_cands[:MAX_UNIT_LINKS]]
    unit_b = [(inv.edge_url(cid, b, x), f"{names[b]} to {names[x]}", inv.edge_url(cid, b, x))
              for x in b_cands[:MAX_UNIT_LINKS]]
    return popular, unit_a, unit_b


def heading_name(name, symbol):
    """Unit name for a heading, taken from the units metadata.
    Abbreviations, rates and mixed-case symbols keep their metadata form (km/h, mph, PSI, GB, inHgs);
    ordinary names get consistent capitalisation ('Square feet' -> 'Square Feet'). Slugs are never used."""
    if "/" in name or name.lower() == str(symbol).lower() or any(ch.isupper() for ch in name[1:]):
        return name
    return display_name(name)


def unit_headings(inv, cid, a, b):
    """('More <source> Conversions', 'More <target> Conversions'): the source unit is always first."""
    names = inv.hname[cid]
    return (f"{HEADING_PREFIX}{names[a]}{HEADING_SUFFIX}", f"{HEADING_PREFIX}{names[b]}{HEADING_SUFFIX}")


def render_cards(ci, nl, popular, unit_a, unit_b, heads, mark_first=False):
    def card(heading, items, mark=False):
        attr = f" {MARKER}" if mark else ""
        return (f'{ci}<article class="page-card"{attr}>{nl}'
                f'{ci}  <h2>{heading}</h2>{nl}'
                f'{ci}  <ul class="seo-link-list">{"".join(li(h, t) for h, t, _ in items)}</ul>{nl}'
                f'{ci}</article>')
    parts = [card(H_POPULAR, popular, mark_first)]
    if unit_a:
        parts.append(card(esc(heads[0]), unit_a))
    if unit_b:
        parts.append(card(esc(heads[1]), unit_b))
    return nl.join(parts)


def render_block(indent, nl, popular, unit_a, unit_b, heads):
    """Standard template: the whole <section class="page-grid"> is rewritten."""
    return (f'{indent}<section class="page-grid" {MARKER}>{nl}'
            + render_cards(indent + "  ", nl, popular, unit_a, unit_b, heads) + f'{nl}{indent}</section>')


# ----------------------------------------------------------------------------------------------
# page enumeration / classification
# ----------------------------------------------------------------------------------------------
def read_head(path):
    with open(path, "rb") as f:
        raw = f.read()
    text = raw.decode("utf-8")
    head = text[: text.find("</head>") if "</head>" in text else 6000]
    m = CANON_RE.search(head)
    r = ROBOTS_RE.search(head)
    return text, (m.group(1) if m else ""), (r.group(1) if r else "")


def canon_path(href):
    if href.startswith(BASE_URL + "/"):
        return href[len(BASE_URL):]
    return None


class Page:
    __slots__ = ("kind", "cid", "a", "b", "url", "path", "scope_cat", "slug")

    def __init__(self, kind, cid, a, b, url, path, scope_cat, slug):
        self.kind, self.cid, self.a, self.b, self.url, self.path, self.scope_cat, self.slug = \
            kind, cid, a, b, url, path, scope_cat, slug


def enumerate_pages(inv, root, notes):
    """Return (pages, excluded). pages: list[Page]; excluded: list[(url, reason)]."""
    pages, excluded = [], []
    root = Path(root)
    # 1. category pages straight from the authoritative bitmaps
    for cid in inv.cat_ids:
        toks = inv.toks[cid]
        for i, js in inv.out[cid].items():
            for j in js:
                slug = f"{toks[i]}-to-{toks[j]}"
                pages.append(Page("category", cid, i, j, f"/{cid}/{slug}/", root / cid / slug / "index.html", cid, slug))
    cat_urls = {p.url for p in pages}
    # 2. twins: physically inside a category folder, not in the inventory, canonical elsewhere
    twin_edges = []
    for cid in inv.cat_ids:
        d = root / cid
        with os.scandir(d) as it:
            for e in it:
                if not e.is_dir() or "-to-" not in e.name:
                    continue
                url = f"/{cid}/{e.name}/"
                if url in cat_urls:
                    continue
                fp = Path(e.path) / "index.html"
                if not fp.exists():
                    excluded.append((url, "no-index-html"))
                    continue
                _, canon, _ = read_head(fp)
                cp = canon_path(canon)
                slug = cp.strip("/") if cp else ""
                if cp and "/" not in slug and slug in FLAGSHIP and FLAGSHIP[slug][0] == cid and e.name == slug:
                    twin_edges.append((cid, slug, url, fp))
                else:
                    excluded.append((url, f"not-in-inventory-and-canonical-not-a-flagship ({canon or 'none'})"))
    for cid, slug, url, fp in sorted(twin_edges):
        _, a_tok, b_tok = FLAGSHIP[slug]
        a, b = inv.idx[cid][a_tok], inv.idx[cid][b_tok]
        inv.add_twin_edge(cid, a, b, f"/{slug}/")
        pages.append(Page("twin", cid, a, b, url, fp, cid, slug))
    # 3. root flagship pages (self-canonical)
    for slug, (cid, a_tok, b_tok) in sorted(FLAGSHIP.items()):
        fp = root / slug / "index.html"
        if not fp.exists():
            excluded.append((f"/{slug}/", "root-page-missing"))
            continue
        pages.append(Page("root", cid, inv.idx[cid][a_tok], inv.idx[cid][b_tok], f"/{slug}/", fp, "root", slug))
    return pages, excluded


def validate_flagship_table(inv, root, problems):
    for slug, (cid, a, b) in FLAGSHIP.items():
        if cid not in inv.idx or a not in inv.idx[cid] or b not in inv.idx[cid]:
            problems.append(f"flagship table: {slug} -> unresolved unit token ({cid},{a},{b})")
    appjs = Path(root) / "src" / "app.js"  # readable source; root app.js is minified
    if appjs.exists():
        txt = appjs.read_text(encoding="utf-8", errors="replace")
        for slug, (cid, fa, fb) in FLAGSHIP_APPJS_IDS.items():
            m = re.search(r'slug: "%s", categoryId: "([a-z_-]+)", from: "([a-z_]+)", to: "([a-z_]+)"' % re.escape(slug), txt)
            if not m or (m.group(1), m.group(2), m.group(3)) != (cid, fa, fb):
                problems.append(f"flagship table: app.js seoMap entry for {slug} differs from the cross-check ({m.groups() if m else None})")


# ----------------------------------------------------------------------------------------------
# core run
# ----------------------------------------------------------------------------------------------
PHASES = {"small": (0, 1500), "medium": (1500, 10000), "large": (10000, 10**9)}


def select_scopes(inv, args):
    allscopes = list(inv.cat_ids) + ["root"]
    if args.all:
        return allscopes
    if args.phase:
        lo, hi = PHASES[args.phase]
        sel = [c for c in inv.cat_ids if lo <= inv.cat_page_count[c] < hi]
        return sel + (["root"] if args.phase == "small" else [])
    bad = [c for c in (args.category or []) if c not in allscopes]
    if bad:
        raise SystemExit(f"unknown category/scope: {bad}. valid: {allscopes}")
    return args.category or []


def main(argv=None):
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except (AttributeError, ValueError):
            pass
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--root", default=str(REPO_ROOT))
    m = ap.add_mutually_exclusive_group()
    m.add_argument("--dry-run", action="store_true")
    m.add_argument("--check", action="store_true")
    m.add_argument("--write", action="store_true")
    s = ap.add_mutually_exclusive_group()
    s.add_argument("--category", nargs="+")
    s.add_argument("--phase", choices=list(PHASES))
    s.add_argument("--all", action="store_true")
    ap.add_argument("--report")
    ap.add_argument("--show", nargs="+", default=[])
    ap.add_argument("--gzip-sample", type=int, default=0)
    args = ap.parse_args(argv)
    mode = "write" if args.write else "check" if args.check else "dry-run"
    root = Path(args.root).resolve()

    inv = Inventory(root)
    problems = []
    validate_flagship_table(inv, root, problems)
    notes = []
    pages, excluded = enumerate_pages(inv, root, notes)
    scopes = select_scopes(inv, args) if (args.all or args.phase or args.category) else []
    if not scopes and not args.show:
        if mode == "write":
            raise SystemExit("--write needs an explicit selection: --category ... | --phase ... | --all")
        scopes = list(inv.cat_ids) + ["root"]
    selected = [p for p in pages if p.scope_cat in scopes]
    bypath = {p.url: p for p in pages}

    # hubs: must exist, be self-canonical and indexable (they are link destinations)
    hub_ok = {}
    for cid in inv.cat_ids:
        fp = root / cid / "index.html"
        if not fp.exists():
            problems.append(f"hub missing: /{cid}/")
            continue
        _, canon, robots = read_head(fp)
        hub_ok[cid] = (canon == f"{BASE_URL}/{cid}/" and "noindex" not in robots)
        if not hub_ok[cid]:
            problems.append(f"hub not self-canonical/indexable: /{cid}/ ({canon!r}, {robots!r})")

    if args.show:
        for u in args.show:
            p = bypath.get(u)
            if not p:
                print(f"--show {u}: not an in-scope page")
                continue
            own = {p.url}
            if p.kind == "twin":
                own.add(f"/{p.slug}/")
            pop, ua, ub = plan_links(inv, p.cid, p.a, p.b, own)
            print(f"\n== {u}  [{p.kind}]  A={inv.names[p.cid][p.a]}  B={inv.names[p.cid][p.b]}")
            heads = unit_headings(inv, p.cid, p.a, p.b)
            for title, items in ((H_POPULAR, pop), (heads[0], ua), (heads[1], ub)):
                print(f"  {title}:")
                for h, t, _ in items:
                    print(f"     {t:42s} {h}")
        if not scopes:
            return 0

    st = collections.Counter()
    per_cat = collections.defaultdict(collections.Counter)
    skipped = collections.defaultdict(list)
    valid_urls = set()            # canonical+indexable pages seen on disk
    used_targets = collections.Counter()
    dist_a, dist_b = collections.Counter(), collections.Counter()
    dup_boxes = self_links = 0
    gz_acc = collections.defaultdict(lambda: [0, 0, 0])
    gz_every = {}
    if args.gzip_sample:
        for c in scopes:
            n = sum(1 for p in selected if p.scope_cat == c)
            gz_every[c] = max(1, n // args.gzip_sample)
    seen_in_cat = collections.Counter()

    sel_set = {p.url for p in selected}

    pending_writes = []  # defer all writes until validation is complete
    for p in selected:
        c = per_cat[p.scope_cat]
        c["pages"] += 1
        try:
            text, canon, robots = read_head(p.path)
        except OSError as e:     # incomplete checkout: report, never crash
            skipped[p.scope_cat].append((p.url, f"unreadable-file ({type(e).__name__})"))
            continue
        own = {p.url}
        if p.kind == "twin":
            cp = canon_path(canon)
            if cp != f"/{p.slug}/":
                skipped[p.scope_cat].append((p.url, "twin-canonical-changed"))
                continue
            own.add(cp)
        else:
            if canon != f"{BASE_URL}{p.url}":
                skipped[p.scope_cat].append((p.url, f"canonical-mismatch ({canon!r})"))
                st["skip_canonical"] += 1
                continue
            if "noindex" in robots:
                skipped[p.scope_cat].append((p.url, "noindex"))
                continue
            valid_urls.add(p.url)
        n_grids = text.count('class="page-grid"')
        if n_grids != 1:
            skipped[p.scope_cat].append((p.url, f"page-grid-count={n_grids}"))
            continue
        # locate the single grid with a literal find, then do an anchored match (fast on 20 KB pages)
        k = text.find('<section class="page-grid"')
        while k > 0 and text[k - 1] in " \t":
            k -= 1
        mo = ORIG_RE.match(text, k) if k >= 0 else None
        md = DONE_RE.match(text, k) if k >= 0 else None
        variant = False
        if not (mo or md):
            # multi-card variant: locate the single Related article / the marked first card
            variant = True
            if text.count("<h2>Related conversions</h2>") == 1:
                j = text.find("<h2>Related conversions</h2>")
                a_ = text.rfind('<article class="page-card">', 0, j)
                while a_ > 0 and text[a_ - 1] in " \t":
                    a_ -= 1
                mo = ART_ORIG_RE.match(text, a_) if a_ >= 0 else None
            elif text.count(MARKER) == 1:
                j = text.find(f'<article class="page-card" {MARKER}>')
                while j > 0 and text[j - 1] in " \t":
                    j -= 1
                md = ART_DONE_RE.match(text, j) if j >= 0 else None
        if not (mo or md):
            skipped[p.scope_cat].append((p.url, "unrecognized-related-box-structure"))
            continue
        cur = md or mo
        pop, ua, ub = plan_links(inv, p.cid, p.a, p.b, own)
        heads = unit_headings(inv, p.cid, p.a, p.b)
        if variant:
            new_block = render_cards(cur.group("indent"), cur.group("nl"), pop, ua, ub, heads, mark_first=True)
        else:
            new_block = render_block(cur.group("indent"), cur.group("nl"), pop, ua, ub, heads)
        old_block = cur.group(0)
        # validation of generated links
        for items in (pop, ua, ub):
            urls = [t for _, _, t in items]
            if len(set(urls)) != len(urls):
                dup_boxes += 1
            if own & set(urls):
                self_links += 1
        dist_a[len(ua)] += 1
        dist_b[len(ub)] += 1
        c["links_popular"] += len(pop)
        c["links_unit_a"] += len(ua)
        c["links_unit_b"] += len(ub)
        if not ua:
            c["omitted_unit_a"] += 1
        if not ub:
            c["omitted_unit_b"] += 1
        for _, _, t in ua + ub:
            used_targets[t] += 1
        c["bytes_before"] += len(text.encode("utf-8"))
        old_b = len(old_block.encode("utf-8"))
        new_b = len(new_block.encode("utf-8"))
        c["block_bytes_before"] += old_b
        c["block_bytes_after"] += new_b
        if md:
            if old_block == new_block:
                c["up_to_date"] += 1
                continue
            c["stale"] += 1
        else:
            c["to_update"] += 1
        c["delta_bytes"] += new_b - old_b
        new_text = text[: cur.start()] + new_block + text[cur.end():]
        if args.gzip_sample and seen_in_cat[p.scope_cat] % gz_every[p.scope_cat] == 0:
            g = gz_acc[p.scope_cat]
            g[0] += 1
            g[1] += len(gzip.compress(text.encode(), 6))
            g[2] += len(gzip.compress(new_text.encode(), 6))
        seen_in_cat[p.scope_cat] += 1
        if mode == "write":
            pending_writes.append((p, new_text, c))

    # link validation: every unit-link target must be an existing, self-canonical, indexable page.
    # Targets outside the selection are verified lazily from their own <head>.
    for t in used_targets:
        if t in valid_urls:
            continue
        tp = bypath.get(t)
        if tp is None:
            continue
        try:
            with open(tp.path, "rb") as f:
                raw = f.read(8192).decode("utf-8", "replace")
        except OSError:
            continue    # stays unverified -> reported as a problem
        m_, r_ = CANON_RE.search(raw), ROBOTS_RE.search(raw)
        if m_ and m_.group(1) == f"{BASE_URL}{t}" and not (r_ and "noindex" in r_.group(1)):
            valid_urls.add(t)
    unverified_targets = [t for t in used_targets if t not in valid_urls]
    if unverified_targets:
        for t in unverified_targets[:20]:
            problems.append(f"link target not verified canonical+indexable: {t}")
    st["bad_targets"] = len(unverified_targets)
    disallow, redirects = load_access_rules(root)
    inaccessible = []
    for t in list(used_targets) + [f"/{c}/" for c in inv.cat_ids]:
        why = inaccessible_reason(t, disallow, redirects)
        if why:
            inaccessible.append((t, why))
    for t, why in inaccessible[:20]:
        problems.append(f"link target not accessible: {t} ({why})")
    st["inaccessible_targets"] = len(inaccessible)
    st["dup_boxes"], st["self_links"] = dup_boxes, self_links
    if dup_boxes:
        problems.append(f"{dup_boxes} boxes with duplicate links")
    if self_links:
        problems.append(f"{self_links} self-links")
    if skipped:
        problems.append(f"{sum(len(v) for v in skipped.values())} pages skipped (see report)")

    hubs_changed = hub_diff(root)
    if hubs_changed:
        hub_message = f"category hub files differ from git HEAD: {hubs_changed[:5]}"
        if mode == "write":
            print("WARNING: " + hub_message + " (preserving these hub files; they will not be written)")
        else:
            problems.append(hub_message)

    if mode == "write":
        if problems:
            print("WRITE ABORTED: validation problems were found; no conversion pages were modified.")
        else:
            for p, new_text, c in pending_writes:
                write_page(root, p, new_text)
                c["written"] += 1
    tot = collections.Counter()
    for c in per_cat.values():
        tot.update(c)
    inbound = sorted(used_targets.values())
    report = {
        "mode": mode, "scopes": scopes, "root": str(root),
        "in_scope_pages": len(selected),
        "by_kind": dict(collections.Counter(p.kind for p in selected)),
        "twins_updated": sorted(p.url for p in selected if p.kind == "twin"),
        "excluded_from_scope": excluded,
        "skipped": {k: v for k, v in skipped.items()},
        "totals": dict(tot),
        "per_scope": {k: dict(v) for k, v in sorted(per_cat.items())},
        "unit_a_link_count_distribution": dict(sorted(dist_a.items())),
        "unit_b_link_count_distribution": dict(sorted(dist_b.items())),
        "distinct_unit_link_targets": len(used_targets),
        "inbound_links_per_target": {"min": inbound[0] if inbound else 0, "median": inbound[len(inbound) // 2] if inbound else 0,
                                     "max": inbound[-1] if inbound else 0},
        "broken_or_noncanonical_targets": st.get("bad_targets", 0),
        "inaccessible_targets": st.get("inaccessible_targets", 0),
        "duplicate_link_boxes": dup_boxes, "self_links": self_links,
        "hubs_valid": hub_ok, "hubs_changed_vs_git_head": hubs_changed,
        "gzip_sample": {k: {"pages": v[0], "before": v[1], "after": v[2]} for k, v in gz_acc.items()},
        "problems": problems,
    }
    if args.report:
        Path(args.report).write_text(json.dumps(report, indent=1), encoding="utf-8")
    print_summary(report, mode)
    if mode == "check":
        if problems:
            return 2 if any(not p.endswith("(see report)") for p in problems) else 1
        return 0 if (tot["to_update"] + tot["stale"] == 0) else 1
    return 0 if not problems else 2 if mode == "write" else 0


def load_access_rules(root):
    """Static accessibility rules: robots.txt Disallow (User-agent: *) and _redirects sources.
    GitHub Pages ignores _redirects, but a target that a redirect rule would move is still rejected."""
    root = Path(root)
    disallow, redirects = [], []
    rp = root / "robots.txt"
    if rp.exists():
        applies = False
        for line in rp.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.split("#")[0].strip()
            if line.lower().startswith("user-agent:"):
                applies = line.split(":", 1)[1].strip() == "*"
            elif applies and line.lower().startswith("disallow:"):
                v = line.split(":", 1)[1].strip()
                if v:
                    disallow.append(v)
    rd = root / "_redirects"
    if rd.exists():
        for line in rd.read_text(encoding="utf-8", errors="replace").splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = line.split()
            if len(parts) >= 2:
                redirects.append((parts[0], parts[1]))
    return disallow, redirects


def inaccessible_reason(target, disallow, redirects):
    for d in disallow:
        if target.startswith(d):
            return f"robots.txt Disallow: {d}"
    for src, dest in redirects:
        if src.endswith("*"):
            hit = target.startswith(src[:-1])
        else:
            hit = target == src or target.rstrip("/") == src.rstrip("/")
        if hit and dest.rstrip("/") != target.rstrip("/"):   # a pure trailing-slash rule is harmless
            return f"redirect rule: {src} -> {dest}"
    return None


def write_page(root, p, new_text):
    path = Path(p.path).resolve()
    rel = path.relative_to(Path(root).resolve())
    parts = rel.parts
    ok = (len(parts) == 3 and parts[2] == "index.html" and "-to-" in parts[1] and parts[0] in FLAGSHIP_CATS()) or \
         (len(parts) == 2 and parts[1] == "index.html" and parts[0] in FLAGSHIP)
    if not ok:
        raise SystemExit(f"refusing to write outside conversion-page scope: {rel}")
    tmp = path.with_name("index.html.tmp-il")
    tmp.write_bytes(new_text.encode("utf-8"))
    try:
        for attempt in range(8):
            try:
                os.replace(tmp, path)
                break
            except PermissionError:          # antivirus / search indexer can briefly lock a file on Windows
                if attempt == 7:
                    raise
                time.sleep(0.25 * (attempt + 1))
    finally:
        if tmp.exists():
            try:
                tmp.unlink()
            except OSError:
                pass


_CATS = None


def FLAGSHIP_CATS():
    global _CATS
    if _CATS is None:
        units = json.loads((REPO_ROOT / "search-index" / "units.json").read_text(encoding="utf-8"))
        _CATS = {c["id"] for c in units["categories"]}
    return _CATS


def hub_diff(root):
    """Hubs must remain byte-identical to git HEAD (skipped when root is not the git work tree).
    Uses `git status` (works on huge working trees) and FAILS LOUDLY if git errors instead of reporting 'no changes'."""
    if Path(root).resolve() != REPO_ROOT or not (REPO_ROOT / ".git").exists():
        return []   # not a git work tree (e.g. a ZIP download): hubs are verified by SHA-256 by the caller
    cats = sorted(FLAGSHIP_CATS())
    r = subprocess.run(["git", "status", "--porcelain=v1", "-z", "-uno", "--"] + [f"{c}/index.html" for c in cats],
                       cwd=REPO_ROOT, capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        return [f"git status failed: {r.stderr.strip()[:120]}"]
    return [e[3:] for e in r.stdout.split("\0") if e]


def print_summary(r, mode):
    t = r["totals"]
    print(f"\n=== inject_internal_links [{mode}] ===")
    print(f"scopes: {len(r['scopes'])}  in-scope pages: {r['in_scope_pages']:,}  by kind: {r['by_kind']}")
    print(f"to update: {t.get('to_update', 0):,}  already current: {t.get('up_to_date', 0):,}  stale: {t.get('stale', 0):,}  "
          f"written: {t.get('written', 0):,}  skipped: {sum(len(v) for v in r['skipped'].values()):,}")
    print(f"links  POPULAR={t.get('links_popular', 0):,}  UnitA={t.get('links_unit_a', 0):,}  UnitB={t.get('links_unit_b', 0):,}")
    print(f"omitted boxes  UnitA={t.get('omitted_unit_a', 0)}  UnitB={t.get('omitted_unit_b', 0)}")
    print(f"unit A link-count distribution {r['unit_a_link_count_distribution']}")
    print(f"unit B link-count distribution {r['unit_b_link_count_distribution']}")
    print(f"duplicate boxes: {r['duplicate_link_boxes']}  self-links: {r['self_links']}  "
          f"broken/non-canonical targets: {r['broken_or_noncanonical_targets']}  inaccessible (robots/redirect): {r['inaccessible_targets']}")
    print(f"raw bytes: pages {t.get('bytes_before', 0):,}  related-block before {t.get('block_bytes_before', 0):,} "
          f"after {t.get('block_bytes_after', 0):,}  delta {t.get('delta_bytes', 0):+,}")
    if r["problems"]:
        print("PROBLEMS:")
        for p in r["problems"][:25]:
            print("  -", p)


if __name__ == "__main__":
    sys.exit(main())
