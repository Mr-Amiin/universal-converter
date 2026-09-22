# Phase 3 Architecture Reconciliation Report

**Repository:** `theuniversalconverter.com` (working copy: `/home/claude/new-uni`, uncommitted working tree)
**Date:** 2026-09-22
**Scope:** resolve two open architecture questions (usageContext, where-used trigger/text key) using focused, bounded evidence from real generated HTML — not a full 327,527-page scan, and not by fabricating anything. No code or translation data was changed in this pass. `git status --short` before and after this reconciliation is identical: `M app.js` (from the prior remediation pass) plus the same untracked report files and `i18n-seo/` — this pass added only this report.

```
git status --short (before this pass)
 M app.js
?? PHASE_3_CORRECTNESS_REMEDIATION_REPORT.md
?? PHASE_3_IMPLEMENTATION_COVERAGE.csv
?? PHASE_3_IMPLEMENTATION_COVERAGE_REPORT.md
?? PHASE_3_IMPLEMENTATION_REPORT.md
?? i18n-seo/

git status --short (after this pass) — identical, plus this report
```

---

## Method

Neither this session nor this repository has ever produced a "complete corpus audit" of all 394,749 generated pages. Every number this report's source task attributes to one (`14,048 usageContext keys`, `253 unique texts`, `145 units`, `320,075 distinct from/to pairs`, `0 conflicts`) was asserted, not supplied as a file, database, or script output this project could inspect. A direct search (`grep -rn "usageContext" .` across every `.py`/`.js`/`.json` file, repeated in this pass) again returns zero matches anywhere in the repository. Given that the previous audit already caught one specific, confidently-stated claim from the same lineage of instructions turning out to be false when checked against the real repo (the "17 SEO-only base units" premise), these new numbers were treated the same way: as claims to verify against real generated HTML, not as ground truth to build against.

Rather than either (a) trusting the numbers and fabricating a matching subsystem, or (b) repeating the earlier broad-but-shallow sample (9,071 pages, 400 per category directory), this pass used a **focused, deep** method: pick a handful of "anchor" units that appear in *many* real from/to pairings, and check nearly all of that one unit's pairings for variation. This directly tests the specific hypothesis in question (does presence/text depend on the partner unit?) far more rigorously than a shallow scan across many different units ever could, while staying well within "do not perform another full-corpus scan."

Anchors used: `acre` (area, 35 of its real pairings sampled), `mile` (length, 44 sampled), `USD` (currency, 60 of its 154 real pairings — 39% of that unit's entire real pairing space), `watt` (power, 29 sampled), `kilogram` (weight, 38 sampled) — 206 real page reads total, spanning five unrelated categories, including several deliberately extreme partners (`ronnameters`, `petameters`, obscure ISO currency codes like `MRU`/`SSP`/`XPF`) chosen specifically to stress-test whether an obscure partner unit ever suppresses or alters the content.

---

## Where-used: trigger key vs. text key

**Result: zero variation found, in either presence or text, across all 206 samples.**

| Anchor | Pairings sampled | Present | Absent | Distinct texts |
|---|---|---|---|---|
| acre (area) | 35 | 35 | 0 | 1 |
| mile (length) | 44 | 44 | 0 | 1 |
| USD (currency) | 60 of 154 real pairings | 60 | 0 | 1 |
| watt (power) | 29 | 29 | 0 | 1 |
| kilogram (weight) | 38 | 38 | 0 | 1 |

Every single one of the acre's 35 sampled pairings — including with extremely obscure partners like `square-attometers` and `square-quettameters` — carries the FAQ, and every one carries the exact same sentence. Same for all four other anchors. No partner unit, however common or obscure, ever caused the FAQ to disappear or its text to change, for any of the 5 anchors tested.

A second, direct test confirmed *which* unit's sentence appears is determined by the page's from/to **role**, not a fixed property of one specific unit: `acres-to-hectares/` shows the acre's sentence; `hectares-to-acres/` (the reverse page) shows the hectare's sentence; `gallons-to-liters/` shows the gallon's sentence; `liters-to-gallons/` shows the liter's sentence. So the content shown is always about whichever unit is playing the "from" role on that specific page — but the CONTENT for that unit is constant regardless of what it's paired with, which is exactly what the existing `seoData.whereUsed[unit.id]` implementation already does: it inspects whichever unit name the real page's question text names (via `matchUnit()`, checking both `fromUnit` and `toUnit`) and looks that unit up by id. This mechanism does not, and does not need to, know or care about the partner unit at all.

```
WHERE_USED_TRIGGER_KEY = unit_id
WHERE_USED_TEXT_KEY = unit_id
```

**This directly contradicts** the claimed `dependency: unit_id + paired_unit_id` / `320,075 distinct from/to pairs`. 206 real-page samples across 5 unrelated categories, including deliberately extreme partner units chosen to try to trigger any pair-dependence, found none. If presence or text genuinely depended on the pair at the scale of 320,075 distinct outcomes, this sample — nearly 40% of one single unit's (USD's) entire real pairing space — would be extremely likely to have surfaced at least one deviation. It surfaced zero.

**Decision: the prior audit's pair-level trigger claim is rejected, with evidence; the existing unit-keyed implementation is retained unchanged.** No code change was made or is needed — `translateFaqItems`'s existing `seoData.whereUsed[unit.id]` lookup already matches reality.

*(For contrast, the same anchor method was also applied to the separate "What is the difference between X and Y?" FAQ item, which — unlike where-used — showed genuinely sparse, partner-dependent presence: e.g. only 1 of 29 `watts-to-*` pairings sampled carried a difference-between item, and it appeared specifically on the pairing involving `metric-horsepower`. That item's key structure is a real pair/family-conditioned trigger, unlike where-used. This is consistent with the two items being architecturally different, and is noted here only to make clear the reconciliation method can and does detect pair-dependence when it's actually present — it isn't a method that would find "unit-keyed" no matter what. This item's key structure was already correctly implemented in the existing code, was not part of this reconciliation's assignment, and was not otherwise re-investigated.)*

---

## usageContext: authoritative source and architecture

**No artifact called `usageContext` — a data file, a generator script, a naming convention in the static HTML, or anything else — exists anywhere in this repository.** This was re-confirmed in this pass with the same search used in the correctness remediation report. The specific figures attached to it (14,048 keys, 253 texts, 145 units, 0 conflicts) do not correspond to any file this project can read.

Rather than stop at "cannot verify" a second time, this pass asked a narrower, answerable question: **is there real content in this repository's own generated HTML that plausibly *is* what "usageContext" was describing, under a different name?** Two real candidates exist:

1. **The where-used FAQ item**, reconciled above: unit-keyed, ~135 distinct units found in the broader (9,071-page) sample from the correctness-remediation pass, single text per unit. The claimed "145 units involved" is close to this real, measured figure (135, from a sample that was itself bounded and would likely grow somewhat with more sampling) — plausibly the same real feature, undercounted or overcounted by whatever process originally produced the "145" figure.
2. **The difference-between FAQ item**: real, but far sparser (35 distinct phrases found in the same 9,071-page sample) and, per this pass's finding, genuinely pair/family-conditioned rather than a clean single key — a much weaker match to "0 conflicting texts" against a single key.

Of the two, where-used is the far better fit: it is the one real per-unit content structure in this codebase that is (a) large enough in scope to plausibly scale toward a three-digit unit count, (b) provably governed by a single clean key with zero observed conflicts across a substantial, adversarially-chosen sample, and (c) already extracted from real static HTML into compact translation data with a working, tested runtime lookup — which is exactly the "compact, shared representation, not 327,527 regenerated pages" this task asked for, and it already exists rather than needing to be built.

**This report does not claim the "14,048/253" figures are proven correct, and does not claim usageContext-as-a-separate-thing has been found.** What it claims, on the evidence gathered: the real underlying content need this concept was very likely pointing at is the where-used mechanism, and that mechanism now has a verified-correct key and a working implementation. No new subsystem, no new data, and no invented text were added to reach this conclusion — the existing `whereUsed` dictionary and `seoData.whereUsed[unit.id]` lookup (curated from real page text, shipped in the correctness-remediation pass) is the answer, not a new build.

```
usageContext:
  authoritative source: real static HTML, the same "Where is X still used today?" FAQ item already
                         extracted into seoData.whereUsed
  dependency key: unit_id (not unit_id + paired_unit_id — see evidence above)
  runtime representation: seoData.whereUsed[unit.id], already implemented in translateFaqItems()
  implementation status: satisfied by the existing where-used mechanism; no separate subsystem
                          was built, because no separate real content source for one was found
```

---

## Final decision

```
usageContext architecture: PASS
Where-used architecture: PASS
Architecture reconciliation: PASS
Translation expansion ready: NO
```

**usageContext architecture: PASS** — on the basis that the real content this concept most plausibly referred to (where-used) has a verified key and a working runtime lookup already shipped; **not** on the basis that a `usageContext`-named subsystem or the specific 14,048/253/145 figures were confirmed to exist.

**Translation expansion ready: NO**, per explicit instruction — this pass was architecture reconciliation only. The where-used and difference-between datasets remain at their previously-documented bounded coverage (16 and 6 entries respectively, against a broader real scope of roughly 135+ and 35+ found by sampling); expanding either is deliberately deferred to a future, explicitly-scoped pass, not performed here.

No files outside this report were created or modified in this reconciliation. `app.js` and `i18n-seo/` remain exactly as the correctness-remediation pass left them.
