# START_NEW_CHAT — project briefing

Paste this into a fresh Claude conversation to continue development. (~950 words.)

## What this is
**Build Your Own Meal Plan** (brand "Fuel Kitchen") — a premium, dark-themed, UK-focused **meal-planning + nutrition-education** web app. Users build a day (breakfast, lunch, dinner, night-time snack), get full macro + 24-micronutrient dashboards, a balance score, recommendations and a shopping list. On top sits a reusable, **research-led Condition Support Engine** for **PCOS, Endometriosis and Menopause** that shows exactly what the evidence says, how strong it is, what outcome was measured, and where it's limited. It **never** diagnoses, treats or claims to cure.

Location: `C:\Users\Uncrowned\Desktop\Projects_CLAUDE\meal-plan-builder`. Read `docs/` first — especially `PROJECT_OVERVIEW`, `ARCHITECTURE`, `CONDITION_EVIDENCE`, `FOOD_ENGINE`, `CURRENT_STATE`.

## Stack
React 18 + TypeScript 5.6 (strict) + Vite 6 + Tailwind 3.4 + Lucide + Recharts. Node tooling via `tsx`; tests via Vitest; CoFID import via `xlsx`. **No backend** — client-only, localStorage persistence. Dev: `npm run dev` → http://localhost:5173.

Scripts: `typecheck`, `test`, `build`, `import-cofid`, `extract-recipe-foods`, `migrate-recipes`, `validate-evidence`, `validate-food`. Dev recipe-authoring tool at `#authoring`.

## Three domains (all under `src/`)
1. **Recipes/planner** — `data/recipes/*` (49 recipes: 13/12/12/12), `utils/*` (nutrition, filters, targets, score, recommendations, optimise, shopping, storage), core `components/*`. State lives in `App.tsx` (useState/useMemo); hash routing.
2. **Condition Support Engine** — `data/conditions/`: `types.ts` (schema), `references.ts` (**124 verified** citations), `evidence/{shared,pcos,endometriosis,menopause,claims}.ts` (**53 evidence items** = 20 shared/17/6/10, **8 claim cards**), `engine.ts` (registry), `matchers.ts`, `scoring.ts`, `recommendations.ts`; UI in `components/conditions/*`.
3. **Food-composition engine** — `data/food/`: `types.ts` (`CanonicalFood`/`CanonicalNutrition`), `conversions.ts`, `householdMeasures.ts`, `quality.ts`, `seedFoods.ts` (32), `foodStore.ts`, `providers/*` (cofidLocal, openFoodFacts, foodDataCentral, foodSearchService); `utils/recipeNutrition.ts` + `utils/recipeCalc.ts`. CoFID 2021 imported → `data/generated/cofid/` (2,886 records, gitignored).

## Non-negotiable rules
- **Research integrity:** never invent studies, DOIs, PMIDs, doses, durations. Unverifiable → exclude or flag. Every claim traces to `references.ts`.
- **Composition ≠ medical claim.** Food data = "what nutrients?"; only the evidence engine makes condition statements. A nutrient-rich food is never auto-labelled beneficial.
- **Biomarker ≠ symptom ≠ clinical outcome ≠ quality of life** — enforced by `OutcomeCategory`. Evidence graded **per outcome** (A/B/C/D), with `EvidenceSpecificity` (condition-specific/indirect/general/mechanistic/preclinical).
- **Config-driven:** no `if (condition === 'pcos')` in components — read the `ConditionDefinition`.
- **Missing ≠ 0:** optional nutrients stay `undefined`.
- **Categorical, not false-precision:** condition relevance is higher/moderate/lower/insufficient-data (never a clinical score); PCOS glycaemic is categorical (never an invented GI number).
- **Additive migration:** don't break the planner; keep recipe ids + the `NutritionData` display contract stable.
- **No brands / affiliate links / dosing prescriptions.** Supplements are a read-only evidence library; show *research* doses only.
- **UK spelling & metric units.**

## Current state (2026-07-12)
Green on typecheck/tests/build. The active workstream is the **recipe nutrition migration**: moving recipes off hand-authored numbers onto values calculated from CoFID. **Only 1/49 recipes (`bf-protein-porridge`) is fully linked**; the rest still show authored values (`effectiveNutrition` falls back). CoFID is imported. Live FDC is stubbed (needs a serverless proxy + key; key must never be client-side). OFF is live but its required `User-Agent` is stripped by browsers (should be server-proxied).

Known debt: `sodium`/`potassium` duplicated across `NutritionData` and `MicronutrientData`; duplicated accent-style maps; no component tests; `#authoring` unauthenticated; no Prettier/ESLint.

## Immediate next task (in progress — tasks 19–22)
Relink the remaining **48 recipes** to CoFID codes, then migrate:
1. **Auto-matcher** (`scripts/match-ingredients.ts`, to build): score each recipe ingredient against the 2,886 CoFID records with prep-state heuristics (detect "dry weight"/"drained"/"cooked" from notes), resolve grams via `resolveGrams`, assign `matchStatus` (verified/probable/manual-review-required), emit generated links + a review report. Skip the already-curated porridge.
2. **Curate** high-impact/prep-sensitive matches by hand — proteins (raw vs cooked chicken/beef/salmon), grains (dry vs boiled rice/pasta), drained tins, subtypes. Never match by first result.
3. **Wire** generated links into `data/recipes/ingredientLinks.ts`, run `extract-recipe-foods`, run `migrate-recipes` (thresholds: macros >10%, fibre >20%), **review each discrepancy before switching** a recipe from authored → calculated. Add ids to `FULLY_LINKED_RECIPE_IDS` only after review.
4. **Verify:** typecheck, tests, `validate-food`, build, browser-check (porridge + a rice + a drained-tin + a salmon recipe show CoFID provenance in `NutritionSourcesPanel`), mobile 375px, console clean.

After migration: recipe-library expansion (→180–240, coverage-matrix driven) is a **later** phase — do not create recipes before calc is trusted.

## How to add a condition
Add id to `ConditionId`, author a `ConditionDefinition` + `evidence/<condition>.ts`, register in `evidence/index.ts` + `engine.ts`. UI renders automatically. (Future candidates — perimenopause, T2D, insulin resistance, high cholesterol, hypertension, IBS, hypothyroidism — are **not** implemented; "PMOS" is intentionally excluded as it isn't a real diagnosis.)

## Working style expected
Research-first for evidence work (verify citations, report null findings, self-audit for overstatement). Run `validate-evidence`/`validate-food` after data changes. Keep accessibility (keyboard, focus, Esc-close, text labels not colour-only) and dark/mobile layout intact. Verify changes in the browser preview, not just typecheck.
