const CACHE_NAME = "universal-converter-v22";
const APP_SHELL = [
"/",
"/index.html",
"/styles.css",
"/app.js",
"/search-engine.js",
"/adsense-config.js",
"/adsense.js",
"/analytics-config.js",
"/google-analytics.js",
"/logo.svg?v=2",
"/logo-dark.svg?v=2",
"/logo-icon.svg?v=2",
"/logo-icon-dark.svg?v=2",
"/favicon.svg?v=2",
"/site.webmanifest?v=2",
"/unit-converter.html",
"/online-calculator.html",
"/sitemap.html",
"/404.html",
"/offline.html",
"/guides.html",
"/metric-vs-imperial.html",
"/what-is-a-kilometer.html",
"/acre-vs-hectare.html",
"/celsius-vs-fahrenheit.html",
"/digital-storage-units-guide.html",
"/pressure-units-guide.html",
"/references.html",
"/about.html",
"/contact.html",
"/privacy.html",
"/terms.html",
"/meter-to-feet/",
"/meters-to-feet/",
"/feet-to-meters/",
"/miles-to-km/",
"/km-to-miles/",
"/inches-to-cm/",
"/kg-to-lbs/",
"/lbs-to-kg/",
"/grams-to-ounces/",
"/celsius-to-fahrenheit/",
"/fahrenheit-to-celsius/",
"/liter-to-gallon/",
"/liters-to-gallons/",
"/gallons-to-liters/",
"/acre-to-hectare/",
"/acres-to-hectares/",
"/hectares-to-acres/",
"/square-feet-to-square-meters/",
"/mph-to-kmh/",
"/psi-to-bar/",
"/gb-to-mb/",
"/watts-to-horsepower/"
];

// BEST EFFORT: stored individually, so one failing file never blocks installation.
const OPTIONAL_ASSETS = [
  "/logo.svg",
  "/adsense-config.js",
  "/adsense.js",
  "/analytics-config.js",
  "/google-analytics.js",
  "/unit-converter.html",
  "/online-calculator.html",
  "/sitemap.html",
  "/404.html",
  "/guides.html",
  "/metric-vs-imperial.html",
  "/what-is-a-kilometer.html",
  "/acre-vs-hectare.html",
  "/celsius-vs-fahrenheit.html",
  "/digital-storage-units-guide.html",
  "/pressure-units-guide.html",
  "/references.html",
  "/about.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/meter-to-feet/",
  "/meters-to-feet/",
  "/feet-to-meters/",
  "/miles-to-km/",
  "/km-to-miles/",
  "/inches-to-cm/",
  "/kg-to-lbs/",
  "/lbs-to-kg/",
  "/grams-to-ounces/",
  "/celsius-to-fahrenheit/",
  "/fahrenheit-to-celsius/",
  "/liter-to-gallon/",
  "/liters-to-gallons/",
  "/gallons-to-liters/",
  "/acre-to-hectare/",
  "/acres-to-hectares/",
  "/hectares-to-acres/",
  "/square-feet-to-square-meters/",
  "/mph-to-kmh/",
  "/psi-to-bar/",
  "/gb-to-mb/",
  "/watts-to-horsepower/"
];

const HOME_URL = "/";
const OFFLINE_URL = "/offline.html";
const RATES_URL = "/rates.json";
const SEARCH_INDEX_DIR = "/search-index/";

// A redirected response cannot be used to answer a navigation, so store a clean copy instead.
function cleanResponse(response) {
  if (!response.redirected) return Promise.resolve(response);
  return response.blob().then((body) => new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  }));
}

// Fetches fresh from the network (never the HTTP cache) and rejects on anything but a 2xx.
function fetchFresh(url) {
  return fetch(new Request(url, { cache: "reload" })).then((response) => {
    if (!response.ok) throw new Error("precache failed: " + url + " (" + response.status + ")");
    return response;
  });
}

function precacheUrl(cache, url) {
  return fetchFresh(url).then(cleanResponse).then((response) => cache.put(url, response));
}

// Only same-origin successful responses are stored: a 404/500 must never be replayed offline.
function isCacheable(response) {
  return !!response && response.ok && response.type === "basic";
}

function isValidRatesPayload(payload) {
  if (!payload || typeof payload !== "object" || !payload.rates || typeof payload.rates !== "object") return false;
  const codes = Object.keys(payload.rates);
  if (codes.length === 0) return false;
  return codes.every((code) => {
    const rate = Number(payload.rates[code]);
    return Number.isFinite(rate) && rate > 0;
  });
}

// The offline fallback rate snapshot is stored only if it parses and holds real rates.
function precacheRates(cache) {
  return fetchFresh(RATES_URL).then((response) => {
    return response.clone().json().then((payload) => {
      if (!isValidRatesPayload(payload)) throw new Error("rates.json is not a valid rate snapshot");
      return cache.put(RATES_URL, response);
    });
  });
}

// The search engine requests manifest.json plainly but units.json, pages.json and every category
// shard with "?v=<manifest.version>" (see search-engine.js). Cache keys include the query string,
// so the exact URLs are derived from the live manifest rather than guessed or wildcarded.
function searchIndexUrls(manifest) {
  if (!manifest || typeof manifest !== "object" || !manifest.files || typeof manifest.files !== "object") return [];
  const query = "?v=" + encodeURIComponent(manifest.version || "0");
  const names = [manifest.files.units, manifest.files.pages];
  (Array.isArray(manifest.categories) ? manifest.categories : []).forEach((category) => {
    names.push(category && category.shard);
  });
  const seen = {};
  const urls = [];
  names.forEach((name) => {
    if (typeof name !== "string" || seen[name]) return;
    if (!/^[A-Za-z0-9._-]+(\/[A-Za-z0-9._-]+)*$/.test(name) || name.indexOf("..") !== -1) return;
    seen[name] = true;
    urls.push(SEARCH_INDEX_DIR + name + query);
  });
  return urls;
}

function precacheSearchIndex(cache) {
  return fetchFresh(SEARCH_INDEX_DIR + "manifest.json").then((response) => {
    return response.clone().json().then((manifest) => {
      const urls = searchIndexUrls(manifest);
      if (urls.length === 0) throw new Error("search-index manifest lists no files");
      return cache.put(SEARCH_INDEX_DIR + "manifest.json", response).then(() => {
        return Promise.allSettled(urls.map((url) => precacheUrl(cache, url)));
      });
    });
  });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // allSettled (not Promise.all): every write must have finished before a failure cleans up the cache.
      return Promise.allSettled(CORE_ASSETS.map((url) => precacheUrl(cache, url)))
        .then((results) => {
          const failed = results.find((result) => result.status === "rejected");
          if (failed) throw failed.reason;
        })
        .then(() => {
          // "/index.html" is the same document as "/". Some hosts redirect it to "/", so store the
          // cached homepage under that key rather than fetching a redirect.
          return cache.match(HOME_URL).then((home) => home && cache.put("/index.html", home.clone()));
        })
        .then(() => Promise.allSettled(
          OPTIONAL_ASSETS.map((url) => precacheUrl(cache, url)).concat([precacheRates(cache), precacheSearchIndex(cache)])
        ));
    }).then(() => self.skipWaiting()).catch((error) => {
      // Never leave a half-filled cache behind: an older worker that is still active looks up
      // every cache by name, so partial v21 entries could otherwise leak into it.
      return caches.delete(CACHE_NAME).then(() => { throw error; });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

function storeInBackground(event, request, response) {
  if (!isCacheable(response)) return;
  const copy = response.clone();
  const work = caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
  if (typeof event.waitUntil === "function") event.waitUntil(work);
}

// Runs only after the network request itself failed. Never used for HTTP error responses, so a
// real 404 from the server is still shown as a 404 while online.
function offlineNavigationFallback(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const isHome = path === "/" || path === "/index.html";
  // A directory-style page requested without its trailing slash (e.g. /kg-to-lbs).
  const lacksSlash = path.charAt(path.length - 1) !== "/" && path.split("/").pop().indexOf(".") === -1;
  return caches.open(CACHE_NAME).then((cache) => {
    const lookup = (target) => cache.match(target, { ignoreSearch: true });
    return lookup(path).then((page) => {
      if (page) return page;
      return (lacksSlash ? lookup(path + "/") : Promise.resolve(null)).then((slashed) => {
        // Same redirect the host performs online, so the page's relative links resolve correctly.
        if (slashed) return Response.redirect(new URL(path + "/" + url.search, self.location.origin).href, 302);
        return lookup(HOME_URL).then((home) => {
          // Homepage (possibly with a query string): serve it in place.
          if (home && isHome) return home;
          // Any other uncached URL: redirect so the homepage's relative assets resolve from "/".
          if (home) return Response.redirect(new URL(HOME_URL, self.location.origin).href, 302);
          // Last resort: the cached homepage itself is unavailable.
          return lookup(OFFLINE_URL).then((offline) => offline || Response.error());
        });
      });
    });
  });
}

function handleNavigation(event) {
  const request = event.request;
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      storeInBackground(event, request, response);
      return response;
    }).catch(() => offlineNavigationFallback(request));
  });
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  // Search index data: network first, so a cached manifest can never point at
  // shard files that a newer deploy has replaced; the cache is only the offline fallback.
  // Offline fallback exchange-rate snapshot: network first, so a cached copy can never be served
  // indefinitely while the network is available. (Fresh rates themselves are cross-origin and
  // never pass through this worker.)
  const requestPath = new URL(event.request.url).pathname;
  if (requestPath === RATES_URL || requestPath.indexOf(SEARCH_INDEX_DIR) === 0) {
    event.respondWith(
      fetch(event.request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match(event.request).then((cached) => cached || Response.error()))
    );
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }
  // Sub-resources (CSS, JS, images, JSON, fonts): cache first, then network. If both fail the
  // request fails like any offline request; HTML is never substituted for a non-HTML resource.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        storeInBackground(event, event.request, response);
        return response;
      }).catch(() => Response.error());
    })
  );
});
