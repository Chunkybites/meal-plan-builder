# Condition Support Engine — Research & Architecture Report

**Prepared:** 2026-07-12 · **Status:** pre-implementation checkpoint · **Process:** 6 parallel literature reviewers (endometriosis diet + supplements, menopause diet + supplements, guidelines/safety, myth cards) under a strict no-fabrication rule; PCOS reused from the earlier verified review; a diverse citation sample independently re-verified by the lead.

This document is the single source of truth for refactoring the single-condition PCOS layer into a reusable **Condition Support Engine** serving PCOS, Endometriosis and Menopause. It is nutrition **education**, never diagnosis or treatment.

---

## 0. Governing honesty rules (apply to all three conditions)

1. **Biomarker ≠ symptom ≠ clinical outcome ≠ quality of life.** A CRP/testosterone/HOMA-IR/BMD/LDL change is a *surrogate*. It is never rendered as symptom relief. Pain outcomes are tracked separately from inflammatory markers; BMD separately from fracture; ovulation separately from live birth.
2. **Specificity is always shown:** condition-specific / indirect-clinical / general-population / mechanistic / **preclinical**. General-population or animal data never masquerade as condition-specific human evidence.
3. **Guidelines endorse almost nothing.** The 2023 PCOS guideline endorses no supplement and no single diet; **ESHRE 2022 and NICE NG73 recommend no diet or supplement for endometriosis**; **NICE NG23** keeps HRT first-line for menopause and only notes "some evidence" for isoflavones/black cohosh with safety caveats. The engine communicates this.
4. **Placebo response is large** in vasomotor (20–59%) and pain trials — uncontrolled "it worked" reports are treated as uninterpretable.
5. **"PMOS" is not a real diagnosis** (carried over from the prior review) — not offered.

---

## 1. Existing application architecture assessment

A Vite + React 18 + TypeScript + Tailwind + Recharts SPA. Meal-building state (`selections`, `targets`, `favourites`, `savedPlans`, `pcosMode`) lives in `App.tsx`, persisted through `utils/storage.ts` (`STORAGE_KEYS`). Recipes flow through `data/recipes/index.ts` (`ALL_RECIPES`/`getRecipe`). Nutrition maths in `utils/nutrition.ts`; filtering in `utils/filters.ts`; general recommendations in `utils/recommendations.ts`. The step flow (`ProgressTracker` → `MealBuilder` per slot → summary dashboards) is intact and must not regress. Everything is additive-friendly: components accept optional props, and the summary composes independent sections.

## 2. Existing PCOS implementation assessment

Already built and verified (see `docs/PCOS_EVIDENCE_REPORT.md`):
- **Data:** `data/pcos/{types,references,evidence,matchers,scoring}.ts` — but the shape is **single-condition**. `ConditionEvidenceItem` holds a flat `outcomes[]`, an `isSupplement` boolean, `matchKeywords`, and a PCOS-only `Condition = 'pcos'`.
- **Components:** `components/pcos/{pcosCommon,IngredientEvidencePanel,PcosModeToggle,PcosSafetyNotice,PcosRelevanceScore,ResearchMethodologyModal,PcosDashboard,SupplementEvidenceCentre}.tsx`.
- **Wiring:** `pcosMode` boolean in `App.tsx`; badges on `RecipeCard`/`IngredientSelector`/`RecipeDetailsModal`; summary renders dashboard + supplement centre.

**Verdict:** the PCOS content and component *patterns* are excellent and reusable; the *types* and *registry* are the part that must be generalised. This is a refactor-and-extend, not a rewrite. ~35 PCOS evidence items and ~48 references migrate wholesale.

## 3. Proposed Condition Support Engine architecture

```
data/conditions/
  types.ts            # ConditionId, ConditionDefinition, shared evidence model
  references.ts       # ONE central reference store (all conditions)
  engine.ts           # registry: getCondition(id), CONDITIONS, evidence lookups
  matchers.ts         # generic evidence↔recipe/ingredient linking (condition-scoped)
  scoring.ts          # generic relevance engine driven by per-condition factor configs
  recommendations.ts  # generic rule runner driven by per-condition rule lists
  evidence/
    index.ts          # merges all interventions; dedupes shared ones
    shared.ts         # interventions linked to >1 condition (omega-3, vit D, NAC, curcumin, magnesium, Mediterranean…)
    pcos.ts           # PCOS-only interventions + PCOS ConditionDefinition
    endometriosis.ts  # endo-only interventions + definition
    menopause.ts      # menopause-only interventions + definition
    claims.ts         # PopularClaim cards
components/conditions/
  ConditionSelector.tsx        # General / PCOS / Endo / Menopause cards
  IngredientEvidencePanel.tsx  # reusable (condition-aware)
  ConditionDashboard.tsx       # renders metric modules from active ConditionDefinition
  ConditionRelevance.tsx       # categorical relevance chip + breakdown
  SupplementEvidenceCentre.tsx # condition filter → outcome filter → sort
  ResearchCentre.tsx           # browse all interventions; search + filters
  ResearchDetailModal.tsx      # per-study detail incl. NULL findings
  PopularClaimCard.tsx         # claim vs evidence
  ConditionSafetyNotice.tsx    # general + supplement variants
  ResearchMethodologyModal.tsx # source hierarchy + grading (shared)
```

Core UI reads `getCondition(activeId)` and renders from its `trackedOutcomes`, `dashboardMetrics`, `relevanceFactors` and `recommendationRules`. **No `if (condition==='pcos')` in components.** Adding a condition = add a `ConditionDefinition` + evidence items + register it.

## 4. Proposed shared evidence schema (TypeScript)

```ts
type ConditionId = 'pcos' | 'endometriosis' | 'menopause';           // extensible
type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
type EvidenceSpecificity = 'condition-specific' | 'indirect-clinical' | 'general-population' | 'mechanistic' | 'preclinical';
type EvidenceDirection = 'improved' | 'reduced' | 'increased' | 'mixed' | 'no-significant-effect' | 'insufficient-evidence';
type OutcomeCategory = 'symptom' | 'biochemical-marker' | 'clinical-outcome' | 'quality-of-life';  // enforces the biomarker≠symptom rule
type InterventionType = 'food' | 'beverage' | 'nutrient' | 'supplement' | 'dietary-pattern';
type InteractionStatus = 'documented' | 'potential' | 'insufficient-information';

interface ConditionOutcomeDefinition { id: string; label: string; category: OutcomeCategory; group: string; }
interface DashboardMetricDefinition { id: string; label: string; kind: 'fibre'|'protein-distribution'|'omega3-sources'|'plant-diversity'|'carb-quality'|'added-sugar'|'calcium'|'vitamin-d'|'soy-foods'|'fruit-veg-diversity'|'wholefood-proportion'|'oily-fish'|'evidence-linked'; note: string; }
interface RelevanceFactor { id: string; label: string; weight: number; evaluator: 'fibre'|'protein'|'carb-quality'|'added-sugar'|'unsaturated-fat'|'omega3'|'oily-fish'|'legumes'|'wholegrain'|'plant-diversity'|'fruit-veg-diversity'|'wholefood-proportion'|'calcium'|'vitamin-d'|'soy-foods'|'evidence-linked'; }
interface RecommendationRule { id: string; when: 'fibre-low'|'no-oily-fish'|'refined-carbs'|'low-plant-diversity'|'protein-uneven'|'low-calcium-foods'|'no-soy-foods'|'has-evidence-ingredients'|'gi-symptom-note'; buildText: 'template-key'; tone: 'positive'|'suggestion'; }

interface ConditionDefinition {
  id: ConditionId; name: string; shortName: string; tagline: string; description: string;
  whatItTracks: string[]; trackedOutcomes: ConditionOutcomeDefinition[];
  dashboardMetrics: DashboardMetricDefinition[]; relevanceFactors: RelevanceFactor[];
  recommendationRules: RecommendationRule[]; outcomeFilterGroups: string[];
  disclaimer: string; researchMethodologyNotes: string[]; accent: 'volt'|'fuchsia'|'sky'|'amber';
}

interface EvidenceOutcome {
  outcomeId: string; label: string; category: OutcomeCategory;
  direction: EvidenceDirection; evidenceLevel: EvidenceLevel;
  summary: string; clinicalRelevance?: string; referenceIds: string[];
}
interface ConditionEvidenceLink {
  conditionId: ConditionId; outcomes: EvidenceOutcome[];
  specificity: EvidenceSpecificity; evidenceSummary: string; overallNote: string;
  studiedPopulation: string; limitations: string[];
}
interface SafetyProfile {
  safetySummary: string; contraindications: string[];
  medicationInteractions: { medicationOrClass: string; status: InteractionStatus; summary: string; referenceIds: string[] }[];
  pregnancyConsiderations?: string; breastfeedingConsiderations?: string; tryingToConceiveConsiderations?: string;
}
interface ConditionEvidenceItem {
  id: string; interventionName: string; interventionType: InterventionType; aliases: string[];
  conditions: ConditionEvidenceLink[];                 // SHARED across conditions — the key change
  mechanismSummary?: string; studiedDose?: string; studiedDuration?: string;
  safety: SafetyProfile; matchKeywords: string[];
  isSupplement: boolean; referenceIds: string[]; lastEvidenceReview: string;
}
interface ResearchReference {                          // central store
  id: string; title: string; authors?: string; year: number; journal?: string;
  studyType: 'guideline'|'systematic-review'|'meta-analysis'|'randomised-controlled-trial'|'controlled-trial'|'cohort'|'observational'|'mechanistic'|'cochrane-review'|'umbrella-review'|'reference'|'other';
  doi?: string; pubmedId?: string; url: string;
  verification: 'independently-verified'|'agent-verified'|'listing-verified'; note?: string;
}
interface PopularClaim {
  id: string; conditionIds: ConditionId[]; claim: string;
  whatEvidenceShows: string; whyMisleading: string;
  evidenceLevel: EvidenceLevel; referenceIds: string[];
}
```

`OutcomeCategory` is the structural enforcement of the biomarker≠symptom rule: the UI can render a "biochemical marker" chip distinctly from a "symptom" chip everywhere automatically.

---

## 5–7. Research findings by condition (tiered)

### PCOS (reused, verified earlier)
- **B (surrogate-level):** myo-inositol (HOMA-IR), low-GI pattern (insulin/ovulation), berberine (metabolic/androgen markers; pregnancy-contraindicated), probiotics (HOMA-IR), L-carnitine (weight); vitamin D (testosterone/CRP), omega-3 (lipids).
- **C:** cinnamon (menses), curcumin supplement (glycaemia), spearmint tea (androgen markers only), walnuts/almonds, flaxseed, ALA, CoQ10, chromium, Mediterranean, zinc, green tea, resveratrol, folate/B12.
- **D / null:** the 40:1 ratio "optimal" claim, D-chiro-inositol alone, magnesium, selenium, melatonin, ginger, secondary whole foods.

### Endometriosis
- **B:** low-FODMAP diet for **overlapping IBS-type GI symptoms only** (EndoFOD RCT); melatonin 10 mg for pelvic pain & analgesic use (one RCT); vitamin C+E combined for pain (two small RCTs). Observational **risk** signals (not treatment): higher fruit/citrus, long-chain omega-3, lower red/processed meat, lower trans-fat, higher dairy — all NHS II cohort.
- **C:** Mediterranean diet (single-arm, pain), NAC (uncontrolled cohorts — endometrioma size/pain), omega-3 supplement (pilot RCT null but plausible), probiotics (dysmenorrhoea only, non-durable), vitamin D (mixed).
- **D / null / preclinical:** curcumin monotherapy (negative RCT), resveratrol (negative RCT), gluten-free diet (uncontrolled, no coeliac screen — no lesion evidence), low-nickel diet (uncontrolled pilot), quercetin/lactoferrin/CoQ10/ALA (preclinical), magnesium/zinc (no endo trial), EVOO/nuts/seeds as isolated foods.

### Menopause
- **A/B (general → menopause):** oat/barley β-glucan & pulses for LDL (A, general-population extrapolation); PREDIMED Mediterranean + EVOO/nuts for CV events (A general, B menopause).
- **B:** soy isoflavone extracts (high-genistein) & S-equol for hot-flush frequency/severity; energy-restricted Mediterranean diet for cardiometabolic markers; creatine **+ resistance training** for upper-body strength/bone geometry; vitamin K2 (MK-7) for BMD; higher protein + RT / protein adequacy for lean mass; omega-3 for triglycerides; soy for LDL.
- **C:** red clover (small/borderline), melatonin (BMD surrogate/sleep), collagen peptides (single trial BMD), magnesium (sleep), blueberry (BP), vitamin D (deficiency correction), protein distribution (acute MPS only), B vitamins (deficiency).
- **D / null:** flaxseed for hot flushes (phase III null), omega-3 for vasomotor/sleep/mood (MsFLASH null), dairy for BMD/fracture across transition (SWAN null), calcium+D supplements for hip fracture (WHI null; USPSTF against routine use), black cohosh for vasomotor (Cochrane: no better than placebo) + **liver flag**, leucine alone.

## 8–11. Cross-condition tiers (headline)
- **Strongest per condition:** PCOS → myo-inositol / low-GI; Endo → low-FODMAP (GI only) & melatonin (pain); Menopause → soy isoflavones (vasomotor) & creatine+RT (strength).
- **Moderate:** as tiered above.
- **Emerging:** spearmint, NAC-endo, red clover, collagen, blueberry, etc.
- **Weak/overstated:** 40:1 ratio, gluten-free-for-endo, flaxseed-for-hot-flushes, black-cohosh-as-HRT, omega-3-for-vasomotor.

## 12. Popular claims where evidence is overstated (8 cards, all verified)
Spearmint "lowers testosterone/clears hair" (biochemical only, hirsutism unchanged — C/D); 40:1 "proven optimal" (D — rests on one 7-arm open-label n=56 + commentary); "seed cycling balances hormones" (D — rotation protocol untested); "gluten causes endometriosis" (D — one uncontrolled study, no causation); "dairy is inflammatory" (D — RCT review shows neutral/anti-inflammatory); "soy raises oestrogen/is dangerous" (D — no estradiol change; neutral-to-protective for breast cancer; food ≠ high-dose supplement); "creatine damages women's kidneys" (D — serum-creatinine artifact, no harm in healthy kidneys); "black cohosh is natural HRT" (D — not an oestrogen, no better than placebo, liver signal).

## 13. Major safety issues
- **Berberine (PCOS):** avoid in pregnancy/breastfeeding (neonatal kernicterus); CYP/P-gp interactions.
- **Black cohosh (menopause):** hepatotoxicity (LiverTox likelihood A); avoid after breast cancer.
- **St John's Wort (menopause mood):** documented interactions with hormonal contraception, tamoxifen, SSRIs, anticoagulants.
- **Isoflavones/red clover:** not advised after breast cancer (precautionary).
- **Calcium supplements:** contested CV/kidney-stone signal at high dose; prefer dietary calcium.
- **Vitamin D:** UL ~4000 IU/day; toxicity → hypercalcaemia.
- **Restrictive diets (gluten-free, low-nickel, blanket low-FODMAP):** nutritional-adequacy and disordered-eating risks; low-FODMAP must be framed as short-term, dietitian-supervised elimination-and-reintroduction.

## 14. Important medication-interaction areas
Glucose-lowering drugs/metformin (berberine, chromium, ALA — additive; metformin→B12 depletion documented); anticoagulants/antiplatelets (omega-3 — not clinically significant per 2024 meta-analysis; NAC/curcumin — insufficient); hormonal contraception / HRT / tamoxifen (St John's Wort — documented); hormone-sensitive conditions (isoflavones, red clover, black cohosh — precautionary). All rendered as Documented / Potential / Insufficient-information only.

## 15. Major evidence gaps
Endometriosis: almost no RCTs of whole-food diets; nearly all food data are observational *risk-of-developing* (reverse causation likely); no supplement has adequate evidence to be recommended. Menopause: virtually all bone results are BMD/turnover surrogates — **no food/supplement here shows fracture reduction**; perimenopause- and surgical-menopause-specific data are thin. PCOS: surrogate-heavy, small, geographically narrow, some Expressions of Concern. All three: guidelines decline to recommend specific diets/supplements.

## 16. Proposed dashboard metrics per condition
- **PCOS:** fibre; protein distribution; carbohydrate quality; added sugar; plant diversity; oily-fish/omega-3 sources; evidence-linked ingredients. (Existing.)
- **Endometriosis:** fruit & vegetable diversity; fibre; omega-3 / oily-fish sources; plant diversity; whole-food proportion; evidence-linked ingredients. **Separate "GI symptom support" panel** explicitly labelled *not a treatment for endometriosis*.
- **Menopause:** daily protein + per-meal distribution; calcium-food sources; vitamin-D food sources; oily-fish sources; soy-food exposure; fruit & vegetable diversity; wholegrain sources; evidence-linked ingredients. Wording: "Your selected meals provide approximately…", never "You are deficient in…".

## 17. Proposed recommendation architecture
`utils/recommendations.ts` stays as the **general** engine. New `data/conditions/recommendations.ts` runs a condition's `recommendationRules` against the day's computed metrics, and every rule's wording inherits evidence-strength language from the evidence DB (no rule may claim more than the stored `evidenceLevel`). Menopause adds protein-distribution and calcium-food rules; endometriosis adds oily-fish and an explicit GI-vs-endo separation rule.

## 18. Files to create
`data/conditions/{types,references,engine,matchers,scoring,recommendations}.ts`; `data/conditions/evidence/{index,shared,pcos,endometriosis,menopause,claims}.ts`; `components/conditions/{ConditionSelector,IngredientEvidencePanel,ConditionDashboard,ConditionRelevance,SupplementEvidenceCentre,ResearchCentre,ResearchDetailModal,PopularClaimCard,ConditionSafetyNotice,ResearchMethodologyModal}.tsx`; `utils/validateEvidence.ts` + a dev check script; this report.

## 19. Files to modify
`App.tsx` (replace `pcosMode:boolean` with `activeCondition: ConditionId|'general'`; render `ConditionSelector`, condition-scoped dashboard/centre/recommendations); `utils/storage.ts` (new key `activeCondition`, migrate old `pcosMode`); `RecipeCard.tsx`, `IngredientSelector.tsx`, `RecipeDetailsModal.tsx`, `MealBuilder.tsx` (accept `conditionId` instead of `pcosMode`); `README.md`.

## 20. Migration plan for existing PCOS implementation
1. Port `data/pcos/references.ts` → `data/conditions/references.ts` (add `cohort`/`mechanistic` study types; keep verification flags).
2. Transform each PCOS `ConditionEvidenceItem` (flat `outcomes`) → new shape with a single `conditions:[{conditionId:'pcos', outcomes, specificity, …}]` link; move `overallNote`/`limitations` into the link; wrap safety fields into `SafetyProfile`. Interventions shared with endo/menopause (omega-3, vitamin D, NAC, curcumin, magnesium, melatonin, Mediterranean, probiotics, CoQ10, ALA, resveratrol, flaxseed) become **one** item with multiple condition links.
3. Generalise `matchers.ts`/`scoring.ts` to take a `ConditionDefinition` (PCOS factor config reproduces current behaviour).
4. Replace `components/pcos/*` with `components/conditions/*` (the PCOS components are ~90% reusable; parametrise copy by `ConditionDefinition`). Keep `docs/PCOS_EVIDENCE_REPORT.md`.
5. Delete `data/pcos/` and `components/pcos/` once parity is verified. `pcosMode:true` in localStorage migrates to `activeCondition:'pcos'`.
6. Verify existing PCOS behaviour is byte-for-byte equivalent before adding endo/menopause content.

---

## Per-condition evidence tables (condensed; full narratives in §5–7 sources)

### PCOS (representative)
| Intervention | Type | Outcome | Rating | Specificity | Research exposure | Duration | Limitation |
|---|---|---|---|---|---|---|---|
| Myo-inositol | supplement | HOMA-IR | B | condition-specific | 2–4 g/day | 8–24 wk | surrogate; very-low GRADE |
| MI:DCI 40:1 | supplement | "optimal ratio" | D | condition-specific | 40:1 ~4 g/day | 3 mo | one 7-arm open-label trial + commentary |
| Spearmint tea | beverage | free testosterone | C | condition-specific | 2 cups/day | 30 d | marker only |
| Spearmint tea | beverage | objective hirsutism | D | condition-specific | 2 cups/day | 30 d | no effect (p=0.12); too short for hair cycle |
| Low-GI pattern | dietary-pattern | insulin/ovulation | B | condition-specific | whole diet | wks–mo | weight-confounded |
| Berberine | supplement | HOMA-IR/androgens | B | condition-specific | ~1–1.5 g/day | 12 wk–6 mo | bias; **pregnancy: avoid** |

### Endometriosis
| Intervention | Type | Outcome | Rating | Specificity | Research exposure | Duration | Limitation |
|---|---|---|---|---|---|---|---|
| Low-FODMAP | dietary-pattern | IBS-type GI symptoms | B | condition-specific | <5 g FODMAP/day | 28 d | GI only; **NOT lesion/endo treatment**; short-term protocol |
| Melatonin | supplement | pelvic pain, analgesic use | B | condition-specific | 10 mg nightly | 8 wk | single RCT (n=40) |
| Vitamin C+E | supplement | pelvic pain | B | condition-specific | C 1000 mg + E 800–1200 IU | 8 wk | two small trials |
| NAC | supplement | endometrioma size / pain | C | condition-specific | 600 mg ×3, 3 days/wk | 3 mo | uncontrolled cohorts; no RCT |
| Omega-3 | supplement | pelvic pain | C | condition-specific | 1000 mg ×2/day | 8 wk | pilot RCT null/underpowered |
| Fruit/citrus | food | endometriosis *risk* | B | condition-specific | ≥1 citrus/day | 22 yr cohort | observational; reverse causation |
| Red/processed meat | food | endometriosis *risk* | B | condition-specific | >2 servings/day | 22 yr cohort | observational |
| Gluten-free | dietary-pattern | pain | D | condition-specific | GF diet | 12 mo | uncontrolled; no coeliac screen; no lesion data |
| Curcumin (mono) | supplement | pain | D (negative) | condition-specific | 500 mg ×2/day | 8 wk | negative RCT |
| Resveratrol | supplement | pain | D (negative) | condition-specific | 40 mg/day + OCP | 42 d | negative RCT |
| Quercetin / lactoferrin / CoQ10 | supplement | — | D | preclinical | — | — | no human trial |

### Menopause
| Intervention | Type | Outcome | Rating | Specificity | Research exposure | Duration | Limitation |
|---|---|---|---|---|---|---|---|
| Soy isoflavones (high-genistein) | food/supplement | hot-flush frequency | B | condition-specific | ~54 mg/day (genistein >18.8 mg) | 6 wk–12 mo | heterogeneous; equol status; <HRT |
| S-equol | supplement | hot flushes | B | condition-specific | 10 mg/day | 12 wk | small; non-producers |
| Creatine + resistance training | supplement | upper-body strength | B | condition-specific | 3–5 g/day (or 0.1–0.14 g/kg) | ≥24 wk | **training-driven; alone unproven** |
| Creatine + RT | supplement | BMD | C/D | condition-specific | 0.14 g/kg/day | 2 yr | larger trial null for BMD (geometry only) |
| Vitamin K2 (MK-7) | supplement | BMD | B | condition-specific | 180 µg/day | 3 yr | surrogate; no fracture data |
| Higher protein + RT | food/supplement | lean mass | B | condition-specific | ~1.0–1.2 g/kg/day | wks–mo | training-driven; small increment |
| Protein distribution | dietary-pattern | muscle | C | general (non-menopausal) | ~30 g × 3 meals | days | acute MPS; older-adult RCTs null |
| Omega-3 | supplement | triglycerides | B | condition-specific | ≥1 g/day | ≤16 wk | biomarker; LDL may rise |
| Omega-3 | supplement | vasomotor/sleep/mood | D (null) | condition-specific | 1.8 g/day | 12 wk | MsFLASH null |
| Flaxseed | food | hot flushes | D (null) | condition-specific | 7.5–40 g/day | 6–12 wk | phase III null |
| Calcium + vitamin D | supplement | hip fracture | D (null) | condition-specific | 1000 mg + 400 IU | ~7 yr | WHI null; USPSTF against routine use |
| Dairy | food | BMD/fracture | D (null) | condition-specific | <0.5–≥2.5 servings/day | longitudinal | SWAN null |
| Black cohosh | supplement | hot flushes | D | condition-specific | extract-dependent | 3–12 mo | no better than placebo; **liver flag** |

---

## Deep dives (verified)

**Spearmint (PCOS):** Grant 2010 RCT (PMID 19585478, n=42, 30 d) — total/free testosterone ↓ (p<0.05); **objective Ferriman–Gallwey hirsutism unchanged (p=0.12)**; only subjective self-rating improved; 30 d too short for the ~4–6 month hair cycle. Akdoğan 2007 (PMID 17310494, n=21, 5 d) free-T only. → testosterone **C**, objective hirsutism **D**.

**Inositol & 40:1 (PCOS):** myo-inositol B for insulin surrogates, comparable to metformin, better tolerated (Fitz 2024, PMID 38163998). The **40:1 "optimal" claim is D** — traces to a narrative review (Monastra 2017, PMID 27898267), a commentary (Roseff 2020), and one small open-label 7-arm dose-finding trial (Nordio 2019, PMID 31298405, n=56, ~8/arm), amid a strong industry-COI pattern.

**NAC (endometriosis):** only *uncontrolled* human data — Porpora 2013 (PMID 23737821, cohort with untreated comparison) and Anastasi 2023 (PMID 36981595, single-arm n=120, no control): within-group ↓ pain, ↓ endometrioma size, ↓ Ca125, spontaneous pregnancies. **No published placebo-controlled RCT verified.** → **C**; do not say NAC "treats" endometriosis.

**Omega-3 (endometriosis):** PurFECT1 pilot RCT (Abokhrais 2020, PMID 31951599, n=33, 8 wk) — a *feasibility* trial, **no significant between-arm pain difference**; olive-oil "placebo" may itself be active. Dysmenorrhoea (primary, non-endo) evidence is indirect. → **C**.

**Gluten-free (endometriosis):** rests on Marziali 2012 (PMID 23334113) — retrospective, uncontrolled, n=207, no coeliac screen; 75% "improved" but confounded by placebo, broader diet change, responder selection. Brouns 2023 critical review: not advised absent coeliac diagnosis. **No lesion evidence.** → **D**.

**Low-FODMAP (endometriosis):** EndoFOD RCT (Varney 2025, PMID 40319391, crossover, n=35) — 60% vs 26% GI responders (p=0.008); **endometriosis pain was not an endpoint**; GI symptoms occur irrespective of bowel infiltration. It is a short-term, dietitian-supervised elimination-and-reintroduction protocol. → **B for IBS-type GI symptoms; D for treating endometriosis**.

**Soy & isoflavones (menopause):** Taku 2012 (PMID 22433977) — flush frequency −20.6%, severity −26.2%; genistein >18.8 mg ~2× more potent. Franco 2016 JAMA (PMID 27327802) −1.31 flushes/day (modest, 74% high-RoB). S-equol (Aso 2012, PMID 21992596) −58.7% vs −34.5% placebo in non-producers. Cochrane pooled phytoestrogens inconclusive but flags high-dose genistein positive. **Equol-producer status, genistein dose, formulation and duration explain the disagreement.** Soy does not raise estradiol (Hooper 2009) and is neutral-to-protective for breast cancer (Chen 2014). → vasomotor **B**.

**Creatine (menopause):** the musculoskeletal signal is **conditional on resistance training** — Chilibeck 2023 (PMID 37144634, 2-yr RCT, n=237) **null for BMD** (geometry only); dos Santos 2021 meta (PMID 34836013) upper-body strength only, and only with ≥24 wk RT; cognition preliminary (n=36, non-monohydrate). Creatine **alone** unproven. Kidney-harm claim is a serum-creatinine artifact (no harm in healthy kidneys). → strength (with RT) **B**; BMD **C/D**.

**Vitamin D & calcium (menopause):** WHI CaD (Jackson 2006, PMID 16481635, n=36,282) — hip fracture **null** (HR 0.88), +1% BMD, ↑ kidney stones; Zhao 2017 JAMA (PMID 29279934, 51,145) no fracture benefit in community-dwellers; USPSTF 2024 recommends against routine low-dose supplementation. Value is **correcting deficiency**, not routine supplementation. → fracture prevention **D**; deficiency correction **B**.

**Protein distribution (menopause):** Mamerow 2014 (PMID 24477298) — even 30 g×3 gave +25% 24-h MPS, but **n=8, non-menopausal, acute biomarker**; Agergaard 2023 (PMID 37086618) **null in older adults** at the muscle level. → **C**; plausible and harmless, not proven for menopause outcomes.

---

## Research Integrity Audit (applied before finalising)

- **Single small trials not overvalued:** melatonin-endo (n=40), NAC-endo (uncontrolled), creatine-cognition (n=36), collagen/blueberry (single trials) all capped at B/C with the limitation stated.
- **General-population ≠ condition-specific:** β-glucan/pulses/nuts LDL data marked general-population extrapolation; PREDIMED flagged non-menopause; primary-dysmenorrhoea supplement data marked indirect, not endometriosis.
- **Animal/cell labelled preclinical and down-weighted:** quercetin, lactoferrin, CoQ10-endo, much of resveratrol/curcumin's "positive" literature — all D/preclinical, excluded from driving recommendations.
- **Biomarker ≠ symptom enforced structurally** via `OutcomeCategory`; e.g. melatonin-BDNF, vitamin C+E oxidative markers, cruciferous estrogen-metabolite ratio, all BMD/turnover results are tagged marker/biochemical, not symptom.
- **Statistical vs clinical significance:** soy −1.31 flushes/day, red clover −1.73 (borderline p, wide CI), BMD +1–4% all annotated as modest/uncertain clinical importance.
- **Null findings foregrounded:** curcumin-endo, resveratrol-endo, omega-3-vasomotor (MsFLASH), flaxseed-hot-flushes (phase III), dairy-fracture (SWAN), calcium+D-fracture (WHI), protein-distribution-in-elderly — all surfaced, not hidden.
- **Adverse events / dropouts / funding noted:** NAC-endo dropouts unreported (flagged); black cohosh hepatotoxicity; inositol industry COI; several menopause trials industry-linked/single-manufacturer.
- **Supplement marketing language removed:** no "boosts", "balances", "detoxes"; doses always "research has studied…".
- **Dietary patterns vs isolated foods distinguished:** WAVS "88% hot-flush reduction" attributed to soy+whole-diet not fruit/veg; Mediterranean cardiometabolic benefit attributed to energy restriction (equalled a non-Med comparator).
- **Food exposure vs supplement dose distinguished:** turmeric vs curcumin supplement; oily fish vs fish-oil capsules; culinary EVOO vs olive polyphenol extract; whole flaxseed vs isolated lignan.
- **Menopause stage vs perimenopause:** most data postmenopausal; perimenopause/surgical data thin — stated as a gap.
- **Endometriosis symptoms vs IBS overlap:** low-FODMAP confined to GI symptoms with an explicit "not a lesion treatment" boundary; the dashboard separates "GI symptom support" from "endometriosis nutrition".
- **Citation integrity:** ~90 references, real PMIDs/DOIs read off fetched pages; a lead-verified sample (Grant 2010, Fitz 2024, Teede 2023, Schwertner 2013, Chilibeck 2023, Varney 2025, Franco 2016, Cochrane antioxidants) all confirmed. Listing-verified and identifier-unverified items are flagged; nothing fabricated. A `validateEvidence.ts` utility will check for missing/duplicate reference ids, outcomes without references, missing review dates, and missing safety summaries.
