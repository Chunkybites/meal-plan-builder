# CONDITION_EVIDENCE

The evidence engine — the heart of the app. Source of truth: `src/data/conditions/`. Full research narratives and the integrity audit live in `docs/CONDITION_SUPPORT_REPORT.md` and `docs/PCOS_EVIDENCE_REPORT.md`. **Every claim in the app traces to a verified reference; nothing here is invented.**

## Design principles (enforced in types)
- **One reusable engine, config-driven.** No `if (condition === …)` in UI. A `ConditionDefinition` declares tracked outcomes, dashboard metrics, relevance factors and recommendation rules; components render from it.
- **Graded per OUTCOME, not per intervention.** e.g. omega-3 can be B for one outcome, D for another.
- **`OutcomeCategory` separates** `biochemical-marker` / `symptom` / `clinical-outcome` / `quality-of-life`. A marker change is never rendered as symptom relief.
- **`EvidenceSpecificity`** records `condition-specific | indirect-clinical | general-population | mechanistic | preclinical`. General-population evidence is never shown as if proven in the condition.
- **Shared interventions = one entity, many links** (`ConditionEvidenceItem.conditions: ConditionEvidenceLink[]`).
- **Popularity ≠ evidence.** Weak/marketed items are included but clearly labelled, and countered by Popular-Claim cards.

## Files
`types.ts` (schema) · `references.ts` (**124** central verified refs) · `evidence/shared.ts` (**20** multi-condition) · `evidence/pcos.ts` (**17**) · `evidence/endometriosis.ts` (**6**) · `evidence/menopause.ts` (**10**) · `evidence/claims.ts` (**8** cards) · `evidence/index.ts` (`ALL_EVIDENCE`) · `engine.ts` (registry) · `matchers.ts` · `scoring.ts` · `recommendations.ts` · `../../utils/validateEvidence.ts`.

## Evidence hierarchy & rating
Source priority: guidelines → NICE/NHS → Cochrane → systematic reviews → meta-analyses → RCTs → controlled trials → cohort → observational. Grades:
- **A** stronger (guideline support / multiple SR-MA / consistent high-quality RCTs)
- **B** moderate (several consistent human studies, real limitations)
- **C** emerging (small/short/preliminary)
- **D** insufficient/conflicting (mostly observational/mechanistic, or inadequate)

No PCOS/endo/menopause intervention here reaches **A** on the verified base; grades cluster B–D by design.

## How recommendations are generated
`generateConditionRecommendations(def, selections, targets, recipeById)`: builds the day dashboard, then runs the condition's `recommendationRules`; each rule's `trigger` (e.g. `fibre-low`, `no-oily-fish`, `refined-carbs`, `protein-uneven`, `low-calcium-foods`, `no-soy-foods`, `has-evidence-ingredients`, `gi-symptom-note`) is evaluated against the dashboard and fires template text with `{value}`/`{list}` filled. **Wording is bounded by stored evidence** — the runner never strengthens a claim. Recipe/ingredient evidence surfaces via `matchers.ts` matching `item.matchKeywords` to recipe ingredient text; relevance via `scoring.ts` (categorical only).

## Confidence / relevance scoring
`computeRelevance` sums each `RelevanceFactor.weight × factorFraction(0..1)` → 0–100, then maps to a **categorical** label: `insufficient-data` if too few factors are assessable, else `higher ≥65 / moderate ≥42 / lower`. Unassessable factors use a neutral 0.5. This is an **educational planning signal, never a clinical score**, always shown with its factor breakdown. PCOS additionally shows a **categorical glycaemic descriptor** (`assessGlycaemic`: favourable-carb share + fibre → lower/moderate/higher) — explicitly "not a measured GI value".

## Citation strategy
One central `references.ts`; items/outcomes/interactions/claims reference by id (no duplication). Each `ResearchReference` has real `pubmedId`/`doi`/`url`, a `verification` tier (`independently-verified` / `agent-verified` / `listing-verified`), and study-detail fields (`population`, `comparator`, `duration`, `keyFindings`, **`nullFindings`**, `limitations`, `note` for retraction/EoC/COI). The Research Detail modal deliberately surfaces null findings.

---

## General Nutrition
Default mode; no condition layer. Uses the standard macro/micro dashboards, balance score and general recommendations (`utils/`). No condition claims.

## PCOS (accent fuchsia · 12 tracked outcomes · 7 dashboard metrics · 8 relevance factors · 7 rules)
- **Tracked outcomes:** total/free testosterone, free androgen index, SHBG, DHEAS, hirsutism, acne, insulin resistance/HOMA-IR, fasting insulin/glucose, HbA1c, menstrual regularity, ovulation, lipids, weight/waist, quality of life.
- **Relevance factors (sum 100):** fibre 22, carb-quality 18, protein 18, unsaturated-fat 12, omega3 8, added-sugar 8, plant-diversity 8, evidence-linked 6.
- **Evidence highlights (per-outcome):** *Myo-inositol* B for insulin/HOMA-IR (surrogate), C menses/ovulation, D weight; comparable to metformin on surrogates, better tolerated. *Low-GI/Mediterranean pattern* B for insulin sensitivity/ovulation. *Spearmint tea* C for lowering testosterone (marker) but **D for objective hirsutism** (30-day trials too short for hair-growth cycle). *Berberine* B metabolic surrogates but pregnancy-contraindicated. *Vitamin D* B testosterone/CRP, mainly deficiency correction. *Magnesium/selenium/melatonin* largely D (markers only). *The 40:1 inositol ratio is NOT proven optimal* (see claims).
- **Foods to favour / limit:** favour higher-fibre, wholegrain, legume, oily-fish, unsaturated-fat, lower-added-sugar patterns; limit predominantly refined carbohydrate. Framed as planning relevance, never "good/bad for PCOS".

## Endometriosis (accent sky · 9 outcomes · 8 metrics incl. a separate GI-symptom-support panel · 7 factors · 6 rules)
- **Tracked outcomes:** dysmenorrhoea, chronic pelvic pain, dyspareunia, dyschezia, GI/bloating symptoms, fatigue, inflammatory & oxidative markers, quality of life, analgesic use, lesion/fertility where studied. **Pain is tracked separately from inflammatory markers.**
- **Relevance factors (sum 100):** fruit-veg-diversity 25, fibre 20, omega3 18, wholefood-proportion 15, oily-fish 12, plant-diversity 5, evidence-linked 5.
- **Evidence highlights:** most food evidence is **observational risk-of-developing** (NHS II cohort: citrus/fruit ↓risk, red/processed meat ↑risk, trans fat ↑risk, dairy ↓risk) — *not* treatment. *Melatonin* B for pelvic pain (one RCT, marker BDNF kept separate). *Vitamin C+E* B pain (two small RCTs). *NAC* C — only uncontrolled cohorts, "does not treat endometriosis". *Omega-3* endo pain pilot null; *curcumin/resveratrol* negative RCTs (foregrounded). *Low-FODMAP* B for **overlapping IBS-type GI symptoms only**, D for endometriosis itself — surfaced in the separate GI-symptom-support panel, never as lesion treatment. *Gluten-free* D (single uncontrolled study, no coeliac screen). ESHRE 2022 / NICE NG73 recommend **no** specific diet.

## Menopause (accent amber · 13 outcomes · 9 metrics · 9 factors · 6 rules)
- **Tracked outcomes:** vasomotor (hot-flush frequency/severity, night sweats), sleep, mood/anxiety/depression, bone mineral density/turnover/fracture, muscle/lean mass/strength, LDL/HDL/triglycerides, blood pressure, insulin sensitivity, body composition, genitourinary where studied, quality of life. **BMD is tracked separately from fracture risk.**
- **Relevance factors (sum 100):** protein 22, calcium-foods 14, fruit-veg-diversity 12, protein-distribution 12, oily-fish 10, soy-foods 10, wholegrain 7, vitamin-d-foods 8, evidence-linked 5.
- **Evidence highlights:** *Soy isoflavones* B for hot-flush frequency (genistein-dose & equol-producer dependent; food ≠ supplement). *Creatine + resistance training* B strength (training-driven; creatine alone unproven; 2-yr RCT null for BMD — geometry only). *Vitamin D/calcium* no fracture reduction in replete community-dwellers; value = deficiency correction. *Black cohosh* D (no better than placebo; liver flag; extract non-generalisable). *Flax lignans / omega-3* null for hot flushes. **Foods/supplements are never positioned as HRT replacements** — HRT has a different, stronger evidence base and clinical role.

## Future conditions (NOT implemented)
Perimenopause, type-2 diabetes, insulin resistance, high cholesterol, hypertension, IBS, hypothyroidism. Addable by: add `ConditionId`, author a `ConditionDefinition` + `evidence/<condition>.ts`, register in `evidence/index.ts` + `engine.ts`. UI then renders automatically.

## Mechanisms & contraindications
Each item carries an optional `mechanismSummary` (labelled mechanistic, weak) and a full `SafetyProfile` (`safetySummary`, `contraindications`, `medicationInteractions` with `documented|potential|insufficient-information` status, and pregnancy/breastfeeding/TTC notes). Notable safety: berberine avoid in pregnancy (kernicterus) + CYP/P-gp; St John's Wort documented interactions (contraception/tamoxifen/SSRIs/warfarin); black cohosh hepatotoxicity; metformin→B12; omega-3 bleeding marked low-significance per 2024 meta-analysis. Only credibly-sourced interactions are shown.

## Popular claim vs evidence (8 cards, `evidence/claims.ts`)
`claim-spearmint`, `claim-40to1`, `claim-seed-cycling`, `claim-gluten-endo`, `claim-dairy-inflammatory`, `claim-soy-oestrogen`, `claim-creatine-kidneys`, `claim-black-cohosh-hrt`. Each: the claim, what the evidence shows, why it may mislead, an evidence grade, and references — neutral, non-mocking, crediting the kernel of truth.

## Integrity checks
`npm run validate-evidence` (`validateEvidence.ts`): duplicate/missing/broken reference ids, missing PMIDs/DOIs (warn), duplicate DOIs/PMIDs, per-item missing `lastEvidenceReview`/`safetySummary`/zero links, outcomes without references, relevance-factor weight sums outside 90–110, missing disclaimers, unused references. Run before shipping evidence changes.
