// End-to-end DOM test of the exchange-rate loading + freshness line, using the real page + app.js in jsdom.
// Usage: node tests/currency-rates-ui.js <path-to-dataset.json>      (needs: npm install jsdom; not a site dependency)
const { JSDOM, VirtualConsole } = require('jsdom');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const dataset = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const REMOTE = 'https://raw.githubusercontent.com/Mr-Amiin/universal-converter/data/rates.json';
const appJs = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
let failures = 0;
const check = (name, ok, detail) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  -> ' + detail)); if (!ok) failures++; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadPage(pagePath, mode, params = {}) {
  const html = fs.readFileSync(path.join(ROOT, pagePath, 'index.html'), 'utf8').replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/g, '');
  const errs = [];
  const vc = new VirtualConsole();
  // The test strips the page's external <script> tags (analytics/ads/consent), which leaves one unrelated
  // addEventListener-on-null error that the ORIGINAL app.js produces identically; it is ignored here.
  vc.on('jsdomError', (e) => { const m = String(e.message).slice(0, 160); if (!/reading 'addEventListener'/.test(m)) errs.push(m); });
  const dom = new JSDOM(html, { url: 'https://theuniversalconverter.com/' + pagePath + '/', runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.__fetched = [];
  w.fetch = async (u, opts = {}) => {
    const url = String(u); w.__fetched.push({ url, cache: opts.cache });
    if (url === REMOTE) {
      if (mode === 'remote-down') throw new Error('network down');
      if (mode === 'remote-incomplete') { const d = JSON.parse(JSON.stringify(dataset)); delete d.rates.KES; return { ok: true, status: 200, json: async () => d }; }
      if (mode === 'remote-http-error') return { ok: false, status: 503, json: async () => ({}) };
      const d = params.dataset || dataset;
      return { ok: true, status: 200, json: async () => d };
    }
    const rel = url.replace(/^https:\/\/theuniversalconverter\.com\//, '').split('?')[0];
    const f = path.join(ROOT, rel);
    if (!fs.existsSync(f)) return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
    const buf = fs.readFileSync(f, 'utf8');
    return { ok: true, status: 200, json: async () => JSON.parse(buf), text: async () => buf };
  };
  w.matchMedia = w.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  // app.js is one IIFE: inject a small test hook just before its closing "}());" to reach TRANSLATIONS etc.
  const cut = appJs.lastIndexOf('}());');
  w.eval(appJs.slice(0, cut) + ';window.__t = { T: TRANSLATIONS, setLang: (l) => { currentLanguageCode = l; }, update: () => updateConversion() };\n' + appJs.slice(cut));
  w.document.dispatchEvent(new w.Event('DOMContentLoaded'));
  await sleep(400);
  return { w, errs };
}

(async () => {
  // 1) Live dataset on the real USD->KES pair page
  let { w, errs } = await loadPage('currency/usd-to-kes', 'live');
  const doc = w.document;
  const from = doc.getElementById('fromUnit') && doc.getElementById('fromUnit').value;
  const to = doc.getElementById('toUnit') && doc.getElementById('toUnit').value;
  check('page selects USD -> KES', from === 'USD' && to === 'KES', `${from} -> ${to}`);
  w.document.getElementById('fromValue').value = '1';
  w.document.getElementById('fromValue').dispatchEvent(new w.Event('input', { bubbles: true }));
  await sleep(50);
  const out = parseFloat(String(doc.getElementById('toValue').value).replace(/,/g, ''));
  check('1 USD = 129.2 KES from live dataset (direction + value)', Math.abs(out - 129.2) < 0.05, out);
  const remoteCall = w.__fetched.find((f) => f.url === REMOTE);
  check('rates fetched from raw data-branch URL with revalidation', !!remoteCall && remoteCall.cache === 'no-cache', JSON.stringify(remoteCall));
  const fresh = doc.getElementById('currencyFreshness');
  check('freshness line is shown', !!fresh && !fresh.hidden, fresh && fresh.textContent);
  const t = fresh ? fresh.textContent : '';
  check('freshness shows observation date', t.includes('Reference-rate date: 2026-10-29'), t);
  check('freshness shows last retrieval timestamp', t.includes('Last checked: 2026-10-30 12:00 UTC'), t);
  const link = fresh && fresh.querySelector('a');
  check('freshness has a Frankfurter attribution link', !!link && link.href === 'https://frankfurter.dev/' && link.textContent === 'Frankfurter' && link.rel.includes('noopener'), link && link.outerHTML);
  check('freshness has reference-rate disclosure', t.includes('Reference rates, not live trading prices.'), t);
  check('no page errors', errs.length === 0, errs.join(' | '));

  // 2) Reverse direction + other pairs through the same formula the site uses
  const sw = doc.getElementById('fromUnit'); const tw = doc.getElementById('toUnit');
  const setPair = async (a, b, amount) => {
    sw.value = a; sw.dispatchEvent(new w.Event('change', { bubbles: true }));
    tw.value = b; tw.dispatchEvent(new w.Event('change', { bubbles: true }));
    const fv = doc.getElementById('fromValue'); fv.value = String(amount); fv.dispatchEvent(new w.Event('input', { bubbles: true }));
    await sleep(50);
    return parseFloat(String(doc.getElementById('toValue').value).replace(/,/g, ''));
  };
  check('129.2 KES -> USD ~ 1', Math.abs(await setPair('KES', 'USD', 129.2) - 1) < 0.001);
  check('1 USD -> EUR = 0.8739', Math.abs(await setPair('USD', 'EUR', 1) - 0.8739) < 0.0001);
  check('1 EUR -> USD = 1.1443', Math.abs(await setPair('EUR', 'USD', 1) - 1 / 0.8739) < 0.0001);
  check('1 USD -> INR = 88.25', Math.abs(await setPair('USD', 'INR', 1) - 88.25) < 0.01);
  check('88.25 INR -> USD ~ 1', Math.abs(await setPair('INR', 'USD', 88.25) - 1) < 0.001);
  check('1 USD -> SOS = 571', Math.abs(await setPair('USD', 'SOS', 1) - 571) < 0.1);
  check('571 SOS -> USD ~ 1', Math.abs(await setPair('SOS', 'USD', 571) - 1) < 0.001);
  check('1 EUR -> BGN = 1.95583', Math.abs(await setPair('EUR', 'BGN', 1) - 1.95583) < 1e-4);
  const bgn = doc.getElementById('currencyFreshness').textContent;
  check('BGN shows legacy fixed-conversion notice', /Legacy fixed conversion/.test(bgn) && bgn.includes('1 EUR = 1.95583 BGN') && /not a live market rate/.test(bgn), bgn);
  check('1 EUR -> HRK = 7.5345', Math.abs(await setPair('EUR', 'HRK', 1) - 7.5345) < 1e-4);
  await setPair('USD', 'SOS', 1);
  check('SOS shows official-rate caveat', /official rate can differ/.test(doc.getElementById('currencyFreshness').textContent));
  w.close();

  // 3) Remote unavailable -> offline snapshot, clearly disclosed (never silently presented as live)
  for (const mode of ['remote-down', 'remote-http-error', 'remote-incomplete']) {
    ({ w, errs } = await loadPage('currency/usd-to-kes', mode));
    const f = w.document.getElementById('currencyFreshness');
    check(`${mode}: falls back to /rates.json and discloses it`, w.__fetched.some((x) => x.url.endsWith('/rates.json') && x.cache === 'no-store') && !!f && /could not be loaded/.test(f.textContent) && /2026-07-23/.test(f.textContent), f && f.textContent);
    check(`${mode}: no errors`, errs.length === 0, errs.join(' | '));
    w.close();
  }

  // 4) Every supported language: keys present, placeholders match English, rendered through the existing i18n system
  ({ w, errs } = await loadPage('currency/usd-to-kes', 'live'));
  const T = w.__t.T;
  const langs = Object.keys(T);
  const KEYS = ['currencyFreshObserved', 'currencyFreshChecked', 'currencyFreshSource', 'currencyFreshDisclaimer', 'currencyFreshLegacy', 'currencyFreshOffline', 'currencyFreshBuiltin', 'currencyFreshOfficial', 'currencyFreshPegged'];
  const ph = (x) => (x.match(/\{\w+\}/g) || []).sort().join(',');
  check('14 supported languages found', langs.length === 14, langs.join(','));
  for (const lang of langs) {
    const m = T[lang].messages;
    const missing = KEYS.filter((k) => typeof m[k] !== 'string' || !m[k].trim());
    const badPh = KEYS.filter((k) => m[k] && ph(m[k]) !== ph(T.en.messages[k]));
    const untranslated = lang === 'en' ? [] : KEYS.filter((k) => m[k] === T.en.messages[k]);
    check(`${lang}: all ${KEYS.length} freshness keys present, placeholders match, translated`, !missing.length && !badPh.length && !untranslated.length, JSON.stringify({ missing, badPh, untranslated }));
  }
  for (const lang of langs.filter((l) => l !== 'en')) {
    w.__t.setLang(lang);
    w.document.getElementById('fromUnit').value = 'EUR'; w.document.getElementById('toUnit').value = 'BGN';
    w.__t.update();
    const node = w.document.getElementById('currencyFreshness');
    const expectObserved = T[lang].messages.currencyFreshObserved.replace('{DATE}', '2026-10-29');
    const expectLegacy = T[lang].messages.currencyFreshLegacy.replace(/\{CODE\}/g, 'BGN').replace('{RATE}', '1.95583');
    check(`${lang}: freshness line rendered in that language (date, legacy fixed conversion, disclaimer, link)`,
      node.textContent.includes(expectObserved) && node.textContent.includes(expectLegacy) && node.textContent.includes(T[lang].messages.currencyFreshDisclaimer) && !!node.querySelector('a[href="https://frankfurter.dev"]'), node.textContent);
  }
  w.close();
  process.exit(failures ? 1 : 0);
})();
