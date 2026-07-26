# PCOS Support — Research Implementation Report

**Prepared:** 2026-07-12 · **Status:** pre-implementation evidence review · **Author process:** five parallel literature reviewers (PubMed / Cochrane / 2023 International PCOS Guideline / NICE / NHS) with a strict no-fabrication rule; a sample of load-bearing citations independently re-verified.

This document is the single source of truth for the PCOS evidence layer added to *Build Your Own Meal Plan*. Every `ConditionEvidenceItem` shipped in the app must trace back to a reference listed here. It is nutrition **education**, not medical advice, and never claims to diagnose, treat, cure or reverse PCOS.

---

## 0. Two honesty notes that shape the whole feature

1. **"PMOS — Polyendocrine Metabolic Ovarian Syndrome" is not a recognised medical diagnosis.** It does not appear in PubMed, the 2023 International Guideline, NICE or NHS. There is no distinct evidence base to build for it, and inventing one would violate the integrity rules of this brief. The data model therefore carries an extensible `Condition` type, but the **only** condition populated with evidence is **PCOS**. The UI states plainly that PMOS is not an established condition and that the evidence shown is PCOS-specific.
2. **The honest headline of the entire PCOS supplement/food literature:** almost every "positive" trial is **small (n≈40–90), short (8–12 weeks), heavily single-country (Iran-dominated), and reports biochemical *surrogate* markers** (HOMA-IR, testosterone, TAC) rather than the outcomes women care about (visible hirsutism, durable menstrual regularity, live birth). A cluster of these RCTs carries formal **Expressions of Concern**. The 2023 International Guideline endorses **no** supplement outright and supports **no single diet** over another. The feature is built to communicate that reality, not paper over it.

---

## 1. Interventions investigated (35)

**Supplements/nutrients (17):** myo-inositol, D-chiro-inositol, MI+DCI combination, the 40:1 ratio, vitamin D, omega-3, magnesium, chromium, alpha-lipoic acid, L-carnitine, CoQ10, NAC, berberine, curcumin, probiotics, synbiotics, selenium, zinc, melatonin, resveratrol, folate, vitamin B12.

**Foods/beverages (deep): ** spearmint tea, green tea, cinnamon, turmeric/curcumin-as-food, ginger, oily fish, nuts (walnut/almond), flaxseed. **Foods (secondary, honestly rated D):** berries, kiwi, citrus, avocado, EVOO, legumes, wholegrains, cruciferous veg, leafy greens, seeds, eggs, Greek yoghurt/fermented dairy.

**Dietary patterns:** low-GI/low-GL, Mediterranean, high-fibre.

---

## 2. Evidence grading system (applied at the OUTCOME level)

- **A — Stronger:** multiple relevant SRs/meta-analyses, high-quality RCTs, or strong guideline support.
- **B — Moderate:** several human intervention studies, reasonably consistent, important limitations remain.
- **C — Emerging:** small/short human trials, limited samples, preliminary but biologically plausible.
- **D — Insufficient/conflicting:** inconsistent, mainly observational/mechanistic, or currently inadequate.

**No PCOS intervention in this review reaches grade A for any outcome.** Popularity is never a reason to upgrade. A single item can hold different grades for different outcomes (e.g. myo-inositol B for HOMA-IR, C for menses, D for weight).

---

## 3. Findings by tier

### Best-supported (mostly B, still surrogate-heavy)
- **Myo-inositol** — **B** for fasting insulin / HOMA-IR (surrogates); **C** for androgens/menses/ovulation; **D** for weight and live birth. Roughly comparable to metformin on metabolic surrogates and **better tolerated**, but metformin remains superior for hirsutism and central adiposity (Fitz 2024, guideline-commissioned SR).
- **Low-GI / low-GL dietary pattern** — **B** for insulin sensitivity and ovulatory function; partly confounded by weight loss.
- **Inositol vs metformin** — **B**: broadly comparable on surrogates; metformin better for hirsutism/waist–hip; inositol far fewer GI side-effects.
- **Berberine** — **B** for HOMA-IR and androgen surrogates, **but** trials are largely open-label active-comparator (vs metformin), high risk of bias; **no** live-birth benefit; **pregnancy contraindication** (see safety).
- **Probiotics** — **B** (moderate certainty) for HOMA-IR only; **C** for androgens/hirsutism/inflammation.
- **L-carnitine** — **B** for weight/BMI; **B/C** for ovulation/pregnancy (often in combination with clomiphene/metformin); no live-birth data.

### Emerging (C)
- **Vitamin D** — **B** for small testosterone reduction and hs-CRP/lipids; insulin benefit conditional on daily low-dose or co-supplement; **D** for SHBG and hirsutism. Most plausible when correcting genuine deficiency.
- **Omega-3** — **B** for lipids (TG/TC/LDL); **conflicting (C/D)** for insulin resistance (two meta-analyses disagree); **D** for androgens. One PCOS fish-oil trial is **retracted**.
- **Cinnamon** — **C** for insulin resistance and menstrual cyclicity; **D** for androgens. Small, high-dropout trials.
- **Curcumin (supplement)** — **B/C** for glucose/insulin/HOMA-IR; **C/D** for androgens; null for lipids. Evidence is for concentrated supplements, **not culinary turmeric** (bioavailability).
- **Spearmint tea** — see §4 (flagship). **C** for lowering total/free testosterone; **D** for objective hirsutism.
- **Nuts (walnut/almond)** — **C**: walnuts ↑SHBG, almonds ↓free-androgen-index (one small PCOS RCT).
- **Flaxseed** — **C** for insulin/HOMA-IR; **C/D** for androgens.
- **Alpha-lipoic acid** — **B/C** for fasting glucose; **C** (low certainty) for HOMA-IR; **D** for androgens and, notably, oxidative-stress markers.
- **CoQ10** — **C** for glucose/HOMA-IR (single small RCT) and lipids (network-MA ranking); **D** for androgens.
- **Chromium** — **C** for HOMA-IR (fragile, 2-trial basis); **D** for fasting insulin.
- **Mediterranean diet** — **C** in PCOS (pilot/feasibility RCTs); strong general cardiometabolic base.
- **High-fibre pattern** — **C** for insulin resistance; largely observational/mechanistic in PCOS.
- **Zinc** — **C** for insulin resistance / oxidative stress (not isolated from other minerals).
- **Green tea** — **C** for weight/glycaemia (often extract, not brewed); **D** for androgens.
- **Resveratrol** — **C** for androgens (conflicting across MAs); **D** for insulin.
- **Folate** — **C** for homocysteine; **C/D** for insulin (integrity-flagged trial).
- **B12** — **C**: monitor ± supplement with long-term metformin (mechanism/cohort).

### Weak / conflicting / essentially null (D)
- **D-chiro-inositol alone** — **C** at best on tiny-trial signals; **D** for most metabolic markers; **high-dose DCI carries a plausible harm signal** (aromatase inhibition, oocyte quality).
- **The 40:1 MI:DCI ratio** — **D as "proven optimal."** The "optimal ratio" claim rests on a **narrative review** (Monastra 2017, whose title implies trial evidence but contains none) and a **commentary**; the only independent head-to-head data are very-low certainty, with a strong industry (Lo.Li. Pharma) conflict-of-interest pattern. Reasonable physiology-based default — **not** conclusively proven.
- **Magnesium** — **D**: standalone, no significant effect on any androgen/metabolic outcome.
- **Selenium** — **D**: raises antioxidant marker (TAC) only; not recommended routinely; selenosis/T2D-risk caution.
- **Melatonin** — **D**: TAC only; no metabolic/hormonal/fertility benefit in pooled data.
- **Ginger** — **D**: largely null in PCOS.
- **Secondary whole foods** (berries, kiwi, citrus, avocado, EVOO alone, wholegrains, cruciferous, leafy greens, seeds, eggs, yoghurt) — **D for PCOS-specific evidence**: benefits are general-population or mechanistic, i.e. part of an overall healthy pattern, not PCOS treatments.

---

## 4. Spearmint tea — flagship worked example

- **Akdoğan 2007** (Phytother Res; **PMID 17310494**): clinical trial, **n=21** hirsute women (12 PCOS + 9 idiopathic hirsutism), 1 cup **twice daily for only 5 days**. Free testosterone fell significantly; **total testosterone did not**; LH/FSH/oestradiol rose; DHEAS unchanged. No hirsutism scoring possible in 5 days. Hormonal-signal pilot only.
- **Grant 2010** (Phytother Res; **PMID 19585478**; DOI 10.1002/ptr.2900): the actual **randomised controlled trial**, **n=42**, all with PCOS + hirsutism, spearmint tea **twice daily for 30 days**. **Total and free testosterone significantly reduced (p<0.05)**; LH/FSH rose. **SHBG and DHEAS not reported.** Subjective self-rated hirsutism (DQLI) improved, **but the objective Ferriman–Gallwey score did NOT differ between groups (p=0.12).**

**How the app frames it:** "Small human trials have investigated spearmint tea for potential anti-androgen effects, and have reported reductions in free/total testosterone over 30 days. These are short, small studies measuring a **biochemical marker**. In the one randomised trial, **objective hirsutism did not significantly improve** — and 30 days is far shorter than the ~4–6 month hair-growth cycle needed for visible change. A drop in an androgen marker is **not** the same as visibly reduced hair growth." → **testosterone: C; objective hirsutism: D.**

---

## 5. Safety findings (medication interactions, pregnancy/TTC)

Status vocabulary: **Documented / Potential / Insufficient information.**

| Supplement | Interaction / context | Status | Source |
|---|---|---|---|
| Berberine | Pregnancy & breastfeeding — **avoid** (bilirubin displacement → neonatal kernicterus concern) | Documented caution | LactMed NBK501866 |
| Berberine | CYP2D6/2C9/3A4 substrates; ↑ cyclosporine/tacrolimus levels | Documented | MSKCC About Herbs |
| Berberine | Metformin / glucose-lowering drugs (additive hypoglycaemia) | Potential | MSKCC About Herbs |
| Metformin | Vitamin B12 depletion (higher risk ≥1500 mg/day, >4 yr) | Documented | Cureus 2024, PMID 39233729 |
| Omega-3 | Anticoagulants/antiplatelets (bleeding) | Potential, low clinical significance | JAHA 2024, PMID 38742535 |
| Melatonin | CYP1A2 inhibitors; CNS depressants (additive sedation) | Documented | StatPearls NBK534823 |
| Melatonin | Pregnancy/breastfeeding — avoid (insufficient safety data) | Documented caution | StatPearls NBK534823 |
| Melatonin | Warfarin/bleeding | Insufficient information | StatPearls NBK534823 |
| NAC | Nitroglycerin/nitrates (hypotension) | Documented | StatPearls NBK537183 |
| NAC | Anticoagulants/antiplatelets | Insufficient information | StatPearls NBK537183 |
| Chromium | Insulin/oral antidiabetics | Potential | DARE NBK196264 |
| Vitamin D | Upper limit 4000 IU/day; toxicity → hypercalcaemia | Documented | Indian J Anaesth 2021, PMID 33776129 |
| Myo-inositol | Pregnancy/TTC — studied *for* fertility; no adverse-effect signal (harms not formally graded) | No signal (≠ proven safe) | Cochrane CD011507.pub3 |

Universal supplement disclaimer shown in-app: research doses are educational, not personalised recommendations; supplements may interact with medication and may be inappropriate in pregnancy/breastfeeding/when trying to conceive; supplement quality/regulation differs from medicines.

---

## 6. Guideline anchor (2023 International Evidence-based PCOS Guideline; Teede 2023, PMID 37580314)

- Lifestyle (diet + exercise + behavioural) is **first-line for all**.
- **No single diet** is recommended over another — sustainable, individualised healthy eating.
- **Inositol: "could be considered"** (conditional, very-low-quality evidence; limited clinical benefit); metformin preferred for hirsutism/central adiposity.
- **No endorsement** of NAC, berberine, curcumin, probiotics, selenium, zinc, melatonin, resveratrol or routine folate.
- Supplement regulation/quality differs from pharmaceuticals — inform your clinician.

---

## 7. Major evidence gaps

- Almost no hard patient-important outcomes (visible hirsutism over ≥4–6 months, durable menstrual regularity, live birth).
- Trials small, short, geographically narrow; several under Expressions of Concern.
- Food evidence is dominated by capsules/extracts, not foods as eaten; no trial of oily fish *as food* in PCOS.
- Secondary whole foods lack PCOS-specific trials entirely.
- The 40:1 ratio lacks independent high-certainty head-to-head proof.

---

## 8. Proposed data architecture (TypeScript)

New module `src/data/pcos/` with `types.ts`, `evidence.ts` (the DB), `references.ts` (central, deduplicated), `matchers.ts` (evidence→food/recipe linking), and `scoring.ts` (relevance score + dashboard metrics). Core types:

```ts
type Condition = 'pcos';                       // extensible; only 'pcos' is populated
type EvidenceLevel = 'A' | 'B' | 'C' | 'D';
type EvidenceDirection =
  | 'improved' | 'reduced' | 'increased' | 'mixed'
  | 'no-significant-effect' | 'insufficient-evidence';
type InterventionType = 'food' | 'beverage' | 'nutrient' | 'supplement' | 'dietary-pattern';
type PcosOutcome =                              // the marker/symptom studied
  | 'total-testosterone' | 'free-testosterone' | 'free-androgen-index' | 'shbg'
  | 'hirsutism' | 'acne' | 'insulin-resistance' | 'fasting-insulin' | 'fasting-glucose'
  | 'homa-ir' | 'hba1c' | 'menstrual-regularity' | 'ovulation' | 'lipids'
  | 'triglycerides' | 'ldl' | 'hdl' | 'inflammation' | 'crp' | 'oxidative-stress'
  | 'weight' | 'waist' | 'fertility' | 'quality-of-life';
type EvidenceContext = 'pcos-specific' | 'indirect-metabolic' | 'general-population' | 'mechanistic';
type InteractionStatus = 'documented' | 'potential' | 'insufficient-information';

interface EvidenceOutcome {
  outcome: PcosOutcome; label: string;
  direction: EvidenceDirection; evidenceStrength: EvidenceLevel;
  summary: string; context: EvidenceContext; referenceIds: string[];
}
interface MedicationInteraction { drugOrContext: string; status: InteractionStatus; note: string; referenceIds: string[]; }
interface ResearchReference {
  id: string; title: string; authors?: string; year: number; journal?: string;
  studyType: 'systematic-review' | 'meta-analysis' | 'randomised-controlled-trial'
    | 'guideline' | 'controlled-trial' | 'observational' | 'cochrane-review' | 'other';
  doi?: string; pubmedId?: string; url: string;
  verification: 'independently-verified' | 'agent-verified' | 'listing-verified';
  note?: string;                               // e.g. "Expression of Concern"; "narrative review, not a trial"
}
interface ConditionEvidenceItem {
  id: string; condition: Condition;
  interventionName: string; interventionType: InterventionType; aliases: string[];
  outcomes: EvidenceOutcome[];
  overallNote: string;                         // never a single misleading universal grade
  evidenceSummary: string; mechanismSummary?: string;
  studiedDose?: string; studiedDuration?: string; studiedPopulation: string;
  limitations: string[]; safetyNotes: string[];
  contraindications: string[]; medicationInteractions: MedicationInteraction[];
  pregnancyTtcNote?: string;
  matchKeywords: string[];                      // for recipe/ingredient linking
  referenceIds: string[]; lastEvidenceReview: string;
}
```

## 9. Proposed UI changes (additive; nothing existing removed)

- **PCOS Support toggle** in the targets panel (persisted). Off by default → app behaves exactly as today.
- **RecipeCard / IngredientSelector:** a small **"PCOS Evidence"** badge when an item matches the DB → opens the **Ingredient Evidence Panel** ("Why might this be relevant to PCOS?").
- **PCOS Nutrition Relevance Score** on recipe cards (educational, clearly not clinical), with a categorical glycaemic descriptor ("Lower/Moderate/Higher glycaemic carbohydrate profile" / "Unable to estimate reliably").
- **Summary (PCOS mode adds):** PCOS Daily Dashboard (fibre, protein distribution, omega-3 sources, plant diversity, carbohydrate quality, added sugar where data supports it, evidence-linked ingredients); PCOS-aware recommendations (evidence-strength wording); **PCOS Supplement Evidence Centre** (filter by outcome, sort by strength/most-researched/A–Z); **Research Methodology** modal; condition-specific safety disclaimers.
- All references render as clickable links to PubMed/DOI. Charts keep numeric text equivalents; modals close on Esc; keyboard-navigable.

## 10. Files to create / modify

**Create:** `src/data/pcos/types.ts`, `references.ts`, `evidence.ts`, `matchers.ts`, `scoring.ts`; `src/utils/pcosRecommendations.ts`; components `PcosModeToggle.tsx`, `PcosEvidenceBadge.tsx`, `IngredientEvidencePanel.tsx`, `PcosRelevanceScore.tsx`, `PcosDashboard.tsx`, `SupplementEvidenceCentre.tsx`, `ResearchMethodologyModal.tsx`, `PcosSafetyNotice.tsx`; this report.

**Modify (additively):** `App.tsx` (pcosMode state + wiring), `storage.ts` (new key), `NutritionTargetsForm.tsx` (toggle), `RecipeCard.tsx` + `RecipeDetailsModal.tsx` (badge/score), `IngredientSelector.tsx` (badge), `MealBuilder.tsx` (pass-through), summary area in `App.tsx` (dashboard/centre/recommendations), `README.md`.

---

## 11. Verified reference list (identifiers read off real pages)

Independently re-verified by the lead during compilation: Grant 2010 (19585478), Akdoğan 2007 (17310494), Teede 2023 (37580314), Fitz 2024 (38163998), Showell 2020 Cochrane antioxidants (32851663).

**Inositols & guideline**
- Fitz V, et al. Inositol for PCOS: SR&MA to inform the 2023 guideline. *JCEM* 2024;109(6):1630–1655. PMID 38163998; DOI 10.1210/clinem/dgad762.
- Showell MG, et al. Inositol for subfertile women with PCOS. *Cochrane* 2018;12:CD012378. PMID 30570133; DOI 10.1002/14651858.CD012378.pub2.
- Unfer V, et al. Myo-inositol effects in PCOS: meta-analysis. *Endocr Connect* 2017;6(8):647–658. PMID 29042448; DOI 10.1530/EC-17-0243. *(COI: Lo.Li. Pharma)*
- Greff D, et al. Inositol is an effective and safe treatment in PCOS: SR&MA. *Reprod Biol Endocrinol* 2023;21:10. PMID 36703143; DOI 10.1186/s12958-023-01055-z.
- Roseff S, Montenegro M. Inositol treatment for PCOS should be science-based. *Int J Endocrinol* 2020;2020:6461254. PMID 32308679; DOI 10.1155/2020/6461254. *(commentary)*
- Zhang JQ, et al. Myo-inositol and metformin in PCOS: updated MA. *Eur Rev Med Pharmacol Sci* 2022;26(6):1792–1802. PMID 35363325; DOI 10.26355/eurrev_202203_28322.
- Monastra G, et al. Combining MI and DCI (40:1)… *Gynecol Endocrinol* 2017;33(1):1–9. PMID 27898267; DOI 10.1080/09513590.2016.1247797. *(narrative review, NOT a trial — despite the title)*
- Teede HJ, et al. Recommendations from the 2023 International Evidence-based Guideline for PCOS. *JCEM* 2023;108(10):2447–2469. PMID 37580314; DOI 10.1210/clinem/dgad463.

**Metabolic supplements**
- Zhang B, et al. Vitamin D in PCOS: MA of RCTs. *Heliyon* 2023. PMID 36942243; DOI 10.1016/j.heliyon.2023.e14291.
- Łagowska K, et al. Vitamin D and insulin resistance in PCOS: SR&MA. *Nutrients* 2018;10(11):1637. PMID 30400199; DOI 10.3390/nu10111637.
- Yang K, et al. Omega-3 for PCOS: SR&MA. *Reprod Biol Endocrinol* 2018;16:27. PMID 29580250; DOI 10.1186/s12958-018-0346-x.
- Sadeghi A, et al. Omega-3 and insulin resistance in PCOS: MA. *Diabetes Metab Syndr* 2017. PMID 27484441; DOI 10.1016/j.dsx.2016.06.025.
- Abu-Zaid A, et al. Magnesium and sex hormones/cardiometabolic risk in PCOS: SR&MA. *Medicina* 2025;61(2):280. PMID 40005397; DOI 10.3390/medicina61020280.
- Heshmati J, et al. Chromium and insulin-resistance indices in PCOS: SR&MA. *Horm Metab Res* 2018. PMID 29523006; DOI 10.1055/s-0044-101835.
- Abu-Zaid A, et al. Alpha-lipoic acid in PCOS: SR&MA. *Obstet Gynecol Sci* 2024. PMID 38044616; DOI 10.5468/ogs.23206.
- L-carnitine and fertility outcomes in PCOS: dose-response MA. *Obstet Gynecol Sci* 2025. PMID 40436023; DOI 10.5468/ogs.24272.
- Mohd Shukri MF, et al. L-carnitine for PCOS: SR&MA. *PeerJ* 2022;10:e13992. PMID 36132218; DOI 10.7717/peerj.13992.
- Samimi M, et al. CoQ10 in PCOS: RCT. *Clin Endocrinol* 2017. PMID 27911471; DOI 10.1111/cen.13288.
- Hu X, et al. Nutritional supplements in PCOS: network MA. *PeerJ* 2023;11:e16410. PMID 38025704; DOI 10.7717/peerj.16410.

**Botanical/other supplements**
- Viña I, et al. NAC in PCOS: SR&MA. *Nutrients* 2025;17(2):284. PMID 39861414; DOI 10.3390/nu17020284.
- Liu J, et al. NAC and metabolic parameters in PCOS: SR&MA. *Front Nutr* 2023;10:1209614. PMID 37841396; DOI 10.3389/fnut.2023.1209614.
- Thakker D, et al. NAC for PCOS: SR&MA. *Obstet Gynecol Int* 2015;2015:817849. PMID 25653680; DOI 10.1155/2015/817849.
- Showell MG, et al. Antioxidants for female subfertility. *Cochrane* 2020;8:CD007807. PMID 32851663; DOI 10.1002/14651858.CD007807.pub4.
- Xie L, et al. Berberine on reproduction and metabolism in PCOS: SR&MA. *Evid Based Complement Alternat Med* 2019;2019:7918631. PMID 31915452; DOI 10.1155/2019/7918631.
- Simental-Mendía LE, et al. Curcumin on glycaemic/lipid parameters in PCOS: SR&MA. *Reprod Sci* 2022. PMID 34655047; DOI 10.1007/s43032-021-00761-6.
- Cozzolino M, et al. Probiotics and synbiotics for PCOS: SR&MA. *Eur J Nutr* 2020. PMID 32372265; DOI 10.1007/s00394-020-02233-0.
- Talebi S, et al. Pro-/pre-/synbiotics in PCOS: umbrella review. *Front Nutr* 2023;10:1178842. PMID 37829729; DOI 10.3389/fnut.2023.1178842.
- Zhao J, et al. Selenium in PCOS: SR&MA. *BMC Endocr Disord* 2023;23:33. PMID 36740666; DOI 10.1186/s12902-023-01286-6.
- Ye J, et al. Mineral supplements and insulin resistance in PCOS: MA. *BMC Endocr Disord* 2026. PMID 41580698; DOI 10.1186/s12902-025-02158-x.
- Ziaei S, et al. Melatonin in PCOS: SR&MA. *J Ovarian Res* 2024;17:138. PMID 38965577; DOI 10.1186/s13048-024-01450-z.
- Fadlalmola HA, et al. Resveratrol in PCOS: SR&MA. *Pan Afr Med J* 2023;44:134. PMID 37333786; DOI 10.11604/pamj.2023.44.134.32404.
- Asemi Z, et al. Folate in overweight women with PCOS: RCT. *Mol Nutr Food Res* 2014. PMID 24828019; DOI 10.1002/mnfr.201400033. **Expression of Concern (2023) PMID 37655943.**

**Foods, beverages & dietary patterns**
- Grant P. Spearmint herbal tea… anti-androgen effects in PCOS: RCT. *Phytother Res* 2010;24(2):186–188. PMID 19585478; DOI 10.1002/ptr.2900.
- Akdoğan M, et al. Spearmint teas on androgen levels in hirsutism: clinical trial. *Phytother Res* 2007;21(5):444–447. PMID 17310494; DOI 10.1002/ptr.2074.
- Kort DH, Lobo RA. Cinnamon improves menstrual cyclicity in PCOS: RCT. *Am J Obstet Gynecol* 2014;211(5):487.e1–6. PMID 24813595; DOI 10.1016/j.ajog.2014.05.009.
- Kalgaonkar S, et al. Walnuts vs almonds on metabolic/endocrine parameters in PCOS: RCT. *Eur J Clin Nutr* 2011;65(3):386–393. PMID 21157477; DOI 10.1038/ejcn.2010.266.
- Chan CC, et al. Chinese green tea in obese PCOS: RCT. *(green tea)* PMID 16378915. *(listing-verified; page CAPTCHA-blocked)*
- Cinnamon powder and insulin resistance in PCOS: RCT. PMID 29250843. *(listing-verified)*
- Low glycaemic diet in PCOS and anovulation: RCT. PMID 29734548. *(listing-verified)*
- Omega-3 on androgen profile/menstrual status in PCOS: RCT. PMC3941370. *(listing-verified)*
- Flaxseed on metabolic status in PCOS: RCT. PMC6982376. *(listing-verified)*

**Safety sources**
- Bleeding risk with omega-3 PUFAs: SR&MA of RCTs. *JAHA* 2024. PMID 38742535; DOI 10.1161/JAHA.123.032390.
- Vitamin B12 deficiency with metformin. *Cureus* 2024. PMID 39233729; DOI 10.7759/cureus.68550.
- Antenatal myo-inositol for preventing GDM. *Cochrane* 2023. DOI 10.1002/14651858.CD011507.pub3.
- Melatonin — StatPearls NBK534823. · N-Acetylcysteine — StatPearls NBK537183. · Chromium — DARE NBK196264. · Goldenseal/berberine — LactMed NBK501866. · Berberine — MSKCC About Herbs. · Vitamin D toxicity — *Indian J Anaesth* 2021, PMID 33776129.

**Could not verify (excluded from claims):** NICE CKS PCOS (HTTP 403, UK-restricted); NIH ODS fact sheets (403); several individual RCT identifiers were listing-verified only (labelled in-app). No identifier was fabricated; anything unverifiable is marked or omitted.

---

## 12. Self-audit (applied before finalising)

Checked for and corrected: overstated conclusions (downgraded inositol/ALA/omega-3 language to surrogate-level); single-small-trial reliance (flagged CoQ10, walnut/almond, spearmint); supplement-marketing-as-evidence (40:1 ratio traced to review/commentary + COI); animal data generalised to humans (DCI harm signal kept as mechanistic/preclinical); general metabolic research presented as PCOS-specific (labelled every outcome with `context`); surrogate markers presented as symptom improvement (explicit throughout, especially spearmint→hirsutism); statistical vs clinical significance (stated for HOMA-IR shifts); null findings reported (magnesium, selenium, melatonin, omega-3-on-IR, spearmint-on-objective-hirsutism); conflicting evidence surfaced (omega-3, resveratrol, cinnamon); research-integrity issues named (Expressions of Concern; retracted fish-oil trial; Iran-cluster homogeneity). PMOS honestly flagged as not a recognised diagnosis.
