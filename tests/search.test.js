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
    assert.ok(title.startsWith(item.title), `page title "${title}" should start with "${item.title}"`);
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
