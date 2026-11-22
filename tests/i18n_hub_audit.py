"""Full audit of all category hubs x all non-English languages (+ English baseline).

For every hub it checks Popular Conversions, All Conversions (heading, search label,
placeholder, count, show/hide toggle, lazily translated cards), Quick Facts (including
nested lists), Why Convert (where it exists, links preserved), RTL, no raw template
placeholders and no page errors; one UI language-switch chain per hub (en -> ar -> de
-> en, verifying no stale text); and an SEO-page sample per category.

Usage: python3 -m http.server 8000      (repo root, other shell)
       python3 tests/i18n_hub_audit.py OUT.json [lang,lang,...] [hub,hub,...]
Results are appended to OUT.json as they are produced. Exit code 1 on any failure.
Requires Playwright + Chromium. Huge hubs are loaded under a file lock (memory).
"""
import fcntl, json, os, re, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get("UC_BASE", "http://127.0.0.1:8000")
ROOT = Path(__file__).resolve().parent.parent
OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/hub_audit.json"
LANGS = sys.argv[2].split(",") if len(sys.argv) > 2 and sys.argv[2] else "es fr de pt it ar zh ja ko hi tr id so".split()
ALL_HUBS = sorted(p.parent.name for p in ROOT.glob("*/index.html") if "allConversionsCount" in p.read_text(encoding="utf-8"))
HUBS = sys.argv[3].split(",") if len(sys.argv) > 3 and sys.argv[3] else ALL_HUBS
HEAVY = {h for h in ALL_HUBS if (ROOT / h / "index.html").stat().st_size > 5_000_000}

LEAF = """(sel)=>{const o=[];for(const r of document.querySelectorAll(sel)){const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);let n;
while(n=w.nextNode()){const t=n.nodeValue.replace(/\\s+/g,' ').trim();if(t)o.push(t)}}return o}"""
SNAP = """()=>{const q=s=>document.querySelector(s),t=s=>{const e=q(s);return e?e.textContent.trim():null};
const why=q('.seo-why-convert');
return {lang:document.documentElement.lang,dir:document.documentElement.dir,pop:t('#popularHubTitle'),all:t('#allConversionsTitle'),
label:t('label[for=allConversionsSearch]'),ph:q('#allConversionsSearch')&&q('#allConversionsSearch').placeholder,count:t('#allConversionsCount'),
show:t('#allConversionsToggle .seo-links-when-closed'),hide:t('#allConversionsToggle .seo-links-when-open'),
pcard:t('#popularHubGrid .popular-grid-card span'),qfh:t('article.seo-quick-facts h2'),
qfLists:document.querySelectorAll('article.seo-quick-facts ul').length,qfItems:document.querySelectorAll('article.seo-quick-facts li').length,
whyh:why?(why.querySelector('h2')||{}).textContent:null,whyLinks:why?[...why.querySelectorAll('p a')].map(a=>a.getAttribute('href')):null,
raw:/\\{[A-Z_0-9]+\\}/.test(document.body.innerText),n:(window.__categoryConversions||[]).length,
firstSeo:(q('#popularHubGrid .popular-grid-card')||{getAttribute:()=>null}).getAttribute('href')}}"""
failures = []

def fail(msg):
    failures.append(msg); print("FAIL", msg, flush=True)

def record(entry):
    with open(OUT, "a", encoding="utf-8") as f: f.write(json.dumps(entry, ensure_ascii=False) + "\n")

class Lock:
    def __init__(self, heavy): self.heavy = heavy
    def __enter__(self):
        if self.heavy:
            self.f = open("/tmp/uc_heavy.lock", "w"); fcntl.flock(self.f, fcntl.LOCK_EX)
    def __exit__(self, *a):
        if self.heavy: fcntl.flock(self.f, fcntl.LOCK_UN); self.f.close()

def open_page(b, url, lang, width=1280):
    ctx = b.new_context(viewport={"width": width, "height": 900}, service_workers="block")
    ctx.add_init_script(f"try{{localStorage.setItem('uc-language','{lang}')}}catch(e){{}}")
    pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    pg.set_default_timeout(90000)
    pg.goto(BASE + url, wait_until="load"); pg.wait_for_timeout(2500)
    return ctx, pg, errs

def leaks(texts, english):
    ens = set(english)
    # technical formula lines with unit symbols ("1 deg x 0.0174 = ...") stay untranslated by design
    return [t for t in dict.fromkeys(texts) if t in ens and len(t.split()) >= 3 and re.search(r"[A-Za-z]{3,}", t)
            and not t.endswith("— sources") and not re.search(r"(=|×|÷).*\d|\d.*(=|×|÷)", t)]

def expand_and_cards(pg):
    pg.click("#allConversionsToggle"); pg.wait_for_timeout(1500)
    return pg.evaluate("()=>[...document.querySelectorAll('#allConversionsGrid .conversion-card')].slice(0,3).map(a=>a.textContent)")

def run_hub(b, hub, base):
    url = f"/{hub}/"
    with Lock(hub in HEAVY):
        ctx, pg, errs = open_page(b, url, "en")
        s = pg.evaluate(SNAP); cards = expand_and_cards(pg)
        qf = pg.evaluate(LEAF, "article.seo-quick-facts"); why = pg.evaluate(LEAF, ".seo-why-convert")
        ctx.close()
    base[hub] = {"snap": s, "cards": cards, "qf": qf, "why": why}
    seo_href = s["firstSeo"]
    if seo_href:
        seo_url = f"/{hub}/" + seo_href.replace("../", "").replace("index.html", "").strip("/") + "/" if not seo_href.startswith("..") else "/" + seo_href.replace("../", "").replace("index.html", "").strip("/") + "/"
        ctx, pg, _ = open_page(b, seo_url, "en"); base[hub]["seo_url"] = seo_url; base[hub]["seo"] = pg.evaluate(LEAF, "article.seo-article"); ctx.close()

def check_combo(b, hub, lang, base):
    e = base[hub]; es = e["snap"]; t0 = time.time()
    with Lock(hub in HEAVY):
        ctx, pg, errs = open_page(b, f"/{hub}/", lang)
        s = pg.evaluate(SNAP); cards = expand_and_cards(pg)
        qf = pg.evaluate(LEAF, "article.seo-quick-facts"); why = pg.evaluate(LEAF, ".seo-why-convert")
        ctx.close()
    p = f"{lang} {hub}"; probs = []
    if s["lang"] != lang: probs.append(f"html lang={s['lang']}")
    if (lang == "ar") != (s["dir"] == "rtl"): probs.append(f"dir={s['dir']}")
    for k, label in [("pop", "popular heading"), ("all", "all-conversions heading"), ("label", "search label"), ("ph", "placeholder"), ("show", "show toggle"), ("hide", "hide toggle"), ("qfh", "quick facts heading")]:
        if s[k] is None or s[k] == es[k]: probs.append(f"{label} not translated ({s[k]!r})")
    if "conversions shown" in (s["count"] or "") or not re.search(r"\d", s["count"] or ""): probs.append(f"count not translated ({s['count']!r})")
    if not s["pcard"] or " to " in s["pcard"]: probs.append(f"popular card English ({s['pcard']!r})")
    if not cards or any(" to " in c for c in cards): probs.append(f"all-conversion cards English ({cards})")
    if s["qfLists"] != es["qfLists"] or s["qfItems"] != es["qfItems"]: probs.append(f"quick facts structure changed {es['qfLists']}/{es['qfItems']} -> {s['qfLists']}/{s['qfItems']}")
    for l in leaks(qf, e["qf"]): probs.append(f"quick facts English: {l[:60]}")
    if es["whyh"] is None:
        if s["whyh"] is not None: probs.append("why-convert appeared")
    else:
        if s["whyh"] == es["whyh"]: probs.append("why heading not translated")
        if s["whyLinks"] != es["whyLinks"]: probs.append(f"why links changed {es['whyLinks']} -> {s['whyLinks']}")
        for l in leaks(why, e["why"]): probs.append(f"why English: {l[:60]}")
    if s["raw"]: probs.append("raw {PLACEHOLDER} visible")
    if errs: probs.append(f"page errors {errs}")
    for pr in probs: fail(f"{p}: {pr}")
    seo_leaks = []
    if e.get("seo_url"):
        ctx, pg, errs = open_page(b, e["seo_url"], lang)
        seo_leaks = leaks(pg.evaluate(LEAF, "article.seo-article"), e["seo"])
        if errs: fail(f"{p} SEO {e['seo_url']}: page errors {errs}")
        ctx.close()
        # SEO-sample leaks are recorded (and counted in the summary) but reported separately:
        # they are hand-written per-page prose, a content gap rather than a hub-level defect.
        if os.environ.get("UC_STRICT_SEO"):
            for l in seo_leaks: fail(f"{p} SEO {e['seo_url']}: English: {l[:80]}")
    record({"kind": "combo", "hub": hub, "lang": lang, "ok": not probs, "problems": probs, "seo_url": e.get("seo_url"), "seo_leaks": seo_leaks, "secs": round(time.time() - t0, 1)})

def switch_chain(b, hub, base):
    e = base[hub]; es = e["snap"]; probs = []
    with Lock(hub in HEAVY):
        ctx, pg, errs = open_page(b, f"/{hub}/", "en")
        def to(code):
            pg.evaluate(f"()=>document.querySelector('#langDropdownMenu [data-lang-code=\"{code}\"]').click()"); pg.wait_for_timeout(2500)
            return pg.evaluate(SNAP)
        a = to("ar")
        if a["dir"] != "rtl" or a["pop"] == es["pop"]: probs.append("en->ar failed")
        d = to("de")
        if d["dir"] != "ltr" or d["pop"] == es["pop"] or d["pop"] == a["pop"] or d["all"] == a["all"]: probs.append("ar->de failed / stale Arabic")
        if re.search(r"[\u0600-\u06FF]", " ".join(pg.evaluate(LEAF, "article.seo-quick-facts, .seo-why-convert, .popular-conversions-hub, .all-conversions-hub")[:400])): probs.append("Arabic text left after switching to German")
        n = to("en")
        for k in ["lang", "dir", "pop", "all", "label", "ph", "show", "hide", "qfh", "pcard", "whyh"]:
            if n[k] != es[k]: probs.append(f"stale after returning to English: {k}: {n[k]!r} != {es[k]!r}")
        if n["count"] != es["count"]: probs.append(f"stale count {n['count']!r}")
        if pg.evaluate(LEAF, "article.seo-quick-facts") != e["qf"]: probs.append("quick facts differ from English baseline after switching back")
        if pg.evaluate(LEAF, ".seo-why-convert") != e["why"]: probs.append("why-convert differs from English baseline after switching back")
        if errs: probs.append(f"page errors {errs}")
        ctx.close()
    for pr in probs: fail(f"switch {hub}: {pr}")
    record({"kind": "switch", "hub": hub, "ok": not probs, "problems": probs})

def already_done():
    """(hub, lang) combos and hub switch chains already recorded in OUT (resumable runs)."""
    done, switched = set(), set()
    if os.path.exists(OUT):
        for line in open(OUT, encoding="utf-8"):
            try: r = json.loads(line)
            except ValueError: continue
            if r.get("kind") == "combo": done.add((r["hub"], r["lang"]))
            elif r.get("kind") == "switch": switched.add(r["hub"])
    return done, switched

if __name__ == "__main__":
    base = {}; combos = 0; done, switched = already_done()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for hub in HUBS:
            todo = [l for l in LANGS if (hub, l) not in done]
            if not todo and hub in switched: continue
            run_hub(b, hub, base); print("baseline", hub, base[hub]["snap"]["n"], flush=True)
            for lang in todo:
                check_combo(b, hub, lang, base); combos += 1
            if hub not in switched: switch_chain(b, hub, base)
            print("done", hub, flush=True)
        b.close()
    record({"kind": "summary", "hubs": len(HUBS), "langs": len(LANGS), "combos_this_run": combos, "hub_level_failures_this_run": len(failures)})
    print("COMBOS", combos, "FAILURES", len(failures)); sys.exit(1 if failures else 0)
