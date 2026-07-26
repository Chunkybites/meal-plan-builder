# ARCHITECTURE

_How the systems connect. See [FOOD_ENGINE](FOOD_ENGINE.md), [CONDITION_EVIDENCE](CONDITION_EVIDENCE.md), [API_DOCUMENTATION](API_DOCUMENTATION.md) for depth._

## Overall shape
A **single-page React app, no backend**. All state is client-side; persistence is localStorage. External food APIs are optional enrichment reached through adapters; the core planner works fully offline. Three layered domains:

```
                    ┌──────────────────────── UI (React components) ────────────────────────┐
                    │  App.tsx (state + hash route) → MealBuilder / Summary / Condition UI   │
                    └───────────────┬───────────────────────────┬───────────────────────────┘
                                    │ reads                      │ reads
              ┌─────────────────────▼─────────┐      ┌───────────▼──────────────────────┐
              │  Condition Support Engine       │      │  Food-composition engine          │
              │  data/conditions/*              │      │  data/food/*                      │
              │  (evidence, config, scoring)    │      │  (canonical model, providers)     │
              └─────────────────────┬───────────┘      └───────────┬──────────────────────┘
                                    │ matches by ingredient keyword │ resolves ingredient→food→grams
              ┌─────────────────────▼───────────────────────────────▼──────────────────────┐
              │  Recipes (data/recipes/*) + ingredientLinks.ts + utils (nutrition/calc)       │
              └──────────────────────────────────────────────────────────────────────────────┘
```
**Boundary rule:** the food engine answers "what nutrients?"; the condition engine answers "what has research investigated?". They meet only at the ingredient-keyword level and never let composition imply a medical claim (enforced by `validate-food-data`).

## Frontend architecture
- **Entry:** `main.tsx` mounts `App`. `App.tsx` holds nearly all state (see State) and does lightweight **hash routing**: default planner vs `#authoring` (dev-only `RecipeAuthoring`).
- **Wizard flow:** `ProgressTracker` drives steps breakfast→lunch→dinner→snack→summary. `MealBuilder` orchestrates a slot: `IngredientSelector` → filtered `RecipeCard` grid (`RecipeFilters`) → `RecipeDetailsModal` → `SelectedMeal`.
- **Summary:** `DailyMealSummary`, `MacroDashboard`, `MicroDashboard` (Recharts), `NutritionScore`, `SmartRecommendations`, `OptimiseModal`, `ShoppingList`, `SavedPlans`.
- **Condition layer (additive):** `ConditionSelector` sets the active `SupportMode`. When a condition is active, `MealBuilder`/`RecipeCard`/`IngredientSelector` receive `condition` and render evidence badges → `IngredientEvidencePanel`; the summary gains `ConditionDashboard`, `SupplementEvidenceCentre`, `ResearchCentre`, `ConditionSafetyNotice`. No component branches on a condition id — they read the `ConditionDefinition`.
- **Presentation primitives:** `components/common.tsx` (`Modal`, `ProgressBar`, `NumberField`, `TagPill`, `EmptyState`); `components/conditions/conditionsCommon.tsx` (`EvidenceLevelBadge`, `OutcomeCategoryChip`, `ReferenceList`, `ConditionEvidenceButton`).

## Backend architecture
None today. Two seams are prepared for one:
- **FDC proxy** — `foodDataCentral.ts` calls `VITE_FDC_PROXY_BASE ?? '/api/fdc'`; a serverless function must inject `FDC_API_KEY` server-side (see [API_DOCUMENTATION](API_DOCUMENTATION.md)). Absent proxy → empty results, gracefully.
- **Open Food Facts** — called live from the browser; the required `User-Agent` is best set by a server proxy in production (browsers strip it).

## Component hierarchy (abridged)
```
App
├─ Header, ProgressTracker, ConditionSelector, NutritionTargetsForm
├─ MealBuilder (per slot)
│  ├─ IngredientSelector · RecipeFilters · RecipeCard[] · SelectedMeal
│  ├─ RecipeDetailsModal → NutritionSourcesPanel
│  └─ IngredientEvidencePanel (condition active)
├─ DailyMealSummary · MacroDashboard · MicroDashboard · NutritionScore
│  · SmartRecommendations · OptimiseModal · ShoppingList · SavedPlans
├─ ConditionDashboard · SupplementEvidenceCentre · ResearchCentre
│  (→ ResearchDetailModal, PopularClaimCard, IngredientEvidencePanel) · ConditionSafetyNotice
└─ Disclaimer   |   #authoring → RecipeAuthoring (dev)
```

## State management
Plain React `useState`/`useMemo` in `App.tsx` (no Redux/Zustand). Tracked: `mode`/route, active `SupportMode`, `dailyTargets`, per-slot `MealSelection`s, `favourites`, `savedPlans`, UI modals. Derived values (day totals, dashboards, scores, recommendations, relevance) are computed via `useMemo` from selections + active condition. Persistence via `utils/storage.ts` safe wrappers to **6 localStorage keys** (targets, selections, favourites, savedPlans, supportMode, plus schema/version guard). Missing/corrupt storage degrades gracefully.

## Routing
Hash-based only: `''` → planner, `#authoring` → dev recipe tool. No router library.

## Services
- **Food search** — `data/food/providers/foodSearchService.ts` fans out CoFID-local → FDC (fallback) → OFF (branded/barcode only); `resolveFoodById`, `lookupBarcode`.
- **Recipe nutrition** — `utils/recipeNutrition.ts` (canonical maths) + `utils/recipeCalc.ts` (`effectiveNutrition`: calculated when a recipe is fully linked, else stored authored values).
- **Condition engine** — `data/conditions/engine.ts` registry + `matchers.ts` (evidence↔ingredient), `scoring.ts` (relevance + dashboards), `recommendations.ts` (rule runner).

## Evidence engine (summary)
Central `references.ts` (124 verified) ← `evidence/{shared,pcos,endometriosis,menopause,claims}.ts` (53 items + 8 claims) ← `engine.ts` registry ← config-driven `matchers`/`scoring`/`recommendations` ← UI. Details in [CONDITION_EVIDENCE](CONDITION_EVIDENCE.md).

## Nutrition engine (summary)
Provider-independent `CanonicalFood`/`CanonicalNutrition` (per-100g, unit-suffixed, missing=undefined). Recipe ingredients link once to canonical foods with gram weight + `QuantityBasis`; `computeRecipeNutrition` sums `per100g × grams/100`, never rounding mid-calc, flagging partial/unresolved/basis-mismatch. Bridged back to the legacy `NutritionData`/`MicronutrientData` display contract. Details in [FOOD_ENGINE](FOOD_ENGINE.md).

## Food search (summary)
Local CoFID (2,886 records, lazy-loaded full set; a small `recipeFoods.json` bundled) + 32 manual seed foods; transparent 0–1 match scores; results always labelled by source; never auto-selects result #1.

## Meal generation
No AI generation. Users select from a curated recipe DB (49). "Generation" = filtering/ranking (`utils/filters.ts`) + optimisation (`utils/optimise.ts`, portion/recipe swaps toward targets). Recipe authoring is manual via the dev tool.

## User profiles
None yet — no accounts/auth. "Profile" = `dailyTargets` + active `SupportMode` in localStorage.

## AI integrations
None in the running app. (LLM-assisted *research* produced the evidence base offline; the app ships only verified static data.)

## API integrations
UK CoFID (offline import), Open Food Facts (live, branded/barcode), USDA FDC (proxy stub). See [API_DOCUMENTATION](API_DOCUMENTATION.md).

## Data flow (add a meal)
1. User picks ingredient → `filterRecipes` ranks recipes for the slot.
2. Add recipe → `MealSelection {recipeId, servings}` in `App` state → localStorage.
3. `effectiveNutrition(recipe)` returns calculated (if fully linked) or authored `NutritionData`; scaled by servings.
4. Day totals (`sumNutrition`/`sumMicros`) feed dashboards, score, recommendations, shopping list.
5. If a condition is active: `matchers` find evidence per recipe/ingredient; `scoring` yields categorical relevance + dashboard metrics; `recommendations` runs the condition rules.

## Error handling
Storage reads/writes wrapped (never throw). Provider failures resolve to `null`/empty (planner keeps working offline); `AbortError` re-thrown for cancellation. Recipe calc emits structured **warnings** (unresolved link, basis mismatch, partial nutrients) rather than fabricating values. UI shows empty states and "data unavailable"/"partial estimate" instead of fake zeros.

## Validation strategy
Two dev validators, both flag-not-delete: `validate-evidence` (`validateEvidence.ts` — reference integrity, per-outcome references, weight-sum, safety fields) and `validate-food` (`validate-food-data.ts` — impossible/negative nutrients, Atwater & sodium↔salt sanity, duplicate ids, missing links, and the composition↔evidence boundary). `migrate-recipes` reports calculated-vs-authored discrepancies against thresholds (10% macros / 20% fibre). Vitest covers conversions, household measures, recipe maths and search.
