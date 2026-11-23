"""Translation-coverage check for the sections that used to fall back to English:
category hubs (Popular / All Conversions), SEO pages (Formula explanation and the
Unit-vs-Unit comparison table), sitemap.html and the mobile hamburger menu.

Data check only (no browser needed):  python -m unittest tests.test_i18n_coverage
Browser audit (needs Playwright + a local server): see tests/i18n_browser_audit.py
"""
import json, re, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LANGS = "es fr de pt it ar zh ja ko hi tr id so".split()  # English is the page source
APP_JS = (ROOT / "app.js").read_text(encoding="utf-8")
VOCAB = json.loads((ROOT / "tests/fixtures/i18n_comparison_vocab.json").read_text(encoding="utf-8"))

HUB_KEYS = ["popular_conversions_heading", "all_conversions_heading_template",
            "all_conversions_search_label_template", "all_conversions_example_suffix",
            "all_conversions_count_template", "all_conversions_show_template",
            "all_conversions_hide_template", "quick_facts_heading", "category_why_heading_template",
            "qf_sub_label_units", "qf_sub_label_industries", "qf_sub_label_uses"]
SEO_KEYS = ["factor_explanation_template", "comparison_aspect_label", "comparison_family_label",
            "comparison_typical_use_label", "comparison_vs_connector", "formula", "about_converting"]
SITEMAP_KEYS = ["sitemap_eyebrow", "sitemap_intro", "sitemap_open_xml", "sitemap_back_home",
                "sitemap_overview_aria", "sitemap_search_aria", "sitemap_categories_aria",
                "sitemap_route_count_template", "sitemap_search_label", "sitemap_search_placeholder",
                "sitemap_show_pages_template", "sitemap_pages_count_template", "sitemap_show_more_template",
                "sitemap_loading", "sitemap_load_failed", "sitemap_status_none",
                "sitemap_status_some_template", "sitemap_converter_template"]
NAV_KEYS = ["openMenu", "closeMenu", "mobileNavigation", "primaryNavigation", "homeLink",
            "switchTheme", "selectLanguage", "changeLanguage"]


def load(lang):
    return json.loads((ROOT / f"i18n-seo/{lang}.json").read_text(encoding="utf-8"))


def tokens(s):
    return sorted(set(re.findall(r"\{[A-Z_]+\}", s)))


class TestI18nCoverage(unittest.TestCase):
    def test_exactly_the_14_registered_languages_have_dictionaries(self):
        registered = set(re.findall(r'\{ code: "(\w+)", name:', APP_JS))
        self.assertEqual(len(registered), 14)
        files = {p.stem for p in (ROOT / "i18n-seo").glob("*.json")}
        self.assertEqual(registered - {"en"}, files)

    def test_chrome_keys_present_and_translated(self):
        en_ref = load("es")["chrome"]
        for lang in LANGS:
            chrome = load(lang)["chrome"]
            for key in HUB_KEYS + SEO_KEYS + SITEMAP_KEYS:
                with self.subTest(lang=lang, key=key):
                    self.assertTrue(chrome.get(key), "missing or empty")
                    if key.endswith("_template") or key.endswith("_suffix"):
                        self.assertEqual(tokens(chrome[key]), tokens(en_ref[key]), "placeholder mismatch")

    def test_no_ungrammatical_category_compounds(self):
        for lang in LANGS:
            for key, value in load(lang)["chrome"].items():
                with self.subTest(lang=lang, key=key):
                    self.assertNotIn("{CATEGORY}-", str(value))
                    self.assertNotIn("{NAME}-", str(value))

    def test_comparison_vocabulary_covered(self):
        want = VOCAB["family"] + VOCAB["use"]
        for lang in LANGS:
            table = load(lang).get("comparisonText", {})
            missing = [k for k in want if not table.get(k)]
            with self.subTest(lang=lang):
                self.assertEqual(missing, [], f"{len(missing)} of {len(want)} comparison strings untranslated")

    def test_sitemap_static_labels_covered(self):
        direct = [l for l in VOCAB["sitemap_labels"]
                  if not re.search(r"^(Guides|About|Contact)$", l)]
        for lang in LANGS:
            labels = load(lang).get("sitemapLabels", {})
            for need in ["Main pages", "Trust and legal", "Privacy Policy", "Terms of Use", "References"]:
                with self.subTest(lang=lang, label=need):
                    self.assertTrue(labels.get(need))

    def test_nav_aria_keys_in_all_14_languages(self):
        for key in NAV_KEYS:
            with self.subTest(key=key):
                self.assertEqual(len(re.findall(rf"\b{key}: \"", APP_JS)), 14)

    def test_hub_inline_scripts_use_hooks(self):
        hubs = [p for p in ROOT.glob("*/index.html") if "allConversionsCount" in p.read_text(encoding="utf-8")]
        self.assertEqual(len(hubs), 27)
        for p in hubs:
            t = p.read_text(encoding="utf-8")
            with self.subTest(hub=p.parent.name):
                self.assertIn("window.ucHubCount", t)
                self.assertIn("window.ucHubSearchMatcher", t)
                self.assertIn("window.ucHubCardsChanged", t)
                # cards must render plain English text and be translated lazily:
                # a per-card hook at render time would hang the 100k+ card hubs
                self.assertNotIn("window.ucHubCardTitle", t)

    def test_why_convert_bodies_cover_every_hub_with_matching_links(self):
        hubs = {}
        for p in ROOT.glob("*/index.html"):
            t = p.read_text(encoding="utf-8")
            m = re.search(r'seo-why-convert">\s*<h2>.*?</h2>\s*<p>(.*?)</p>', t, re.S)
            if m:
                hubs[p.parent.name] = len(re.findall(r"<a ", m.group(1)))
        self.assertEqual(len(hubs), 26)
        for lang in LANGS:
            bodies = load(lang).get("whyConvertBody", {})
            self.assertEqual(sorted(bodies), sorted(hubs), lang)
            for slug, n_links in hubs.items():
                with self.subTest(lang=lang, hub=slug):
                    placeholders = sorted(re.findall(r"\{L\d+\}", bodies[slug]))
                    self.assertEqual(placeholders, sorted("{L%d}" % i for i in range(1, n_links + 1)))
            self.assertTrue(load(lang)["chrome"].get("category_converters_link_template"))

    def test_xml_sitemap_untouched(self):
        self.assertNotIn("ucSitemap", (ROOT / "sitemap.xml").read_text(encoding="utf-8")[:200000])


if __name__ == "__main__":
    unittest.main()
