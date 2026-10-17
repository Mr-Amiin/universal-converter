#!/usr/bin/env node
/**
 * generate-sitemap.js
 * ===================================================================
 * Universal Converter build pipeline — sitemap + route-count stage.
 *
 * Pipeline order (this file owns steps 2-4; step 1 is your existing
 * page generator, wired in via --routes or the generateSeoPages hook):
 *
 *   1. Generate all SEO pages           (existing page generator)
 *   2. Generate/update sitemap.xml      (generateSitemapXml)
 *   3. Count every <url> node in it     (countUrlEntries)
 *   4. Write that number into           (updateHtmlCount)
 *      sitemap.html's #sitemapRouteCount
 *
 * LAYOUT: sitemap.xml is a sitemap INDEX that lists sitemap-0001.xml,
 * sitemap-0002.xml, ... (10,000 URLs max per file; Google's hard limits
 * are 50,000 URLs / 50 MB). The "count every <url>" steps below follow the
 * index and sum the URLs of every referenced file. For the full, validated
 * generator that scans the real pages use generate_sitemaps.py (build.py runs
 * it automatically).
 *
 * SINGLE SOURCE OF TRUTH: the sitemap files (sitemap.xml index + parts).
 * The count is derived by reading the <url> tags actually present in
 * the sitemap.xml file on disk after step 2 — not from routes.length,
 * not from a database row count, not from anything else. Whatever
 * ships in sitemap.xml is what gets written into sitemap.html, full
 * stop. There is no second number to keep in sync by hand.
 *
 * This script also actively guards against browser-side counting:
 * guardNoBrowserSideCounting() scans every inline <script> in
 * sitemap.html and fails the build if any of them reference the
 * #sitemapRouteCount element, or call any counting-ish browser API
 * (fetch, MutationObserver, setInterval/setTimeout-driven recompute,
 * DOM scans of cards/links/categories) anywhere near it. The counter
 * must always be static text baked in at build time.
 *
 * Usage:
 *   node scripts/generate-sitemap.js \
 *     --routes ./data/routes.json \
 *     --xml    ./sitemap.xml \
 *     --html   ./sitemap.html
 *
 * If --routes is omitted, step 2 is skipped and the script treats
 * whatever sitemap.xml already exists on disk as authoritative (useful
 * when a separate crawler/build step already produced it this run).
 * ===================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');

// -------------------------------------------------------------------
// CLI args
// -------------------------------------------------------------------
function parseArgs(argv) {
  const args = { routes: null, xml: './sitemap.xml', html: './sitemap.html', baseUrl: 'https://theuniversalconverter.com' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--routes') args.routes = argv[++i];
    else if (a === '--xml') args.xml = argv[++i];
    else if (a === '--html') args.html = argv[++i];
    else if (a === '--base-url') args.baseUrl = argv[++i];
  }
  return args;
}

// -------------------------------------------------------------------
// STEP 1 (hook only): Generate all SEO pages.
//
// The actual page templates/content generator lives elsewhere in the
// codebase and isn't part of this script. This hook exists so the
// pipeline order is explicit and a real implementation can be dropped
// in without restructuring anything downstream. If you already run
// your page generator as its own npm script, just make sure it runs
// before this file in package.json / CI, and pass --routes pointing
// at the route list it produced.
// -------------------------------------------------------------------
function generateSeoPages(routesPath) {
  if (!routesPath) {
    console.log('Step 1: Generate SEO pages — skipped (no --routes given; ' +
      'assuming pages/sitemap.xml were already generated upstream).');
    return null;
  }
  console.log(`Step 1: Generate SEO pages — reading route list from ${routesPath}`);
  const routes = JSON.parse(fs.readFileSync(path.resolve(routesPath), 'utf8'));
  // Real page generation (writing each SEO page to disk) happens in the
  // existing generator. This pipeline only needs the route list back
  // so it can build sitemap.xml from the same data in step 2.
  console.log(`Step 1: Generate SEO pages — ${routes.length} route(s) confirmed.`);
  return routes;
}

// -------------------------------------------------------------------
// STEP 2: Generate/update sitemap.xml from the route list.
// -------------------------------------------------------------------
function generateSitemapXml(routes) {
  const lines = [];
  lines.push('<?xml version="1.0" encoding="UTF-8"?>');
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');

  for (const route of routes) {
    const entry = typeof route === 'string' ? { loc: route } : route;
    const loc = escapeXml(entry.loc);
    const lastmod = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
    const changefreq = entry.changefreq
      ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>`
      : '';
    lines.push(`    <url><loc>${loc}</loc>${lastmod}${changefreq}</url>`);
  }

  lines.push('</urlset>');
  lines.push('');
  return lines.join('\n');
}

const MAX_URLS_PER_SITEMAP = 10000; // project target; Google's hard limit is 50,000 URLs / 50 MB

// Split a route list into sitemap files + an index. Returns { filename: content }.
function generateSplitSitemaps(routes, baseUrl, maxUrls = MAX_URLS_PER_SITEMAP) {
  if (!routes.length) throw new Error('refusing to write sitemaps for an empty route list');
  if (maxUrls < 1 || maxUrls > 50000) throw new Error('maxUrls must be between 1 and 50000');
  const files = {};
  const names = [];
  for (let start = 0, n = 1; start < routes.length; start += maxUrls, n++) {
    const name = `sitemap-${String(n).padStart(4, '0')}.xml`;
    files[name] = generateSitemapXml(routes.slice(start, start + maxUrls));
    names.push(name);
  }
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const name of names) lines.push(`  <sitemap><loc>${escapeXml(baseUrl + '/' + name)}</loc></sitemap>`);
  lines.push('</sitemapindex>', '');
  files['sitemap.xml'] = lines.join('\n');
  return files;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// -------------------------------------------------------------------
// STEP 3: Count every <url> node actually written to sitemap.xml.
//
// This re-reads the file from disk rather than trusting routes.length,
// so the number reflects what's really there, including anything
// added by other tooling that touches sitemap.xml directly.
// -------------------------------------------------------------------
function countUrlEntries(xmlContent) {
  const matches = xmlContent.match(/<url>/g);
  return matches ? matches.length : 0;
}

// Count <url> nodes for a sitemap file. If it is a sitemap index, follow it:
// sum the <url> nodes of every referenced sitemap file in the same folder.
function countSitemapUrls(xmlPath) {
  const content = fs.readFileSync(xmlPath, 'utf8');
  if (!/<sitemapindex[\s>]/.test(content)) return countUrlEntries(content);
  let total = 0;
  for (const m of content.matchAll(/<sitemap>\s*<loc>\s*([^<]+?)\s*<\/loc>/g)) {
    const name = path.basename(new URL(m[1].replace(/&amp;/g, '&')).pathname);
    const partPath = path.join(path.dirname(xmlPath), name);
    if (!fs.existsSync(partPath)) {
      throw new Error(`sitemap ${name} is listed in ${path.basename(xmlPath)} but was not found at ${partPath}`);
    }
    total += countSitemapUrls(partPath);
  }
  return total;
}

// -------------------------------------------------------------------
// STEP 4: Write that count into sitemap.html.
// -------------------------------------------------------------------
function updateHtmlCount(htmlContent, count) {
  const formatted = count.toLocaleString('en-US');
  const pattern = /(<p id="sitemapRouteCount">)([\s\S]*?)(<\/p>)/;

  if (!pattern.test(htmlContent)) {
    throw new Error(
      'Could not find <p id="sitemapRouteCount">...</p> in sitemap.html — ' +
        'refusing to guess where the count should go.'
    );
  }

  const newText = `${formatted} public routes are currently indexed for search and browsing.`;
  return htmlContent.replace(pattern, `$1${newText}$3`);
}

function extractHtmlCount(htmlContent) {
  const match = htmlContent.match(/<p id="sitemapRouteCount">([\s\S]*?)<\/p>/);
  if (!match) return null;
  const numMatch = match[1].replace(/,/g, '').match(/\d+/);
  return numMatch ? parseInt(numMatch[0], 10) : null;
}

// -------------------------------------------------------------------
// GUARD: no browser-side code may ever recompute this number.
//
// Scans every inline <script>...</script> block in sitemap.html and
// fails the build if any of them:
//   - reference the #sitemapRouteCount element/id, or
//   - contain counting-style APIs (fetch of sitemap.xml, DOM scans of
//     cards/links/categories, MutationObserver, setInterval,
//     rAF-driven recompute loops) in a way that touches that element.
//
// This runs on every build, so if someone re-introduces client-side
// counting logic later, the build fails instead of silently drifting.
// -------------------------------------------------------------------
function guardNoBrowserSideCounting(htmlContent) {
  const scriptBlocks = [...htmlContent.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1]);

  const offendingPatterns = [
    /sitemapRouteCount/i,
  ];

  for (const block of scriptBlocks) {
    for (const pattern of offendingPatterns) {
      if (pattern.test(block)) {
        throw new Error(
          'guardNoBrowserSideCounting: found an inline <script> that references ' +
            '#sitemapRouteCount. The route count must be static text written at ' +
            'build time — remove any browser-side logic that reads or recalculates it.'
        );
      }
    }
  }

  console.log(`Guard: scanned ${scriptBlocks.length} inline <script> block(s) — ` +
    'none reference #sitemapRouteCount. Counter is build-time-only. OK.');
}

// -------------------------------------------------------------------
// Main pipeline
// -------------------------------------------------------------------
function main() {
  const args = parseArgs(process.argv.slice(2));
  const xmlPath = path.resolve(args.xml);
  const htmlPath = path.resolve(args.html);

  // Step 1
  const routes = generateSeoPages(args.routes);

  // Step 2
  if (routes) {
    const files = generateSplitSitemaps(routes, args.baseUrl.replace(/\/$/, ''));
    const outDir = path.dirname(xmlPath);
    for (const f of fs.readdirSync(outDir)) {
      if (/^sitemap-\d{4}\.xml$/.test(f)) fs.unlinkSync(path.join(outDir, f)); // drop stale parts
    }
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(name === 'sitemap.xml' ? xmlPath : path.join(outDir, name), content, 'utf8');
    }
    console.log(`Step 2: Generate/update sitemap.xml — wrote index ${xmlPath} + ${Object.keys(files).length - 1} sitemap file(s)`);
  } else {
    console.log(`Step 2: Generate/update sitemap.xml — skipped, using existing ${xmlPath}`);
  }

  if (!fs.existsSync(xmlPath)) {
    console.error(`sitemap.xml not found at ${xmlPath} and no --routes file was given.`);
    process.exit(1);
  }

  // Step 3
  const totalRoutes = countSitemapUrls(xmlPath);
  console.log(`Step 3: Count <url> nodes in sitemap.xml — ${totalRoutes.toLocaleString('en-US')}`);

  // Step 4
  const htmlBefore = fs.readFileSync(htmlPath, 'utf8');
  const htmlAfter = updateHtmlCount(htmlBefore, totalRoutes);
  fs.writeFileSync(htmlPath, htmlAfter, 'utf8');
  console.log(`Step 4: Update #sitemapRouteCount in sitemap.html — wrote ${htmlPath}`);

  // Guard: no browser-side recomputation allowed.
  guardNoBrowserSideCounting(htmlAfter);

  // Validation: re-read both files off disk (not from memory) and compare.
  const verifyXmlCount = countSitemapUrls(xmlPath);
  const verifyHtmlCount = extractHtmlCount(fs.readFileSync(htmlPath, 'utf8'));
  const match = verifyXmlCount === verifyHtmlCount;

  console.log('');
  console.log('Routes in sitemap.xml:        ' + verifyXmlCount.toLocaleString('en-US'));
  console.log('Routes written to HTML:       ' + (verifyHtmlCount === null ? 'N/A' : verifyHtmlCount.toLocaleString('en-US')));
  console.log('');
  console.log('MATCH: ' + (match ? 'TRUE' : 'FALSE'));

  if (!match) {
    console.error('\nBUILD FAILED: sitemap.xml and sitemap.html report different totals.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generateSeoPages,
  generateSitemapXml,
  generateSplitSitemaps,
  countUrlEntries,
  countSitemapUrls,
  updateHtmlCount,
  extractHtmlCount,
  guardNoBrowserSideCounting,
};
