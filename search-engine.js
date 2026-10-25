/*!
 * search-engine.js - client-side engine for the site-wide search box.
 *
 * Works in the browser (global `UCSearch`) and in Node (`require`), so the exact
 * code that ships is the code the automated tests exercise.
 *
 * Data comes from the static files written by generate_search_index.py:
 *
 *   search-index/manifest.json      version + category list
 *   search-index/units.json         every unit (slug, name, symbol, aliases, tier)
 *   search-index/pages.json         home, category hubs, popular root conversions, guides
 *   search-index/pairs/<cat>.json   bitmap of which "<from>-to-<to>" pages exist
 *
 * A category conversion page lives at  <cat>/<fromSlug>-to-<toSlug>/ , so a result
 * is only ever produced when the bitmap says that page exists. Nothing here
 * fetches HTML pages. Shards are fetched lazily, only for categories that contain
 * a matching unit.
 *
 * Outcomes are explicit: an index/shard that cannot be loaded is reported as an
 * error and is never turned into "no results".
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.UCSearch = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var FORMAT_VERSION = 1;
  var SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  // site-root-relative page paths we are willing to link to
  var SAFE_PATH = /^(?:|(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+|[a-z0-9]+(?:-[a-z0-9]+)*\.html)$/;

  /* ------------------------------------------------------------------ text */

  function normalize(text) {
    var s = String(text == null ? "" : text);
    if (s.normalize) s = s.normalize("NFKC"); // "m²" -> "m2"
    return s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  }

  function squash(text) {
    return normalize(text).replace(/[^a-z0-9À-￿]+/g, "");
  }

  var IRREGULAR_PLURAL = { foot: "feet", inch: "inches", mouse: "mice" };
  var IRREGULAR_SINGULAR = { feet: "foot", inches: "inch", mice: "mouse" };

  function singularWord(w) {
    if (IRREGULAR_SINGULAR[w]) return IRREGULAR_SINGULAR[w];
    if (w.length > 3 && /ies$/.test(w)) return w.slice(0, -3) + "y";
    if (w.length > 4 && /(ches|shes|sses|xes|zes)$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && /s$/.test(w) && !/(ss|us|is)$/.test(w)) return w.slice(0, -1);
    return w;
  }

  function pluralWord(w) {
    if (IRREGULAR_PLURAL[w]) return IRREGULAR_PLURAL[w];
    if (/(s|x|z|ch|sh)$/.test(w)) return w + "es";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
    return w + "s";
  }

  /** "kilometers per hour" -> also "kilometer per hour"; only the head noun is inflected. */
  function phraseVariants(phrase) {
    var p = normalize(phrase);
    if (!p) return [];
    var out = [p];
    var per = p.indexOf(" per ");
    var head = per === -1 ? p : p.slice(0, per);
    var tail = per === -1 ? "" : p.slice(per);
    var words = head.split(" ");
    var last = words.pop();
    var base = words.length ? words.join(" ") + " " : "";
    [base + singularWord(last) + tail, base + pluralWord(last) + tail].forEach(function (v) {
      if (out.indexOf(v) === -1) out.push(v);
    });
    return out;
  }

  /**
   * Every searchable string for a unit definition {slug,name,symbol,aliases,keywords}
   * as [key, kind] pairs. kind: name | slug | symbol | alias | keyword
   */
  function unitKeys(def) {
    var seen = Object.create(null);
    var out = [];
    function add(key, kind) {
      if (!key) return;
      var id = kind + "\u0000" + key;
      if (seen[id]) return;
      seen[id] = true;
      out.push([key, kind]);
    }
    phraseVariants(def.name).forEach(function (k) { add(k, "name"); });
    if (def.slug) phraseVariants(String(def.slug).replace(/-/g, " ")).forEach(function (k) { add(k, "slug"); });
    var sym = normalize(def.symbol);
    if (sym) {
      add(sym, "symbol");
      var sq = squash(sym);
      if (sq && sq !== sym) add(sq, "symbol");
    }
    (def.aliases || []).forEach(function (a) {
      phraseVariants(a).forEach(function (k) { add(k, "alias"); });
      var s2 = squash(a);
      if (s2 && s2 !== normalize(a)) add(s2, "alias");
    });
    (def.keywords || []).forEach(function (k) {
      var n = normalize(k);
      if (n) add(n, "keyword");
    });
    return out;
  }

  /* --------------------------------------------------------------- scoring */

  // No mid-word substring tier on purpose: "mph" must not match "kmph", "meter" must not match "kilometer".
  var SCORE = { EXACT: 100, VARIANT: 96, PREFIX: 80, WORD: 60, CATEGORY: 35, KEYWORD: 30, KEYWORD_PREFIX: 25 };

  /** Best score of term t against [key,kind] pairs; 0 = no match. */
  function scoreKeys(keys, t, minPrefix) {
    var best = 0;
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i][0];
      var kind = keys[i][1];
      var s = 0;
      if (kind === "keyword") {
        if (key === t) s = SCORE.KEYWORD;
        else if (t.length >= 3 && key.indexOf(t) === 0) s = SCORE.KEYWORD_PREFIX;
      } else if (key === t) {
        s = SCORE.EXACT;
      } else if (t.length >= minPrefix) {
        if (key.indexOf(t) === 0) s = SCORE.PREFIX + Math.round((10 * t.length) / key.length);
        else if (key.indexOf(" " + t) !== -1) s = SCORE.WORD + Math.round((10 * t.length) / key.length);
      }
      if (s > best) best = s;
    }
    return best;
  }

  function termVariants(t) {
    var out = [];
    phraseVariants(t).forEach(function (v) { if (v !== t) out.push(v); });
    return out;
  }

  /** score a term (with singular/plural variants) against keys */
  function scoreTerm(keys, t, minPrefix) {
    var best = scoreKeys(keys, t, minPrefix);
    if (best >= SCORE.EXACT) return best;
    var variants = termVariants(t);
    for (var i = 0; i < variants.length; i++) {
      var v = variants[i];
      for (var k = 0; k < keys.length; k++) {
        if (keys[k][1] !== "keyword" && keys[k][0] === v) { if (SCORE.VARIANT > best) best = SCORE.VARIANT; }
      }
    }
    return best;
  }

  /* ----------------------------------------------------------------- query */

  var PAIR_WORD = /^(.+?)\s+(?:to|in|into|as)\s+(.+)$/;
  var PAIR_SYMBOL = /^(.+?)\s*(?:->|=>|→|=)\s*(.+)$/;

  /** -> { mode: "none" | "single" | "pair", term, left, right } */
  function parseQuery(raw) {
    var q = normalize(raw);
    q = q.replace(/^(?:convert|conversion of|how many)\s+/, "");
    q = q.replace(/\s+(?:converter|conversion|conversions|calculator)$/, "");
    q = q.replace(/\s+(?:to|in|into|as|->|=>|→|=)$/, "").trim(); // "knots to" -> "knots"
    if (!q) return { mode: "none", term: "" };
    var m = PAIR_SYMBOL.exec(q) || PAIR_WORD.exec(q);
    if (m) {
      var l = m[1].trim();
      var r = m[2].trim();
      if (l && r) return { mode: "pair", term: q, left: l, right: r };
    }
    return { mode: "single", term: q };
  }

  /* ---------------------------------------------------------------- loader */

  function SearchIndexError(message, kind, category, cause) {
    var e = new Error(message);
    e.name = "SearchIndexError";
    e.kind = kind; // "index" | "shard"
    e.category = category || null;
    e.cause = cause || null;
    return e;
  }

  function defaultFetchJson(url) {
    return fetch(url).then(function (response) {
      if (!response.ok) throw new Error(url + " -> HTTP " + response.status);
      return response.json();
    });
  }

  function decodeBase64(b64) {
    if (typeof atob === "function") {
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    }
    return new Uint8Array(Buffer.from(b64, "base64"));
  }

  function safePath(path) {
    return typeof path === "string" && SAFE_PATH.test(path);
  }

  /**
   * options:
   *   baseUrl    folder holding manifest.json (default "search-index/")
   *   rootPrefix prefix that turns a site-root-relative path into a link from the
   *              current page ("" on the homepage, "../../" on a category page,
   *              "/" or "/repo-name/" for absolute bases). Default "".
   *   fetchJson  (url) => Promise<object>; replaceable for tests
   */
  function createEngine(options) {
    var opts = options || {};
    var baseUrl = opts.baseUrl == null ? "search-index/" : opts.baseUrl;
    if (baseUrl && baseUrl.charAt(baseUrl.length - 1) !== "/") baseUrl += "/";
    var rootPrefix = opts.rootPrefix == null ? "" : opts.rootPrefix;
    var fetchJson = opts.fetchJson || defaultFetchJson;

    var core = null;
    var corePromise = null;
    var shardPromises = Object.create(null);
    var diagnostics = { invalidEntries: 0, duplicateUrls: 0, shardLoads: 0, fetches: [] };

    function fetchTracked(url) {
      diagnostics.fetches.push(url);
      return Promise.resolve().then(function () { return fetchJson(url); });
    }

    function loadCore() {
      return fetchTracked(baseUrl + "manifest.json").then(function (manifest) {
        if (!manifest || manifest.format !== FORMAT_VERSION || !Array.isArray(manifest.categories) || !manifest.files) {
          throw new Error("unsupported or corrupt manifest");
        }
        var v = "?v=" + encodeURIComponent(manifest.version || "0");
        return Promise.all([
          fetchTracked(baseUrl + manifest.files.units + v),
          fetchTracked(baseUrl + manifest.files.pages + v)
        ]).then(function (docs) { return buildCore(manifest, docs[0], docs[1]); });
      });
    }

    function buildCore(manifest, unitsDoc, pagesDoc) {
      if (!unitsDoc || !Array.isArray(unitsDoc.categories) || !pagesDoc || !Array.isArray(pagesDoc.pages)) {
        throw new Error("corrupt units/pages document");
      }
      var categories = [];
      var catById = Object.create(null);
      var allUnits = [];
      unitsDoc.categories.forEach(function (c, ci) {
        if (!c || !SAFE_SLUG.test(String(c.id)) || !Array.isArray(c.u)) { diagnostics.invalidEntries++; return; }
        var cat = { id: c.id, label: String(c.label || c.id), order: ci, units: [], byTier: null };
        c.u.forEach(function (row, idx) {
          if (!Array.isArray(row) || !SAFE_SLUG.test(String(row[0]))) { diagnostics.invalidEntries++; cat.units.push(null); return; }
          // row = [slug, name, symbol, tier, aliases|0, keywords]
          var aliases = Array.isArray(row[4]) ? row[4] : [];
          var keywords = Array.isArray(row[5]) ? row[5] : [];
          var unit = { cat: cat.id, catLabel: cat.label, catOrder: ci, idx: idx, slug: row[0], name: String(row[1] || row[0]), symbol: String(row[2] || ""), tier: row[3] | 0, aliases: aliases, keywords: keywords };
          unit.keys = unitKeys(unit);
          cat.units.push(unit);
          allUnits.push(unit);
        });
        // partner ordering inside a category: common units first, then short names
        cat.order_ = cat.units.map(function (u, i) { return i; }).filter(function (i) { return cat.units[i]; }).sort(function (a, b) {
          var ua = cat.units[a], ub = cat.units[b];
          return (ua.tier - ub.tier) || (ua.name.length - ub.name.length) || (ua.name < ub.name ? -1 : ua.name > ub.name ? 1 : 0);
        });
        categories.push(cat);
        catById[cat.id] = cat;
      });

      var pages = [];
      var seenPaths = Object.create(null);
      pagesDoc.pages.forEach(function (p) {
        if (!p || !safePath(p.u) || typeof p.t !== "string") { diagnostics.invalidEntries++; return; }
        if (seenPaths[p.u]) { diagnostics.duplicateUrls++; return; }
        seenPaths[p.u] = true;
        var page = { path: p.u, title: p.t, category: String(p.c || ""), kind: p.x === "conv" ? "conv" : p.x === "hub" ? "hub" : "page" };
        if (page.kind === "conv") {
          if (!p.f || !p.o) { diagnostics.invalidEntries++; return; }
          page.from = { name: p.f.n, symbol: p.f.y || "", keys: unitKeys({ slug: p.f.s, name: p.f.n, symbol: p.f.y, aliases: p.f.a, keywords: p.f.k }) };
          page.to = { name: p.o.n, symbol: p.o.y || "", keys: unitKeys({ slug: p.o.s, name: p.o.n, symbol: p.o.y, aliases: p.o.a, keywords: p.o.k }) };
        } else {
          var keys = [];
          phraseVariants(p.t).forEach(function (k) { keys.push([k, "name"]); });
          (p.a || []).forEach(function (a) { phraseVariants(a).forEach(function (k) { keys.push([k, "alias"]); }); });
          (p.k || []).forEach(function (k) { var n = normalize(k); if (n) keys.push([n, "keyword"]); });
          page.keys = keys;
        }
        pages.push(page);
      });

      return { manifest: manifest, categories: categories, catById: catById, units: allUnits, pages: pages };
    }

    function ready() {
      if (!corePromise) {
        corePromise = loadCore().then(function (c) { core = c; return c; }, function (err) {
          corePromise = null; // allow a retry
          throw SearchIndexError("The search index could not be loaded (" + (err && err.message ? err.message : err) + ")", "index", null, err);
        });
      }
      return corePromise;
    }

    function getShard(category) {
      if (shardPromises[category.id]) return shardPromises[category.id];
      var manifestCat = core.manifest.categories.filter(function (c) { return c.id === category.id; })[0];
      if (!manifestCat) return Promise.reject(SearchIndexError("No index shard is listed for " + category.label, "shard", category.id));
      var url = baseUrl + manifestCat.shard + "?v=" + encodeURIComponent(core.manifest.version || "0");
      diagnostics.shardLoads++;
      var p = fetchTracked(url).then(function (doc) {
        var n = category.units.length;
        if (!doc || doc.n !== n || typeof doc.b !== "string") throw new Error("shard does not match the unit list");
        var bytes = decodeBase64(doc.b);
        if (bytes.length !== Math.ceil((n * n) / 8)) throw new Error("shard bitmap has the wrong length");
        return {
          has: function (i, j) { var k = i * n + j; return (bytes[k >> 3] >> (k & 7)) & 1; }
        };
      }).catch(function (err) {
        delete shardPromises[category.id]; // do not cache failures
        throw SearchIndexError("Could not load the " + category.label + " search data (" + (err && err.message ? err.message : err) + ")", "shard", category.id, err);
      });
      shardPromises[category.id] = p;
      return p;
    }

    function hrefFor(path) { return rootPrefix + path; }

    function convItem(from, to, score) {
      var path = from.cat + "/" + from.slug + "-to-" + to.slug + "/";
      return { kind: "conv", title: from.name + " to " + to.name, path: path, href: hrefFor(path), category: from.catLabel,
               categoryId: from.cat, fromSymbol: from.symbol, toSymbol: to.symbol, score: score };
    }

    function pageItem(page, score) {
      var item = { kind: page.kind, title: page.title, path: page.path, href: hrefFor(page.path), category: page.category,
                   categoryId: "", fromSymbol: "", toSymbol: "", score: score };
      if (page.kind === "conv") { item.fromSymbol = page.from.symbol; item.toSymbol = page.to.symbol; }
      return item;
    }

    /* ------------------------------------------------ unit matching */

    function matchUnits(term, minPrefix, limit) {
      var hits = [];
      var cats = core.categories;
      for (var c = 0; c < cats.length; c++) {
        var catTerms = phraseVariants(cats[c].label).concat(phraseVariants(cats[c].id.replace(/-/g, " ")));
        var inCat = catTerms.indexOf(term) !== -1;
        for (var i = 0; i < cats[c].units.length; i++) {
          var u = cats[c].units[i];
          if (!u) continue;
          var s = scoreTerm(u.keys, term, minPrefix);
          if (inCat && s < SCORE.CATEGORY) s = SCORE.CATEGORY;
          if (s > 0) hits.push({ unit: u, score: s });
        }
      }
      hits.sort(function (a, b) {
        return (b.score - a.score) || (a.unit.tier - b.unit.tier) || (a.unit.catOrder - b.unit.catOrder) ||
               (a.unit.name.length - b.unit.name.length) || (a.unit.name < b.unit.name ? -1 : a.unit.name > b.unit.name ? 1 : 0);
      });
      return limit ? hits.slice(0, limit) : hits;
    }

    /* ---------------------------------------------------- sessions */

    function buildPlan(parsed) {
      var explicit = [];
      var groups = [];
      if (parsed.mode === "single") {
        var t = parsed.term;
        core.pages.forEach(function (p) {
          var s;
          if (p.kind === "conv") {
            s = Math.max(scoreTerm(p.from.keys, t, 2), scoreTerm(p.to.keys, t, 2));
            if (s >= SCORE.PREFIX) s += 5;
          } else {
            s = scoreTerm(p.keys, t, 2);
            if (s === SCORE.EXACT) s += 10;
          }
          if (s > 0) explicit.push({ page: p, score: s });
        });
        matchUnits(t, 2).forEach(function (h) { groups.push({ type: "unit", unit: h.unit, score: h.score }); });
      } else if (parsed.mode === "pair") {
        core.pages.forEach(function (p) {
          if (p.kind !== "conv") return;
          var sl = scoreTerm(p.from.keys, parsed.left, 1);
          var sr = scoreTerm(p.to.keys, parsed.right, 1);
          if (sl > 0 && sr > 0) explicit.push({ page: p, score: (sl + sr) / 2 + 5 });
        });
        var left = matchUnits(parsed.left, 1, 250);
        var right = matchUnits(parsed.right, 1, 250);
        var combos = [];
        left.forEach(function (l) {
          right.forEach(function (r) {
            if (l.unit.cat !== r.unit.cat || l.unit === r.unit) return;
            combos.push({ from: l.unit, to: r.unit, score: (l.score + r.score) / 2, best: Math.max(l.score, r.score) });
          });
        });
        // Exactness gate: if some combination has an exact match on at least one side,
        // drop combinations where neither side is exact ("meters to feet" must not
        // list "m/s to ft/s" just because "meters per second" starts with "meters").
        if (combos.some(function (c) { return c.best >= SCORE.VARIANT; })) {
          combos = combos.filter(function (c) { return c.best >= SCORE.VARIANT; });
        }
        var byCat = Object.create(null);
        combos.forEach(function (c) {
          var g = byCat[c.from.cat] || (byCat[c.from.cat] = { type: "pair", cat: c.from.cat, combos: [], score: 0 });
          g.combos.push(c);
          if (c.score > g.score) g.score = c.score;
        });
        Object.keys(byCat).forEach(function (k) { groups.push(byCat[k]); });
      }
      explicit.sort(function (a, b) { return (b.score - a.score) || (a.page.title < b.page.title ? -1 : 1); });
      groups.sort(function (a, b) {
        return (b.score - a.score) || ((a.unit ? a.unit.tier : 0) - (b.unit ? b.unit.tier : 0)) ||
               ((a.unit ? a.unit.catOrder : core.catById[a.cat].order) - (b.unit ? b.unit.catOrder : core.catById[b.cat].order));
      });
      return { explicit: explicit, groups: groups };
    }

    function expandGroup(group, shard) {
      var items = [];
      var cat = core.catById[group.unit ? group.unit.cat : group.cat];
      if (group.type === "unit") {
        var u = group.unit;
        cat.order_.forEach(function (j) { if (j !== u.idx && shard.has(u.idx, j)) items.push(convItem(u, cat.units[j], group.score)); });
        cat.order_.forEach(function (j) { if (j !== u.idx && shard.has(j, u.idx)) items.push(convItem(cat.units[j], u, group.score - 1)); });
      } else {
        group.combos.sort(function (a, b) {
          return (b.score - a.score) || (a.to.tier - b.to.tier) || (a.from.tier - b.from.tier) ||
                 (a.to.name.length - b.to.name.length) || (a.from.name.length - b.from.name.length);
        });
        group.combos.forEach(function (cb) { if (shard.has(cb.from.idx, cb.to.idx)) items.push(convItem(cb.from, cb.to, cb.score)); });
      }
      return items;
    }

    function Session(parsed, plan) {
      this.parsed = parsed;
      this.errors = [];
      this.done = false;
      this._explicit = plan.explicit;
      this._groups = plan.groups;
      this._buffer = [];
      this._seen = Object.create(null);
    }

    /** Next group's items into the buffer. Returns false when nothing is left. */
    Session.prototype._fill = function () {
      var self = this;
      if (!self._groups.length) return Promise.resolve(false);
      var group = self._groups.shift();
      var cat = core.catById[group.unit ? group.unit.cat : group.cat];
      return getShard(cat).then(function (shard) {
        self._buffer = expandGroup(group, shard);
        return true;
      }, function (err) {
        self.errors.push({ category: cat.id, label: cat.label, message: err.message });
        self._buffer = [];
        return true;
      });
    };

    Session.prototype._pull = function () {
      var self = this;
      function emit(item) {
        if (self._seen[item.path]) { diagnostics.duplicateUrls++; return null; }
        self._seen[item.path] = true;
        return item;
      }
      function takeExplicit() {
        var ex = self._explicit.shift();
        var it = emit(pageItem(ex.page, ex.score));
        return it ? Promise.resolve(it) : step();
      }
      function takeBuffered() {
        var it = emit(self._buffer.shift());
        return it ? Promise.resolve(it) : step();
      }
      // Merge two score-ordered streams: hand-built pages (explicit) and the
      // unit groups. Whichever has the higher score goes first; a group is only
      // loaded (shard fetched) when it could outrank what is already waiting.
      function step() {
        var ex = self._explicit[0];
        var head = self._buffer[0];
        if (head) {
          return ex && ex.score >= head.score ? takeExplicit() : takeBuffered();
        }
        var nextGroup = self._groups[0];
        if (!nextGroup) return ex ? takeExplicit() : Promise.resolve(null);
        if (ex && ex.score >= nextGroup.score) return takeExplicit();
        return self._fill().then(step);
      }
      return step();
    };

    /** Up to n more results: Promise<{items, done, errors}> */
    Session.prototype.next = function (n) {
      var self = this;
      var items = [];
      function loop() {
        if (items.length >= n) return Promise.resolve();
        return self._pull().then(function (item) {
          if (!item) { self.done = true; return; }
          items.push(item);
          return loop();
        });
      }
      return loop().then(function () {
        return { items: items, done: self.done, errors: self.errors.slice() };
      });
    };

    /** Promise<Session>; rejects with SearchIndexError(kind "index") if the index cannot be loaded. */
    function query(term) {
      var parsed = parseQuery(term);
      return ready().then(function () {
        var plan = parsed.mode === "none" ? { explicit: [], groups: [] } : buildPlan(parsed);
        return new Session(parsed, plan);
      });
    }

    return {
      ready: ready,
      query: query,
      diagnostics: diagnostics,
      get core() { return core; }
    };
  }

  return {
    createEngine: createEngine,
    parseQuery: parseQuery,
    normalize: normalize,
    squash: squash,
    phraseVariants: phraseVariants,
    unitKeys: unitKeys,
    scoreTerm: scoreTerm,
    isSafePath: safePath,
    SCORE: SCORE,
    FORMAT_VERSION: FORMAT_VERSION
  };
});
