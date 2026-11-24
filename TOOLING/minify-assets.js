#!/usr/bin/env node
/*
 * minify-assets.js - repeatable JS/CSS minification for the GitHub Pages site.
 *
 * Readable sources live in src/. Running this script writes the minified production
 * files to the repository root, at the SAME URLs every page already references
 * (app.js, styles.css, search-engine.js, ...), so no HTML page needs to change.
 * The output is deterministic: the same sources always produce the same bytes.
 *
 * One-time tool install (outside the repo, nothing is added to it):
 *     npm install --prefix "$HOME/.uc-minify" terser@5.51.4 csso@5.0.5      (Git Bash / macOS / Linux)
 *     npm install --prefix "$env:USERPROFILE\.uc-minify" terser@5.51.4 csso@5.0.5   (PowerShell)
 * (or set UC_MINIFY_TOOLS to any folder whose node_modules holds terser and csso)
 *
 * Usage (from the repository root):
 *     node TOOLING/minify-assets.js            # rebuild the minified files
 *     node TOOLING/minify-assets.js --check    # exit 1 if the root files differ from a fresh build
 *
 * EDIT src/*, NEVER the root copies. Tools that parse the code as text (unit-registry
 * extraction, i18n/disclosure tests) read src/.
 */
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const dirs = [process.env.UC_MINIFY_TOOLS, path.join(os.homedir(), '.uc-minify'), ROOT].filter(Boolean);
function load(name) {
  for (const d of dirs) { try { return require(require.resolve(name, { paths: [d] })); } catch (e) { /* next */ } }
  console.error(`Cannot find "${name}". Install it first - see the header of TOOLING/minify-assets.js.`); process.exit(2);
}
const JS = ['app.js', 'search-engine.js', 'guides.js', 'adsense.js', 'adsense-config.js', 'analytics-config.js', 'google-analytics.js'];
const CSS = ['styles.css'];
const check = process.argv.includes('--check');

(async () => {
  const { minify } = load('terser'); const csso = load('csso');
  let stale = 0, before = 0, after = 0;
  const emit = (name, out) => {
    const dest = path.join(ROOT, name), cur = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : null;
    if (check) { if (cur !== out) { stale++; console.log('STALE  ' + name); } else console.log('ok     ' + name); }
    else { fs.writeFileSync(dest, out); }
  };
  for (const name of JS) {
    const src = fs.readFileSync(path.join(ROOT, 'src', name), 'utf8');
    const r = await minify(src, { compress: { passes: 2 }, mangle: true, format: { comments: false } });
    if (r.error) throw r.error;
    emit(name, r.code); before += Buffer.byteLength(src); after += Buffer.byteLength(r.code);
    console.log(`${name.padEnd(22)} ${Buffer.byteLength(src)} -> ${Buffer.byteLength(r.code)} bytes`);
  }
  for (const name of CSS) {
    const src = fs.readFileSync(path.join(ROOT, 'src', name), 'utf8');
    const out = csso.minify(src, { restructure: false, comments: false }).css;
    emit(name, out); before += Buffer.byteLength(src); after += Buffer.byteLength(out);
    console.log(`${name.padEnd(22)} ${Buffer.byteLength(src)} -> ${Buffer.byteLength(out)} bytes`);
  }
  console.log(`total ${before} -> ${after} bytes`);
  if (check && stale) process.exit(1);
})();
