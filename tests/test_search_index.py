"""
Tests for generate_search_index.py using a small synthetic site.
Run:  python3 -m unittest tests.test_search_index -v     (from the repository root)

The real-site checks (index == every canonical page on disk) run inside the
generator itself and via `python3 generate_search_index.py --check`.
"""
import base64
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import generate_search_index as gsi  # noqa: E402

BASE = "https://theuniversalconverter.com"


def page(title, canonical=None, extra_head=""):
    canon = f'<link rel="canonical" href="{canonical}">' if canonical else ""
    return f"<!doctype html><html><head><title>{title}</title>{canon}{extra_head}</head><body></body></html>"


def conv(cat, slug, title, site):
    d = site / cat / slug
    d.mkdir(parents=True, exist_ok=True)
    (d / "index.html").write_text(page(title, f"{BASE}/{cat}/{slug}/"), encoding="utf-8")


class SearchIndexGeneratorTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.site = Path(self.tmp.name) / "site"
        self.out = Path(self.tmp.name) / "out"
        self.site.mkdir()
        (self.site / "index.html").write_text(page("Universal Converter", f"{BASE}/"), encoding="utf-8")
        for slug, title in [
            ("knot-to-mile-per-hour", "Knots to mph Converter — kn to mph"),
            ("mile-per-hour-to-knot", "mph to Knots Converter — mph to kn"),
            ("knot-to-kilometer-per-hour", "Knots to km/h Converter — kn to km/h"),
        ]:
            conv("speed", slug, title, self.site)
        (self.site / "speed" / "index.html").write_text(page("Speed", f"{BASE}/speed/"), encoding="utf-8")

    def tearDown(self):
        self.tmp.cleanup()

    def run_gen(self, *extra):
        return gsi.main(["--site-dir", str(self.site), "--out-dir", str(self.out), *extra])

    def load(self):
        manifest = json.loads((self.out / "manifest.json").read_text(encoding="utf-8"))
        units = json.loads((self.out / "units.json").read_text(encoding="utf-8"))
        pages = json.loads((self.out / "pages.json").read_text(encoding="utf-8"))
        shards = {c["id"]: json.loads((self.out / c["shard"]).read_text(encoding="utf-8")) for c in manifest["categories"]}
        return manifest, units, pages, shards

    def urls(self):
        _, units, pages, shards = self.load()
        return gsi.expand_urls(units, pages, shards)

    def test_basic_expansion_matches_pages_on_disk(self):
        self.assertEqual(self.run_gen(), 0)
        self.assertEqual(
            self.urls(),
            {"/", "/speed/", "/speed/knot-to-mile-per-hour/", "/speed/mile-per-hour-to-knot/", "/speed/knot-to-kilometer-per-hour/"},
        )
        manifest, units, _, _ = self.load()
        self.assertEqual(manifest["totals"]["categoryPages"], 3)
        knot = next(u for u in units["categories"][0]["u"] if u[0] == "knot")
        self.assertEqual(knot[1:3], ["Knots", "kn"])
        self.assertEqual(knot[3], gsi.POPULAR_TIER["knot"])

    def test_noindex_redirect_duplicate_pages_are_excluded(self):
        conv("speed", "knot-to-meter-per-second", "Knots to m/s Converter — kn to m/s", self.site)
        # noindex
        d = self.site / "speed" / "knot-to-foot-per-second"
        d.mkdir()
        (d / "index.html").write_text(page("Knots to ft/s Converter — kn to ft/s", f"{BASE}/speed/knot-to-foot-per-second/",
                                           '<meta name="robots" content="noindex, follow">'), encoding="utf-8")
        # meta refresh redirect stub
        d = self.site / "speed" / "knot-to-mach"
        d.mkdir()
        (d / "index.html").write_text(page("Redirect", None, '<meta http-equiv="refresh" content="0; url=/speed/">'), encoding="utf-8")
        # duplicate whose canonical is another EXISTING page
        d = self.site / "speed" / "knots-to-mph"
        d.mkdir()
        (d / "index.html").write_text(page("Knots to mph Converter — kn to mph", f"{BASE}/speed/knot-to-mile-per-hour/"), encoding="utf-8")
        self.assertEqual(self.run_gen(), 0)
        urls = self.urls()
        for gone in ("/speed/knot-to-foot-per-second/", "/speed/knot-to-mach/", "/speed/knots-to-mph/"):
            self.assertNotIn(gone, urls)
        self.assertIn("/speed/knot-to-meter-per-second/", urls)
        manifest, *_ = self.load()
        reasons = manifest["stats"]["excludedByReason"]
        self.assertEqual(reasons.get("noindex"), 1)
        self.assertEqual(reasons.get("meta-refresh-redirect"), 1)
        self.assertEqual(reasons.get("canonical-elsewhere"), 1)

    def test_orphan_canonical_policy(self):
        d = self.site / "speed" / "knot-to-yard-per-second"
        d.mkdir()
        (d / "index.html").write_text(page("Knots to yd/s Converter — kn to yd/s", f"{BASE}/knot-to-yard-per-second/"), encoding="utf-8")
        self.assertEqual(self.run_gen("--orphan-canonicals", "exclude"), 0)
        self.assertNotIn("/speed/knot-to-yard-per-second/", self.urls())
        self.assertEqual(self.run_gen(), 0)  # default: index under the URL it is really served at
        self.assertIn("/speed/knot-to-yard-per-second/", self.urls())
        self.assertNotIn("/knot-to-yard-per-second/", self.urls(), "the nonexistent canonical must never be indexed")
        manifest, *_ = self.load()
        self.assertEqual(manifest["stats"]["orphanCanonicalPages"], 1)

    def test_invalid_slugs_are_not_indexed(self):
        # two "-to-" separators, uppercase, same unit on both sides
        for slug in ("a-to-b-to-c", "Knot-to-Mph", "knot-to-knot"):
            d = self.site / "speed" / slug
            d.mkdir()
            (d / "index.html").write_text(page("x", f"{BASE}/speed/{slug}/"), encoding="utf-8")
        self.assertEqual(self.run_gen(), 0)
        urls = self.urls()
        self.assertFalse([u for u in urls if "a-to-b" in u or "Knot" in u or "knot-to-knot" in u])
        manifest, *_ = self.load()
        self.assertEqual(manifest["stats"]["skippedUnclassified"].get("invalid-conversion-slug"), 3)

    def test_no_duplicate_urls_and_bitmap_matches_pairs(self):
        self.assertEqual(self.run_gen(), 0)
        manifest, units, _, shards = self.load()
        shard = shards["speed"]
        self.assertEqual(shard["p"], 3)
        bits = base64.b64decode(shard["b"])
        self.assertEqual(sum(bin(b).count("1") for b in bits), 3)
        self.assertEqual(len(bits), (shard["n"] ** 2 + 7) // 8)

    def test_check_mode_detects_stale_index(self):
        self.assertEqual(self.run_gen(), 0)
        self.assertEqual(self.run_gen("--check"), 0)
        conv("speed", "knot-to-meter-per-second", "Knots to m/s Converter — kn to m/s", self.site)
        self.assertEqual(self.run_gen("--check"), 1)
        self.assertEqual(self.run_gen(), 0)
        self.assertEqual(self.run_gen("--check"), 0)

    def test_output_is_deterministic(self):
        self.assertEqual(self.run_gen(), 0)
        first = {p.name: p.read_bytes() for p in self.out.rglob("*.json")}
        self.assertEqual(self.run_gen(), 0)
        second = {p.name: p.read_bytes() for p in self.out.rglob("*.json")}
        self.assertEqual(first, second)

    def test_empty_site_refuses_to_write(self):
        empty = Path(self.tmp.name) / "empty"
        empty.mkdir()
        self.assertEqual(gsi.main(["--site-dir", str(empty), "--out-dir", str(self.out)]), 1)

    def test_curated_aliases_and_tiers(self):
        aliases, kws, tier = gsi.curated_for_token("kilometer-per-hour")
        self.assertIn("kph", aliases)
        self.assertEqual(tier, gsi.POPULAR_TIER["kilometer_per_hour"])
        aliases, _, _ = gsi.curated_for_token("pounds")
        self.assertIn("lbs", aliases)
        self.assertEqual(gsi.curated_for_token("quettameter-per-day")[2], gsi.TIER_DEFAULT)

    # ---- popular root pages: curated display names survive SEO-style titles -------------------

    def root_conv(self, slug, title):
        d = self.site / slug
        d.mkdir(parents=True, exist_ok=True)
        (d / "index.html").write_text(page(title, f"{BASE}/{slug}/"), encoding="utf-8")

    def popular_entry(self, slug):
        _, _, pages, _ = self.load()
        return next(p for p in pages["pages"] if p["u"] == slug + "/")

    def test_popular_root_display_names_ignore_rewritten_titles(self):
        # "Convert kg to lbs" is the real <title> of /kg-to-lbs/ today; it must not become the display name.
        self.root_conv("kg-to-lbs", "Convert kg to lbs")
        self.root_conv("mph-to-kmh", "Convert mph to kph")
        self.assertEqual(self.run_gen(), 0)
        kg = self.popular_entry("kg-to-lbs")
        self.assertEqual(kg["t"], "Kilograms to Pounds")
        self.assertEqual((kg["f"]["n"], kg["f"].get("y"), kg["o"]["n"], kg["o"].get("y")), ("Kilograms", "kg", "Pounds", "lb"))
        mph = self.popular_entry("mph-to-kmh")
        self.assertEqual(mph["t"], "mph to km/h")
        self.assertEqual((mph["f"].get("y"), mph["o"].get("y")), ("mph", "km/h"))

    def test_popular_root_curated_names_do_not_depend_on_the_title_at_all(self):
        self.root_conv("kg-to-lbs", "Totally different title")
        self.assertEqual(self.run_gen(), 0)
        self.assertEqual(self.popular_entry("kg-to-lbs")["t"], "Kilograms to Pounds")

    def test_curated_table_is_limited_to_root_slugs_and_well_formed(self):
        for slug, row in gsi.POPULAR_ROOT_DISPLAY.items():
            self.assertTrue(gsi.SLUG_RE.match(slug), slug)
            self.assertEqual(len(slug.split("-to-")), 2, slug)
            self.assertEqual(len(row), 4, slug)
            self.assertTrue(row[0] and row[2], f"{slug}: names must not be empty")
        self.assertEqual(len(gsi.POPULAR_ROOT_DISPLAY), 11)

    def test_uncurated_root_page_still_uses_its_title(self):
        # Behaviour for every root page not in the table is unchanged.
        self.root_conv("gb-to-mb", "Gigabytes to Megabytes Converter — GB to MB")
        self.assertEqual(self.run_gen(), 0)
        e = self.popular_entry("gb-to-mb")
        self.assertEqual((e["f"]["n"], e["f"].get("y"), e["o"]["n"], e["o"].get("y")), ("Gigabytes", "GB", "Megabytes", "MB"))

    def test_category_page_with_unconventional_title_is_still_indexed(self):
        # electricity/watts-to-amperes/ has the title "Watts to Amps Converter | TheUniversalConverter",
        # which does not match the "<names> Converter — <symbols>" pattern. It must still get its bit.
        conv("electricity", "watts-to-amperes", "Watts to Amps Converter | TheUniversalConverter", self.site)
        conv("electricity", "watts-to-kilowatts", "Watts to Kilowatts Converter — W to kW", self.site)
        (self.site / "electricity" / "index.html").write_text(page("Electricity", f"{BASE}/electricity/"), encoding="utf-8")
        self.assertEqual(self.run_gen(), 0)
        self.assertIn("/electricity/watts-to-amperes/", self.urls())
        _, units, _, shards = self.load()
        rows = next(c for c in units["categories"] if c["id"] == "electricity")["u"]
        idx = {r[0]: i for i, r in enumerate(rows)}
        shard, n = shards["electricity"], shards["electricity"]["n"]
        bits = base64.b64decode(shard["b"])
        k = idx["watts"] * n + idx["amperes"]
        self.assertEqual((bits[k >> 3] >> (k & 7)) & 1, 1)
        # amperes keeps its curated search aliases, so "amps" can resolve to it
        self.assertEqual(rows[idx["amperes"]][4], ["a", "amp", "amps"])

    # ---- the root-only override must never reach nested category pages ---------------------------
    # The real tree has nested pages that share a curated root slug (weight/kg-to-lbs/,
    # length/meters-to-feet/, speed/mph-to-kmh/ ...). Today they declare the root page as their
    # canonical and are excluded as duplicates, so nothing leaks. These tests make them
    # self-canonical (indexable) with deliberately different titles, so any inheritance of the
    # curated root values would show up.

    def unit_row(self, cat, token):
        _, units, _, _ = self.load()
        rows = next(c for c in units["categories"] if c["id"] == cat)["u"]
        return next(r for r in rows if r[0] == token)

    def test_category_page_does_not_inherit_root_display_override(self):
        self.root_conv("kg-to-lbs", "Convert kg to lbs")                       # curated root page
        conv("weight", "kg-to-lbs", "Kilos to Quid Converter — KX to QX", self.site)   # same slug, nested
        self.assertEqual(self.run_gen(), 0)
        # root entry still gets the curated names/symbols ...
        root = self.popular_entry("kg-to-lbs")
        self.assertEqual(root["t"], "Kilograms to Pounds")
        self.assertEqual((root["f"].get("y"), root["o"].get("y")), ("kg", "lb"))
        # ... while the nested page's units come ONLY from its own title.
        self.assertEqual(self.unit_row("weight", "kg")[1:3], ["Kilos", "KX"])
        self.assertEqual(self.unit_row("weight", "lbs")[1:3], ["Quid", "QX"])
        self.assertIn("/weight/kg-to-lbs/", self.urls())
        self.assertIn("/kg-to-lbs/", self.urls())

    def test_category_page_with_root_style_title_falls_back_not_to_curated_names(self):
        # Same situation as the real root title "Convert mph to kph", but on a nested page:
        # it must take the generic slug fallback, never the curated root names.
        conv("speed", "mph-to-kmh", "Convert mph to kph", self.site)
        self.assertEqual(self.run_gen(), 0)
        self.assertEqual(self.unit_row("speed", "mph")[1:3], ["Mph", ""])
        self.assertEqual(self.unit_row("speed", "kmh")[1:3], ["Kmh", ""])
        manifest, *_ = self.load()
        self.assertEqual(manifest["stats"]["fallbackTitles"], 1)

    def test_only_root_pages_become_popular_conversion_entries(self):
        self.root_conv("kg-to-lbs", "Convert kg to lbs")
        conv("weight", "kg-to-lbs", "Kilos to Quid Converter — KX to QX", self.site)
        conv("speed", "mph-to-kmh", "mph to km/h Converter — mph to km/h", self.site)
        self.assertEqual(self.run_gen(), 0)
        _, _, pages, _ = self.load()
        conv_urls = [p["u"] for p in pages["pages"] if p.get("x") == "conv"]
        self.assertEqual(conv_urls, ["kg-to-lbs/"], "nested pages must never appear as popular root entries")
        for u in conv_urls:
            self.assertEqual(u.count("/"), 1, f"{u} is not a root-level URL")


if __name__ == "__main__":
    unittest.main()
