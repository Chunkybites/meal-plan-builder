# PROJECT_OVERVIEW

_Last updated: 2026-07-12. Companion docs: [ARCHITECTURE](ARCHITECTURE.md) · [DATABASE_SCHEMA](DATABASE_SCHEMA.md) · [CONDITION_EVIDENCE](CONDITION_EVIDENCE.md) · [FOOD_ENGINE](FOOD_ENGINE.md) · [CODING_STANDARDS](CODING_STANDARDS.md) · [API_DOCUMENTATION](API_DOCUMENTATION.md) · [ROADMAP](ROADMAP.md) · [CURRENT_STATE](CURRENT_STATE.md) · [START_NEW_CHAT](START_NEW_CHAT.md)._

## Vision
A premium, fitness-styled **meal-planning and nutrition-education** web app ("Build Your Own Meal Plan", brand "Fuel Kitchen"). Users build a full day of eating (breakfast, lunch, dinner, night-time snack), see a complete nutrition breakdown, and — optionally — turn on a **research-led Condition Support layer** for PCOS, Endometriosis or Menopause that shows *exactly what the evidence says, how strong it is, what outcome was actually measured, and where the research is limited*.

The defining principle: **the user can see not only what has been studied, but how strong the evidence is, what was actually measured, and where it falls short.** It is deliberately not a wellness blog, supplement funnel, or "hormone balancing" app.

## Target users
- People planning meals around macro/micro targets (fitness, general health).
- Women with PCOS, endometriosis or menopause who want *honest, cited* nutrition information rather than social-media claims.
- (Future) coaches/dietitians who need a defensible evidence layer.

## Core problems solved
1. Turn ingredient preferences into a nutritionally balanced day quickly and visually.
2. Give an accurate macro + 24-micronutrient picture with targets, a balance score and a shopping list.
3. Cut through misinformation: surface real, verified research per condition and per outcome, with evidence grades and explicit "what this does not prove" framing.
4. Move nutrition values off hand-authored numbers onto a reproducible **food-composition engine** (UK CoFID primary).

## Unique selling proposition
An **outcome-level, citation-verified evidence engine** fused into a working meal planner: shared interventions modelled once across conditions, biomarker-vs-symptom separation enforced by the type system, 124 verified references (real PMIDs/DOIs), "popular claim vs evidence" myth-busting, and a provider-independent food-composition layer with full data provenance.

## Current feature set (implemented)
- Ingredient-led meal builder (breakfast→lunch→dinner→snack→summary wizard), dietary/prep/calorie/protein filters, portion scaling (0.5×–4× + "adjust to fit targets").
- Macro dashboard, 24-micronutrient dashboard, nutritional balance score, gap-based recommendations, plan optimiser, aggregated shopping list, saved plans, favourites — all persisted to localStorage.
- **Condition Support Engine** (General default; one of PCOS/Endometriosis/Menopause active at a time): ingredient/recipe evidence panels, categorical condition-relevance, dynamic condition dashboards, Supplement Evidence Centre, Research Centre, Research Detail (with null findings), Popular-Claim cards, safety notices, methodology modal.
- **Food-composition engine**: provider-independent canonical model; UK CoFID 2021 imported (2,886 records); Open Food Facts live for branded/barcode; USDA FDC proxy adapter (stub); recipe-nutrition calculator from gram weights with provenance UI; dev-only recipe-authoring tool at `#authoring`.

## Planned / not-yet features
- Migrate all 49 recipes onto calculated nutrition (only 1 fully linked today).
- Recipe-library expansion (target ~180–240) after the engine is trusted.
- Real FDC backend proxy + key; barcode scanning; user accounts; weekly plans; more conditions (perimenopause, T2D, insulin resistance, high cholesterol, hypertension, IBS, hypothyroidism — **not** implemented).

## Current development status
Working prototype. Meal planner + condition engine + food engine are all wired and pass typecheck/tests/build. The **recipe nutrition migration is mid-flight**: nutrition is still hand-authored for 48/49 recipes; the calc engine is live and used for the 1 fully-linked demo recipe (porridge), falling back to authored values otherwise.

## Technical stack
- **UI:** React 18.3 + TypeScript 5.6 (strict), Vite 6, Tailwind CSS 3.4, Lucide icons 0.469, Recharts 2.15.
- **Data tooling (Node, via `tsx` 4.23):** `xlsx` 0.18.5 for CoFID import; Vitest 4.1.10 for tests.
- **Persistence:** browser localStorage only (no backend yet).
- **External data:** UK CoFID (local import), Open Food Facts (live), USDA FoodData Central (proxy stub).

## Folder structure (top level)
```
meal-plan-builder/
  src/
    types.ts                     # legacy display contract (Recipe, NutritionData, MicronutrientData…)
    App.tsx, main.tsx            # shell + hash routing + state
    data/
      recipes/                   # 49 recipes + ingredientLinks.ts (migration links)
      ingredients.ts, microDefs.ts
      conditions/                # Condition Support Engine (types, engine, matchers, scoring, recommendations, evidence/*)
      food/                      # canonical food model, conversions, providers, foodStore, seedFoods
      generated/cofid/           # imported CoFID artefacts (gitignored data)
    utils/                       # nutrition, filters, targets, score, recommendations, optimise, shopping, storage, recipeNutrition, recipeCalc, validateEvidence
    components/                  # core UI + components/conditions/* + components/dev/RecipeAuthoring
  scripts/                       # import-cofid, extract-recipe-foods, migrate-recipes, validate, validate-food-data
  data-sources/cofid/            # place official CoFID.xlsx here (gitignored)
  docs/                          # this documentation set + evidence/audit reports
```

## Major dependencies
`react`, `react-dom`, `recharts`, `lucide-react` (runtime); `typescript`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `vitest`, `tsx`, `xlsx` (dev/tooling).

## Development philosophy
- **Research integrity is non-negotiable.** No invented studies, DOIs, PMIDs, doses or durations. Unverifiable → excluded or flagged. Every claim is traceable to a central reference.
- **Composition ≠ medical claim.** Food data answers "what nutrients?"; only the evidence engine makes condition statements. A nutrient-rich food is never auto-labelled beneficial.
- **Biomarker ≠ symptom ≠ clinical outcome ≠ quality of life** — enforced structurally (`OutcomeCategory`).
- **Config-driven, not branched.** No `if (condition === 'pcos')` in components; conditions are data.
- **Missing ≠ zero.** Optional nutrients stay `undefined`.
- **Additive migration.** Never break the working planner; keep recipe ids and the display contract stable.
- **Accessible, dark, mobile-first.** Keyboard nav, focus management, Esc-to-close, text labels alongside colour.
