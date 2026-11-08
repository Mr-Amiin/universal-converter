"""
Tests for the collapsed-by-default "All <Category> Conversions" SEO link list on the 27 category landing pages
(collapse_seo_links.py, v2: hidden panel + toggle button at the bottom-right of the grid). From the repo root:

    python -m unittest tests.test_seo_links_disclosure -v

Static tests need no browser. Browser tests reuse BrowserCase from tests/test_category_landing_converter.py.
Pages with more than BIG links (density 166k, flow-rate 102k, currency 24k) are toggled and state-checked but not fully
laid out in the browser tests; laying out all of their links is slow and is exactly what this feature avoids.
"""
import re
import unittest

from tests.test_category_landing_converter import BrowserCase, CONVERTER_CATEGORIES, ROOT, git_head

PAGES = list(CONVERTER_CATEGORIES)
BIG = 20000
SMALL = 5000
ANCHOR = re.compile(r"<a\b[^>]*>.*?</a>", re.S)


def without_converter(html):
    a = html.find('<section class="converter-section')
    if a < 0:
        return html
    depth = 0
    for m in re.finditer(r"<section\b|</section>", html[a:]):
        depth += -1 if m.group(0) == "</section>" else 1
        if depth == 0:
            return html[:a] + html[a + m.end() :]


def section(html):
    a = html.index('<section class="all-conversions-hub" id="allConversions"')
    depth = 0
    for m in re.finditer(r"<section\b|</section>", html[a:]):
        depth += -1 if m.group(0) == "</section>" else 1
        if depth == 0:
            return html[a : a + m.end()]


class TestStaticHtml(unittest.TestCase):
    def test_every_page_has_a_hidden_panel_around_all_links_and_a_button_after_it(self):
        for cat in PAGES:
            with self.subTest(page=cat):
                sec = section((ROOT / cat / "index.html").read_text(encoding="utf8"))
                self.assertEqual(sec.count('id="allConversionsPanel"'), 1)
                self.assertIn('<div class="seo-links-panel" id="allConversionsPanel" hidden>', sec)
                p0 = sec.index('id="allConversionsPanel"')
                grid = sec.index('id="allConversionsGrid"')
                btn = sec.index('id="allConversionsToggle"')
                self.assertTrue(p0 < grid < btn, "grid is inside the panel and the button comes AFTER it (keyboard order = visual order)")
                panel_end = sec.index("</div>\n        <div class=\"seo-links-actions\">")
                self.assertTrue(p0 < grid < panel_end < btn)
                n = sec[p0:panel_end].count('<a class="conversion-card"')
                self.assertGreater(n, 0)
                tag = re.search(r'<button[^>]*id="allConversionsToggle"[^>]*>', sec).group(0)
                self.assertIn('aria-expanded="false"', tag)
                self.assertIn('aria-controls="allConversionsPanel"', tag)
                self.assertIn(f"Show all {n:,} conversions", sec)
                self.assertIn(f"Hide all {n:,} conversions", sec)
                self.assertEqual(sec.count("<script>"), 1)
                self.assertIn("<noscript><style>#allConversionsPanel[hidden]", sec)
                self.assertLess(sec.index('id="allConversionsTitle"'), p0, "heading stays outside (always visible)")

    def test_all_original_links_and_metadata_unchanged_vs_head(self):
        total = 0
        for cat in PAGES:
            with self.subTest(page=cat):
                now = (ROOT / cat / "index.html").read_bytes().decode("utf8").replace("\r\n", "\n")
                head = git_head(f"{cat}/index.html")
                self.assertEqual(ANCHOR.findall(now), ANCHOR.findall(head))
                total += len(ANCHOR.findall(now))
                self.assertEqual(now[: now.index("</head>")], head[: head.index("</head>")])
                ld = lambda h: re.findall(r'<script type="application/ld\+json"[^>]*>.*?</script>', h, re.S)
                self.assertEqual(ld(now), ld(head))
                hd = lambda h: re.findall(r"<h[1-3][^>]*>.*?</h[1-3]>", without_converter(h), re.S)
                self.assertEqual(hd(now), hd(head))
        print(f"\n[audit] anchors verified identical to HEAD across {len(PAGES)} pages: {total}")

    def test_css_block_is_present_once_and_scoped(self):
        css = (ROOT / "styles.css").read_text(encoding="utf8")
        self.assertEqual(css.count("BEGIN seo-links-disclosure"), 1)
        block = css[css.index("/* BEGIN seo-links-disclosure */") : css.index("/* END seo-links-disclosure */")]
        selectors = re.findall(r"(?:^|\})\s*([^{}@/]+?)\s*\{", block)
        self.assertTrue(selectors and all(".seo-links-" in s for s in selectors), selectors)


class TestBrowser(BrowserCase):
    def page(self, cat, width=1280, height=900, js=True):
        return self.open(f"/{cat}/", width, height)

    def test_collapsed_by_default_toggle_keyboard_and_label(self):
        for cat in PAGES:
            with self.subTest(page=cat):
                page = self.page(cat)
                try:
                    n = page.evaluate("document.querySelectorAll('#allConversionsGrid a').length")
                    big = n > BIG
                    self.assertTrue(page.evaluate("document.getElementById('allConversionsPanel').hidden"))
                    self.assertEqual(page.get_attribute("#allConversionsToggle", "aria-expanded"), "false")
                    self.assertTrue(page.is_visible("#allConversionsToggle"))
                    self.assertTrue(page.is_visible("#allConversionsTitle"))
                    self.assertFalse(page.is_visible("#allConversionsGrid"), "links must not be rendered while collapsed")
                    self.assertEqual(page.evaluate("document.querySelectorAll('#allConversionsGrid a').length"), n, "links remain in the DOM")
                    self.assertEqual(page.inner_text("#allConversionsToggle").strip(), f"Show all {n:,} conversions")
                    page.click("#allConversionsToggle")
                    self.assertEqual(page.get_attribute("#allConversionsToggle", "aria-expanded"), "true")
                    self.assertFalse(page.evaluate("document.getElementById('allConversionsPanel').hidden"))
                    self.assertEqual(page.inner_text("#allConversionsToggle").strip(), f"Hide all {n:,} conversions")
                    if not big:
                        self.assertTrue(page.is_visible("#allConversionsGrid"))
                        self.assertTrue(page.is_visible("#allConversionsSearch"))
                    page.click("#allConversionsToggle")
                    self.assertTrue(page.evaluate("document.getElementById('allConversionsPanel').hidden"))
                    self.assertEqual(page.inner_text("#allConversionsToggle").strip(), f"Show all {n:,} conversions")
                    page.focus("#allConversionsToggle")
                    page.keyboard.press("Enter")
                    self.assertFalse(page.evaluate("document.getElementById('allConversionsPanel').hidden"))
                    page.keyboard.press("Space")
                    self.assertTrue(page.evaluate("document.getElementById('allConversionsPanel').hidden"))
                    self.assertEqual(page.errors, [], "no JavaScript errors")
                finally:
                    page.close()

    def test_button_sits_at_the_bottom_right_of_the_grid_one_card_wide(self):
        """Reference screenshot: teal button under the grid, aligned with the 4th column, card-sized."""
        for cat in PAGES:
            n = (ROOT / cat / "index.html").read_text(encoding="utf8").count('class="conversion-card"')
            if n > SMALL:
                continue
            for width, cols in ((1280, 4), (800, 2), (375, 1)):
                with self.subTest(page=cat, width=width):
                    page = self.page(cat, width, 900)
                    try:
                        page.click("#allConversionsToggle")
                        m = page.evaluate(
                            """() => {
                              const g = document.getElementById('allConversionsGrid'), b = document.getElementById('allConversionsToggle');
                              const cards = [...g.querySelectorAll('a')], c0 = cards[0].getBoundingClientRect();
                              const row = cards.filter(c => Math.abs(c.getBoundingClientRect().top - c0.top) < 2);
                              const right = Math.max(...row.map(c => c.getBoundingClientRect().right));
                              const br = b.getBoundingClientRect(), gr = g.getBoundingClientRect();
                              return {cols: getComputedStyle(g).gridTemplateColumns.split(' ').length, cardW: c0.width, btnW: br.width,
                                      cardRight: right, btnRight: br.right, below: br.top - gr.bottom, h: br.height};
                            }"""
                        )
                        self.assertEqual(m["cols"], cols)
                        self.assertAlmostEqual(m["btnW"], m["cardW"], delta=2.0)
                        self.assertAlmostEqual(m["btnRight"], m["cardRight"], delta=2.0)
                        self.assertGreaterEqual(m["below"], 0, "button is below the grid, not over a link")
                        self.assertLess(m["below"], 40)
                        self.assertGreaterEqual(m["h"], 44, "tap target")
                    finally:
                        page.close()

    def test_converter_and_page_unaffected(self):
        for cat in PAGES:
            with self.subTest(page=cat):
                page = self.page(cat)
                try:
                    self.assertNotEqual(page.input_value("#toValue"), "")
                    self.assertEqual(page.locator("#categoryList button").count(), 1)
                    self.assertEqual(page.input_value("#fromValue"), "1")
                    self.assertEqual(page.locator("h1").count(), 1)
                    self.assertEqual(page.errors, [])
                finally:
                    page.close()

    def test_search_still_works_after_expanding(self):
        for cat in PAGES:
            n = (ROOT / cat / "index.html").read_text(encoding="utf8").count('class="conversion-card"')
            if n > SMALL:
                continue
            with self.subTest(page=cat):
                page = self.page(cat)
                try:
                    page.click("#allConversionsToggle")
                    total = page.evaluate("window.__categoryConversions.length")
                    term = page.evaluate("window.__categoryConversions[0].title.split(' ')[0].toLowerCase()")
                    expected = page.evaluate("(t) => window.__categoryConversions.filter(i => i.title.toLowerCase().includes(t)).length", term)
                    page.fill("#allConversionsSearch", term)
                    page.wait_for_timeout(80)
                    self.assertEqual(page.locator("#allConversionsGrid a").count(), expected)
                    self.assertEqual(page.inner_text("#allConversionsCount").replace(",", ""), f"{expected} of {total} conversions shown")
                    page.fill("#allConversionsSearch", "zzzz-no-match-zzzz")
                    page.wait_for_timeout(80)
                    self.assertEqual(page.locator("#allConversionsGrid a").count(), 0)
                    page.fill("#allConversionsSearch", "")
                    page.wait_for_timeout(80)
                    self.assertEqual(page.locator("#allConversionsGrid a").count(), total)
                    self.assertTrue(page.is_visible("#allConversionsGrid"), "still expanded after searching")
                finally:
                    page.close()

    def test_mobile_layout_and_no_horizontal_scroll(self):
        for cat in PAGES:
            with self.subTest(page=cat):
                n = (ROOT / cat / "index.html").read_text(encoding="utf8").count('class="conversion-card"')
                page = self.page(cat, 375, 800)
                try:
                    box = page.locator("#allConversionsToggle").bounding_box()
                    self.assertGreaterEqual(box["height"], 44)
                    self.assertGreaterEqual(box["width"], 250)
                    self.assertTrue(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"))
                    if n <= SMALL:
                        page.click("#allConversionsToggle")
                        page.wait_for_timeout(100)
                        self.assertTrue(page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1"))
                        self.assertTrue(page.is_visible("#allConversionsGrid"))
                    self.assertEqual(page.errors, [])
                finally:
                    page.close()

    def test_without_javascript_the_links_are_visible_and_the_button_hidden(self):
        ctx = self.browser.new_context(viewport={"width": 1280, "height": 900}, java_script_enabled=False, service_workers="block")
        self.addCleanup(ctx.close)
        page = ctx.new_page()
        page.goto(self.base + "/torque/", wait_until="load")
        self.assertTrue(page.is_visible("#allConversionsGrid"))
        self.assertFalse(page.is_visible("#allConversionsToggle"))


if __name__ == "__main__":
    unittest.main()
