# Phase 3 Scope Freeze Report

**Repository:** `theuniversalconverter.com` (working copy: `/home/claude/new-uni`, uncommitted working tree)
**Date:** 2026-09-22
**Scope:** freeze the Phase 3 requirement surface to what the repository actually supports, formally exclude the unsupported `usageContext` structure, reassess the current implementation against the frozen scope, and run a validation sweep. No repository-wide search was repeated, no corpus rescan was performed, and no code or translation content was added or removed. `git status --short` before and after this pass is identical to the end of the prior report: `M app.js` plus the same untracked report files and `i18n-seo/`, plus this new report.

```
git status --short (before this pass)
 M app.js
?? PHASE_3_ARCHITECTURE_RECONCILIATION_REPORT.md
?? PHASE_3_CORRECTNESS_REMEDIATION_REPORT.md
?? PHASE_3_FINAL_USAGE_ARCHITECTURE_REPORT.md
?? PHASE_3_IMPLEMENTATION_COVERAGE.csv
?? PHASE_3_IMPLEMENTATION_COVERAGE_REPORT.md
?? PHASE_3_IMPLEMENTATION_REPORT.md
?? i18n-seo/

git status --short (after this pass) — identical, plus this report; app.js diff unchanged (518 insertions / 12 deletions)
```

---

## 1. Why usageContext is not being implemented

**Historical usageContext finding:**

> A prior corpus extraction reported a separate usageContext structure, but no authoritative source or production implementation for that structure could be identified after repeated repository-wide investigation. The separate STATIC guide pages are distinct content and do not establish equivalence. Therefore Phase 3 does not implement a separate usageContext subsystem unless an authoritative source is later discovered.

This is carried forward unchanged from `PHASE_3_FINAL_USAGE_ARCHITECTURE_REPORT.md` and is not being re-investigated in this pass, per instruction. Nothing in the current `app.js` or `i18n-seo/*.json` was ever written around a `usageContext` concept — a direct check this pass (`grep -n "usageContext" app.js i18n-seo/*.json`) returns zero matches, so there is no unsupported logic to remove. This confirms the exclusion is a documentation/scope decision only, with no corresponding code change required.

## 2. Evidence for unit-keyed whereUsed

Unchanged and retained from the prior two reconciliation passes: 206 real-page samples across 5 unrelated anchor units (acre, mile, USD, watt, kilogram — including deliberately extreme partner units) found zero variation in either presence or text based on the paired unit. `WHERE_USED_TEXT_KEY = unit_id`, `WHERE_USED_TRIGGER_KEY = unit_id`. This is implemented exactly this way in `translateFaqItems()` (`seoData.whereUsed[unit.id]`) and was not changed in this pass.

---

## 3. Frozen Phase 3 data model

Features retained (all currently implemented, at the coverage levels detailed in Section 5):

```
unit names                          -> seoData.units[unit.id] (+ compositional engine)
unit definitions                    -> seoData.unitDefinitions[unit.id] (+ dimensionDefinitions fallback)
category names                      -> seoData.categories[id].name
category intro templates            -> NOT IMPLEMENTED (no per-unit research source exists;
                                        same rule TOOLING/generate_about_section.py already follows)
temperature variants                -> faq.temp_q1_answer / temp_q2_answer / temp_q6_answer
compound-rate composition           -> composeGeneratedUnitName() "_per_" branch + dimensionDefinitions
digital units                       -> seoData.units[unit.id] (flat, not composable)
currency names                      -> seoData.currencyNames[unit.id], wired into getUnitDisplayName
FAQ universal core                  -> faq.q1-q4/q6 generic templates
FAQ category-specific prose         -> faq.temp_*/fuel_*/currency_* prefixed templates
FAQ pair-specific prose             -> faq.q4_question/q4_answer ("What is a X")
whereUsed                           -> seoData.whereUsed[unit.id]  (unit_id key, confirmed)
related conversion labels           -> translateRelatedConversions() via deriveConversionFromPath()
```

Explicitly excluded from mandatory scope:

```
usageContext subsystem  -> EXCLUDED (Section 1) — unless an authoritative source is discovered later
```

`category intro templates` remains listed as not implemented — this was already true before this pass (documented in the original coverage audit) and is unaffected by the usageContext decision; it is a separate, pre-existing scope limit (no per-unit long-form research content exists beyond the 16 enhanced pages), not something newly cut.

---

## 4. Reassessment of the current implementation against the frozen scope

| Feature | Status | Notes |
|---|---|---|
| Unit names | PARTIAL | 139/6,413 curated directly; SI-prefix and square/cubic composition extend coverage further; long tail falls back to English by design |
| Unit definitions | PARTIAL | 36/6,413 curated directly; compound-rate units additionally covered via `dimensionDefinitions` (7 dimensions) |
| Category names | COMPLETE | 27/27, all 13 languages |
| Category intro templates | MISSING (pre-existing, out of scope) | No per-unit research source exists; unaffected by this scope freeze |
| Temperature variants | COMPLETE | q1/q2/q6 category-specific wording + real-number extraction; verified against 8 real pairs across 4 temperature scales |
| Compound-rate composition | COMPLETE (mechanism) | `_per_` branch + recursive resolver implemented and verified (density spot check); coverage still bounded by which numerator/denominator units are individually curated |
| Digital units | PARTIAL | 11/22 names, 4/22 definitions — unchanged from the correctness-remediation pass, not revisited here (no regression found, none expected) |
| Currency names | COMPLETE (architecture) / PARTIAL (coverage) | Lookup wired into `getUnitDisplayName`; 42/155 SEO-eligible currencies curated |
| FAQ universal core | COMPLETE | q1-q4/q6 generic templates, real-number extraction confirmed across categories |
| FAQ category-specific prose | COMPLETE | temperature, fuel, currency variants implemented and tested; electricity/`multi`-type categories reasoned about but not individually re-verified (unchanged finding from the correctness-remediation report) |
| FAQ pair-specific prose | PARTIAL | Bounded by the same unit name/definition curation set |
| whereUsed | COMPLETE (mechanism) / PARTIAL (coverage) | unit_id-keyed, verified correct; 16 units curated against a real scope of ~135+ found by sampling |
| Related conversion labels | COMPLETE (mechanism) / PARTIAL (coverage) | Same curation-set ceiling as unit names |
| usageContext subsystem | UNSUPPORTED / REMOVE | Never built; nothing to remove; formally excluded from scope per Section 1 |

No item in the current, uncommitted `app.js` or `i18n-seo/*.json` needed to be removed — the reassessment confirms zero code was ever written around the unsupported usageContext concept, so "UNSUPPORTED / REMOVE" applies only to the requirement itself, not to any shipped artifact.

---

## 5. Translation expansion

Per the explicit stop condition on this task ("Freeze the scope first... STOP after the scope-freeze report and implementation-scope review"), **no translation expansion was performed in this pass.** Section 6 of the source task's instructions asked to "continue with translation expansion for the supported architecture" once scope is reconciled, but the same task's closing instructions say to stop before doing that — the closing STOP takes precedence, so this report only determines *readiness* for that next step, without taking it.

---

## 6. Validation sweep

**JSON-level (all 13 `i18n-seo/*.json` files):**

| Check | Result |
|---|---|
| Valid JSON (parses) | PASS — all 13 |
| No duplicate keys (checked via `object_pairs_hook`, which catches duplicates Python's default parser would silently discard) | PASS — 0 found |
| No null/undefined/empty-string values | PASS — 0 found (one expected empty string, `prefixes[""] = ""`, is the deliberate "no prefix" / base-unit entry mirroring `app.js`'s own prefixes array, not a defect) |
| Identical key structure across all 13 languages | PASS — 395 nested keys each, zero divergence |

**Runtime-level (jsdom against real generated HTML):**

| Check | Result |
|---|---|
| Temperature (7 real pairs: Celsius↔Fahrenheit, Celsius↔Kelvin, Celsius↔Rankine, Delisle→Fahrenheit) | PASS — 20/20 assertions |
| Fuel economy (mode-mismatched pair) | PASS — 2/2 assertions |
| Currency (USD→EUR, including the alternate q6 question pattern) | PASS — 2/2 assertions + manual inspection confirms all 7 FAQ items translate correctly, currency names now translate throughout |
| Compound-rate composition (density) | PASS — 2/2 assertions |
| whereUsed (acre, full page test) | PASS — correct translated text rendered, matches curated data |
| FAQ variants (category-specific templates firing correctly, generic templates unaffected) | PASS — confirmed across temperature/fuel/currency/generic categories |
| Unit names / definitions | PASS — spot-checked via the acre/hectare full-page test and the density compound-rate test |
| Homepage regression | PASS — `hydrateSeoArticleContent` correctly no-ops (no `seo-page` class) |
| Enhanced-page protection | PASS — all 18 spot-checked enhanced/canonical pages (the 16 originally listed plus 2 additional short-slug redirects checked in this pass) remain byte-identical to `git HEAD` |
| English regression | PASS — exact text restoration confirmed after an ES round-trip |

**Total: 27 automated jsdom assertions + 4 JSON-validation checks × 13 languages, all passing. Zero failures, zero regressions found in this pass.**

**Browser validation: SKIPPED**, unchanged — no working browser environment is available in this session; jsdom exercises real DOM code paths but does not validate visual layout, RTL rendering, or cross-browser behavior.

---

## Final decision

```
Unsupported usageContext subsystem: EXCLUDED
whereUsed implementation: PASS
Phase 3 implementation scope: FROZEN
Ready for translation expansion: YES
```

**Ready for translation expansion: YES**, on the basis of this pass's reassessment: every item in the frozen scope is either COMPLETE (mechanism working, verified by automated test) or PARTIAL in a well-understood, bounded way (curation coverage below the full unit catalog, by original design, not a defect); nothing is broken, nothing needs to be built before expansion can safely add more curated data on top of the existing, tested architecture. The one item marked UNSUPPORTED/REMOVE (usageContext) required no code change, since none was ever built for it.
