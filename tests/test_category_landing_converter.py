"""
Tests for the category-specific converter on category landing pages.

Run from the repo root:
    python3 -m unittest tests.test_category_landing_converter -v

Requires: playwright (python) with a Chromium build available.
Third-party ad/analytics requests are blocked so the tests are hermetic.

ROLLOUT: CONVERTER_CATEGORIES lists the landing pages that have been given the
converter so far. Add a folder name here when another category is rolled out;
every test below then covers it automatically. The "audit" tests run over ALL
landing pages and prove that pages not yet converted are byte-identical to HEAD.
"""
import functools
import http.server
import math
import os
import re
import subprocess
import threading
import unittest
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
CONVERTER_CATEGORIES = ["agriculture", "angle", "area", "astronomy", "chemistry", "cooking", "currency", "density", "digital", "electricity", "energy", "engineering", "flow-rate", "force", "frequency", "fuel-economy", "length", "power", "pressure", "radiation", "scientific", "speed", "temperature", "time", "torque", "volume", "weight"]

# Landing-page folder -> registry category id (only where they differ)
REGISTRY_ID = {"flow-rate": "flow", "fuel-economy": "fuel_economy"}

# Homepage-link fix: files that were intentionally edited so homepage links point at "/" instead of
# index.html - the hand-written static pages and their STATIC/ mirrors, the page generators (+ their
# TOOLING/ copies) and the template they read, the homepage itself and the admin page.
# Exact file names only (no globs, no directories). Generated converter pages
# (<category>/<slug>/index.html) must never be listed here; the guard test asserts that.
HOMEPAGE_LINK_FIX_FILES = frozenset({
    "STATIC/about.html",
    "STATIC/acre-vs-hectare.html",
    "STATIC/celsius-vs-fahrenheit.html",
    "STATIC/contact.html",
    "STATIC/currency-measurement-converter.html",
    "STATIC/digital-storage-units-guide.html",
    "STATIC/guides.html",
    "STATIC/length-converter.html",
    "STATIC/metric-vs-imperial.html",
    "STATIC/offline.html",
    "STATIC/online-calculator.html",
    "STATIC/pressure-units-guide.html",
    "STATIC/privacy.html",
    "STATIC/references.html",
    "STATIC/temperature-converter.html",
    "STATIC/terms.html",
    "STATIC/unit-converter.html",
    "STATIC/weight-converter.html",
    "STATIC/what-is-a-kilometer.html",
    "TOOLING/generate_new_pages.py",
    "TOOLING/generate_seo_pages_from_sitemap.py",
    "about.html",
    "acre-vs-hectare.html",
    "admin/index.html",
    "celsius-vs-fahrenheit.html",
    "contact.html",
    "currency-measurement-converter.html",
    "digital-storage-units-guide.html",
    "generate_new_pages.py",
    "generate_seo_pages_from_sitemap.py",
    "guides.html",
    "index.html",
    "length-converter.html",
    "metric-vs-imperial.html",
    "offline.html",
    "online-calculator.html",
    "pressure-units-guide.html",
    "privacy.html",
    "references.html",
    "sitemap.html",
    "temperature-converter.html",
    "templates/kg-to-lbs-template - Copy.html",
    "templates/kg-to-lbs-template.html",
    "terms.html",
    "unit-converter.html",
    "weight-converter.html",
    "what-is-a-kilometer.html",
})

# The existing SEO conversion page each landing converter was copied from. Each
# was verified at runtime to initialise as its own category. (digital has no SEO
# page for its default pair byte->megabyte, so a byte->... page was used; torque's
# source page is the one whose runtime init has the known "pound-feet" bug, so
# PARITY_PAGE gives a Torque SEO page that works for behaviour comparisons.)
SOURCE_SEO_PAGE = {
    "agriculture": "acre-to-hectare",
    "angle": "degrees-to-radians",
    "area": "square-meters-to-acres",
    "astronomy": "astronomical-unit-to-light-year",
    "chemistry": "gram-per-liter-to-milligram-per-liter",
    "cooking": "cup-us-to-milliliter",
    "currency": "usd-to-eur",
    "density": "kilogram-per-cubic-meter-to-pound-per-cubic-foot",
    "digital": "byte-to-bit",
    "electricity": "volts-to-kilovolts",
    "energy": "joules-to-kilowatt-hours",
    "engineering": "psi-to-pascal",
    "flow-rate": "liter-per-second-to-gallon-us-per-minute",
    "force": "newtons-to-pound-forces",
    "frequency": "hertz-to-rpm",
    "fuel-economy": "mile-per-gallon-us-to-liter-per-100-kilometer",
    "length": "meters-to-feet",
    "power": "watts-to-horsepower",
    "pressure": "pascal-to-psi",
    "radiation": "gray-to-rad-absorbed",
    "scientific": "angstroms-to-nanometers",
    "speed": "kmh-to-mph",
    "temperature": "celsius-to-fahrenheit",
    "time": "hour-to-day",
    "torque": "newton-meters-to-pound-feet",
    "volume": "liters-to-gallons",
    "weight": "kg-to-lbs",
}
PARITY_PAGE = dict(SOURCE_SEO_PAGE, torque="newton-meters-to-kilogram-force-meters")

# The inline `window.__categoryConversions = [...]` script on category landing
# pages has a pre-existing syntax error. It is unrelated to this feature, so it
# is tolerated here (and only here) so it can't mask any NEW error.
KNOWN_PREEXISTING_ERRORS = {"Unexpected token ')'"}

BLOCKED = ("googlesyndication", "google-analytics", "googletagmanager")

# app.js is an IIFE, so its unit registry is private. The tests serve an
# instrumented copy with two read-only probes (the file on disk is untouched):
#   window.__reg      -> [{id, units:[unitId,...]}, ...] from the real registry
#   window.__getState -> the live converter state object
_APP_SRC = (ROOT / "app.js").read_text(encoding="utf8")
_REG_LINE = "const categoryMap = new Map(categories.map((category) => [category.id, category]));"
assert _APP_SRC.count(_REG_LINE) == 1 and _APP_SRC.rstrip().endswith("}());")
INSTRUMENTED_APP = _APP_SRC.replace(
    _REG_LINE,
    _REG_LINE + "\nwindow.__reg = categories.map((c) => ({ id: c.id, defaultFrom: c.defaultFrom, defaultTo: c.defaultTo, units: c.units.map((u) => u.id) }));",
).rstrip()
INSTRUMENTED_APP = INSTRUMENTED_APP[: -len("}());")] + "window.__getState = () => state;\n}());\n"


def all_landing_pages():
    return sorted(
        p.parent.name
        for p in ROOT.glob("*/index.html")
        if 'id="allConversions"' in p.read_text(encoding="utf8")
    )


def git_head(path):
    # Decode explicitly as UTF-8 (the default locale encoding on Windows is not UTF-8,
    # and text mode would also translate newlines).
    out = subprocess.run(["git", "show", f"HEAD:{path}"], cwd=ROOT, capture_output=True, check=True).stdout
    return out.decode("utf8")


class _QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


class BrowserCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        handler = functools.partial(_QuietHandler, directory=str(ROOT))
        cls.httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.base = f"http://127.0.0.1:{cls.httpd.server_address[1]}"
        threading.Thread(target=cls.httpd.serve_forever, daemon=True).start()
        cls.pw = sync_playwright().start()
        cls.browser = cls.pw.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.pw.stop()
        cls.httpd.shutdown()

    def open(self, path, width=1280, height=900, app_src=None):
        app_src = INSTRUMENTED_APP if app_src is None else app_src
        page = self.browser.new_page(viewport={"width": width, "height": height})
        self.addCleanup(page.close)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.route(
            "**/*",
            lambda r: r.abort() if any(k in r.request.url for k in BLOCKED) else r.continue_(),
        )
        page.route(
            re.compile(r"/app\.js(\?.*)?$"),
            lambda r: r.fulfill(status=200, content_type="application/javascript", body=INSTRUMENTED_APP),
        )
        page.goto(self.base + path, wait_until="load")
        page.wait_for_function("document.querySelectorAll('#fromUnit option').length > 0 || !document.getElementById('fromUnit')")
        page.wait_for_timeout(300)
        page.errors = errors
        return page

    @staticmethod
    def registry_unit_ids(page, category_id):
        # window.__reg mirrors the site's authoritative unit registry (see instrumentation above).
        return page.evaluate(
            "(id) => window.__reg.find((c) => c.id === id).units", category_id
        )

    @staticmethod
    def new_errors(page):
        return [e for e in page.errors if e not in KNOWN_PREEXISTING_ERRORS]


def convert(page, from_id, to_id, value):
    page.select_option("#fromUnit", from_id)
    page.select_option("#toUnit", to_id)
    page.fill("#fromValue", str(value))
    page.wait_for_timeout(50)
    return page.input_value("#toValue")


class TestLandingStructure(unittest.TestCase):
    """1, 8: placement after the H1 and preservation of existing page content."""

    def test_converter_is_immediately_after_h1_hero(self):
        for cat in CONVERTER_CATEGORIES:
            with self.subTest(category=cat):
                html = (ROOT / cat / "index.html").read_text(encoding="utf8")
                h1 = html.index("<h1")
                hero_end = html.index("</section>", h1)
                after_hero = html[hero_end + len("</section>"):].lstrip()
                self.assertTrue(
                    after_hero.startswith('<section class="converter-section category-landing-converter"'),
                    "converter must be the very next block after the hero containing the H1",
                )
                # exactly one H1, and exactly one converter
                self.assertEqual(html.count("<h1"), 1)
                self.assertEqual(html.count('id="fromUnit"'), 1)

    def test_converter_markup_is_an_exact_copy_of_the_source_seo_page(self):
        """Every landing converter is copied from a real SEO page of the same category.
        Exactly three lines may differ: the section marker, the hidden accessible title,
        and the hidden description."""

        def block(html, marker):
            start = html.index(marker)
            depth = 0
            for m in re.finditer(r"<section\b|</section>", html[start:]):
                depth += -1 if m.group(0) == "</section>" else 1
                if depth == 0:
                    return html[start : start + m.end()]

        for cat in CONVERTER_CATEGORIES:
            with self.subTest(category=cat):
                src = (ROOT / cat / SOURCE_SEO_PAGE[cat] / "index.html").read_text(encoding="utf8")
                land = (ROOT / cat / "index.html").read_text(encoding="utf8")
                s = [l.strip() for l in block(src, '<section class="converter-section">').splitlines() if l.strip()]
                d = [l.strip() for l in block(land, '<section class="converter-section category-landing-converter"').splitlines() if l.strip()]
                self.assertEqual(len(s), len(d))
                diffs = [(a, b) for a, b in zip(s, d) if a != b]
                self.assertEqual(len(diffs), 3, diffs)
                (m1, m2), (t1, t2), (d1, d2) = diffs
                self.assertEqual(m1, '<section class="converter-section">')
                self.assertEqual(
                    m2, f'<section class="converter-section category-landing-converter" data-category-converter="{cat}">'
                )
                self.assertTrue(t1.startswith('<h2 id="converterTitle" class="visually-hidden">'))
                self.assertTrue(t2.startswith('<h2 id="converterTitle" class="visually-hidden">') and t2.endswith(" converter</h2>"))
                self.assertTrue(d1.startswith('<p id="activeCategoryDescription">'))
                self.assertEqual(d2, d1.replace('<p id="activeCategoryDescription">', '<p id="activeCategoryDescription" hidden>', 1))

    def test_existing_content_metadata_and_seo_unchanged(self):
        """Apart from the KNOWN insertions (the category converter block, and the collapsed "All conversions" wrapper
        added by collapse_seo_links.py), every landing page equals HEAD byte-for-byte: title, meta, canonical, JSON-LD,
        links, intro, popular, all-conversions, FAQ/related sections, scripts and footer. Works both before the
        converters are committed (HEAD has none) and after (HEAD has them: then the blocks must be identical too)."""

        def strip_known(html):
            html = html.replace('<div class="seo-links-panel" id="allConversionsPanel" hidden>\n        ', "", 1)
            html = re.sub(r'\n        </div>\n        <div class="seo-links-actions">.*?</script>', "", html, count=1, flags=re.S)
            start = html.find('<section class="converter-section category-landing-converter"')
            if start < 0:
                return html, None
            depth, end = 0, None
            for m in re.finditer(r"<section\b|</section>", html[start:]):
                depth += -1 if m.group(0) == "</section>" else 1
                if depth == 0:
                    end = start + m.end()
                    break
            block = html[start:end]
            return html.replace("\n\n      " + block, "", 1), block

        for cat in CONVERTER_CATEGORIES:
            with self.subTest(category=cat):
                # normalise CRLF (a Windows checkout with core.autocrlf) so only content is compared
                cur = (ROOT / cat / "index.html").read_bytes().decode("utf8").replace("\r\n", "\n")
                cur_rest, cur_block = strip_known(cur)
                head_rest, head_block = strip_known(git_head(f"{cat}/index.html"))
                self.assertIsNotNone(cur_block, "the converter block must be present")
                self.assertEqual(cur.count(cur_block), 1)
                if head_block is not None:
                    self.assertEqual(cur_block, head_block, "converter block must equal the committed one")
                self.assertEqual(cur_rest, head_rest)

    def test_audit_all_landing_pages(self):
        """Audit every category landing page. Converted ones must contain the
        converter; every other page must be byte-identical to HEAD (so the
        rollout cannot have changed them by accident)."""
        pages = all_landing_pages()
        self.assertGreaterEqual(len(pages), 26)
        converted, pending = [], []
        for cat in pages:
            html = (ROOT / cat / "index.html").read_text(encoding="utf8")
            if 'data-category-converter="' in html:
                converted.append(cat)
            else:
                pending.append(cat)
                self.assertEqual(html, git_head(f"{cat}/index.html"), f"{cat} changed unexpectedly")
        self.assertEqual(sorted(converted), sorted(CONVERTER_CATEGORIES))
        print(f"\n[audit] landing pages checked: {len(pages)} | with converter: {len(converted)} {converted} | pending: {len(pending)}")


class TestTorqueConverterBrowser(BrowserCase):
    CAT = "torque"

    def test_only_own_units_in_both_dropdowns(self):
        """2, 3, 4"""
        page = self.open("/torque/")
        registry = self.registry_unit_ids(page, "torque")
        for sel in ("#fromUnit", "#toUnit"):
            ids = page.eval_on_selector_all(f"{sel} option", "o => o.map(x => x.value)")
            self.assertEqual(ids, registry, f"{sel} must equal the registered torque units, in order")
        # nothing from any other category is offered: every option is a torque-registry unit,
        # and the only units of other categories that appear are ones torque itself registers
        other_only = page.evaluate(
            """() => {
              const own = new Set(window.__reg.find(c => c.id === 'torque').units);
              return window.__reg.filter(c => c.id !== 'torque')
                .flatMap(c => c.units)
                .filter(id => !own.has(id));
            }"""
        )
        offered = set(page.eval_on_selector_all("#fromUnit option, #toUnit option", "o => o.map(x => x.value)"))
        self.assertEqual(offered & set(other_only), set())
        # no category switcher / other-category UI inside the converter
        side = page.eval_on_selector_all("#categoryList button", "b => b.map(x => x.innerText)")
        self.assertEqual(len(side), 1)
        self.assertIn("Torque", side[0])
        self.assertEqual(page.locator(".category-landing-converter a").count(), 0)
        self.assertEqual(page.locator("#unitSearch").count(), 0)
        self.assertEqual(len(registry), 29)
        self.assertEqual(self.new_errors(page), [])

    def test_initializes_as_torque_independently_of_the_inline_conversions_script(self):
        """The inline <script> holding window.__categoryConversions (and the page's
        search code) has a pre-existing syntax error. The converter must not depend on
        it: it initializes identically with that script as shipped, removed, or fixed."""
        html = (ROOT / "torque/index.html").read_text(encoding="utf8")
        k = html.index("window.__categoryConversions = [")
        start, end = html.rfind("<script>", 0, k), html.index("</script>", k) + len("</script>")
        variants = {
            "as shipped": html,
            "script removed": html[:start] + html[end:],
            "typo fixed": html.replace("}]);\n        (function", "}];\n        (function", 1),
        }
        seen = []
        for name, body in variants.items():
            page = self.browser.new_page()
            self.addCleanup(page.close)
            page.route("**/*", lambda r: r.abort() if any(k in r.request.url for k in BLOCKED) else r.continue_())
            def serve(route, _request=None, body=body):
                route.fulfill(status=200, content_type="text/html", body=body)

            page.route("**/torque/", serve)
            page.goto(self.base + "/torque/", wait_until="load")
            page.wait_for_timeout(500)
            state = (
                page.input_value("#fromValue"), page.input_value("#fromUnit"),
                page.input_value("#toUnit"), page.locator("#fromUnit option").count(),
                page.locator("#categoryList button").count(),
            )
            self.assertEqual(state, ("1", "newton_meter", "pound_foot", 29, 1), name)
            self.assertTrue(math.isclose(float(page.input_value("#toValue")), 0.737562, rel_tol=1e-5), name)
            seen.append(state)
        self.assertEqual(len(set(seen)), 1)

    def test_state_is_torque_and_not_length_default(self):
        page = self.open("/torque/")
        self.assertEqual(page.evaluate("window.__getState().categoryId"), "torque")
        self.assertEqual(page.input_value("#fromUnit"), "newton_meter")
        self.assertEqual(page.input_value("#toUnit"), "pound_foot")
        self.assertIn("Pound-foot", page.inner_text("#resultText"))
        # default on first load, before any interaction: 1 N m -> ~0.737562 lb ft
        self.assertEqual(page.input_value("#fromValue"), "1")
        self.assertTrue(math.isclose(float(page.input_value("#toValue")), 0.737562, rel_tol=1e-5))

    def test_url_params_cannot_switch_category(self):
        page = self.open("/torque/?category=length&from=meter&to=foot")
        ids = page.eval_on_selector_all("#fromUnit option", "o => o.map(x => x.value)")
        self.assertEqual(ids, self.registry_unit_ids(page, "torque"))
        self.assertEqual(page.evaluate("window.__getState().categoryId"), "torque")

    def test_representative_conversions(self):
        """5"""
        page = self.open("/torque/")
        cases = [
            ("newton_meter", "pound_foot", "1", 0.737562149277),
            ("pound_foot", "newton_meter", "1", 1.3558179483314),
            ("pound_inch", "pound_foot", "12", 1.0),
            ("pound_foot", "pound_inch", "1", 12.0),
            ("pound_inch", "ounce_inch", "1", 16.0),
            ("kilogram_force_meter", "newton_meter", "1", 9.80665),
            ("newton_meter", "kilogram_force_meter", "9.80665", 1.0),
            ("newton_meter", "pound_inch", "100", 885.0746),
        ]
        for f, t, v, expected in cases:
            with self.subTest(f=f, t=t, v=v):
                out = float(convert(page, f, t, v).replace(",", ""))
                self.assertTrue(math.isclose(out, expected, rel_tol=1e-4), f"{out} != {expected}")

    def test_prefixed_units_round_trip_and_all_pairs_finite(self):
        """4: every unit pairs with every other unit and gives a finite result."""
        page = self.open("/torque/")
        ids = self.registry_unit_ids(page, "torque")
        page.fill("#fromValue", "1")
        for f in ids:
            page.select_option("#fromUnit", f)
            for t in ids:
                page.select_option("#toUnit", t)
                val = page.input_value("#toValue").replace(",", "")
                self.assertNotIn(val.lower(), ("", "nan", "infinity"), f"{f}->{t}")
        # kilonewton-meter really is 1000 N m
        kn = next(i for i in ids if "kilonewton" in i)
        out = float(convert(page, kn, "newton_meter", "1").replace(",", ""))
        self.assertEqual(out, 1000.0)

    HOSTILE_STORAGE = """
      localStorage.setItem('uc-favorites', JSON.stringify(['length','currency','torque']));
      localStorage.setItem('uc-recent', JSON.stringify(['length','weight','torque']));
      localStorage.setItem('uc-history', JSON.stringify([
        {text:'1 Meter = 3.28 Foot', categoryId:'length', categoryName:'Length'},
        {text:'1 N m = 0.7376 lb ft', categoryId:'torque', categoryName:'Torque'}]));
    """

    def test_locked_against_url_storage_and_list_clicks(self):
        ctx = self.browser.new_context(viewport={"width": 1280, "height": 900})
        self.addCleanup(ctx.close)
        ctx.add_init_script(self.HOSTILE_STORAGE)
        page = ctx.new_page()
        page.errors = []
        page.on("pageerror", lambda e: page.errors.append(str(e)))
        page.route("**/*", lambda r: r.abort() if any(k in r.request.url for k in BLOCKED) else r.continue_())
        page.route(re.compile(r"/app\.js(\?.*)?$"), lambda r: r.fulfill(status=200, content_type="application/javascript", body=INSTRUMENTED_APP))
        page.goto(self.base + "/torque/?category=length&from=meter&to=foot", wait_until="load")
        page.wait_for_timeout(500)
        reg = self.registry_unit_ids(page, "torque")
        # other categories never appear in sidebar, favorites, recent or history
        self.assertEqual(page.locator("#categoryList button").count(), 1)
        for sel in ("#favoritesList", "#recentList"):
            self.assertEqual(page.eval_on_selector_all(f"{sel} button", "b => b.map(x => x.innerText)"), ["Torque Converter"])
        hist = page.inner_text("#historyList")
        self.assertNotIn("Meter", hist)
        self.assertIn("lb ft", hist)
        # click every list button, then swap: still torque
        for sel in ("#recentList button", "#favoritesList button", "#categoryList button"):
            for i in range(page.locator(sel).count()):
                page.locator(sel).nth(i).click()
        page.click("#swapButton")
        for sel in ("#fromUnit", "#toUnit"):
            self.assertEqual(page.eval_on_selector_all(f"{sel} option", "o => o.map(x => x.value)"), reg)
        self.assertEqual(page.evaluate("window.__getState().categoryId"), "torque")
        self.assertEqual(self.new_errors(page), [])

    def test_design_matches_existing_seo_converter(self):
        """Landing converter uses the same markup/structure as an existing SEO page."""
        def skeleton(path):
            page = self.open(path)
            sk = page.evaluate(
                """() => {
                  const sec = document.querySelector('.converter-section');
                  const ids = [...sec.querySelectorAll('[id]')].map(e => e.id).filter(i => i !== 'converterTitle').sort();
                  const cls = [...new Set([...sec.querySelectorAll('[class]')].flatMap(e => [...e.classList]))]
                    .filter(c => c !== 'category-landing-converter').sort();
                  return {ids, cls, panels: [...sec.querySelector('.tool-layout').children].map(c => c.className.replace(/\\s+/g,' ').trim())};
                }"""
            )
            page.close()
            return sk
        landing = skeleton("/torque/")
        seo = skeleton("/torque/newton-meters-to-kilogram-force-meters/")
        self.assertEqual(landing, seo)

    def test_description_hidden_on_landing_but_not_on_seo_page(self):
        landing = self.open("/torque/")
        self.assertFalse(landing.is_visible("#activeCategoryDescription"))
        self.assertTrue(landing.is_visible("#favoriteButton"))
        # no extra 728x90 content-top ad slot on the landing page
        self.assertNotIn("content top (728x90)", landing.content())
        self.assertEqual(landing.locator('[data-ad-placement="content-top"]').count(), 0)
        landing.close()
        seo = self.open("/torque/newton-meters-to-kilogram-force-meters/")
        self.assertTrue(seo.is_visible("#activeCategoryDescription"))
        self.assertEqual(
            seo.inner_text("#activeCategoryDescription"),
            "Convert Newton meters (N m) to Kilogram-force meters (kgf m) using the exact conversion factor.",
        )

    def test_swap_button(self):
        page = self.open("/torque/")
        page.click("#swapButton")
        self.assertEqual(page.input_value("#fromUnit"), "pound_foot")
        self.assertEqual(page.input_value("#toUnit"), "newton_meter")

    def test_invalid_and_empty_input(self):
        """validation: never shows NaN or throws"""
        page = self.open("/torque/")
        for bad in ("", "abc", "-", "1e999"):
            with self.subTest(bad=bad):
                page.fill("#fromValue", bad)
                page.wait_for_timeout(50)
                text = page.inner_text("#resultText") + page.input_value("#toValue")
                self.assertNotIn("NaN", text)
        self.assertEqual(self.new_errors(page), [])

    def test_layout_desktop_and_mobile(self):
        """9"""
        for name, (w, h) in {"desktop": (1280, 900), "tablet": (768, 1024), "mobile": (375, 800)}.items():
            with self.subTest(viewport=name):
                page = self.open("/torque/", w, h)
                self.assertTrue(page.is_visible("#fromValue"))
                self.assertTrue(page.is_visible("#toValue"))
                self.assertTrue(page.is_visible("#fromUnit"))
                self.assertTrue(page.is_visible("#toUnit"))
                self.assertTrue(page.is_visible("#swapButton"))
                no_hscroll = page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
                self.assertTrue(no_hscroll, "page scrolls horizontally")
                # converter sits right below the H1 block and its input is in the first viewport
                top = page.evaluate("document.getElementById('fromValue').getBoundingClientRect().top")
                self.assertLess(top, h, "input should be visible without scrolling")
                # order in DOM: h1 < converter < first intro section
                order = page.evaluate(
                    """() => {
                      const h1 = document.querySelector('h1');
                      const conv = document.querySelector('.category-landing-converter');
                      const intro = document.querySelector('.seo-intro');
                      const f = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
                      return f(h1, conv) && f(conv, intro);
                    }"""
                )
                self.assertTrue(order)


class TestEveryCategoryLandingConverter(BrowserCase):
    """The converter on EVERY category landing page: locked to its own category, correct
    default pair, registry-only units, working input/unit/swap, same behaviour as the
    category's own SEO page, and no new JavaScript errors."""

    def make_page(self, ctx, path):
        page = ctx.new_page()
        page.errors = []
        page.on("pageerror", lambda e: page.errors.append(str(e)))
        page.route("**/*", lambda r: r.abort() if any(k in r.request.url for k in BLOCKED) else r.continue_())
        page.route(
            re.compile(r"/app\.js(\?.*)?$"),
            lambda r, _req=None: r.fulfill(status=200, content_type="application/javascript", body=INSTRUMENTED_APP),
        )
        page.goto(self.base + path, wait_until="load", timeout=180000)
        page.wait_for_function(
            "typeof window.__getState === 'function' && document.querySelectorAll('#fromUnit option').length > 0",
            timeout=180000,
        )
        page.wait_for_timeout(300)
        return page

    @staticmethod
    def drive(page, a, b):
        page.select_option("#fromUnit", a)
        page.select_option("#toUnit", b)
        page.fill("#fromValue", "7")
        page.wait_for_timeout(120)
        s1 = (page.input_value("#fromUnit"), page.input_value("#toUnit"), page.input_value("#toValue"), page.inner_text("#resultText")[:90])
        page.click("#swapButton")
        page.wait_for_timeout(120)
        s2 = (page.input_value("#fromUnit"), page.input_value("#toUnit"), page.input_value("#fromValue"), page.input_value("#toValue"), page.inner_text("#resultText")[:90])
        return s1, s2

    def test_every_category_landing_converter(self):
        for cat in CONVERTER_CATEGORIES:
            with self.subTest(category=cat):
                cid = REGISTRY_ID.get(cat, cat)
                other = "weight" if cat == "length" else "length"
                # SW blocked: the site registers a service worker that would bypass route interception
                ctx = self.browser.new_context(viewport={"width": 1280, "height": 900}, service_workers="block")
                try:
                    ctx.add_init_script(
                        f"""localStorage.setItem('uc-cookie-consent','declined');
                        localStorage.setItem('uc-favorites', JSON.stringify([...new Set(['{other}','currency','{cid}'])]));
                        localStorage.setItem('uc-recent', JSON.stringify(['{other}','{cid}']));
                        localStorage.setItem('uc-history', JSON.stringify([{{text:'1 X = 2 Y',categoryId:'{other}',categoryName:'Other'}}]));"""
                    )
                    page = self.make_page(ctx, f"/{cat}/?category={other}&from=meter&to=foot")
                    reg = page.evaluate("(id) => window.__reg.find((c) => c.id === id)", cid)
                    # locked to its own category despite ?category=<other> and stored other-category state
                    self.assertEqual(page.evaluate("window.__getState().categoryId"), cid)
                    # category default pair, from the shared registry
                    self.assertEqual((page.input_value("#fromUnit"), page.input_value("#toUnit")), (reg["defaultFrom"], reg["defaultTo"]))
                    self.assertEqual(page.input_value("#fromValue"), "1")
                    self.assertNotIn("NaN", page.inner_text("#resultText"))
                    # only this category's registered units, in both dropdowns
                    for sel in ("#fromUnit", "#toUnit"):
                        self.assertEqual(page.eval_on_selector_all(f"{sel} option", "o => o.map(x => x.value)"), reg["units"])
                    self.assertEqual(page.locator("#categoryList button").count(), 1)
                    self.assertLessEqual(page.locator("#favoritesList button").count(), 1)
                    self.assertLessEqual(page.locator("#recentList button").count(), 1)
                    self.assertNotIn("1 X", page.inner_text("#historyList"))
                    # description hidden on the landing page; the rest of the converter is visible
                    self.assertFalse(page.is_visible("#activeCategoryDescription"))
                    self.assertTrue(page.is_visible("#favoriteButton"))
                    self.assertNotIn("content top (728x90)", page.content())
                    # clicking every list button cannot change the category
                    for sel in ("#recentList button", "#favoritesList button", "#categoryList button"):
                        for i in range(page.locator(sel).count()):
                            page.locator(sel).nth(i).click()
                    self.assertEqual(page.evaluate("window.__getState().categoryId"), cid)
                    self.assertEqual(page.locator("#fromUnit option").count(), len(reg["units"]))
                    # a COMPATIBLE pair gives a numeric result; swap exchanges the units
                    comp = None
                    for cand in reg["units"][:40]:
                        if cand == reg["defaultFrom"]:
                            continue
                        page.select_option("#fromUnit", reg["defaultFrom"])
                        page.select_option("#toUnit", cand)
                        page.fill("#fromValue", "7")
                        page.wait_for_timeout(60)
                        txt = page.inner_text("#resultText")
                        if txt.startswith("7 ") and "Choose" not in txt:
                            comp = cand
                            break
                    self.assertIsNotNone(comp, "no compatible target found for the default source unit")
                    s1, s2 = self.drive(page, reg["defaultFrom"], comp)
                    self.assertRegex(s1[2], r"^-?[0-9.,eE+-]+$")
                    self.assertEqual((s2[0], s2[1]), (s1[1], s1[0]))
                    # arbitrary pair (may cross unit families: both pages must behave identically)
                    a2, b2 = reg["units"][min(2, len(reg["units"]) - 1)], reg["units"][min(7, len(reg["units"]) - 1)]
                    x1, x2 = self.drive(page, a2, b2)
                    self.assertEqual([e for e in page.errors if e not in KNOWN_PREEXISTING_ERRORS], [])
                    # parity: the category's own SEO page does exactly the same thing
                    seo = self.make_page(ctx, f"/{cat}/{PARITY_PAGE[cat]}/")
                    self.assertEqual(seo.evaluate("window.__getState().categoryId"), cid)
                    self.assertEqual(self.drive(seo, reg["defaultFrom"], comp), (s1, s2))
                    self.assertEqual(self.drive(seo, a2, b2), (x1, x2))
                    page.close()
                    seo.close()
                    # mobile: no sideways scroll, input visible, still locked
                    m = self.make_page(ctx, f"/{cat}/")
                    m.set_viewport_size({"width": 375, "height": 800})
                    m.wait_for_timeout(150)
                    self.assertTrue(m.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"))
                    self.assertTrue(m.is_visible("#fromValue"))
                    self.assertEqual(m.evaluate("window.__getState().categoryId"), cid)
                    m.close()
                finally:
                    ctx.close()


def snapshot(page):
    """Everything a visitor sees in the converter of an existing SEO page."""
    return {
        "from_options": page.eval_on_selector_all("#fromUnit option", "o => o.map(x => x.value)"),
        "to_options": page.eval_on_selector_all("#toUnit option", "o => o.map(x => x.value)"),
        "from": page.input_value("#fromUnit"),
        "to": page.input_value("#toUnit"),
        "value": page.input_value("#fromValue"),
        "result": page.inner_text("#resultText"),
        "sidebar": page.inner_text("#categoryList"),
        "formula": page.inner_text("#formulaText"),
    }


class TestExistingPagesUnaffected(BrowserCase):
    """7: existing SEO conversion pages behave exactly as they did before this
    change. The oracle is HEAD's own app.js: every page is loaded once with
    HEAD's app.js and once with the current one and the visible converter state
    must be identical. (This deliberately does NOT assert that HEAD is correct;
    see KNOWN_PREEXISTING_SEO_BUG below.)"""

    # Pre-existing at HEAD, unrelated to this feature and intentionally NOT fixed
    # here: torque SEO slugs containing "pound-feet" resolve "feet" to the length
    # unit "foot", so the converter shows meter -> foot. e.g.
    #   /torque/newton-meters-to-pound-feet/, /torque/pound-feet-to-newton-meters/
    KNOWN_PREEXISTING_SEO_BUG = ("torque", "pound-feet")

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.head_app = git_head("app.js")

    def assert_same_as_head(self, path):
        cur = self.open(path)
        cur_snap, cur_errs = snapshot(cur), self.new_errors(cur)
        cur.close()
        head = self.open(path, app_src=self.head_app)
        head_snap, head_errs = snapshot(head), self.new_errors(head)
        head.close()
        self.assertEqual(cur_snap, head_snap, path)
        self.assertEqual(cur_errs, head_errs, path)
        return cur_snap

    def test_torque_seo_pages_identical_to_head_and_correct(self):
        snap = self.assert_same_as_head("/torque/newton-meters-to-kilogram-force-meters/")
        reg = self.registry_unit_ids(self.open("/torque/"), "torque")
        self.assertEqual(snap["from_options"], reg)
        self.assertEqual(snap["to_options"], reg)
        self.assertEqual((snap["from"], snap["to"]), ("newton_meter", "kilogram_force_meter"))
        self.assertIn("Torque", snap["sidebar"])
        # the two popular pages affected by the pre-existing bug are still byte-for-byte
        # the same as before (neither fixed nor made worse)
        self.assert_same_as_head("/torque/newton-meters-to-pound-feet/")
        self.assert_same_as_head("/torque/pound-feet-to-newton-meters/")

    def test_no_seo_page_or_other_landing_file_modified(self):
        """Only app.js, the 27 landing pages and this test file (plus the explicitly listed
        HOMEPAGE_LINK_FIX_FILES, plus service-worker.js for its cache-version bump) may differ from HEAD.
        Set UC_BASELINE_STATUS to a file holding `git status --short` taken BEFORE the
        patch was applied to exempt your own pre-existing uncommitted work."""
        changed = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"], cwd=ROOT, capture_output=True, encoding="utf8", check=True
        ).stdout.splitlines()
        untracked = subprocess.run(
            ["git", "ls-files", "--others", "--exclude-standard"], cwd=ROOT, capture_output=True, encoding="utf8", check=True
        ).stdout.splitlines()
        allowed = {"app.js", "tests/test_category_landing_converter.py"} | {
            f"{c}/index.html" for c in CONVERTER_CATEGORIES
        }
        # collapsed "All conversions" list: one scoped CSS block + its own test file (collapse_seo_links.py)
        allowed |= {"styles.css", "tests/test_seo_links_disclosure.py"}
        # homepage-link fix: explicit file names only, and never a generated converter page
        self.assertEqual(
            {f for f in HOMEPAGE_LINK_FIX_FILES if f.count("/") >= 2 and f.endswith("/index.html")},
            set(),
            "generated converter pages must never be exempted",
        )
        allowed |= HOMEPAGE_LINK_FIX_FILES
        # service worker: intentional one-line cache-version bump (v17 -> v18) shipped with the
        # homepage-link fix so returning PWA users replace their cached app.js. Exact name only.
        allowed |= {"service-worker.js"}
        preexisting = set()
        baseline = os.environ.get("UC_BASELINE_STATUS")
        if baseline:
            for line in Path(baseline).read_text(encoding="utf-8-sig").splitlines():
                if line.strip():
                    preexisting.add(line[3:].strip().strip('"').replace("\\", "/"))
        # `git status` shows an untracked FOLDER as one entry ("?? seo-reports/") while ls-files lists its files:
        # a baseline entry ending in "/" therefore exempts everything beneath it.
        exempt_dirs = tuple(p for p in preexisting if p.endswith("/"))
        stray = {p for p in set(changed + untracked) - allowed - preexisting if not p.startswith(exempt_dirs)}
        self.assertEqual(stray, set())

    def test_sample_seo_pages_every_category_identical_to_head(self):
        """One SEO conversion page from every category folder behaves exactly as
        under HEAD's app.js (unit lists, selection, result, sidebar, formula)."""
        checked = 0
        for cat in all_landing_pages():
            sub = sorted(d for d in (ROOT / cat).iterdir() if d.is_dir() and (d / "index.html").exists())
            if not sub:
                continue
            slug = sub[len(sub) // 2].name
            with self.subTest(page=f"/{cat}/{slug}/"):
                snap = self.assert_same_as_head(f"/{cat}/{slug}/")
                self.assertNotIn("NaN", snap["result"])
                checked += 1
        print(f"\n[audit] SEO pages compared against HEAD (one per category): {checked}")
        self.assertGreaterEqual(checked, 25)

    def test_all_landing_pages_load_without_new_errors(self):
        """The shared app.js change must not break any landing page, converted or not."""
        pages = all_landing_pages()
        for cat in pages:
            with self.subTest(page=f"/{cat}/"):
                page = self.open(f"/{cat}/")
                errs = self.new_errors(page)
                has_converter = page.locator("#fromUnit").count()
                page.close()
                self.assertEqual(errs, [])
                if cat not in CONVERTER_CATEGORIES:
                    self.assertEqual(has_converter, 0)
        print(f"\n[audit] landing pages loaded in browser: {len(pages)}")

    def test_currency_seo_page_rate_handling_unchanged(self):
        cur = sorted(d.name for d in (ROOT / "currency").iterdir() if d.is_dir() and (d / "index.html").exists())
        self.assertTrue(cur)
        page = self.open(f"/currency/{cur[0]}/")
        self.assertEqual(self.new_errors(page), [])
        self.assertEqual(page.evaluate("window.__getState().categoryId"), "currency")
        self.assertNotIn("NaN", page.inner_text("#resultText"))
        self.assert_same_as_head(f"/currency/{cur[0]}/")


if __name__ == "__main__":
    unittest.main()
