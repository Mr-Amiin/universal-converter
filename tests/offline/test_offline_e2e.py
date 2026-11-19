#!/usr/bin/env python3
"""End-to-end offline tests: real Chromium, real service worker, real homepage converter.

"Offline" here is genuine: the local HTTP server is shut down (connection refused) AND the browser
is switched to offline mode, so the navigator.onLine/online/offline events fire as for a real outage.

Usage:  python3 tests/offline/test_offline_e2e.py            (writes tests/offline/results.json)
Needs:  pip install playwright && playwright install chromium
"""
import json, os, re, shutil, subprocess, sys, tempfile, time, traceback
from playwright.sync_api import sync_playwright
from harness import ROOT, ORIGIN, LIVE_RATES, Site

CACHE_V20 = "universal-converter-v20"
# Expected indicator texts per language: (offline message, connection-restored message).
INDICATOR_STRINGS = {
    "en": ('Offline mode: conversions still work', 'Back online'),
    "es": ('Sin conexión: las conversiones siguen funcionando', 'Conexión restablecida'),
    "fr": ('Hors ligne : les conversions fonctionnent toujours', 'De nouveau en ligne'),
    "de": ('Offline: Umrechnungen funktionieren weiterhin', 'Wieder online'),
    "pt": ('Sem conexão: as conversões continuam funcionando', 'De volta online'),
    "it": ('Offline: le conversioni funzionano ancora', 'Di nuovo online'),
    "ar": ('غير متصل: التحويلات لا تزال تعمل', 'عاد الاتصال بالإنترنت'),
    "zh": ('离线模式：换算功能仍可使用', '已恢复在线'),
    "ja": ('オフラインモード：変換は引き続き使えます', 'オンラインに戻りました'),
    "ko": ('오프라인 모드: 변환 기능을 계속 사용할 수 있습니다', '다시 온라인 상태입니다'),
    "hi": ('ऑफ़लाइन मोड: रूपांतरण अभी भी काम करते हैं', 'फिर से ऑनलाइन'),
    "tr": ('Çevrimdışı mod: dönüşümler çalışmaya devam ediyor', 'Yeniden çevrimiçi'),
    "id": ('Mode offline: konversi tetap berfungsi', 'Kembali online'),
    "so": ("Internet la'aan: beddelaadaha wali way shaqeeyaan", 'Xiriirka internetka waa soo noqday'),
}
RESULTS = []          # (scenario, check, ok, detail)
CURRENT = ["?"]


def check(name, ok, detail=""):
    RESULTS.append((CURRENT[0], name, bool(ok), str(detail)[:400]))
    print(("  PASS " if ok else "  FAIL ") + name + ("" if ok else "  -> " + str(detail)[:300]))
    return ok


def scenario(title):
    CURRENT[0] = title
    print("\n== " + title)


def num(text):
    return float(re.sub(r"[^0-9eE+\-.]", "", text.replace(",", "")))


def near(a, b, rel=1e-6):
    return abs(a - b) <= rel * max(1.0, abs(b))


class Env:
    """One isolated browser context + local site that can be taken fully offline."""

    def __init__(self, pw, root=ROOT, cloudflare=False, live=None):
        self.site = Site(root, cloudflare)
        self.live = live                  # dict payload for the live-rates URL, or None -> unreachable
        self.is_offline = False
        self.site.start()
        self.browser = pw.chromium.launch()
        self.ctx = self.browser.new_context(service_workers="allow")
        self.ctx.route(lambda u: not u.startswith(ORIGIN), self._external)
        self.page = self.ctx.new_page()
        self.page_errors, self.failed_same_origin = [], []
        self.page.on("pageerror", lambda e: self.page_errors.append(str(e)))
        self.page.on("requestfailed", lambda r: self.failed_same_origin.append(r.url) if r.url.startswith(ORIGIN) else None)

    def _external(self, route):
        if route.request.url == LIVE_RATES and self.live is not None and not self.is_offline:
            route.fulfill(status=200, content_type="application/json", headers={"access-control-allow-origin": "*"}, body=json.dumps(self.live))
        else:
            route.abort()

    def go_offline(self):
        self.is_offline = True
        self.site.stop()                  # connection refused
        self.ctx.set_offline(True)        # navigator.onLine = false + offline event

    def go_online(self):
        self.site.start()
        self.ctx.set_offline(False)
        self.is_offline = False

    def close(self):
        self.browser.close()
        self.site.stop()

    # ---- helpers -------------------------------------------------------------------------
    def install(self, path="/"):
        p = self.page
        p.goto(ORIGIN + path)
        p.wait_for_selector("#categoryList button")
        p.evaluate("navigator.serviceWorker.ready.then(r => !!r.active)")
        p.reload()
        p.wait_for_selector("#categoryList button")
        controlled = p.evaluate("!!navigator.serviceWorker.controller")
        time.sleep(0.5)
        return controlled

    def cache_urls(self, name=CACHE_V20):
        return self.page.evaluate("""async (n) => { if (!(await caches.has(n))) return null;
            const c = await caches.open(n); return (await c.keys()).map(r => r.url.replace(location.origin, '')); }""", name)

    def cache_names(self):
        return sorted(self.page.evaluate("caches.keys()"))


# --------------------------------------------------------------------------------------------
# Converter driver: uses only the real homepage UI (no second engine, nothing re-implemented).
# --------------------------------------------------------------------------------------------
def pick(page, f, t, value):
    page.select_option("#fromUnit", f)
    page.select_option("#toUnit", t)
    page.fill("#fromValue", str(value))
    return page.input_value("#toValue")


def open_category(page, label):
    page.locator("#categoryList button", has_text=label).first.click()


def known_values(page, tag):
    """Independent, textbook values that must come out of the real converter."""
    cases = [
        ("Length", "meter", "foot", 1, 3.280839895),
        ("Length", "mile", "kilometer", 1, 1.609344),
        ("Mass", "kilogram", "pound", 1, 2.204622622),
        ("Temperature", "celsius", "fahrenheit", 100, 212),
        ("Temperature", "celsius", "kelvin", 0, 273.15),
        ("Temperature", "fahrenheit", "celsius", -40, -40),
        ("Volume", "liter", "gallon_us", 1, 0.2641720524),
        ("Pressure", "bar", "psi", 1, 14.50377377),
        ("Pressure", "bar", "pascal", 1, 100000),
        ("Time", "hour", "minute", 2, 120),
        ("Time", "day", "hour", 1, 24),
        ("Area", "hectare", "acre", 1, 2.471053815),
        ("Agriculture", "hectare", "acre", 10, 24.71053815),
        ("Digital", "megabyte", "kilobyte", 1, None),   # 1000 or 1024 depending on the app's convention
    ]
    for cat, f, t, v, expect in cases:
        open_category(page, cat)
        got = pick(page, f, t, v)
        if expect is None:
            check(f"{tag}: {cat} {v} {f}->{t} = {got}", num(got) in (1000, 1024), got)
        else:
            check(f"{tag}: {cat} {v} {f}->{t} = {got}", near(num(got), expect, 1e-6), f"expected {expect}")


def exercise(page):
    """Drives every category with fixed inputs, plus swap, search, context and calculators.
    Returns an observation dict so online and offline runs can be compared value for value."""
    obs = {"categories": {}, "search": {}, "context": {}, "calculators": {}}
    count = page.locator("#categoryList button").count()
    for i in range(count):
        name = page.locator("#categoryList .category-name").nth(i).inner_text()
        page.locator("#categoryList button").nth(i).click()
        heading = page.inner_text("#activeCategoryName")
        n = page.eval_on_selector("#fromUnit", "s => s.options.length")
        rec = {"heading": heading, "units": n, "pairs": []}
        for (a, b) in [(0, 1), (1, 2 % n), (n // 2, n - 1)]:
            page.select_option("#fromUnit", index=a)
            page.select_option("#toUnit", index=b)
            page.fill("#fromValue", "123.456")
            before = [page.eval_on_selector("#fromUnit", "s=>s.value"),
                      page.eval_on_selector("#toUnit", "s=>s.value"), page.input_value("#toValue"), page.inner_text("#resultText")]
            page.click("#swapButton")
            after = [page.eval_on_selector("#fromUnit", "s=>s.value"), page.eval_on_selector("#toUnit", "s=>s.value"),
                     page.input_value("#fromValue"), page.input_value("#toValue")]
            rec["pairs"].append({"before": before, "after_swap": after})
        obs["categories"][name] = rec
    # search ---------------------------------------------------------------------------
    for q in ["meters to feet", "kg to lbs", "celsius to fahrenheit", "gb to mb", "acres to hectares", "usd to eur", "psi to bar", "psi bar", "zzzqqqxx"]:
        obs["search"][q] = run_search(page, q)
    page.fill("#globalSearch", "")
    # electricity context -----------------------------------------------------------------
    open_category(page, "Electricity")
    ctx = {}
    for volt in ["120", "240"]:
        page.fill("#contextVoltage", volt)
        ctx[f"watt->ampere@{volt}V"] = pick(page, "watt", "ampere", 100)
        ctx[f"ampere->watt@{volt}V"] = pick(page, "ampere", "watt", 100)
        ctx[f"watt->ohm@{volt}V"] = pick(page, "watt", "ohm", 100)
    page.fill("#contextVoltage", "120")
    for hrs in ["1", "5"]:
        page.fill("#contextHours", hrs)
        ctx[f"watt->kWh@{hrs}h"] = pick(page, "watt", "kilowatt_hour", 100)
    obs["context"] = ctx
    # homepage calculators (incl. currency card and agriculture suite) ---------------------------
    calc = {}
    page.fill("#currencyAmount", "250"); page.select_option("#currencyFrom", "USD"); page.select_option("#currencyTo", "EUR")
    calc["currency USD->EUR 250"] = page.inner_text("#currencyResult")
    page.select_option("#currencyFrom", "GBP"); page.select_option("#currencyTo", "JPY")
    calc["currency GBP->JPY 250"] = page.inner_text("#currencyResult")
    page.fill("#percentValue", "20"); page.fill("#percentBase", "350"); calc["percent"] = page.inner_text("#percentageResult")
    page.fill("#bmiWeight", "82"); page.fill("#bmiHeight", "181"); calc["bmi"] = page.inner_text("#bmiResult")
    page.fill("#loanAmount", "300000"); page.fill("#loanRate", "5"); page.fill("#loanYears", "20"); calc["mortgage"] = page.inner_text("#mortgageResult")
    page.fill("#tripDistance", "450"); page.fill("#fuelEfficiency", "7"); page.fill("#fuelPrice", "2"); calc["fuel"] = page.inner_text("#fuelCostResult")
    page.fill("#dateStart", "2026-01-15"); page.fill("#dateOffset", "45"); calc["date"] = page.inner_text("#dateResult")
    page.fill("#birthDate", "1990-05-20"); calc["age"] = page.inner_text("#ageResult")
    page.click("#agriTab-seed"); page.fill("#seedArea", "20"); page.fill("#seedRate", "30"); page.fill("#seedLoss", "10"); calc["agri seed"] = page.inner_text("#seedResult")
    page.click("#agriTab-fertilizer"); page.fill("#fertArea", "12"); page.fill("#fertRate", "150"); page.fill("#fertBags", "25"); calc["agri fertilizer"] = page.inner_text("#fertResult")
    page.click("#agriTab-yield"); page.fill("#yieldMass", "30"); page.fill("#yieldArea", "8"); page.fill("#yieldPrice", "300"); calc["agri yield"] = page.inner_text("#yieldResult")
    page.click("#agriTab-irrigation"); page.fill("#irrigationArea", "7"); page.fill("#irrigationDepth", "30"); page.fill("#irrigationEfficiency", "80"); calc["agri irrigation"] = page.inner_text("#irrigationResult")
    obs["calculators"] = calc
    return obs


def diff(a, b, path=""):
    out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k not in a or k not in b:
                out.append(f"{path}/{k}: missing on one side")
            else:
                out += diff(a[k], b[k], f"{path}/{k}")
    elif a != b:
        out.append(f"{path}: {a!r} != {b!r}")
    return out


def run_search(page, q):
    """Types into the real global search box and returns what the dropdown shows (top results or the no-match text)."""
    box = page.locator("#globalSearch")
    box.click(); box.press("Control+A"); box.press("Delete")
    try:        # old results must be gone before typing, otherwise a stale dropdown could be read
        page.wait_for_function("() => !document.getElementById('searchResults').textContent.trim()", timeout=3000)
    except Exception:
        pass
    page.keyboard.type(q, delay=15)
    time.sleep(0.7)     # past the search debounce
    page.wait_for_function("""() => { const t = document.getElementById('searchResults').textContent;
        return t.trim() && !/Loading search/i.test(t); }""", timeout=10000)
    return page.eval_on_selector("#searchResults", """e => [...e.querySelectorAll('[role=option]')].slice(0, 3)
        .map(a => a.textContent.replace(/\\s+/g, ' ').trim() + ' @ ' + a.getAttribute('href')).join(' || ')
        || e.textContent.replace(/\\s+/g, ' ').trim()""")


def reset_inputs(page):
    page.reload()
    page.wait_for_selector("#categoryList button")


def currency_state(page):
    return page.evaluate("() => ({ meta: window.__currencyRatesMeta || null })")


def wait_currency_source(page, want=None, timeout=15):
    end = time.time() + timeout
    while time.time() < end:
        meta = page.evaluate("() => window.__currencyRatesMeta || null")
        if meta and (want is None or meta.get("source") == want):
            return meta
        time.sleep(0.25)
    return page.evaluate("() => window.__currencyRatesMeta || null")


def rates_payload():
    return json.load(open(os.path.join(ROOT, "rates.json")))


def live_payload(eur_usd=1.2345):
    """A complete schema-v2 payload as published by the rates workflow, with a distinctive EUR rate."""
    seed = rates_payload()
    rates = dict(seed["rates"]); rates["EUR"] = eur_usd
    meta = {c: {"date": "2026-11-19", "source": "test"} for c in rates}
    return {"schema_version": 2, "base": "USD", "provider": "test-live", "provider_name": "Test Live", "generated_at": "2026-11-19T00:00:00Z",
            "retrieved_at": "2026-11-19T00:00:00Z", "observation_date": "2026-11-19", "rates": rates, "meta": meta}


# ============================================================================================
def main():
    with sync_playwright() as pw:
        run_all(pw)
    failed = [r for r in RESULTS if not r[2]]
    out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "results.json" if len(sys.argv) < 2 else "results-partial.json")
    json.dump([{"scenario": s, "check": c, "ok": ok, "detail": d} for s, c, ok, d in RESULTS], open(out, "w"), indent=1)
    print(f"\n{len(RESULTS) - len(failed)} passed, {len(failed)} failed  (details: {out})")
    sys.exit(1 if failed else 0)


def run_all(pw):
    steps = [s1_install_and_cache, s2_outage_refresh_uncached_restore, s3_currency, s4_language_theme_a11y,
             s5_last_resort, s6_subresources, s7_cloudflare_redirect_host, s8_install_resilience, s9_upgrade_v19_to_v20,
             s10_indicator_all_languages]
    only = [a for a in sys.argv[1:] if a.isdigit()]
    for n, step in enumerate(steps, 1):
        if only and str(n) not in only:
            continue
        try:
            step(pw)
        except Exception as exc:                                  # a crashed scenario is a failed check, not silence
            check(f"{step.__name__} completed without exception", False, traceback.format_exc()[-600:])


# --------------------------------------------------------------------------------------------
def s1_install_and_cache(pw):
    scenario("1. Fresh install and cache population")
    env = Env(pw)
    try:
        controlled = env.install()
        check("service worker active and controlling the page after first reload", controlled)
        names = env.cache_names()
        check("only the v20 cache exists", names == [CACHE_V20], names)
        urls = env.cache_urls() or []
        for required in ["/", "/index.html", "/styles.css", "/app.js", "/search-engine.js", "/offline.html", "/rates.json",
                         "/logo.svg", "/logo.svg?v=2", "/logo-dark.svg?v=2", "/search-index/manifest.json"]:
            check(f"cached: {required}", required in urls)
        manifest = json.load(open(os.path.join(ROOT, "search-index", "manifest.json")))
        expected = ["/search-index/manifest.json"]
        v = "?v=" + manifest["version"]
        expected += ["/search-index/" + manifest["files"]["units"] + v, "/search-index/" + manifest["files"]["pages"] + v]
        expected += ["/search-index/" + c["shard"] + v for c in manifest["categories"]]
        missing = [u for u in expected if u not in urls]
        check(f"all {len(expected)} exact search-index URLs from the manifest are cached (incl. ?v= query)", not missing, missing[:3])
        extra = [u for u in urls if u.startswith("/search-index/") and u not in expected]
        check("no unexpected search-index entries", not extra, extra[:3])
        cached_rates = env.page.evaluate("""async () => { const c = await caches.open('%s'); const r = await c.match('/rates.json'); return r ? await r.json() : null; }""" % CACHE_V20)
        check("cached /rates.json is the valid snapshot (base USD, positive rates)",
              cached_rates and cached_rates.get("base") == "USD" and len(cached_rates["rates"]) > 100 and all(float(x) > 0 for x in cached_rates["rates"].values()))
        check("cached rates.json equals the deployed file", cached_rates == rates_payload())
        html = env.page.evaluate("""async () => { const c = await caches.open('%s'); return (await (await c.match('/')).text()); }""" % CACHE_V20)
        check("cached '/' is the real homepage with the converter", 'id="fromValue"' in html and 'id="categoryList"' in html)
        check("no page errors during install", not env.page_errors, env.page_errors[:2])
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s2_outage_refresh_uncached_restore(pw):
    scenario("2. Online baseline, outage, offline refresh, uncached URL, restore")
    env = Env(pw)
    try:
        env.install()
        page = env.page
        # known values online
        known_values(page, "online")
        # full exercise online (baseline); live rates unreachable -> snapshot rates, same in both runs
        base = exercise(page)
        check("online: 27 categories exercised", len(base["categories"]) == 27, len(base["categories"]))
        real = [q for q, v in base["search"].items() if " @ " in v]
        check("online: 7 'X to Y' searches return real conversion results", len(real) == 7, real)
        check("online: no-match search says so (not an error or a spinner)", base["search"]["zzzqqqxx"] == "No matching conversion found", base["search"]["zzzqqqxx"])
        check("online: indicator empty", page.inner_text("#offlineStatus") == "")
        reset_inputs(page)
        wait_currency_source(page)

        # ---- real outage while the page is open --------------------------------------------------
        page.fill("#fromValue", "4321.5")
        page.evaluate("window.__sameDocument = 'marker'")
        env.go_offline()
        time.sleep(0.5)
        check("outage: indicator shows offline text", "Offline" in page.inner_text("#offlineStatus"), page.inner_text("#offlineStatus"))
        check("outage: indicator is a polite live region", page.get_attribute("#offlineStatus", "role") == "status" and page.get_attribute("#offlineStatus", "aria-live") == "polite")
        check("outage: indicator is not focusable / not in tab order", page.evaluate("document.getElementById('offlineStatus').tabIndex") == -1)
        check("outage: page not reloaded and typed value kept", page.evaluate("window.__sameDocument") == "marker" and page.input_value("#fromValue") == "4321.5")
        off = exercise(page)
        d = diff(base, off)
        check("outage (page already open): identical results to online for every category, swap, search, context and calculator", not d, d[:4])
        check("outage: network requests that failed were only expected ones", all(u.endswith(".json") or "search-index" in u or "i18n" in u or "logo" in u for u in env.failed_same_origin) or not env.failed_same_origin, env.failed_same_origin[:5])
        known_values(page, "offline")

        # ---- offline refresh -------------------------------------------------------------------------
        before_fail = len(env.failed_same_origin)
        resp = page.reload()
        page.wait_for_selector("#categoryList button")
        check("offline refresh: cached homepage served (HTTP 200)", resp is not None and resp.status == 200, resp and resp.status)
        check("offline refresh: served by the service worker", resp.from_service_worker)
        check("offline refresh: converter initialised (27 categories, 45 length units)", page.locator("#categoryList button").count() == 27 and page.eval_on_selector("#fromUnit", "s=>s.options.length") == 45)
        check("offline refresh: default result text (1 m in ft)", re.fullmatch(r"1 meter = 3\.2808\d* (feet|foot)", page.inner_text("#resultText"), re.I) is not None, page.inner_text("#resultText"))
        check("offline refresh: indicator visible on load", "Offline" in page.inner_text("#offlineStatus"))
        off2 = exercise(page)
        d = diff(base, off2)
        check("offline refresh: identical results to online baseline", not d, d[:4])
        check("offline refresh: no uncaught page errors", not env.page_errors, env.page_errors[:2])
        check("offline refresh: no failed same-origin requests", len(env.failed_same_origin) == before_fail, env.failed_same_origin[before_fail:][:5])

        # ---- uncached URLs --------------------------------------------------------------------
        for path in ["/this/page/was-never-cached/", "/length/meters-to-us-survey-feet/", "/some-random-page.html", "/volume/liter-to-gallon/"]:
            r = page.goto(ORIGIN + path)
            page.wait_for_selector("#categoryList button")
            check(f"uncached {path}: lands on cached homepage '/' with working converter",
                  page.url == ORIGIN + "/" and page.locator("#fromValue").count() == 1 and near(num(pick(page, "meter", "foot", 1)), 3.280839895), page.url)
        r = page.goto(ORIGIN + "/?utm_source=test")
        page.wait_for_selector("#categoryList button")
        check("offline '/?utm_source=test': homepage served in place (query kept)", page.url == ORIGIN + "/?utm_source=test" and page.locator("#fromValue").count() == 1, page.url)
        r = page.goto(ORIGIN + "/index.html")
        page.wait_for_selector("#categoryList button")
        check("offline '/index.html': homepage", page.locator("#fromValue").count() == 1 and "offline" not in page.title().lower())
        # a page that IS cached keeps being served as itself
        r = page.goto(ORIGIN + "/kg-to-lbs/")
        check("cached SEO page /kg-to-lbs/ still served as itself offline", page.url == ORIGIN + "/kg-to-lbs/" and r.status == 200 and "kg" in page.content().lower(), page.url)
        r = page.goto(ORIGIN + "/kg-to-lbs")
        check("slash-less /kg-to-lbs redirects to cached /kg-to-lbs/ (as the host does online)", page.url == ORIGIN + "/kg-to-lbs/", page.url)
        # search result click -> uncached conversion page -> homepage
        page.goto(ORIGIN + "/"); page.wait_for_selector("#categoryList button")
        page.click("#globalSearch"); page.keyboard.type("meters to us survey feet", delay=10)
        page.wait_for_selector("#searchResults [role=option]")
        page.locator("#searchResults [role=option]").first.click()
        page.wait_for_load_state("load"); page.wait_for_selector("#categoryList button, #fromValue")
        check("offline: clicking a search result for an uncached page lands on a working homepage", page.locator("#fromValue").count() == 1 and page.url.startswith(ORIGIN + "/"), page.url)

        # ---- restore the network -----------------------------------------------------------------------
        page.goto(ORIGIN + "/"); page.wait_for_selector("#categoryList button")
        open_category(page, "Electricity")
        page.fill("#fromValue", "777.25"); page.fill("#contextVoltage", "230")
        page.evaluate("window.__sameDocument = 'marker2'")
        env.go_online()
        time.sleep(0.8)
        t = page.inner_text("#offlineStatus")
        check("restore: indicator says back online", "Back online" in t, t)
        check("restore: page NOT reloaded", page.evaluate("window.__sameDocument") == "marker2")
        check("restore: entered values and category kept", page.input_value("#fromValue") == "777.25" and page.input_value("#contextVoltage") == "230" and "Electricity" in page.inner_text("#activeCategoryName"))
        time.sleep(3.5)
        check("restore: indicator clears itself after a few seconds", page.inner_text("#offlineStatus") == "", page.inner_text("#offlineStatus"))
        res = pick(page, "watt", "ampere", 230)
        check("restore: converter keeps working online (230 W @ 230 V = 1 A)", near(num(res), 1.0), res)
        page.reload(); page.wait_for_selector("#categoryList button")
        on2 = exercise(page)
        d = diff(base, on2)
        check("restore: online results still identical to the original baseline", not d, d[:4])
        # online 404 is preserved (and never cached)
        r = page.goto(ORIGIN + "/definitely-missing-page/")
        check("online: genuine 404 is preserved (status 404, URL unchanged, not redirected to homepage)", r.status == 404 and page.url == ORIGIN + "/definitely-missing-page/", (r.status, page.url))
        check("online 404 page not stored in the cache", "/definitely-missing-page/" not in (env.cache_urls() or []))
        env.go_offline()
        r = page.goto(ORIGIN + "/definitely-missing-page/")
        page.wait_for_selector("#categoryList button")
        check("same URL while offline: falls back to the homepage", page.url == ORIGIN + "/" and r.status == 200, (page.url, r.status))
        env.go_online()
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s3_currency(pw):
    scenario("3. Currency: live rates, snapshot fallback, built-in fallback")
    seed = rates_payload()["rates"]

    def ui_currency(page, amount, a, b):
        page.fill("#currencyAmount", str(amount)); page.select_option("#currencyFrom", a); page.select_option("#currencyTo", b)
        return page.inner_text("#currencyResult")

    def category_currency(page, amount, a, b):
        open_category(page, "Currency")
        return pick(page, a, b, amount)

    # (a) live rates reachable
    live = live_payload(1.2345)
    env = Env(pw, live=live)
    try:
        env.install()
        meta = wait_currency_source(env.page, "live")
        check("online with live feed: source = live", meta and meta["source"] == "live", meta and meta["source"])
        got = category_currency(env.page, 100, "USD", "EUR")
        # converter semantics: result = amount * factor(from) / factor(to) where factor is the published rate
        check("online with live feed: converter uses the live EUR rate", near(num(got), 100 * live["rates"]["USD"] / live["rates"]["EUR"], 1e-5) or near(num(got), 100 * live["rates"]["EUR"] / live["rates"]["USD"], 1e-5), got)
        live_val = num(got)
        # ---- go offline, refresh: live unreachable -> cached snapshot from the service worker
        env.go_offline()
        env.page.reload(); env.page.wait_for_selector("#categoryList button")
        meta = wait_currency_source(env.page, "offline")
        check("offline refresh: falls back to the cached /rates.json snapshot (source = offline)", meta and meta["source"] == "offline", meta)
        check("offline: snapshot timestamp exposed", meta and meta.get("generatedAt") == rates_payload()["generated_at"], meta)
        got_off = category_currency(env.page, 100, "USD", "EUR")
        expect_seed = 100 * seed["USD"] / seed["EUR"]
        expect_seed2 = 100 * seed["EUR"] / seed["USD"]
        check("offline: Currency category converts with the cached snapshot rates", near(num(got_off), expect_seed, 1e-5) or near(num(got_off), expect_seed2, 1e-5), (got_off, expect_seed, expect_seed2))
        check("offline: snapshot result differs from the live-feed result (proves fallback rates are used)", not near(num(got_off), live_val, 1e-4), (got_off, live_val))
        card = ui_currency(env.page, 100, "USD", "EUR")
        check("offline: currency calculator card gives a result with offline-rates note", "EUR" in card, card)
        note = env.page.inner_text("#currencyResult") + " " + (env.page.locator("#currencyTool").inner_text())
        check("offline: UI states that offline reference rates are in use", re.search(r"offline|snapshot|reference|saved", note, re.I) is not None, note[-200:])
        check("offline: no uncaught errors", not env.page_errors, env.page_errors[:2])
        # ---- snapshot missing from the cache too -> built-in rates in app.js still work
        env.page.evaluate("""async () => { const c = await caches.open('%s'); await c.delete('/rates.json'); }""" % CACHE_V20)
        env.page.reload(); env.page.wait_for_selector("#categoryList button")
        meta = wait_currency_source(env.page, "builtin")
        check("snapshot absent: built-in fallback rates are used (source = builtin)", meta and meta["source"] == "builtin", meta)
        got_b = ui_currency(env.page, 100, "USD", "EUR")
        check("snapshot absent: currency calculator still produces a result", re.search(r"100 USD = [\d.,]+ EUR", got_b) is not None, got_b)
        got_b2 = category_currency(env.page, 100, "USD", "EUR")
        check("snapshot absent: Currency category still converts", num(got_b2) > 0, got_b2)
        # ---- connection returns: live rates win again without a manual reload being required by us
        env.go_online()
        env.page.reload(); env.page.wait_for_selector("#categoryList button")
        meta = wait_currency_source(env.page, "live")
        check("back online + refresh: live rates used again", meta and meta["source"] == "live", meta)
    finally:
        env.close()

    # (b) live feed down but site reachable: network-first /rates.json (existing behaviour preserved)
    env = Env(pw, live=None)
    try:
        env.install()
        meta = wait_currency_source(env.page, "offline")
        check("live feed unreachable, site online: /rates.json network response used (existing behaviour)", meta and meta["source"] == "offline", meta)
        # the deployed rates.json changes -> network-first must show the NEW file, not the cached one
        newer = json.loads(json.dumps(rates_payload())); newer["rates"]["EUR"] = 9.87654; newer["generated_at"] = "2026-11-20T00:00:00Z"
        env.site.overrides["/rates.json"] = (200, json.dumps(newer).encode())
        env.page.reload(); env.page.wait_for_selector("#categoryList button")
        meta = wait_currency_source(env.page, "offline")
        time.sleep(0.5)
        check("network-first preserved: a newer deployed /rates.json is used while online (not the cached copy)", meta and meta.get("generatedAt") == "2026-11-20T00:00:00Z", meta)
        env.go_offline()
        env.page.reload(); env.page.wait_for_selector("#categoryList button")
        meta = wait_currency_source(env.page, "offline")
        check("then offline: the latest successfully fetched snapshot is served from cache", meta and meta.get("generatedAt") == "2026-11-20T00:00:00Z", meta)
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s4_language_theme_a11y(pw):
    scenario("4. Language, theme and accessibility offline")
    env = Env(pw)
    try:
        env.install()
        page = env.page
        page.click("#langDropdownToggle"); page.click('.lang-option[data-lang-code="de"]')
        time.sleep(2)           # lets /i18n-seo/de.json load and be stored by the service worker
        online_text = page.inner_text("h1")
        urls = env.cache_urls() or []
        check("German selected online; /i18n-seo/de.json stored by the worker's runtime caching", "/i18n-seo/de.json" in urls, [u for u in urls if "i18n" in u])
        theme_before = page.evaluate("document.documentElement.getAttribute('data-theme')")
        page.click("#themeToggle"); time.sleep(0.2)
        theme_after = page.evaluate("document.documentElement.getAttribute('data-theme')")
        check("theme toggles online", theme_before != theme_after, (theme_before, theme_after))
        env.go_offline()
        page.reload(); page.wait_for_selector("#categoryList button")
        check("offline refresh keeps German UI", page.inner_text("h1") == online_text and "Convert Any Unit" not in page.inner_text("h1"), page.inner_text("h1"))
        check("offline refresh keeps chosen theme", page.evaluate("document.documentElement.getAttribute('data-theme')") == theme_after)
        page.click("#themeToggle"); time.sleep(0.2)
        check("theme can still be toggled offline", page.evaluate("document.documentElement.getAttribute('data-theme')") == theme_before)
        page.click("#langDropdownToggle"); page.click('.lang-option[data-lang-code="en"]'); time.sleep(0.5)
        check("switching back to English works offline", "Convert Any Unit" in page.inner_text("h1"), page.inner_text("h1"))
        # a language whose file was never fetched degrades to English instead of breaking
        page.click("#langDropdownToggle"); page.click('.lang-option[data-lang-code="ja"]'); time.sleep(1)
        check("offline, a never-fetched language falls back gracefully (converter still works)", pick(page, "meter", "foot", 1) is not None and page.locator("#categoryList button").count() == 27)
        check("offline indicator is shown in the selected language (Japanese), not English", page.inner_text("#offlineStatus") == INDICATOR_STRINGS["ja"][0], page.inner_text("#offlineStatus"))
        # accessibility: keyboard order of the converter is unchanged by the indicator
        page.click("#langDropdownToggle"); page.click('.lang-option[data-lang-code="en"]')
        focusable = page.evaluate("""() => [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')].filter(e => e.id === 'offlineStatus' || e.closest('#offlineStatus')).length""")
        check("indicator adds nothing to the tab order", focusable == 0, focusable)
        check("indicator does not intercept clicks", page.evaluate("getComputedStyle(document.getElementById('offlineStatus')).pointerEvents") == "none")
        check("no uncaught page errors", not env.page_errors, env.page_errors[:2])
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s5_last_resort(pw):
    scenario("5. Last resort: cached homepage unavailable -> offline.html")
    env = Env(pw)
    try:
        env.install()
        page = env.page
        page.evaluate("""async () => { const c = await caches.open('%s'); await c.delete('/'); await c.delete('/index.html'); }""" % CACHE_V20)
        env.go_offline()
        for path in ["/", "/never/cached/path/"]:
            page.goto(ORIGIN + path)
            page.wait_for_selector("#retryButton")
            check(f"{path}: offline.html shown", "offline" in page.inner_text("h1").lower(), page.inner_text("h1"))
            check(f"{path}: no second converter (no converter inputs/selects on the page)", page.locator("#fromValue, #fromUnit, #toUnit, #categoryList button").count() == 0)
            check(f"{path}: explains the situation and offers a Retry button", page.locator("#retryButton").inner_text() == "Retry now")
            check(f"{path}: styled (root-absolute stylesheet resolves even at a deep URL)", page.evaluate("[...document.styleSheets].some(s => s.href && s.href.endsWith('/styles.css') && s.cssRules.length > 50)"))
        page.click("#retryButton"); time.sleep(0.8)
        check("Retry while still offline stays on offline.html (no crash)", page.locator("#retryButton").count() == 1)
        page.goto(ORIGIN + "/"); page.wait_for_selector("#retryButton")
        env.go_online()
        page.wait_for_selector("#categoryList button", timeout=10000)
        check("connection returns: offline page reloads itself into the real homepage", page.locator("#fromValue").count() == 1, page.url)
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s6_subresources(pw):
    scenario("6. Failed sub-resources never receive homepage HTML")
    env = Env(pw)
    try:
        env.install()
        page = env.page
        env.go_offline()
        probes = ["/no-such-style.css", "/no-such-script.js", "/no-such-data.json", "/no-such-image.png", "/i18n-seo/zz.json", "/search-index/pairs/nope.json?v=x", "/rates-missing.json"]
        for u in probes:
            res = page.evaluate("""async (u) => { try { const r = await fetch(u); return {ok: true, status: r.status, type: r.headers.get('content-type'), text: (await r.text()).slice(0, 40)}; }
                catch (e) { return {ok: false, err: String(e)}; } }""", u)
            check(f"offline fetch({u}) fails as a network error (no HTML substituted)", res["ok"] is False and "TypeError" in res["err"], res)
        res = page.evaluate("""() => new Promise(done => { const s = document.createElement('script'); s.src = '/missing-lib.js';
            s.onload = () => done('loaded'); s.onerror = () => done('error'); document.head.appendChild(s); })""")
        check("offline <script src> to an uncached file errors (not executed as HTML)", res == "error", res)
        res = page.evaluate("""() => new Promise(done => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = '/missing.css';
            l.onload = () => done('loaded'); l.onerror = () => done('error'); document.head.appendChild(l); })""")
        check("offline <link rel=stylesheet> to an uncached file errors", res == "error", res)
        # cached sub-resources are still served
        res = page.evaluate("""async () => { const r = await fetch('/styles.css'); return [r.ok, r.headers.get('content-type'), (await r.text()).slice(0, 30)]; }""")
        check("cached CSS still served with a CSS body", res[0] and "css" in (res[1] or ""), res)
        res = page.evaluate("""async () => { const r = await fetch('/search-index/manifest.json'); const j = await r.json(); return [r.ok, j.format]; }""")
        check("cached search-index manifest served as JSON", res == [True, 1], res)
        env.go_online()
        res = page.evaluate("""async () => { const r = await fetch('/no-such-style.css'); return [r.status, (r.headers.get('content-type') || '')]; }""")
        check("online: a missing sub-resource keeps its real 404 (not cached, not rewritten)", res[0] == 404, res)
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s7_cloudflare_redirect_host(pw):
    scenario("7. Host that 308-redirects /index.html and *.html (redirected responses must not be cached as-is)")
    env = Env(pw, cloudflare=True)
    try:
        controlled = env.install()
        check("installs on a redirecting host", controlled and env.cache_names() == [CACHE_V20], env.cache_names())
        urls = env.cache_urls() or []
        check("'/' and '/index.html' both cached", "/" in urls and "/index.html" in urls)
        red = env.page.evaluate("""async () => { const c = await caches.open('%s'); const out = {};
            for (const k of ['/', '/index.html', '/about.html', '/offline.html', '/guides.html']) { const r = await c.match(k); out[k] = r ? r.redirected : 'missing'; } return out; }""" % CACHE_V20)
        check("no cached entry is a redirected response", all(v is False for v in red.values()), red)
        env.go_offline()
        r = env.page.goto(ORIGIN + "/about.html")
        check("offline navigation to a cached .html page works (would error if a redirected response had been cached)", r.status == 200 and "About" in env.page.title(), (r.status, env.page.title()))
        r = env.page.goto(ORIGIN + "/index.html"); env.page.wait_for_selector("#categoryList button")
        check("offline /index.html serves the homepage converter", env.page.locator("#fromValue").count() == 1)
        r = env.page.goto(ORIGIN + "/"); env.page.wait_for_selector("#categoryList button")
        open_category(env.page, "Mass")
        check("offline '/' converter works", near(num(pick(env.page, "kilogram", "pound", 1)), 2.204622622))
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s8_install_resilience(pw):
    scenario("8. Install resilience: optional failures must not block installation")
    cases = {
        "optional page returns 404 (/sitemap.html)": {"/sitemap.html": (404, b"nope")},
        "optional page returns 500 (/guides.html)": {"/guides.html": (500, b"err")},
        "analytics script missing (/google-analytics.js)": {"/google-analytics.js": (404, b"")},
        "/rates.json is not JSON": {"/rates.json": (200, b"{not json")},
        "/rates.json has no rates": {"/rates.json": (200, b'{"base":"USD","rates":{}}')},
        "/rates.json has non-positive rate": {"/rates.json": (200, b'{"base":"USD","rates":{"EUR":0}}')},
        "/rates.json missing": {"/rates.json": (404, b"")},
        "search-index manifest missing": {"/search-index/manifest.json": (404, b"")},
        "one search-index shard missing": {"/search-index/pairs/length.json": (404, b"")},
    }
    for label, ov in cases.items():
        env = Env(pw, live=live_payload())     # live feed reachable: the page itself never falls back to /rates.json
        env.site.overrides.update(ov)
        try:
            controlled = env.install()
            urls = env.cache_urls() or []
            check(f"[{label}] service worker still installs and activates", controlled and env.cache_names() == [CACHE_V20], env.cache_names())
            check(f"[{label}] homepage + core assets cached", all(u in urls for u in ["/", "/index.html", "/app.js", "/styles.css", "/search-engine.js", "/offline.html"]))
            if "rates.json" in label:
                check(f"[{label}] invalid/missing snapshot is NOT cached", "/rates.json" not in urls, [u for u in urls if "rates" in u])
            env.go_offline()
            env.page.reload(); env.page.wait_for_selector("#categoryList button")
            check(f"[{label}] homepage converter works offline", near(num(pick(env.page, "meter", "foot", 1)), 3.280839895))
        finally:
            env.close()
    # core asset failure: install must FAIL (no half-built shell)
    env = Env(pw, live=live_payload())
    env.site.overrides["/search-engine.js"] = (404, b"")
    try:
        env.page.goto(ORIGIN + "/"); env.page.wait_for_selector("#categoryList button"); time.sleep(3)
        names = env.cache_names()
        has_active = env.page.evaluate("navigator.serviceWorker.getRegistration().then(r => !!(r && r.active))")
        check("a missing CORE asset aborts installation (no active worker, no partial cache serving)", not has_active, (has_active, names))
        check("no v20 cache left claiming to be complete", CACHE_V20 not in names or not has_active, names)
    finally:
        env.close()


# --------------------------------------------------------------------------------------------
def s9_upgrade_v19_to_v20(pw):
    scenario("9. Upgrade from the deployed service-worker v19 to v20")
    tmp = tempfile.mkdtemp(prefix="uc-upgrade-")
    site_dir = os.path.join(tmp, "site")
    try:
        shutil.copytree(ROOT, site_dir, ignore=shutil.ignore_patterns(".git", "tests", "__pycache__"))
        files = ["service-worker.js", "app.js", "styles.css", "offline.html"]
        v20 = {f: open(os.path.join(ROOT, f), "rb").read() for f in files}
        for f in files:                                   # restore the deployed v19 versions of the files this change touches
            blob = subprocess.check_output(["git", "-C", ROOT, "show", "HEAD:" + f])
            open(os.path.join(site_dir, f), "wb").write(blob)
        v19_sw = open(os.path.join(site_dir, "service-worker.js")).read()
        check("fixture really is v19", 'universal-converter-v19' in v19_sw)
        env = Env(pw, root=site_dir, live=live_payload())
        try:
            env.install()
            page = env.page
            names = env.cache_names()
            check("v19 installed: cache universal-converter-v19", names == ["universal-converter-v19"], names)
            v19_urls = env.cache_urls("universal-converter-v19") or []
            # documented v19 gaps this change fixes
            check("[v19 evidence] /rates.json was NOT precached", "/rates.json" not in v19_urls)
            check("[v19 evidence] search-index units/pages NOT precached", not any(u.startswith("/search-index/units.json") for u in v19_urls))
            check("[v19 evidence] no offline indicator element", page.locator("#offlineStatus").count() == 0)
            # v19 behaviour for an uncached page while offline: offline.html instead of the converter
            env.go_offline()
            page.goto(ORIGIN + "/never/cached/"); time.sleep(0.5)
            check("[v19 evidence] uncached URL offline showed offline.html with no converter", page.locator("#fromValue").count() == 0, page.url)
            env.go_online()
            page.goto(ORIGIN + "/"); page.wait_for_selector("#categoryList button")
            # visitor is mid-task on v19
            open_category(page, "Electricity")
            page.fill("#fromValue", "314.15"); page.fill("#contextVoltage", "208")
            page.evaluate("window.__sameDocument = 'upgrade-marker'")
            # deploy v20
            for f in files:
                open(os.path.join(site_dir, f), "wb").write(v20[f])
            page.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
            end = time.time() + 20
            while time.time() < end and env.cache_names() != [CACHE_V20]:
                time.sleep(0.3)
            names = env.cache_names()
            check("update: v20 activated and the v19 cache was removed", names == [CACHE_V20], names)
            check("update: open page not reloaded, inputs untouched", page.evaluate("window.__sameDocument") == "upgrade-marker" and page.input_value("#fromValue") == "314.15" and page.input_value("#contextVoltage") == "208")
            urls = env.cache_urls() or []
            check("update: v20 cache is complete (rates + search index + shell)", all(u in urls for u in ["/", "/index.html", "/rates.json", "/search-index/manifest.json", "/search-engine.js", "/offline.html"]) and len([u for u in urls if u.startswith("/search-index/")]) == 30, len(urls))
            res = pick(page, "ampere", "watt", 2)
            check("update: converter keeps working in the old page during the switch (2 A @ 208 V = 416 W)", near(num(res), 416.0), res)
            # now offline refresh on the upgraded worker
            env.go_offline()
            page.reload(); page.wait_for_selector("#categoryList button")
            check("after upgrade + offline refresh: v20 app.js active (indicator present and shows offline)", "Offline" in page.inner_text("#offlineStatus"))
            open_category(page, "Temperature")
            check("after upgrade + offline refresh: converter works", pick(page, "celsius", "fahrenheit", 100) == "212")
            r = page.goto(ORIGIN + "/never/cached/")
            page.wait_for_selector("#categoryList button")
            check("after upgrade: uncached URL offline now lands on the cached homepage converter", page.url == ORIGIN + "/" and page.locator("#fromValue").count() == 1, page.url)
            res = run_search(page, "psi to bar")
            check("after upgrade: global search works offline on a cold engine (search index precached)", "psi-to-bar/" in res, res[:120])
            env.go_online()
        finally:
            env.close()

        # failed upgrade: v20 with a missing core asset must leave v19 fully in charge
        for f in files:
            blob = subprocess.check_output(["git", "-C", ROOT, "show", "HEAD:" + f]); open(os.path.join(site_dir, f), "wb").write(blob)
        env = Env(pw, root=site_dir, live=live_payload())
        try:
            env.install()
            for f in files:
                open(os.path.join(site_dir, f), "wb").write(v20[f])
            env.site.overrides["/search-engine.js"] = (503, b"")            # core asset unavailable during the v20 install
            env.page.evaluate("navigator.serviceWorker.getRegistration().then(r => r.update())")
            time.sleep(0.5)
            end = time.time() + 30       # wait for the install attempt to finish (it settles every core write first)
            while time.time() < end and env.page.evaluate("navigator.serviceWorker.getRegistration().then(r => !!(r.installing || r.waiting))"):
                time.sleep(0.3)
            names = env.cache_names()
            check("failed v20 install (core asset 503): v19 and its cache stay active, nothing half-installed", names == ["universal-converter-v19"], names)
            env.go_offline()
            env.page.reload(); env.page.wait_for_selector("#categoryList button")
            check("v19 still serves the homepage offline after the failed upgrade", near(num(pick(env.page, "meter", "foot", 1)), 3.280839895))
        finally:
            env.close()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


# --------------------------------------------------------------------------------------------
def s10_indicator_all_languages(pw):
    scenario("10. Offline and connection-restored indicator in all 14 languages")
    codes = list(INDICATOR_STRINGS)
    offs = [INDICATOR_STRINGS[c][0] for c in codes]
    backs = [INDICATOR_STRINGS[c][1] for c in codes]
    check("expectation table covers exactly the 14 supported languages", len(codes) == 14 and codes[0] == "en", codes)
    check("14 distinct offline texts and 14 distinct restored texts", len(set(offs)) == 14 and len(set(backs)) == 14)
    check("every non-English text differs from English", all(INDICATOR_STRINGS[c][0] != offs[0] and INDICATOR_STRINGS[c][1] != backs[0] for c in codes[1:]))
    env = Env(pw)
    try:
        env.install()
        page = env.page
        menu_codes = page.evaluate("[...document.querySelectorAll('.lang-option')].map(o => o.dataset.langCode)")
        check("the app's own language menu lists the same 14 languages", sorted(menu_codes) == sorted(codes), menu_codes)

        def choose(code):
            page.click("#langDropdownToggle")
            page.click(f'.lang-option[data-lang-code="{code}"]')
            time.sleep(0.25)

        def badge():
            return page.eval_on_selector("#offlineStatus", "e => e.textContent")

        for code in codes:
            off, back = INDICATOR_STRINGS[code]
            choose(code)
            time.sleep(0.8)         # lets the language file load online
            check(f"[{code}] online: indicator is empty", badge() == "")
            env.go_offline(); time.sleep(0.5)
            check(f"[{code}] outage (page open): offline message in {code}", badge() == off, badge())
            check(f"[{code}] <html lang> / dir follow the language", page.evaluate("[document.documentElement.lang, document.documentElement.dir]") == [code, "rtl" if code == "ar" else "ltr"])
            a11y = page.evaluate("""(() => { const e = document.getElementById('offlineStatus');
                return [e.getAttribute('data-i18n'), e.getAttribute('role'), e.getAttribute('aria-live'), e.tabIndex, getComputedStyle(e).pointerEvents]; })()""")
            check(f"[{code}] badge: shared data-i18n path, role=status, aria-live=polite, not focusable, ignores pointer events",
                  a11y == ["messages.offlineIndicator", "status", "polite", -1, "none"], a11y)
            page.reload(); page.wait_for_selector("#categoryList button")
            check(f"[{code}] offline refresh: selected language kept and offline message still in {code}", badge() == off and page.evaluate("document.documentElement.lang") == code, (badge(), page.evaluate("document.documentElement.lang")))
            check(f"[{code}] converter works offline in this language", near(num(pick(page, "meter", "foot", 10)), 32.80839895))
            page.evaluate("window.__noReload = true")
            env.go_online(); time.sleep(0.6)
            check(f"[{code}] connection restored: restored message in {code}", badge() == back, badge())
            check(f"[{code}] restored: page not reloaded and language unchanged", page.evaluate("window.__noReload === true && document.documentElement.lang") == code)
            time.sleep(3.4)
            check(f"[{code}] restored message clears itself", badge() == "" and page.get_attribute("#offlineStatus", "data-i18n") is None, badge())

        # switching language while offline re-translates the visible badge (no reload), on a phone-sized screen too
        page.set_viewport_size({"width": 390, "height": 800})
        choose("en")
        env.go_offline(); time.sleep(0.5)
        for code in codes:
            choose(code)
            check(f"[{code}] language switched WHILE offline: badge re-translated immediately", badge() == INDICATOR_STRINGS[code][0], badge())
            geo = page.evaluate("""(() => { const e = document.getElementById('offlineStatus'), r = e.getBoundingClientRect();
                return {left: r.left, rightGap: window.innerWidth - r.right, fits: r.left >= 0 && r.right <= window.innerWidth && r.bottom <= window.innerHeight && r.height > 0,
                        dir: getComputedStyle(e).direction}; })()""")
            # inline-start edge with a 1rem (16px) margin: the LEFT edge in LTR languages, the RIGHT edge in Arabic (RTL)
            anchored = abs(geo["rightGap"] - 16) <= 1 and geo["left"] > 16 if code == "ar" else abs(geo["left"] - 16) <= 1
            check(f"[{code}] badge fits a 390px screen and is anchored to the inline-start edge (right in Arabic RTL, left otherwise)",
                  geo["fits"] and anchored and geo["dir"] == ("rtl" if code == "ar" else "ltr"), geo)
        # restored message re-translates too if the language changes while it is showing
        choose("fr")
        env.go_online(); time.sleep(0.5)
        choose("de")
        check("language switched while 'back online' is showing: German restored message", badge() == INDICATOR_STRINGS["de"][1], badge())
        time.sleep(3.4)
        check("no uncaught page errors across all 14 languages", not env.page_errors, env.page_errors[:2])
    finally:
        env.close()


if __name__ == "__main__":
    main()
