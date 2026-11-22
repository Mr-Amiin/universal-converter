"""Browser audit of translated sections across the 14 languages (13 + English baseline).

Usage:
    python -m http.server 8000 --bind 127.0.0.1
    python tests/i18n_browser_audit.py http://127.0.0.1:8000

Optional language subset:
    python tests/i18n_browser_audit.py http://127.0.0.1:8000 es,fr,de

Requires Playwright with Chromium. Exits non-zero if any check fails.

This audit targets the current 40-link category-hub design. It deliberately does
not expect the retired allConversionsPanel / allConversionsToggle disclosure UI.
"""
import re
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
LANGS = (
    sys.argv[2].split(",")
    if len(sys.argv) > 2
    else "es fr de pt it ar zh ja ko hi tr id so".split()
)

HUBS = ["length", "area", "digital", "flow-rate", "fuel-economy", "temperature"]
SEO = [
    "length/meters-to-feet",
    "temperature/celsius-to-fahrenheit",
    "temperature/kelvin-to-delisle",
    "area/acres-to-hectares",
]

HUB_SEL = (
    ".popular-conversions-hub .section-heading, "
    ".all-conversions-hub .section-heading, "
    "article.seo-quick-facts, .seo-why-convert"
)
SEO_SEL = "article.seo-article"

LEAF_JS = r"""(sel) => {
    const out = [];
    for (const root of document.querySelectorAll(sel)) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            const value = node.nodeValue.replace(/\s+/g, " ").trim();
            if (value) out.push(value);
        }
    }
    return out;
}"""

HUB_STATE_JS = r"""() => {
    const text = (selector) =>
        document.querySelector(selector)?.textContent?.trim() ?? "";
    const element = (selector) => document.querySelector(selector);

    return {
        pop: text("#popularHubTitle"),
        all: text("#allConversionsTitle"),
        count: text("#allConversionsCount"),
        ph: element("#allConversionsSearch")?.placeholder ?? "",
        card: text("#popularHubGrid .popular-grid-card span"),
        listCount: document.querySelectorAll("#allConversionsList a").length,
        legacyToggle: !!element("#allConversionsToggle"),
        dir: document.documentElement.dir
    };
}"""

failures = []


def fail(message):
    failures.append(message)
    print("FAIL", message, flush=True)


def open_page(browser, url, lang, width=1280):
    context = browser.new_context(
        viewport={"width": width, "height": 900},
        service_workers="block",
    )
    context.add_init_script(f"localStorage.setItem('uc-language', {lang!r})")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)[:160]))
    page.goto(BASE + url, wait_until="networkidle")
    page.wait_for_timeout(1200)
    return context, page, errors


def leaks(texts, english):
    english_text = set(english)
    # This phrase is legitimately shared in French and is not an English leak.
    return [
        text
        for text in dict.fromkeys(texts)
        if text in english_text
        and len(text.split()) >= 3
        and re.search(r"[A-Za-z]{3,}", text)
        and not text.endswith("— sources")
    ]


with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    baseline_hubs = {}
    baseline_seo = {}

    baseline_targets = (
        [(f"/{hub}/", HUB_SEL, baseline_hubs) for hub in HUBS]
        + [(f"/{page}/", SEO_SEL, baseline_seo) for page in SEO]
    )

    for url, selector, store in baseline_targets:
        context, page, errors = open_page(browser, url, "en")
        try:
            store[url] = page.evaluate(LEAF_JS, selector)
            print("baseline", url, len(store[url]), flush=True)
            if errors:
                fail(f"en {url}: page errors {errors}")
        finally:
            context.close()

    for language in LANGS:
        for hub in HUBS:
            url = f"/{hub}/"
            print(language, url, flush=True)
            context, page, errors = open_page(browser, url, language)

            try:
                state = page.evaluate(HUB_STATE_JS)

                required = ("pop", "all", "card")
                missing = [key for key in required if not state[key]]
                if missing:
                    fail(f"{language} {hub}: missing hub UI values {missing}")

                if state["pop"] == "Popular Conversions":
                    fail(f"{language} {hub}: popular heading remains English")

                if state["all"].startswith("All "):
                    fail(f"{language} {hub}: all-conversions heading remains English")

                count_lower = state["count"].lower()
                if re.search(
                    r"\b(conversions shown|show all|hide all)\b",
                    count_lower,
                ):
                    fail(f"{language} {hub}: count text remains English ({state['count']})")

                if state["ph"].startswith("Search "):
                    fail(f"{language} {hub}: search placeholder remains English")

                if " to " in state["card"]:
                    fail(f"{language} {hub}: popular card title appears English ({state['card']})")

                # Current category hubs intentionally show 40 ranked links and
                # do not use the retired collapsible disclosure panel.
                if state["listCount"] != 40:
                    fail(
                        f"{language} {hub}: expected 40 static category links, "
                        f"found {state['listCount']}"
                    )

                if state["legacyToggle"]:
                    fail(f"{language} {hub}: retired disclosure toggle unexpectedly present")

                if (language == "ar") != (state["dir"] == "rtl"):
                    fail(f"{language} {hub}: wrong document direction {state['dir']}")

                hub_text = page.evaluate(LEAF_JS, HUB_SEL)
                for text in leaks(hub_text, baseline_hubs[url]):
                    fail(f"{language} {hub}: English text remains: {text[:90]}")

                if errors:
                    fail(f"{language} {hub}: page errors {errors}")
            finally:
                context.close()

        for seo_page in SEO:
            url = f"/{seo_page}/"
            context, page, errors = open_page(browser, url, language)
            try:
                seo_text = page.evaluate(LEAF_JS, SEO_SEL)
                for text in leaks(seo_text, baseline_seo[url]):
                    fail(f"{language} {seo_page}: English text remains: {text[:90]}")
                if errors:
                    fail(f"{language} {seo_page}: page errors {errors}")
            finally:
                context.close()

        # Mobile hamburger drawer: compare its translated labels with desktop nav.
        context, page, errors = open_page(browser, "/length/", language, width=390)
        try:
            page.click("#mobileMenuToggle")
            page.wait_for_timeout(400)

            drawer = page.evaluate("""() => {
                const readText = (selector) =>
                    [...document.querySelectorAll(selector)].map(
                        (element) => element.textContent.trim()
                    );

                const aria = [...document.querySelectorAll(
                    "#siteHeader [aria-label], #mobileDrawer [aria-label], #mobileDrawer[aria-label]"
                )].map((element) => element.getAttribute("aria-label"));

                return {
                    txt: readText("#mobileDrawer span[data-i18n]"),
                    top: readText(".top-nav [data-i18n]"),
                    aria
                };
            }""")

            if drawer["txt"] != drawer["top"]:
                fail(
                    f"{language} drawer labels differ from desktop navigation: "
                    f"{drawer['txt']} vs {drawer['top']}"
                )

            english_aria = (
                "Open menu",
                "Close menu",
                "Mobile navigation",
                "Primary navigation",
                "Switch color theme",
                "Select language",
                "Universal Converter home",
            )
            for aria_label in drawer["aria"]:
                if aria_label in english_aria or aria_label.startswith("Change language"):
                    fail(f"{language} drawer ARIA remains English: {aria_label}")

            if errors:
                fail(f"{language} mobile drawer: page errors {errors}")
        finally:
            context.close()

        # HTML sitemap page (technical XML sitemap is deliberately not tested/translated).
        context, page, errors = open_page(browser, "/sitemap.html", language)
        try:
            sitemap = page.evaluate(
                r"""() => ({
                    eyebrow: document.querySelector(".page-hero .eyebrow")?.textContent?.trim() ?? "",
                    placeholder: document.getElementById("sitemapSearchInput")?.placeholder ?? "",
                    heading: document.querySelector(".sitemap-grid h2")?.textContent?.trim() ?? "",
                    button: document.querySelector(".sitemap-card-expand")?.textContent?.trim() ?? ""
                })"""
            )

            if not all(sitemap.values()):
                fail(f"{language} sitemap: one or more expected labels are missing ({sitemap})")

            if (
                sitemap["eyebrow"] == "SEO navigation"
                or sitemap["placeholder"].startswith("e.g.")
                or sitemap["button"].startswith("Show ")
            ):
                fail(f"{language} sitemap contains English UI text: {sitemap}")

            if errors:
                fail(f"{language} sitemap: page errors {errors}")
        finally:
            context.close()

        print("done", language, flush=True)

    browser.close()

print("FAILURES:", len(failures), flush=True)
sys.exit(1 if failures else 0)
