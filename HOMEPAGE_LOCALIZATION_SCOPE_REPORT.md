# Homepage Localization Scope Report

Investigation only — no code was modified. This determines, for each homepage element the report was asked to check, whether its remaining English is (1) intentionally outside Phase 1/2 scope, (2) expected because Phase 2 only covers shared chrome, or (3) an actual missing implementation.

## Method

Read the real `app.js` translation architecture (`TRANSLATIONS`, `getTranslation()`, `applyTranslations()`, and the Phase 3 `getCategoryDisplayName()`/`getUnitDisplayName()`/`buildConversionDescription()` wrappers) and the real `index.html` homepage markup, then empirically verified every element in a real DOM (jsdom, running the actual unmodified `app.js`/`index.html` from this repo, driving the real language dropdown) across English, Spanish, Arabic, and Chinese. No file was written or changed during this investigation.

## Two separate mechanisms exist

- **Phase 1/2 (shared UI chrome):** `TRANSLATIONS` is a flat dictionary with exactly 5 namespaces — `nav`, `converter`, `sidebar`, `common`, `categories` (only `unitsLabel`/`conversionPagesLabel`). `applyTranslations(langCode)` applies it two ways: generically, to every element carrying `data-i18n="<key>"`; and, for the converter shell/sidebar (which ship as static pre-generated HTML with no `data-i18n` attributes), via direct selectors hard-coded in `applyTranslations()` itself (e.g. `label[for="fromValue"] > span:first-child`, `.result-label`, `.activity-panel > section`). Its own comment scopes it to "shared UI chrome (header, sidebar, converter shell, homepage overview labels)" and explicitly excludes "SEO page-specific content (titles, About, FAQ, formulas, examples)."
- **Phase 3 (SEO content + converter display data):** `getCategoryDisplayName()`, `getCategoryDisplayDescription()`, `getUnitDisplayName()`, `getUnitDisplayDefinition()`, and `buildConversionDescription()` read from the per-language `i18n-seo/*.json` files. These are used by both the generated SEO pages *and* the homepage's own embedded interactive converter (same `app.js`, same functions, no page-type branching) — this is the mechanism the just-completed remediation task fixed for the category sidebar and the active-category description.

Neither mechanism reaches the homepage's own hero copy, its quick-link category chips, or its ad-slot marketing copy — `TRANSLATIONS` has **no key at all** for any of them (no `hero.*`, no `chips.*`, no `ad.*` namespace exists anywhere in the object), and no `data-i18n` attribute is present on any of that markup in `index.html`. This is the strongest single piece of evidence in this investigation: unlike Phase 3's SEO-article hydration (which is explicitly gated behind `document.body.classList.contains("seo-page")` — a clear, intentional scope boundary visible in the code) there is no comparable gate, flag, or comment anywhere that names the hero section or the ad copy and excludes it. Nor does any commit message or prior phase report (`lang1`/`lang2`, the only history for this feature) document a scope decision either way. The absence is simply that the `TRANSLATIONS` schema and `applyTranslations()`'s selector list never got extended to cover them — this reads as an incomplete implementation, not a documented exclusion.

## Element-by-element findings

| Element | Current behavior | Mechanism | Key | Expected localized? | Status |
|---|---|---|---|---|---|
| Hero H1 (`<h1>Convert Any Unit Instantly</h1>`) | Stays English in es/ar/zh (verified empirically) | None — plain static HTML, no `data-i18n`, no runtime call | none exists | Yes — it's homepage shared UI, the same category `applyTranslations()` says it covers | **MISSING** |
| Hero description (`.hero-subtitle`) | Stays English in es/ar/zh | None | none exists | Yes | **MISSING** |
| Category quick-link chips (`.popular-actions button`, "Length/Weight/.../Flow Rate") | Stays English in es/ar/zh | None — static text; `data-select-category` attribute (not text) drives the click behavior, so translating the text would not break functionality | none exists | Yes | **MISSING** |
| Left category sidebar category names (`#categoryList .category-name`) | Now correctly localized (verified: "Length Converter" → "Longitud"/"الطول"/"长度") | Phase 3 — `getCategoryDisplayName()`, re-rendered on language switch via `refreshLanguageAwareConverter()` | `i18n-seo/<lang>.json` → `categories.<id>.name` | Yes | **IMPLEMENTED** (fixed earlier in this session's remediation pass — this report re-confirms it holds on the homepage too, which carries its own copy of this same sidebar) |
| Converter heading (`#activeCategoryName`) | Correctly localized | Phase 3 — `getCategoryDisplayName()` | `i18n-seo/<lang>.json` → `categories.<id>.name` | Yes | **IMPLEMENTED** |
| Converter description (`#activeCategoryDescription`) | Correctly localized, full sentence frame (verified: `"Convert Meters (m) to Feet (ft) using the exact conversion factor."` → `"将 米（m）换算为 英尺（ft），使用精确换算系数。"`) | Phase 3 — `buildConversionDescription()` + `chrome.convert_description_template`/`chrome.tail_*` | `i18n-seo/<lang>.json` → `chrome.*` | Yes | **IMPLEMENTED** (fixed earlier in this session's remediation pass) |
| From/To labels ("From Unit" / "To Unit") | Correctly localized | Phase 1/2 — direct selector (`label[for="fromValue"]/[for="toValue"] > span:first-child`) *and* generic `data-i18n="converter.fromUnit"/"converter.toUnit"` (both present on the same elements — redundant but harmless) | `converter.fromUnit`, `converter.toUnit` | Yes | **IMPLEMENTED** |
| From/To unit names (dropdown option text, e.g. "Meter (m)") | Correctly localized (verified: "Quettameter (Qm)" → "cuettametro (Qm)"/"كويتامتر (Qm)"/"夸它米 (Qm)") | Phase 3 — `populateSelect()` calls `getUnitDisplayName(item)` for every `<option>` | `i18n-seo/<lang>.json` → `units.<id>`/composable-name resolver | Yes | **IMPLEMENTED** |
| Result text (`#resultText`, e.g. "1 Meter = 3.28083989501 Foot") | Stays English in es/ar/zh (verified: identical string in all 4 languages) | `updateConversion()` builds this string from raw `from.name`/`to.name` — **not** `getUnitDisplayName()` — even though the same function's sibling call (`updateActiveCategoryDescription()`) and the dropdown (`populateSelect()`) both correctly use the display-aware wrapper | none used (should be `getUnitDisplayName(from)`/`getUnitDisplayName(to)`) | Yes — every other unit-name surface on this exact page is localized | **MISSING** (implementation bug: the display wrapper exists and is used one line away, it's just not called here) |
| Decimal control / notation labels | Correctly localized | Phase 1/2 — direct selector + `data-i18n` on the `<option>`s | `converter.decimalControl`, `converter.notation`, `converter.notationAuto/Decimal/Scientific/Engineering` | Yes | **IMPLEMENTED** |
| Definition labels ("From definition" / "To definition" / "Formula") | Correctly localized | Phase 1/2 — direct selector + `data-i18n` | `converter.fromDefinition`, `converter.toDefinition`, `converter.formula` | Yes | **IMPLEMENTED** |
| Definition **values** (`#fromDefinition`/`#toDefinition` text) | Correctly localized (verified: "The meter is the SI base unit of length." → "米是国际单位制中长度的基本单位。") | Phase 3 — `updateDefinitionPanel()` calls `getUnitDisplayDefinition()` | `i18n-seo/<lang>.json` → `unitDefinitions.<id>` / `dimensionDefinitions.<dim>` | Yes | **IMPLEMENTED** |
| Formula **value** (`#formulaText` text, e.g. "Result = input x ... / ...") | Stays English in es/ar/zh (verified: identical across all 4 languages, including the literal word "Result") | `formulaFor(category, from, to)` returns hard-coded English sentences per category type, with no translation lookup | none exists | Yes, by the same logic as the description-sentence fix just applied to `buildConversionDescription()` | **MISSING** (same missing-hook pattern as the description bug just fixed, just not yet extended to this sibling string) |
| Ad labels — "Advertisement" span (`.converter-ad-slot > span:first-child`, `.sidebar-ad`) | Correctly localized | Phase 1/2 — direct selector | `sidebar.advertisement` | Yes | **IMPLEMENTED** |
| Ad labels — "Ad space" / "Display ads help keep..." (`.converter-ad-slot strong`/`p`) | Stays English in es/ar/zh | None — static text, sits immediately next to the "Advertisement" span that IS translated | none exists | Yes — inconsistent to translate one label in the ad block and not its neighbors | **MISSING** |
| Favorites/Recent/History section headings + "Clear" button | Correctly localized | Phase 1/2 — direct selector (`.activity-panel > section`) | `sidebar.favoriteConverters`, `sidebar.recentlyUsed`, `sidebar.conversionHistory`, `sidebar.clear` | Yes | **IMPLEMENTED** |
| Favorites/Recent empty-state text | Correctly localized | Phase 1/2 — `renderStoredLists()` is explicitly re-invoked at the end of `applyTranslations()` and reads `sidebar.noFavorites`/`sidebar.noRecent` via `getTranslation()` | `sidebar.noFavorites`, `sidebar.noRecent`, `sidebar.noHistory` | Yes | **IMPLEMENTED** |
| Favorites/Recent **list item** button text (once a category is actually saved/recent) | Would stay English | `renderCategoryMiniList()` sets `button.textContent = category.name` directly — same missing-hook pattern as the sidebar bug that was already fixed, just not the same function | none used (should be `getCategoryDisplayName(category)`) | Yes | **MISSING** (adjacent finding, not explicitly on the checklist but directly relevant to "favorites/recent/history") |

## Related findings beyond the checklist (surfaced while tracing `updateConversion()`)

- `conversionNote`/`category.note` (the small text under the result, e.g. "Length uses the meter as the base unit.") is a static English string stored per-category in the catalog itself, with no translation lookup — stays English in all languages.
- `convert()`'s own status/error strings (`"Choose compatible unit families"`, `"Conversion unavailable"`, `"Enter a nonzero fuel economy value"`, `"Consumption units invert the efficiency value."`, `"Add the needed electrical context"`, etc.) are hard-coded English and feed directly into `#resultText`/`#conversionNote` for invalid or cross-family conversions.

Neither of these was on the requested checklist, but both share the exact same "missing hook, not intentional exclusion" character as the checked items above, so they're recorded here for completeness rather than acted on.

## No regression

Every already-implemented mechanism (Phase 1/2 selectors, Phase 3 display wrappers, `dir="rtl"`/`lang` attribute switching) was re-verified working correctly on the homepage across all 4 test languages during this investigation, including the category sidebar and active-category description fixed earlier in this session — nothing was found broken. `htmlDir`/`htmlLang` correctly flip to `rtl`/`ar` for Arabic and back, with no layout or console errors observed.

## Final result

```
Homepage hero localization: MISSING
Homepage category localization: IMPLEMENTED
Homepage converter localization: MISSING
Homepage result localization: MISSING
Homepage sidebar localization: IMPLEMENTED
Phase 1/2 localization regression: NO
Code change required: YES
```

Notes on the summary line classifications: "Homepage category localization" and "Homepage sidebar localization" refer to the category name/description surfaces (`#categoryList`, `#activeCategoryName`, `#activeCategoryDescription`, `#overviewGrid`), all fixed in the prior remediation pass and re-confirmed here. "Homepage converter localization" is marked MISSING because it bundles the converter widget's `#resultText` and `#formulaText`, both still hard-coded English, even though several of the converter's other pieces (labels, dropdowns, definitions) are fully implemented — see the element table above for the exact split. "Homepage result localization" refers specifically to `#resultText`. No code change was made in this pass; this report is investigation-only, as scoped.
