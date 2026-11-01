// Verifies the service worker never serves a stale /rates.json while the network is available,
// and never intercepts the cross-origin live-rates URL. Usage: node tests/service-worker-rates.js
const vm = require('vm'), fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'service-worker.js'), 'utf8');
let failures = 0;
const check = (n, ok, d) => { console.log((ok ? 'PASS ' : 'FAIL ') + n + (ok ? '' : ' -> ' + d)); if (!ok) failures++; };

function makeWorker(networkImpl) {
  const store = new Map(); const handlers = {};
  const caches = {
    open: async () => ({ put: async (req, res) => { store.set(req.url || String(req), res); }, addAll: async () => {}, match: async (r) => store.get(r.url || String(r)) }),
    match: async (r) => store.get(r.url || String(r)),
    keys: async () => [], delete: async () => true,
  };
  const self = { location: { origin: 'https://theuniversalconverter.com' }, addEventListener: (t, fn) => { handlers[t] = fn; }, skipWaiting() {}, clients: { claim() {} } };
  const ctx = { self, caches, fetch: networkImpl, Response: { error: () => ({ error: true }) }, URL, Promise, console };
  vm.runInNewContext(src, ctx);
  return { handlers, store };
}
const dispatch = async (w, url) => {
  let responded = null;
  w.handlers.fetch({ request: { method: 'GET', url, mode: 'cors' }, respondWith: (p) => { responded = Promise.resolve(p); } });
  return responded ? await responded : null;
};
(async () => {
  const URLR = 'https://theuniversalconverter.com/rates.json';
  let online = true; let version = 'OLD';
  const resp = (v) => ({ ok: true, v, clone() { return this; } });
  const w = makeWorker(async () => { if (!online) throw new Error('offline'); return resp(version); });
  await dispatch(w, URLR);                       // first visit caches OLD
  check('first load cached', w.store.get(URLR).v === 'OLD');
  version = 'NEW';
  const r = await dispatch(w, URLR);             // later visit: network has NEW
  check('online: returns NEW, not the cached OLD copy', r.v === 'NEW', r && r.v);
  await new Promise((s) => setTimeout(s, 10));
  check('online: cache refreshed to NEW', w.store.get(URLR).v === 'NEW');
  online = false;
  const off = await dispatch(w, URLR);
  check('offline: falls back to last cached copy', off && off.v === 'NEW');
  const raw = await dispatch(w, 'https://raw.githubusercontent.com/Mr-Amiin/universal-converter/data/rates.json');
  check('cross-origin live-rates URL is not intercepted', raw === null);
  const m = /const CACHE_NAME = "([^"]+)"/.exec(src);
  check('CACHE_NAME bumped past v14', m && m[1] !== 'universal-converter-v14', m && m[1]);
  process.exit(failures ? 1 : 0);
})();
