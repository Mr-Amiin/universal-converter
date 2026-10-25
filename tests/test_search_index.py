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


if __name__ == "__main__":
    unittest.main()
