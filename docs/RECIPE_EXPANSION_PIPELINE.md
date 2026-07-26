# Recipe Expansion Pipeline — Phase 1 report, authoring standard & coverage matrix

_2026-07-12. Verified against code (source of truth), not just docs._

## PHASE 1 — Current recipe-pipeline assessment

### 1. How `bf-protein-porridge` is calculated
It is the only recipe in `FULLY_LINKED_RECIPE_IDS` (`ingredientLinks.ts:44`). Its 7 ingredients each have a reviewed `RecipeIngredientFoodLink` (canonical food id, `gramWeight`, `quantityBasis`). `getCalculatedNutrition` (`recipeCalc.ts`) builds `StructuredRecipeIngredient[]` from those links, calls `computeRecipeNutrition` (`recipeNutrition.ts`: Σ `per100g × grams/100`, ÷ servings; missing stays `undefined`; partial/basis-mismatch warnings; no mid-calc rounding), then bridges canonical→`NutritionData`/`MicronutrientData` via `canonicalToNutritionData`/`canonicalToMicronutrientData`.

### 2. ⚠️ CRITICAL: the calculated result is **not shown in the app**
`effectiveNutrition(recipe)` (the intended adapter) is defined in `recipeCalc.ts` **but imported nowhere except its own module**. Every consumer reads `recipe.nutrition`/`recipe.micronutrients` **directly**: `App.tsx` day totals (L105/117), `DailyMealSummary` (L87), `filters.ts` (L60, calorie/protein gate), `optimise.ts` (~15 refs), `utils/recommendations.ts` (L141/155), `conditions/scoring.ts` (L86/178/275/309) & `conditions/recommendations.ts` (L31), `RecipeCard` (L42), `RecipeDetailsModal` (L27), `SelectedMeal` (L31). The **only** place calculated values surface is `NutritionSourcesPanel` (provenance display) via `getCalculatedNutrition`. So today even the porridge card shows its **hand-authored** numbers; the calc engine is effectively dark.

### 3. What must be unified before scaling
The display path must actually route through the adapter. Introduce a **memoised `getRecipeNutrition(recipe)`** returning `effectiveNutrition`'s `{nutrition, micros, calculated}` and replace the ~10 direct `recipe.nutrition` reads with it. Only then does "calculated truth" reach the UI, filters, optimiser, dashboards and condition scoring. This is Phase 3 and is a **hard prerequisite** for calculated-only recipes.

### 4. Can new recipes safely use canonical nutrition immediately?
**Not yet.** Two blockers: (a) `Recipe.nutrition`/`micronutrients` are **required** by the type and read directly everywhere → a link-only recipe would show 0 kcal, be filtered out, and break the optimiser; (b) the adapter is unwired (point 2). After Phase 3 (wire adapter + make those fields optional + require new recipes to be fully linked), new recipes can be link-only/calculated.

### 5. Adapter / migration layer currently required
`effectiveNutrition` **is** the adapter — it just needs wiring + memoisation. No third model. A thin `getRecipeNutrition` resolver + a `Map` cache is the whole compatibility layer. Legacy recipes keep authored values as the fallback branch until each is linked and reviewed (`migrate-recipes` reports the delta before flipping).

### 6. Files to REUSE (do not duplicate)
`data/food/types.ts` (canonical model), `recipeNutrition.ts` (all maths + bridges), `recipeCalc.ts` (`effectiveNutrition`/`getCalculatedNutrition`/`isRecipeLinked`), `data/recipes/ingredientLinks.ts` (link store), `data/food/householdMeasures.ts` (`resolveGrams`), `data/food/foodStore.ts` (`getLocalFood`, `scoreFood`), `data/food/conversions.ts`, `data/food/quality.ts`, `data/generated/cofid/*` (2,886 records), `scripts/{migrate-recipes,validate-food-data,extract-recipe-foods,coverage-matrix}.ts`, `conditions/matchers.ts` (evidence linking).

### 7. Files to MODIFY (Phase 3 + pilot)
`src/types.ts` (make `nutrition`/`micronutrients` optional; add optional structured-ingredient/link metadata if chosen); the ~10 direct readers above → route through `getRecipeNutrition`; `data/recipes/ingredientLinks.ts` (+ pilot links) & `FULLY_LINKED_RECIPE_IDS`; `data/recipes/*` + `index.ts` (add pilot recipes); `scripts` (new validators); `README`.

### 8. Validators that already exist
`validate-food-data.ts` — duplicate food ids, non-numeric/negative nutrients, macro-mass >105 g/100g, Atwater energy tolerance (25%), sodium↔salt consistency, missing `dataQuality`/`provenance`, missing prep state; link checks (duplicate, unknown food id, non-positive grams, raw/cooked basis mismatch); composition↔evidence boundary (supplement keywords must not match foods). `migrate-recipes.ts` — per-recipe calculated-vs-authored discrepancy (macros >10%, fibre >20%). `validateEvidence.ts` — evidence integrity.

### 9. Validators still MISSING (build for the pilot)
- **Recipe-level**: duplicate recipe id; every recipe is *either* fully-linked *or* has authored nutrition (never neither); recipe **energy plausibility** (per-serving calculated kcal vs Atwater from calculated macros).
- **Allergen/dietary audit from ingredient data**: gluten-free / dairy-free / vegetarian / vegan / pescatarian / nut-free consistency vs linked foods + allergen flags (catch hidden allergens: soy sauce→wheat, Worcestershire→fish, pesto→milk/nuts, stock cubes, honey in "vegan", oats gluten handling).
- **Evidence-exposure-type** guard on recipe evidence (whole-food vs supplement) so supplement evidence never attaches to culinary amounts.

---

## PHASE 2 — Canonical recipe authoring standard

Reuse the existing `Recipe` (extended), **not** a competing model. Additions (all additive/optional so legacy recipes still typecheck):
- Make `nutrition?`/`micronutrients?` **optional**. A recipe MUST satisfy: fully-linked (calculated) **or** authored (legacy). New recipes = fully-linked, no authored numbers.
- Reuse existing fields: `id, name, description, mealCategories[], servings, prepTime, cookTime, difficulty, ingredients[], instructions[], dietaryTags[], allergens[], storage, mealPrep, substitutions[]`.
- Add optional: `reheating?: string`, `budget?: 'low' | 'medium' | 'high'`. (Provenance/completeness are **derived at runtime** from links via `getCalculatedNutrition` — not stored, avoiding a second representation.)
- Ingredients stay `RecipeIngredient { name, quantity, unit, category, note? }`; the canonical link (foodId, gramWeight, `quantityBasis`, matchStatus, prep note, optional) lives in `ingredientLinks.ts` keyed `${recipeId}::${lower(name)}` — one reviewed match per ingredient. `quantityBasis` ∈ `raw | cooked | drained | dried | reconstituted | edible-portion | as-served`. Avoid `unknown` for new recipes.
- **Household measures → grams** always via reviewed `resolveGrams` (egg 58 g, tbsp olive oil 13.5 g, tsp cinnamon 2.6 g, garlic clove 4 g, bread slice ~40 g, drained 400 g chickpea tin ≈ 240 g, protein scoop 30 g). No universal density assumptions; `resolveGrams` warns on assumptions.
- **Food matching:** search local CoFID first, match the correct preparation state, record the canonical food id + provenance, flag uncertain matches `manual-review-required`; never auto-accept a fuzzy top result; respect raw≠cooked, dry≠boiled, full-fat≠0%, before-drain≠drained, calcium-set≠unknown tofu.
- **Nutrition:** always calculated (`per100g × grams/100`, Σ, ÷ servings); never hand-typed; round only for display; show completeness + partial flags.
- **Evidence linking:** after calculation, `matchers.getRecipeEvidence` surfaces links, preserving exposure type; UI always states *"contains ingredients studied in relation to this condition — the complete recipe has not been clinically tested."* Supplement evidence never attached to food amounts.

---

## PHASE 4 — Coverage matrix (current 49 recipes)
Generated by `scripts/coverage-matrix.ts` (reproducible each batch).

- **Slots** (multi-slot): breakfast 16 · lunch 16 · dinner 19 · snack 17.
- **Primary base:** Chicken 7, Eggs 6, Greek yoghurt 5, Oats 3, Protein powder 3, Cottage cheese 3, Banana/Bread/Tuna/Turkey/Salmon/Beef 2 each, Chickpeas/Lentils/Quinoa/Prawns/White fish/Tofu/Pasta/Dark chocolate/Apple/Peanut butter 1 each.
- **Tags:** high-protein 36, high-fibre 33, nut-free 36, vegetarian 31, quick 29, under-20 26, budget 21, gluten-free 17, meal-prep 17, low-calorie 10, dairy-free 9, pescatarian 7, lower-fat 7, low-carb 3, **vegan 2**.
- **Evidence-linked recipes:** PCOS 49 · Menopause 48 · Endometriosis 32.
- **Nutrition source:** calculated 1 · authored 48.

### Genuine gaps (drive pilot design; not medical claims)
1. **Vegan** (only 2) and **dairy-free** (9) — under-served.
2. **Oily fish beyond salmon**: mackerel/sardines = 0; white fish = 1.
3. **Plant-protein mains**: tofu 1, tempeh 0, beans-as-primary 0, lentil/chickpea mains 1 each.
4. **Endometriosis** evidence-linked lower (32/49) — more fruit-veg-diversity / omega-3 / wholefood recipes help legitimately.
5. **Lower-calorie dinners** and **calcium-rich** (menopause) options are thin.
6. Everything is **authored** — the pilot must be **calculated**, proving the pipeline end-to-end.

---

## Pilot design (Phase 5) — 12 recipes, each a deliberate calculation test
(3 breakfast / 3 lunch / 3 dinner / 3 snack; also filling real gaps above)
1. **bf-** dry-oats overnight oats (dry-weight oats) + chia + berries — dairy-free option.
2. **bf-** eggs by item → edible grams (veg omelette).
3. **bf-** yoghurt/milk in g/ml (bowl) — calcium.
4. **ln-** raw chicken stated raw weight + barley (wholegrain) salad.
5. **ln-** cooked/dry rice unambiguous + drained tinned chickpeas — vegan.
6. **ln-** tuna/white-fish with dry-vs-cooked pasta explicit.
7. **dn-** salmon + lentil traybake (oily fish + legume).
8. **dn-** calcium-set tofu stir-fry + rice — vegan, menopause calcium.
9. **dn-** mackerel or sardines dish (fills oily-fish gap) + multiple vegetables.
10. **sn-** olive oil by household measure + gram weight (savoury).
11. **sn-** yoghurt + kiwi + walnut bowl (fruit + dairy).
12. **sn-** plant-based (soy) snack — soy foods (menopause), dairy-free.

Every ingredient → reviewed CoFID match (correct prep state), calculated nutrition, allergen/dietary audit from ingredient data, evidence links with exposure type. Ends with a validation report + **READY / NOT READY** verdict.
