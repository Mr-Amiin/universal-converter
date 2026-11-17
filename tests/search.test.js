/*
 * Tests for the site search engine against the REAL generated index.
 * Run:  node --test tests/search.test.js      (Node >= 18, no dependencies)
 *
 * Regenerate the index first if pages changed:  python3 generate_search_index.py
 */
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const UCSearch = require(path.join(ROOT, "search-engine.js"));
const SITE = "https://theuniversalconverter.com";

/*
 * These pages intentionally have SEO titles that differ from their search-index
 * display titles. All other conversion pages must still match their result title.
 */
const TITLE_PREFIX_EXCEPTIONS = new Set([
  "celsius-to-fahrenheit/",
  "fahrenheit-to-celsius/",
  "gallons-to-liters/",
  "inches-to-cm/",
  "kg-to-lbs/",
  "km-to-miles/",
  "lbs-to-kg/",
  "liters-to-gallons/",
  "meters-to-feet/",
  "miles-to-km/",
  "mph-to-kmh/",
  "electricity/watts-to-amperes/",
]);

/** fetchJson that reads the static files from disk, like GitHub Pages would serve them. */
function diskLoader(log) {
  return async (url) => {
    if (log) log.push(url);
    const file = path.join(ROOT, url.split("?")[0]);
    if (!fs.existsSync(file)) throw new Error(url + " -> HTTP 404");
    return JSON.parse(fs.readFileSync(file, "utf8"));
  };
}

function newEngine(extra) {
  return UCSearch.createEngine(Object.assign({ baseUrl: "search-index/", rootPrefix: "", fetchJson: diskLoader() }, extra));
}

async function run(engine, q, n = 50) {
  const session = await engine.query(q);
  const page = await session.next(n);
  return Object.assign(page, { session });
}

/** The published page behind a result must exist, be canonical for itself and match the title. */
function assertResolvesToIntendedPage(item) {
  const file = item.path === "" ? "index.html" : item.path.endsWith(".html") ? item.path : item.path + "index.html";
  const abs = path.join(ROOT, file);
  assert.ok(fs.existsSync(abs), `${item.path} does not exist on disk`);
  const head = fs.readFileSync(abs, "utf8").slice(0, 16384);
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(head);
  if (canonical && item.kind === "conv" && item.categoryId) {
    assert.equal(canonical[1], `${SITE}/${item.path}`, `canonical of ${item.path}`);
  }
  assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(head), `${item.path} is noindex`);
  if (item.kind === "conv") {
    const title = (/<title>(.*?)<\/title>/is.exec(head) || [])[1] || "";
    assert.ok(title.trim().length > 0, `${item.path} has no page title`);

    if (!TITLE_PREFIX_EXCEPTIONS.has(item.path)) {
      assert.ok(
        title.startsWith(item.title),
        `page title "${title}" should start with "${item.title}"`
      );
    }
  }
}

test("generated index contains every knots conversion", async () => {
  const engine = newEngine();
  const core = await engine.ready();
  const speed = core.catById.speed;
  const knot = speed.units.find((u) => u.slug === "knot");
  assert.ok(knot, "knot unit exists in the speed category");
  const shard = JSON.parse(fs.readFileSync(path.join(ROOT, "search-index/pairs/speed.json"), "utf8"));
  const bytes = Buffer.from(shard.b, "base64");
  const has = (i, j) => (bytes[(i * shard.n + j) >> 3] >> ((i * shard.n + j) & 7)) & 1;
  let pairs = 0;
  const partners = new Set();
  speed.units.forEach((u) => {
    if (u.idx === knot.idx) return;
    if (has(knot.idx, u.idx)) { pairs++; partners.add(u.slug); }
    if (has(u.idx, knot.idx)) { pairs++; partners.add(u.slug); }
  });
  assert.equal(pairs, fs.readdirSync(path.join(ROOT, "speed")).filter((d) => /(^knot-to-)|(-to-knot$)/.test(d)).length);
  for (const s of ["kilometer-per-hour", "mile-per-hour", "meter-per-second"]) assert.ok(partners.has(s), "knots <-> " + s);
});

test("knots / knot / kno return many knots conversions, never 'no match'", async () => {
  for (const q of ["knots", "knot", "kno"]) {
    const engine = newEngine();
    const r = await run(engine, q, 100);
    assert.ok(r.items.length >= 60, `${q}: ${r.items.length} results`);
    assert.equal(r.errors.length, 0);
    assert.ok(r.items.every((i) => /knot/i.test(i.title)), `${q}: every result is about knots`);
    assert.ok(r.items.slice(0, 3).every((i) => i.kind === "conv" && i.title.startsWith("Knots to")), `${q}: sources first`);
    const top = r.items.slice(0, 4).map((i) => i.title);
    assert.deepEqual(top.slice(0, 3), ["Knots to km/h", "Knots to mph", "Knots to m/s"]);
  }
});

test("knots results are paged and all reachable", async () => {
  const engine = newEngine();
  const session = await engine.query("knots");
  const first = await session.next(10);
  assert.equal(first.items.length, 10);
  assert.equal(first.done, false);
  let total = first.items.length;
  for (let guard = 0; guard < 20 && !session.done; guard++) total += (await session.next(20)).items.length;
  assert.equal(total, 68);
  assert.equal(session.done, true);
});

test("knots to mph / knots to km/h return exactly the intended page first", async () => {
  const engine = newEngine();
  let r = await run(engine, "knots to mph");
  assert.equal(r.items[0].path, "speed/knot-to-mile-per-hour/");
  assert.equal(r.items.length, 1);
  r = await run(engine, "knots to km/h");
  assert.equal(r.items[0].path, "speed/knot-to-kilometer-per-hour/");
  r = await run(engine, "knots to kmh");
  assert.equal(r.items[0].path, "speed/knot-to-kilometer-per-hour/");
  r = await run(engine, "knots to m/s");
  assert.equal(r.items[0].path, "speed/knot-to-meter-per-second/");
});

test("mph: popular page first, then mph conversions, nothing unrelated", async () => {
  const r = await run(newEngine(), "mph", 40);
  assert.equal(r.items[0].path, "mph-to-kmh/");
  assert.ok(r.items.every((i) => /mph|Mile per Hour|mile-per-hour/i.test(i.title + i.path)));
  assert.ok(r.items.some((i) => i.path === "speed/mile-per-hour-to-knot/"));
});

test("meters to feet / kg to lbs / liter to gallon", async () => {
  const engine = newEngine();
  let r = await run(engine, "meters to feet");
  assert.ok(r.items.slice(0, 2).every((i) => i.title === "Meters to Feet"));
  assert.ok(r.items.some((i) => i.path === "meters-to-feet/"));
  r = await run(engine, "kg to lbs");
  assert.equal(r.items[0].path, "kg-to-lbs/");
  r = await run(engine, "liter to gallon");
  assert.ok(r.items.some((i) => i.path === "liter-to-gallon/"));
  assert.ok(r.items.every((i) => /liter/i.test(i.title) && /gallon/i.test(i.title)), "no unrelated pairs");
});

test("nonexistent query: index searched OK, zero results, zero errors", async () => {
  const r = await run(newEngine(), "qzxwvkj");
  assert.equal(r.items.length, 0);
  assert.equal(r.done, true);
  assert.equal(r.errors.length, 0);
  const r2 = await run(newEngine(), "knots to qzxwvkj");
  assert.equal(r2.items.length, 0);
});

test("case and whitespace do not change results", async () => {
  const engine = newEngine();
  const a = (await run(engine, "knots to mph")).items.map((i) => i.path);
  for (const q of ["KNOTS TO MPH", "  Knots   to   MPH  ", "\tknots to\nmph", "Knots To Mph "]) {
    assert.deepEqual((await run(engine, q)).items.map((i) => i.path), a, JSON.stringify(q));
  }
  assert.deepEqual((await run(engine, "KNOTS")).items.map((i) => i.path), (await run(engine, " knots ")).items.map((i) => i.path));
});

test("every URL returned for the required queries resolves to the intended page", async () => {
  const engine = newEngine();
  const seen = new Set();
  for (const q of ["knots", "knot", "kno", "knots to mph", "knots to km/h", "mph", "meters to feet", "kg to lbs", "liter to gallon"]) {
    const r = await run(engine, q, 80);
    assert.ok(r.items.length > 0, q);
    for (const item of r.items) {
      if (seen.has(item.path)) continue;
      seen.add(item.path);
      assertResolvesToIntendedPage(item);
    }
  }
  assert.ok(seen.size > 100);
});

test("index loading failures are errors, not 'no results'", async () => {
  // manifest unreachable
  let engine = UCSearch.createEngine({ fetchJson: async () => { throw new Error("offline"); } });
  await assert.rejects(() => engine.query("knots"), (e) => e.name === "SearchIndexError" && e.kind === "index");
  // units.json 404
  engine = UCSearch.createEngine({
    fetchJson: async (u) => { if (u.includes("units.json")) throw new Error("HTTP 404"); return diskLoader()(u); }
  });
  await assert.rejects(() => engine.query("knots"), (e) => e.kind === "index");
  // corrupt manifest
  engine = UCSearch.createEngine({ fetchJson: async () => ({ nonsense: true }) });
  await assert.rejects(() => engine.query("knots"), (e) => e.kind === "index");
});

test("a failed shard is reported, never turned into an empty result, and retry works", async () => {
  let broken = true;
  const engine = UCSearch.createEngine({
    baseUrl: "search-index/",
    fetchJson: async (u) => { if (broken && u.includes("pairs/speed.json")) throw new Error("HTTP 503"); return diskLoader()(u); }
  });
  let r = await run(engine, "knots");
  assert.equal(r.items.length, 0);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].category, "speed");
  broken = false; // the failure must not have been cached
  r = await run(engine, "knots", 100);
  assert.equal(r.errors.length, 0);
  assert.ok(r.items.length >= 60);
  // corrupt shard (wrong size)
  const bad = UCSearch.createEngine({
    baseUrl: "search-index/",
    fetchJson: async (u) => { const d = await diskLoader()(u); if (u.includes("pairs/speed.json")) d.b = d.b.slice(0, 4); return d; }
  });
  r = await run(bad, "knots");
  assert.equal(r.items.length, 0);
  assert.equal(r.errors.length, 1);
});

test("index failure is retried on the next query (not cached)", async () => {
  let up = false;
  const engine = UCSearch.createEngine({ fetchJson: async (u) => { if (!up) throw new Error("offline"); return diskLoader()(u); } });
  await assert.rejects(() => engine.query("knots"));
  up = true;
  const r = await run(engine, "knots");
  assert.ok(r.items.length > 0);
});

test("duplicate and invalid URLs in index data are dropped", async () => {
  const manifest = { format: 1, version: "t", files: { units: "u.json", pages: "p.json" }, categories: [{ id: "speed", label: "Speed", shard: "pairs/speed.json" }] };
  const units = { v: 1, categories: [{ id: "speed", label: "Speed", u: [["knot", "Knots", "kn", 1], ["mile-per-hour", "mph", "mph", 1], ["../evil", "Evil", "x", 1], ["bad slug", "Bad", "b", 1]] }] };
  const good = { t: "Home", u: "", c: "Home", x: "page" };
  const pages = { v: 1, pages: [
    good, { ...good },                                             // duplicate
    { t: "JS", u: "javascript:alert(1)", c: "x", x: "page" },     // scheme
    { t: "Abs", u: "//evil.example/x/", c: "x", x: "page" },      // protocol-relative
    { t: "Up", u: "../secret/", c: "x", x: "page" },              // traversal
    { t: "Slash", u: "/abs/", c: "x", x: "page" },                // absolute
    { t: "Query", u: "a/?x=1", c: "x", x: "page" },               // query
    { t: "About", u: "about.html", c: "About", x: "page" }
  ] };
  const engine = UCSearch.createEngine({ fetchJson: async (u) => (u.includes("manifest") ? manifest : u.includes("u.json") ? units : pages) });
  const core = await engine.ready();
  assert.deepEqual(core.pages.map((p) => p.path), ["", "about.html"]);
  assert.equal(engine.diagnostics.duplicateUrls, 1);
  assert.ok(engine.diagnostics.invalidEntries >= 5);
  assert.equal(core.catById.speed.units.filter(Boolean).length, 2, "units with unsafe slugs are discarded");
  assert.ok(UCSearch.isSafePath("speed/knot-to-mile-per-hour/") && UCSearch.isSafePath("about.html") && UCSearch.isSafePath(""));
  for (const bad of ["javascript:alert(1)", "//x/", "/x/", "../x/", "a b/", "A/", "a//b/", "a/?q", "a/#h", "x.html/", "<script>"]) assert.equal(UCSearch.isSafePath(bad), false, bad);
});

test("duplicate URLs never appear twice in a result list", async () => {
  const r = await run(newEngine(), "meters", 500);
  const paths = r.items.map((i) => i.path);
  assert.equal(new Set(paths).size, paths.length);
});

test("user input is never interpreted as markup or a pattern", async () => {
  const engine = newEngine();
  for (const q of ["<img src=x onerror=alert(1)>", "(", "[", "\\", ".*", "knots to <script>", "a'b\"c", "%00", "x".repeat(5000)]) {
    const r = await run(engine, q, 20);
    assert.equal(r.errors.length, 0, q);
    r.items.forEach((i) => assert.ok(UCSearch.isSafePath(i.path)));
  }
});

test("GitHub Pages base paths: hrefs resolve to the same published page", async () => {
  const cases = [
    // [page the user is on, rootPrefix handed to the engine, expected absolute URL of knots->mph]
    ["https://theuniversalconverter.com/", "", "https://theuniversalconverter.com/speed/knot-to-mile-per-hour/"],
    ["https://theuniversalconverter.com/index.html", "", "https://theuniversalconverter.com/speed/knot-to-mile-per-hour/"],
    ["https://mr-amiin.github.io/universal-converter/", "", "https://mr-amiin.github.io/universal-converter/speed/knot-to-mile-per-hour/"],
    ["https://mr-amiin.github.io/universal-converter/speed/", "../", "https://mr-amiin.github.io/universal-converter/speed/knot-to-mile-per-hour/"],
    ["https://mr-amiin.github.io/universal-converter/speed/knot-to-mile-per-hour/", "../../", "https://mr-amiin.github.io/universal-converter/speed/knot-to-mile-per-hour/"]
  ];
  for (const [page, prefix, expected] of cases) {
    const log = [];
    const engine = UCSearch.createEngine({ baseUrl: prefix + "search-index/", rootPrefix: prefix, fetchJson: async (u) => { log.push(u); return diskLoader()(u.slice(prefix.length)); } });
    const r = await run(engine, "knots to mph");
    assert.equal(new URL(r.items[0].href, page).href, expected, page);
    // data files are fetched relative to the same base
    assert.ok(log.every((u) => u.startsWith(prefix + "search-index/")), log.join(","));
  }
});

test("only the needed shards are downloaded, nothing is fetched until a query", async () => {
  const log = [];
  const engine = newEngine({ fetchJson: diskLoader(log) });
  assert.equal(log.length, 0, "creating the engine fetches nothing");
  await run(engine, "knots", 10);
  const shards = log.filter((u) => u.includes("pairs/"));
  assert.deepEqual(shards.map((u) => u.split("?")[0]), ["search-index/pairs/speed.json"]);
  assert.ok(!log.some((u) => u.endsWith(".html")), "never fetches HTML pages");
});

test("parseQuery", () => {
  const p = UCSearch.parseQuery;
  assert.deepEqual(p("knots"), { mode: "single", term: "knots" });
  assert.equal(p("knots to").mode, "single");
  assert.deepEqual(p("Knots  TO  mph"), { mode: "pair", term: "knots to mph", left: "knots", right: "mph" });
  assert.equal(p("knots->mph").mode, "pair");
  assert.equal(p("convert knots to mph").left, "knots");
  assert.equal(p("   ").mode, "none");
});

test("singular/plural variants", () => {
  const v = UCSearch.phraseVariants;
  assert.ok(v("feet").includes("foot") && v("foot").includes("feet"));
  assert.ok(v("kilometers per hour").includes("kilometer per hour"));
  assert.ok(v("inch").includes("inches") && v("inches").includes("inch"));
});

/* ------------------------------------------------------------------------------------------
 * Watts to Amps: /electricity/watts-to-amperes/ must be discoverable from the homepage search.
 *
 * The page's <title> ("Watts to Amps Converter | ...") is deliberately NOT compared with the
 * result's display name ("Watts to Amperes"): the returned URL and the intended result are
 * verified independently, against the real page on disk.
 * ---------------------------------------------------------------------------------------- */

const WATTS_TO_AMPS = "electricity/watts-to-amperes/";

test("watts to amps queries return /electricity/watts-to-amperes/ as the first result", async () => {
  const engine = newEngine();
  for (const q of ["watts to amps", "watt to amp", "W to A", "watts to amperes"]) {
    const r = await run(engine, q, 10);
    assert.equal(r.errors.length, 0, q);
    assert.ok(r.items.length > 0, `${q}: no results`);
    const top = r.items[0];
    assert.equal(top.path, WATTS_TO_AMPS, `${q}: first result is ${top.path}`);
    assert.equal(top.kind, "conv", q);
    assert.equal(top.categoryId, "electricity", q);
    assert.equal(top.href, WATTS_TO_AMPS, `${q}: href`);
    assert.equal(r.items.filter((i) => i.path === WATTS_TO_AMPS).length, 1, `${q}: listed exactly once`);
  }
});

test("the watts-to-amperes result resolves to the real, indexable, self-canonical page", async () => {
  const engine = newEngine();
  const top = (await run(engine, "watts to amps", 5)).items[0];
  assert.equal(top.path, WATTS_TO_AMPS);
  const abs = path.join(ROOT, top.path, "index.html");
  assert.ok(fs.existsSync(abs), `${top.path} does not exist on disk`);
  const head = fs.readFileSync(abs, "utf8").slice(0, 16384);
  const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(head);
  assert.ok(canonical, "page declares a canonical URL");
  assert.equal(canonical[1], `${SITE}/${WATTS_TO_AMPS}`, "canonical equals the result URL");
  assert.ok(!/<meta[^>]+name="robots"[^>]+noindex/i.test(head), "page is not noindex");
});

test("watts-to-amperes: its bitmap bit is set and the shard matches the manifest", async () => {
  const engine = newEngine();
  await engine.ready();
  const cat = engine.core.catById["electricity"];
  const idx = (slug) => cat.units.findIndex((u) => u && u.slug === slug);
  const w = idx("watts");
  const a = idx("amperes");
  assert.ok(w >= 0 && a >= 0, "watts and amperes are electricity units");
  const shard = JSON.parse(fs.readFileSync(path.join(ROOT, "search-index/pairs/electricity.json"), "utf8"));
  const bytes = Buffer.from(shard.b, "base64");
  const bit = (i, j) => (bytes[(i * shard.n + j) >> 3] >> ((i * shard.n + j) & 7)) & 1;
  assert.equal(bit(w, a), 1, "watts -> amperes bit");
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "search-index/manifest.json"), "utf8"));
  assert.equal(manifest.categories.find((c) => c.id === "electricity").pages, shard.p);
  let set = 0;
  for (const b of bytes) set += b.toString(2).replace(/0/g, "").length;
  assert.equal(set, shard.p, "set bits == page count");
});

test("every electricity page folder is represented in the electricity shard (no page left out)", async () => {
  const engine = newEngine();
  await engine.ready();
  const cat = engine.core.catById["electricity"];
  const shard = JSON.parse(fs.readFileSync(path.join(ROOT, "search-index/pairs/electricity.json"), "utf8"));
  const bytes = Buffer.from(shard.b, "base64");
  const has = (i, j) => (bytes[(i * shard.n + j) >> 3] >> ((i * shard.n + j) & 7)) & 1;
  const bySlug = new Map(cat.units.map((u, i) => [u && u.slug, i]));
  const missing = [];
  for (const dir of fs.readdirSync(path.join(ROOT, "electricity"), { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const m = /^(.+?)-to-(.+)$/.exec(dir.name);
    if (!m || !fs.existsSync(path.join(ROOT, "electricity", dir.name, "index.html"))) continue;
    const head = fs.readFileSync(path.join(ROOT, "electricity", dir.name, "index.html"), "utf8").slice(0, 16384);
    if (/<meta[^>]+name="robots"[^>]+noindex/i.test(head)) continue;
    const c = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i.exec(head);
    if (c && c[1] !== `${SITE}/electricity/${dir.name}/`) continue; // duplicate of another page
    const i = bySlug.get(m[1]);
    const j = bySlug.get(m[2]);
    if (i === undefined || j === undefined || !has(i, j)) missing.push(dir.name);
  }
  assert.deepEqual(missing, [], `electricity pages missing from the search index: ${missing.slice(0, 5)}`);
});

/* ------------------------------------------------------------------------------------------
 * Popular root conversions: display names and symbols are curated and must not drift when the
 * index is regenerated (several of those pages now carry SEO titles such as "Convert kg to lbs").
 * Expected values are the entries committed before the Watts to Amps change.
 * ---------------------------------------------------------------------------------------- */

const POPULAR_ROOT_ENTRIES = [
  ["acre-to-hectare/", "Acres to Hectares", "", ""],
  ["acres-to-hectares/", "Acres to Hectares", "ac", "ha"],
  ["celsius-to-fahrenheit/", "Celsius to Fahrenheit", "C", "F"],
  ["fahrenheit-to-celsius/", "Fahrenheit to Celsius", "F", "C"],
  ["feet-to-meters/", "Feet to Meters", "ft", "m"],
  ["gallons-to-liters/", "Gallons to Liters", "gal", "L"],
  ["gb-to-mb/", "GB to MB", "GB", "MB"],
  ["grams-to-ounces/", "Grams to Ounces", "g", "oz"],
  ["hectares-to-acres/", "Hectares to Acres", "ha", "ac"],
  ["inches-to-cm/", "Inches to Centimeters", "", ""],
  ["kg-to-lbs/", "Kilograms to Pounds", "kg", "lb"],
  ["km-to-miles/", "Kilometers to Miles", "", ""],
  ["lbs-to-kg/", "Pounds to Kilograms", "lb", "kg"],
  ["liter-to-gallon/", "Liters to Gallons", "", ""],
  ["liters-to-gallons/", "Liters to Gallons", "L", "gal"],
  ["meter-to-feet/", "Meters to Feet", "", ""],
  ["meters-to-feet/", "Meters to Feet", "m", "ft"],
  ["miles-to-km/", "Miles to Kilometers", "", ""],
  ["mph-to-kmh/", "mph to km/h", "mph", "km/h"],
  ["psi-to-bar/", "PSI to Bars", "psi", "bar"],
  ["square-feet-to-square-meters/", "Square feet to Square Meters", "ft2", "m2"],
  ["watts-to-horsepower/", "Watts to Horsepowers", "W", "hp"],
];

test("popular root conversions keep their curated display names and symbols", async () => {
  const engine = newEngine();
  await engine.ready();
  const conv = engine.core.pages.filter((p) => p.kind === "conv");
  assert.equal(conv.length, POPULAR_ROOT_ENTRIES.length, "same set of popular root conversions");
  for (const [u, title, fromSymbol, toSymbol] of POPULAR_ROOT_ENTRIES) {
    const p = conv.find((x) => x.path === u);
    assert.ok(p, `${u} is in the index`);
    assert.equal(p.title, title, `${u}: title`);
    assert.equal(p.from.symbol, fromSymbol, `${u}: from symbol`);
    assert.equal(p.to.symbol, toSymbol, `${u}: to symbol`);
  }
});

test("popular root conversions are still returned, with their curated titles, by search", async () => {
  const engine = newEngine();
  for (const [q, u, title] of [
    ["kg to lbs", "kg-to-lbs/", "Kilograms to Pounds"],
    ["kilograms to pounds", "kg-to-lbs/", "Kilograms to Pounds"],
    ["km to miles", "km-to-miles/", "Kilometers to Miles"],
    ["meters to feet", "meters-to-feet/", "Meters to Feet"],
    ["celsius to fahrenheit", "celsius-to-fahrenheit/", "Celsius to Fahrenheit"],
    ["mph to km/h", "mph-to-kmh/", "mph to km/h"],
  ]) {
    const hit = (await run(engine, q, 30)).items.find((i) => i.path === u);
    assert.ok(hit, `${q}: ${u} is returned`);
    assert.equal(hit.title, title, `${q}: display title`);
  }
});