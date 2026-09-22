# Phase 3 Final usageContext vs. whereUsed Reconciliation

**Repository:** `theuniversalconverter.com` (working copy: `/home/claude/new-uni`, uncommitted working tree)
**Date:** 2026-09-22
**Scope:** a direct, text-level comparison — not a unit-count comparison — to determine whether the historically-claimed `usageContext` dataset and the repository's real `whereUsed` mechanism are the same content. No code or translation data was changed. `git status --short` before and after this pass is identical to the end of the prior reconciliation: `M app.js` plus the same untracked report files and `i18n-seo/`, plus this new report.

---

## 1. Searching for the actual historical usageContext text

A repository-wide search for `usageContext` (and `usage_context`/`usage-context` variants) was repeated a third time across every file type, including directories not previously checked (`STATIC/`, `admin/`). It again returns **zero matches** anywhere in the repository — no data file, generator script, or HTML attribute by that name exists. There is no "copied canonical SEO page" or prior audit artifact file anywhere on disk that contains this term or the specific 14,048/253/145 figures. This project has no access to whatever process originally produced those numbers; it can only examine the real repository as it exists now.

That said, this pass found something the prior two passes had not checked: a small `STATIC/` directory (17 hand-authored guide pages, entirely separate from the 394,749 auto-generated conversion pages under `area/`, `temperature/`, etc.) containing exactly **3** dedicated comparison pages: `acre-vs-hectare.html`, `celsius-vs-fahrenheit.html`, and `metric-vs-imperial.html`. `acre-vs-hectare.html` and `celsius-vs-fahrenheit.html` each contain a short prose section titled "When each is used" / "Where they are used" — real, non-fabricated English text about where a specific unit is used, textually distinct in style and authorship from the auto-generated `whereUsed` sentences (short, template-flavored fragments like "Used worldwide, especially in agriculture, forestry, and land statistics outside the US") already extracted from the main corpus. This is the closest thing to a second, independent "usage context" content source found anywhere in the repository — but at a scale of 3 pages / roughly 4–6 units, it does not come close to matching "14,048 keys / 253 texts / 145 units" either.

---

## 2. Direct text-level comparison

| Page | from_unit | to_unit | Source A: auto-generated `whereUsed` text (from the conversion-page corpus) | Source B: `STATIC/` guide-page "where used" text |
|---|---|---|---|---|
| `area/acres-to-hectares/` vs. `STATIC/acre-vs-hectare.html` | acre | hectare | "United States United Kingdom (informal/historical, land registry legacy) Countries with historical British land-survey systems" | "Acres are common in the United States and some Commonwealth contexts. Hectares are common in metric agriculture, land management, and international reporting." |
| (same pages, reverse unit) | hectare | acre | "Used worldwide, especially in agriculture, forestry, and land statistics outside the US" | (same guide page, hectare half of the same sentence above) |
| `temperature/celsius-to-fahrenheit/` vs. `STATIC/celsius-vs-fahrenheit.html` | celsius | fahrenheit | "Standard temperature scale in nearly every country except the United States" | "Celsius is common globally and in science. Fahrenheit is common for weather, cooking, and daily temperature in the United States." |
| (same pages, reverse unit) | fahrenheit | celsius | "United States (primary everyday temperature scale) A small number of other territories, e.g. the Bahamas, Belize, Cayman Islands, Liberia, Palau" | (same guide page, Fahrenheit half of the same sentence above) |

**Result for every one of these 4 directly-compared cases: related but different.** Both sources agree on the *gist* (acre → United States; hectare → international/agriculture; Celsius → used almost everywhere except the US; Fahrenheit → used in the US) — which makes sense, since both are true statements about the same real units — but the exact wording, sentence structure, and specific supporting detail (the auto-generated text names specific small territories for Fahrenheit and cites "land registry legacy" for acre; the guide text cites "Commonwealth contexts" and "science" instead) differ completely. **`usageContext_text == whereUsed_text` is FALSE in every tested case; none are exactly identical, and none are identical after whitespace/punctuation normalization either** — they share no complete sentence or clause in common.

Additional structural evidence that these are two separately-produced pieces of content, not one system read two ways: neither `area/acres-to-hectares/index.html` nor `temperature/celsius-to-fahrenheit/index.html` (the auto-generated pages) contains any link to, or reference to, their corresponding `STATIC/*-vs-*.html` guide page, or vice versa. They live in unrelated parts of the site with no cross-reference, consistent with separate authorship/generation processes rather than one dataset rendered into two DOM locations.

---

## 3. Testing presence combinations

Checked for `acre`, `hectare`, `celsius`, and `fahrenheit` — the 4 units where both a `STATIC/` guide page and an auto-generated `whereUsed` entry exist:

- **Both present, text differs**: all 4 cases above (this is the only combination actually observed).
- **usageContext-analog (STATIC guide) exists but whereUsed does not**: not observed — all 4 units checked have both.
- **whereUsed exists but the STATIC-guide analog does not**: this is true for the overwhelming majority of the ~135 units known to have a `whereUsed` entry (from the broader sample taken during the correctness-remediation pass) — only 3 `STATIC/` guide pages exist in total (covering at most 6 units: acre, hectare, celsius, fahrenheit, plus the non-unit-specific "metric"/"imperial" systems named in the third guide page), so essentially every other `whereUsed`-covered unit (mile, watt, kilogram, USD, and ~130 others) has no corresponding guide page at all.

No case of a "conflicting outcome" in the sense the historical figures described (same key, contradictory text) was found — but that is because these are two independent, non-overlapping-by-key production paths (auto-generated per-conversion-page text vs. a tiny hand-authored guide set), not because they were reconciled into one consistent dataset.

Given the extraction method is identical to the one already used and reported in the two prior passes (regex extraction of a specific FAQ `<h3>`/`<p>` pattern from real static HTML, verified working correctly on hundreds of real pages), the difference in wording between the two sources is not a regex/parser artifact — both pieces of text were extracted successfully and completely; they are simply, genuinely, two different pieces of writing about the same topic.

---

## 4. Determination

**C. UNRESOLVED.**

This is not a default or a hedge — it is the specific conclusion the evidence supports, and the task explicitly names it as a legitimate outcome distinct from convenience. The reasoning:

- **SAME_CONTENT (A) is directly contradicted.** Four independent text-level comparisons, covering both directions of two different unit pairs (acre/hectare, celsius/fahrenheit), all show related-but-different text with zero exact or normalized matches. If `usageContext` and `whereUsed` were the same underlying content read from two places, at least some of these comparisons should have produced identical or near-identical text; none did.
- **DISTINCT_CONTENT (B), as the task defines it — "a genuinely different SEO content structure that usageContext still requires separate implementation for" — is also not supportable.** The only real, non-fabricated candidate for a second content structure found anywhere in the repository (the `STATIC/` guide pages) exists at a scale of 3 pages / ~4-6 units, nowhere close to "14,048 keys / 253 texts / 145 units." Declaring this 3-page guide set to *be* "usageContext" and instructing that it "requires separate implementation" would overstate what was found and effectively fabricate a scale-equivalence this project has no evidence for, which is exactly what this task's instructions warn against doing in the other direction (assuming equivalence with `whereUsed` "simply because it is more convenient").
- **No artifact matching the claimed 14,048/253/145 figures was found anywhere in the repository**, on a third consecutive search that this time also covered previously-unchecked directories (`STATIC/`, `admin/`). Those figures remain unverified and, on current evidence, do not describe any real dataset that exists in this codebase.

What this pass adds beyond the prior two: real, if small, evidence that at least one genuinely separate "where a unit is used" content source exists in this repository (the `STATIC/` guides) that is demonstrably not the same text as `whereUsed`. That rules out the clean, convenient "usageContext was just whereUsed all along" story — while still not producing anything resembling the claimed dataset to implement in its place. Both of the previous report's PASS determinations for "usageContext architecture" were reached by treating `whereUsed` as a stand-in; this report withdraws that specific equivalence claim, on the direct-comparison evidence above, without asserting the opposite claim either.

---

## Final decision

```
usageContext vs whereUsed: UNRESOLVED
Where-used text key: unit_id
Where-used trigger key: unit_id
UsageContext implementation required: NO
Architecture reconciliation: FAIL
Translation expansion ready: NO
```

**Where-used text key and trigger key remain `unit_id`** — that finding is unaffected by this report; it was proven independently in the prior reconciliation pass (206 real-pairing samples, zero variation) and nothing in this pass's text-level comparison contradicts it. The `STATIC/` guide pages are a separate, small, already-complete, hand-authored content set with no dynamic lookup of their own (each of the 3 pages is fully static prose, not generated per-unit) — there is nothing to "implement" for them; they simply exist as-is and are out of scope for a per-unit translation key.

**UsageContext implementation required: NO** — not because it was resolved as `whereUsed`, but because no real dataset matching the historical claim was found to implement, and this project will not fabricate one to fill the gap.

**Architecture reconciliation: FAIL** — this is an honest downgrade from the prior report's PASS. That PASS rested on treating `whereUsed` as usageContext's real identity; this pass's direct text comparison shows that identity claim does not hold. The architecture *questions* have been answered as far as available evidence allows, but "usageContext" itself remains an open, unresolved item rather than a closed one, which is what FAIL communicates here — not that anything currently shipped is broken (nothing in this pass changed `app.js` or `i18n-seo/`, and every previously-verified PASS from the correctness-remediation report, temperature/fuel/currency/compound-rate/unit-IDs/enhanced-pages, is untouched and still holds).

**Translation expansion ready: NO** — unchanged, per explicit instruction. No corpus-wide rescan, no new translation data, and no code changes were made in this pass.
