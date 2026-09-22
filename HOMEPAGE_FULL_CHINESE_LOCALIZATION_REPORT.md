# Homepage Full Chinese Localization — Audit & Fix Report

## Scope

This pass followed up on the earlier Chinese homepage remediation, which fixed the hero, search, stats, and Popular Conversions areas but left the rest of the page — everything from "Launch status" down through the footer and cookie banner — untranslated. The goal this time was a genuine top-to-bottom audit of the rendered `zh` homepage DOM, using Chromium, not just a source-code read-through, followed by fixes routed through the existing `TRANSLATIONS` / `data-i18n` / `i18n-seo` architecture (no `if (lang === 'zh')` branches, no second localization system).

No SEO conversion pages were regenerated or modified. No conversion factors, formulas, category IDs/order, SEO URLs, sitemap, robots, ads wiring, favorites/history logic, or responsive/dark-light behavior were changed. Nothing was committed, pushed, deployed, reset, or reverted — all changes are sitting in the working tree exactly as before.

## Sections fixed (index.html → data-i18n hooks)

Every section the user listed now carries `data-i18n` (or `data-i18n-attr`) hooks resolved from a new `homepage.*`/`calculators.*` set of keys:

- Launch status (eyebrow, heading, the "Last updated" paragraph, 3 info cards, "View references" link)
- "Why Universal Converter" (heading + 5 feature cards)
- "Common questions" FAQ (heading + 5 Q/A pairs, content/meaning unchanged)
- "Learn the conversions behind the numbers" (heading, "View all guides" link, 4 guide cards; URLs unchanged)
- The full calculator section: heading, 3 badges, and all 8 calculator cards' titles/labels/placeholders/buttons/tabs (Currency, Percentage, BMI, Age, Date, Mortgage, Fuel cost, Agriculture/Seed/Fertilizer/Yield/Irrigation)
- "SEO-ready utility pages" (eyebrow, heading, description, all 10 link labels; URLs unchanged)
- "Built like a real conversion business" (heading + 5 cards)
- Newsletter (eyebrow, heading, description, email label, placeholder, button, success message)
- "More conversion guides and tips" (heading, link, and the 4 JS-rendered `#blogGrid` cards)
- Mission section (eyebrow, heading, full body paragraph)
- Footer (tagline + 8 nav links; URLs unchanged; the "Universal Converter" brand name itself is left untranslated, consistent with the header)
- Cookie consent banner, in `adsense.js` (message, "Privacy Policy" link, Decline/Accept buttons, aria-label)
- "All converter categories" heading and "Read conversion guides" link
- Category-overview / calculator card default result placeholders now resolve through the same functions their live values use

**105 new keys** were added to each language's existing `homepage` object, plus two brand-new namespaces — **`calculators`** (39 keys) and **`cookieBanner`** (6 keys) — added the same way every other namespace in `TRANSLATIONS` is structured. All of it was authored for all 14 languages up front, not just Chinese.

## Bugs found only by testing in real Chromium (not visible from source alone)

Reading the HTML/JS source only gets you so far — several of these only showed up once the page was actually loaded, switched to `zh`, and exercised:

1. **A label wrapping an `<input>` broke the DOM on every language switch.** I initially tagged `<label class="calc-api" data-i18n="...">API endpoint (optional)<input id="currencyApi">...</label>` and the equivalent birth-date label directly with `data-i18n`. The existing generic handler does `el.textContent = value` for any `data-i18n` element without `data-i18n-attr` — which, on a label that *wraps* an input, deletes the input from the DOM. This threw an uncaught `TypeError` inside `applyTranslations()` on the very first language application (during page load), which silently aborted the rest of that function for whichever elements hadn't been processed yet. Fixed by removing `data-i18n` from those two labels and using the codebase's existing `setFirstTextNode()` helper (the same pattern already used for the precision/notation controls) so only the label's own text node changes, not its child input.
2. **The header's "Categories" dropdown (desktop and mobile) was never localized at all**, in any language, before or after this pass — `renderCategoryDropdownMenus()` and `renderMobileDrawer()` build it once from a static English `label` and never re-run. Fixed by resolving each entry's label through `getCategoryDisplayName()` (the same function the category grid and Popular Conversions already use) and re-invoking both renderers on every language switch.
3. That fix initially resolved to English anyway, because `getCategoryDisplayName()` depends on `currentLanguageCode`/`currentSeoData()`, which are only updated inside `applySeoTranslations()` — called *after* `applyTranslations()` returns. Placing the re-render inside `applyTranslations()` ran it before the language actually flipped. This is the same ordering trap already documented and solved in the codebase for `renderStoredLists()`/`renderPopularConversions()` inside `refreshLanguageAwareConverter()`; the new calls were moved there to match.
4. **The theme toggle's visible "Dark"/"Light" label was hardcoded English in every language.** Added `nav.themeDark`/`nav.themeLight` and re-apply the current theme's label on every language switch (previously it only ever updated on a theme click, never on a language change).
5. **The active category's "Converter" / "Currency calculator" / "Electrical calculator" sub-label** (`#activeCategoryKind`) was hardcoded English. Added a `categoryKindLabel()` helper and translation keys, wired into both category selection and the post-language-switch refresh.
6. **The date calculator's result used `toLocaleDateString("en-US", …)` unconditionally**, so even in Chinese it showed English month abbreviations like "Oct 22, 2026". Added a language→locale map (`DATE_LOCALE_MAP`) used only for this date formatting; the site's existing convention of formatting *numbers* as `en-US` everywhere (unit counts, page counts, day counts) was deliberately left untouched, since that's a consistent, pre-existing choice — only the month-name text itself needed localizing.
7. The 8 calculator result functions (`updateBmi`, `updateAge`, `updateDateCalc`, `updateMortgage`, `updateFuelCost`, `updateAgricultureTools`, `updatePercentage`, `refreshCurrencyRates`) all built result strings from hardcoded English template literals. All now resolve through `getTranslation()` + `fillTemplate()`, and are re-run on every language switch (not just on input) so a stale English result doesn't linger after switching languages. Calculations and numeric formatting are unchanged — verified byte-for-byte identical English output before/after (see Validation below).
8. `renderBlog()` (the JS-driven `#blogGrid` "More conversion guides and tips" cards) read directly from the English `blogPosts` array. Added a href-keyed map to the new `homepage.blog*` translation keys, with English fallback for any future post not in the map, and wired it to re-render on language switch.

## Validation

**Translation completeness** — the app's own `validateAllTranslations()` diagnostic, run live in Chromium: **259 keys × 14 languages, 0 missing, 0 empty**.

**Full rendered-DOM English-leak audit (the main ask)** — loaded `/index.html` in headless Chromium, switched to `zh`, walked every visible text node in `document.body` after JS init, and inspected every node containing Latin letters (523 nodes). Every one is either now correctly translated Chinese text, or falls under the explicit exclusion list:
- The "Universal Converter" brand name (header, footer, and embedded in a few sentences) — left untranslated, same as before.
- Unit symbols (m, kg, Pa, J, W, kg/L, …), currency codes (USD, EUR, …), and conversion value strings ("1 kg = 2.20462262185 lb") in the sidebar/history/popular grid.
- Technical/organization acronyms embedded in otherwise-Chinese sentences: SEO, API, BMI, PWA, HTTP/HTTPS, CSV, BIPM, NIST, GB/MB.
- Third-party product names in the cookie banner: Cookie, Google Analytics, Google AdSense.
- Each language's own name in the language picker (e.g. "English", "Soomaali") — this is deliberate; a language picker always shows each option in its own language.

Zero items required further translation after the fixes above (confirmed by re-running the audit after each fix batch — it went 551 → 550 → 523 → 521 leaked nodes as the label-destruction bug, then the nav-dropdown, theme, category-kind, and date-locale bugs were fixed one at a time).

**14-language × 4-viewport regression** (1440/1024/768/390px), automated in Chromium: for each of the 14 languages, loaded the homepage, switched language, filled every calculator's inputs, toggled the theme, opened the categories dropdown and the mobile drawer, and checked page errors, console errors, and horizontal overflow. **55 of 56 runs passed clean.**

The one failure — **Somali (`so`) at 1440px has a header overflow of ~94px** — is a **pre-existing issue, not introduced by this pass**. I confirmed this directly: substituting the theme label back to hardcoded English "Dark"/"Light" on that same page still overflows by ~77px, because Somali's translated nav-link labels (`nav.home` = "Bogga hore", etc. — already present in the codebase before this session) are simply wider than the header's fixed layout allows at exactly 1440px. My change added the last ~17px on top of an already-broken layout. Since fixing this would mean changing header CSS/structure — explicitly out of scope ("do not change header structure") — I've left it as-is and am flagging it here rather than silently absorbing it into this pass's scope.

**English regression** — filled every calculator with the same inputs before and after this pass: results are byte-for-byte identical ("BMI 22.8571428571 - Normal", "30 days later: Jan 31, 2026", "$1,580.17 per month", etc.), confirming calculations and formulas are unchanged and English behavior is unaffected.

**Arabic RTL** — confirmed `dir="rtl"` and `lang="ar"` are still applied correctly, with computed `direction: rtl` on the body.

**Console/page errors** — 0 across all runs (the only console noise is `net::ERR_TUNNEL_CONNECTION_FAILED` for blocked ad/analytics network calls in this sandboxed environment, unrelated to localization).

## Files changed

- `app.js` — 679 lines changed: 105 new `homepage.*` keys × 14 languages, 2 new namespaces (`calculators`, `cookieBanner`) × 14 languages, `converter.kind*` + `nav.theme*` keys × 14 languages, `DATE_LOCALE_MAP`, the label-destruction fix, the category-dropdown timing fix, and all calculator/blog/theme/category-kind function rewiring described above.
- `index.html` — 278 lines changed: `data-i18n` hooks added across every section listed above.
- `adsense.js` — 10 lines changed: cookie banner markup restructured with `data-i18n` hooks (message, link, both buttons, aria-label), no behavior change.

`i18n-seo/*.json` show as modified in `git status`, but that's carried over unchanged from the prior session's Phase 3 SEO work — nothing in this pass touched those files or any generated SEO page.

## Known remaining gap (documented, not fixed, by design)

- **aria-label attributes** on header controls (mobile menu toggle, theme toggle, language toggle, brand link) remain hardcoded English. These are accessibility metadata, not visible text, so they fall outside the "user-facing UI" / visible-text scope this pass targeted (consistent with the same scoping decision made in the earlier remediation pass for calculator input `aria-label`s). Flagging for a future pass if screen-reader-facing text is in scope.
- **Somali header overflow at 1440px**, described above — pre-existing, not caused by this pass, left alone since fixing it means changing header layout/CSS.

## Addendum — header "Categories" dropdown follow-up fix

A later screenshot flagged the header 分类 dropdown as still showing English ("Length", "Area", "Volume", …) in Chinese. Investigating found two things:

1. **Chinese was already correct in the working tree.** `renderCategoryDropdownMenus()`/`renderMobileDrawer()` were fixed earlier in this pass (see the "header's Categories dropdown was never localized at all" bug above) and, when tested directly, the `zh` dropdown already showed the exact authoritative short names from `i18n-seo/zh.json`'s `categories[id].name` field (长度, 面积, 体积, 重量/质量, 温度, …) — matching the reporter's expected list exactly. The screenshot was from the live/deployed site, which is still on the pre-existing code since nothing has been pushed or deployed yet; it doesn't reflect the current working tree.
2. **Testing did surface a real side effect of the earlier fix**, though: English's dropdown had changed from its original short labels ("Length", "Area", …) to the long `category.name` form ("Length Converter", "Area Converter", …), because `getCategoryDisplayName()` falls through to that long form for English (there's no `i18n-seo/en.json` — English is the base language stored directly on the `categories` array, where names are intentionally long, e.g. `c("length", "Length Converter", …)`, for the category grid/Popular Conversions/sidebar elsewhere on the page). That long form is correct everywhere else but was never what this specific dropdown showed in English before. Fixed by keeping `NAV_CATEGORIES`'s own original short `label` for English, and only calling `getCategoryDisplayName()` for non-English languages, in both `renderCategoryDropdownMenus()` and `renderMobileDrawer()`. No new category mapping was created — this uses the same pre-existing `NAV_CATEGORIES.label` field (English) and the same `getCategoryDisplayName()`/`i18n-seo` lookup (every other language) already in place.

**Validation**, in real Chromium, at 1440/1024/768/390px, cycling zh → en → zh → ar → zh → es → zh (specifically to exercise Chinese-to-other-and-back-to-Chinese):

- All 27 categories present, in the unchanged `NAV_CATEGORIES` order, with unchanged hrefs, at every viewport and every language in the cycle.
- 0 English category names leaking into zh/ar/es.
- English confirmed showing its exact original short labels ("Length", "Area", "Volume", …), unchanged from before this addendum.
- 0 occurrences of `undefined`, `null`, or `[object Object]`.
- Mobile drawer's categories submenu (opened via the hamburger menu → Categories toggle) checked at all 4 viewports in Chinese: 27 items, 0 English leaks, 0 bad text.
- 0 page errors, 0 console errors, across the full sweep.
- Re-ran the full 14-language × 4-viewport regression and the whole-page English-leak audit afterward: no new failures beyond the already-documented, pre-existing Somali 1440px header-overflow issue; the rendered `zh` DOM's Latin-letter text node count is unchanged (521) from before this fix, confirming nothing else regressed.

No commit, push, or deploy was made. No SEO pages were touched.
