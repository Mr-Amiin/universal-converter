# SEO-Page Single-Category Sidebar Validation Report

## Headline results

- **Homepage behavior changed: NO**
- **SEO-page sidebar behavior changed: YES** (one narrow, targeted defect found and fixed — see "Genuine defect found and fixed" below)
- **327,527 canonical SEO pages regenerated: NO**
- **327,527 canonical SEO pages modified: NO**
- **Representative pages tested: 27 / 27 categories**
- **Final result: 27 PASS, 0 FAIL**

## Scope and method

This was a validation pass over the SEO-page single-category sidebar restriction (`seoPageRestrictedCategoryId()` in `app.js`, which powers both the desktop/tablet left sidebar `#categoryList` and the mobile drawer's Categories submenu on any page with `body class="seo-page"`).

**The expected category for each test page was never taken from the page's H1.** It was derived by mirroring the site's own resolver algorithm exactly: read the page's own `.breadcrumb a[href]` links (server-rendered, static, and never touched by any translation/JS logic), match the category-slug segment (`/^\/([a-z0-9-]+)\/?$/`), and apply the same two slug→id exceptions the site's own code uses (`flow-rate` → `flow`, `fuel-economy` → `fuel_economy`). This is the identical breadcrumb-based logic `seoPageRestrictedCategoryId()` itself uses (app.js), not a re-guess from page titles.

One real, representative SEO conversion page was selected for each of the 27 categories: Length, Area, Volume, Weight, Temperature, Time, Speed, Pressure, Energy, Power, Force, Torque, Electricity, Frequency, Digital Storage, Angle, Density, Flow Rate, Fuel Economy, Radiation, Chemistry, Agriculture, Cooking, Astronomy, Engineering, Scientific, Currency.

Expected unit counts were cross-checked three independent ways per page, all of which had to agree:
1. The SEO page's own sidebar "(N units)" meta text next to its one restricted category.
2. The SEO page's own `#fromUnit` / `#toUnit` `<option>` counts (must show the *complete* unit list for that category, not a further-restricted subset).
3. The homepage's own (unrestricted, 27-category) sidebar entry for the same category name, loaded independently and cached before any SEO page was tested.

All testing was done in real headless Chromium (Playwright, `/opt/pw-browsers/chromium`) against the actual repository files served over a local static HTTP server (`python3 -m http.server`, no synthetic/mocked DOM), across:

- **Languages:** en, zh, ar, es on every representative page; all 14 supported languages (en, es, fr, de, pt, it, ar, zh, ja, ko, hi, tr, id, so) cycled on the homepage and on one SEO page for regression coverage.
- **Viewports:** 1440px, 1024px, 768px, 390px, including the mobile drawer's Categories submenu at the narrower widths.

## Genuine defect found and fixed

Validation surfaced one real, reproducible defect — not a false positive, not the H1, and not present in the already-correct Area example the prior message referenced.

**Symptom:** on `agriculture/acre-to-hectare/` and `engineering/psi-to-bar/`, the sidebar correctly showed the page's authoritative single category (Agriculture / 96 units, and Engineering / 158 units, respectively — matching the breadcrumb and matching the homepage's own declared counts for those categories). But the actual live converter — `#activeCategoryName`, and the `#fromUnit` / `#toUnit` dropdowns — was silently showing a **different** category's units: Area (36 units) on the Agriculture page, and Pressure (35 units) on the Engineering page. The sidebar and the converter itself disagreed about which category the page was.

**Root cause:** `app.js` maintains a small, 22-entry curated list (`seoConversions`, used for the homepage's "Popular Conversions" widget) keyed only by bare trailing slug, e.g. `"acre-to-hectare" -> categoryId: "area"` and `"psi-to-bar" -> categoryId: "pressure"`. Separately, the full 327,527-page generated site also has its own pages that happen to reuse those exact same trailing slugs under a *different* category folder (`/agriculture/acre-to-hectare/`, `/engineering/psi-to-bar/`) — because "acre"/"hectare" and "psi"/"bar" are legitimately units in more than one category. The page's converter-initialization code (`computeSeoConversionData()`) looked up the curated list by bare slug *before* it ever considered the URL's own category folder, so the two nested pages inherited the curated list's category (Area / Pressure) instead of their own (Agriculture / Engineering), even though their sidebar was already using the correct, breadcrumb-based resolution.

**Scope of the defect:** narrow and fully enumerated. All 22 curated-slug entries were cross-referenced against every folder in the repository that reuses the same trailing slug; only these 2 of the 327,527 generated pages were affected. (The other curated slugs either have no folder-nested duplicate, or their folder-nested duplicate already agrees with the curated category, e.g. `digital/gb-to-mb`, `volume/liters-to-gallons`, `weight/kg-to-lbs`, `pressure/psi-to-bar` were all already correct.)

**Fix applied (`app.js`, inside `computeSeoConversionData()`):** before trusting the curated slug-only match, check whether the URL's own category-folder segment names a real, different category. If it does, skip the curated match and fall through to the already-correct, folder-hinted `deriveConversionFromPath()` resolution further down the same function. This is a single added guard condition — no new mapping, no change to conversion factors/formulas/`UNIT_META`, no change to category IDs/order, no change to any SEO HTML, and no change to the curated `seoConversions` list itself. It changes behavior for exactly the 2 previously-broken pages; every other page's resolution path is untouched (verified below).

**Verification after the fix:**
- `agriculture/acre-to-hectare/`: sidebar and converter now both agree — Agriculture Converter, 96/96 units.
- `engineering/psi-to-bar/`: sidebar and converter now both agree — Engineering Converter, 158/158 units.
- The **canonical root-level pages for the same slugs** (`/acre-to-hectare/`, `/psi-to-bar/`, which are what the curated "Popular Conversions" list is actually meant to describe) were re-checked and are **unchanged**: still Area/36 and Pressure/35 respectively, exactly as before the fix.
- A sample of other curated-slug nested duplicates that were already correct before the fix (`digital/gb-to-mb`, `volume/liters-to-gallons`, `weight/kg-to-lbs`, `pressure/psi-to-bar`) were re-checked and are **unchanged**.
- The full 27-representative-page suite was re-run after the fix: **27/27 PASS**, 0 structural issues, 0 regressions.
- `node --check app.js` passes.
- `git diff --stat` confirms only `app.js` changed as part of this fix (+19 lines); no SEO page, no `index.html`, no `i18n-seo/*.json` file was touched by this fix.

No other code change was made. Per the explicit instruction for this task, nothing else was touched — this is the one and only genuine failure validation surfaced, and the fix is scoped to exactly that failure.

## Full per-category results

See `SEO_PAGE_SINGLE_CATEGORY_SIDEBAR_VALIDATION.csv` (27 rows, one per category) for the exact machine-readable results: `page, category_id, expected_category, displayed_categories, expected_unit_count, displayed_unit_count, unrelated_categories, status`.

Final counts: **27 PASS / 0 FAIL.**

For every representative page:
- Exactly 1 category was displayed in the sidebar (0 unrelated categories in all 27 cases).
- The displayed category matched the page's authoritative (breadcrumb-derived) category in all 27 cases.
- The complete unit list remained available in the `#fromUnit`/`#toUnit` selects (matching the sidebar's own declared unit count and the homepage's independent count for that category) in all 27 cases, post-fix.

## Language coverage (en / zh / ar / es, plus full 14-language regression)

For every representative page, cycling en → zh → ar → es:
- The sidebar continued to show exactly 1 category in every language.
- The unit-select option counts stayed identical to the English baseline in every language (no language-specific restriction or drift).
- No English category-name text leaked into zh/ar/es sidebar labels.

Full 14-language regression (en, es, fr, de, pt, it, ar, zh, ja, ko, hi, tr, id, so):
- Homepage: all 27 categories remained present in every language, at 1440px — 0 regressions.
- A representative SEO page (`area/acres-to-ares/`): the sidebar stayed restricted to exactly 1 category in every one of the 14 languages — 0 regressions.
- `window.validateAllTranslations()` (the site's own translation-completeness check) continued to report 0 missing / 0 empty keys.
- 0 page errors across the full 14-language sweep.

## Viewport coverage (1440 / 1024 / 768 / 390)

For every representative page, at every one of the 4 required viewports:
- The desktop/tablet sidebar (`#categoryList`) stayed restricted to exactly 1 category.
- The mobile drawer's Categories submenu (opened via the hamburger menu → Categories toggle, checked at 1024/768/390) also stayed restricted to exactly 1 category, matching the sidebar.
- 0 page errors at any viewport.

## Homepage regression check

The homepage was re-verified, independently of the SEO-page work, at all 4 viewports and (see above) across all 14 languages:
- **27 / 27 categories always present** on the homepage — unchanged from the prior localization validation. The homepage's category list is never restricted (`seoPageRestrictedCategoryId()` returns `null` whenever `document.body` lacks the `seo-page` class, which the homepage does).
- 0 page errors.

**Homepage behavior changed: NO.**

## SEO integrity check

```
git diff --stat
```
shows changes are confined to: `app.js` (+19 lines net from this task's one fix, on top of the already-validated homepage-localization changes from the prior task), plus the previously-validated `adsense.js`, `index.html`, and `i18n-seo/*.json` files from the earlier homepage-localization work (unchanged by this task). No file under any category folder (`length/`, `area/`, `agriculture/`, `engineering/`, etc.) — i.e. none of the 327,527 generated SEO conversion pages — appears in `git status --short` or `git diff --stat`.

- **327,527 canonical SEO pages regenerated: NO.**
- **327,527 canonical SEO pages modified: NO.**
- 0 sitemap changes.
- 0 canonical URL changes.
- 0 SEO content/HTML changes.
- 0 conversion-factor/formula/`UNIT_META`/category-ID/category-order changes.

## Browser functional checks (per representative page)

For every one of the 27 representative pages, at 1440px/English:
- **Converter loads and renders:** PASS (27/27).
- **From Unit / To Unit selects populated with the full, correct unit set:** PASS (27/27, post-fix).
- **Swap control:** clicking `#swapButton` correctly swaps the From/To unit values: PASS (27/27).
- **Result:** `#resultText` renders non-empty conversion text: PASS (27/27).
- **Formula:** `#formulaText` renders non-empty formula text: PASS (27/27).
- **About section:** an "About Converting …" `<h2>` is present: PASS (27/27).
- **FAQ:** at least one `.faq-item` is present: PASS (27/27).
- **Related conversions:** a "Related conversions" `<h2>` is present: PASS (27/27).
- **JS page errors:** 0 across all 27 pages, all viewports, all languages tested.

## A note on ad-network requests (not a site defect)

Every one of the 27 pages, in this sandboxed test environment, reported failed requests to `pagead2.googlesyndication.com` (`ERR_TUNNEL_CONNECTION_FAILED`). This is uniform across literally every page tested — including ones untouched by any of this session's work — and is caused by this test environment's network sandboxing having no route to Google's ad-serving domain, not by anything in the site's own code. The `<script async src="https://pagead2.googlesyndication.com/...">` tags are correctly present, unmodified, and identical to how they've always been generated; this would resolve normally on the live, publicly-reachable site. This is reported here for completeness but is not counted as a functional defect.

## What was NOT touched

Per the explicit constraints for this task, nothing else was changed:
- No SEO pages were regenerated or modified.
- No SEO HTML, sitemap, canonical URLs, or SEO content were touched.
- No conversion calculations, conversion factors, formulas, `UNIT_META`, category IDs, or category order were touched.
- No header design, dropdown styling, responsive layout, or dark/light-mode behavior was touched.
- No commit, push, deploy, reset, clean, revert, or discard was performed. The working tree contains only the one targeted `app.js` fix described above, on top of the already-validated, already-reported homepage Chinese-localization work from the prior task.
