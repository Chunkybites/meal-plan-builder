# Food-composition & recipe-calculation engine — audit & implementation report

**Prepared:** 2026-07-12 · **Status:** pre-implementation checkpoint. No production nutrition code is changed until the architecture below is approved. Source terms verified live in [`docs/food-data-sources.md`](food-data-sources.md).

---

## PHASE 1 — Audit of the current application

### 1. How nutrition is currently stored
- `Recipe.nutrition: NutritionData` and `Recipe.micronutrients: MicronutrientData` are **hand-authored per single serving** (`src/types.ts`). They are **not** derived from ingredients.
- `NutritionData`: `calories, protein, carbs, fat, fibre` (required) + optional `sugar, addedSugar, saturatedFat, monounsaturatedFat, polyunsaturatedFat, omega3, omega6, cholesterol, sodium, potassium`.
- `MicronutrientData = Partial<Record<MicroKey, number>>` over 24 micros (vitamins A/B1–B12/C/D/E/K; calcium, iron, magnesium, phosphorus, potassium, sodium, zinc, copper, manganese, selenium, iodine). Reference values in `src/data/microDefs.ts` (mg/µg, general adult).
- `RecipeIngredient { name (free text), quantity, unit, category, note }` — **quantities are per one serving**; `unit` ∈ `g|ml|tsp|tbsp|small|medium|large|clove|slice|item|pinch|scoop|handful`. Ingredients currently feed **display, the shopping list, and condition keyword-matching only** — never nutrition.
- Persistence (`src/utils/storage.ts`): `selections`, `targets`, `favourites`, `savedPlans` (each `SavedMealPlan.totals` is a stored `NutritionData` snapshot), `activeCondition`. All JSON in `localStorage`.

### 2. Which calculations are hard-coded / derived
- **Hard-coded:** every recipe's per-serving macros and micros (the numbers themselves).
- **Derived at runtime:** `scaleNutrition`/`scaleMicros` (per-serving × servings multiplier), `sumNutrition`/`sumMicros` (daily totals), `pctOf` (vs targets), `scaleQuantity`/`buildShoppingList` (ingredient × servings, merged). The scaling maths is sound and reusable; only the *inputs* are hand-authored.

### 3. Recipes with incomplete nutrient data
- All 49 recipes carry the 5 core macros. Optional macro fields (added sugar, fat split, omega-3, cholesterol, potassium) are present unevenly. Micronutrients are partial by design (10–16 of 24 per recipe). There is **no completeness indicator** today.

### 4. Micronutrients unavailable
- No EPA/DHA/ALA split (only `omega3` in grams). No **salt** field (only `sodium` mg). No retinol vs β-carotene vs retinol-equivalent split for vitamin A. No trans fat, no added-sugar for many items, no water/alcohol. Vitamin D stored as µg (no IU).

### 5. Inconsistent units / duplication
- **`sodium` and `potassium` appear in BOTH `NutritionData` and `MicronutrientData`** — duplication risk and a real bug surface.
- **Sodium vs salt** never distinguished (salt = sodium × 2.5).
- `omega3`/`omega6` in grams but no mg-level EPA/DHA (the PCOS dashboard already, correctly, refuses to show EPA/DHA because the data lacks it).
- Household units (tsp/tbsp/slice/clove/item/…) have **no gram equivalents anywhere** — 281 such ingredient lines exist across the 49 recipes, all currently unusable for calculation.

### 6. Files requiring migration
- `src/types.ts` (extend, not break: keep `NutritionData`/`MicronutrientData` as the *display* contract; add canonical types alongside).
- `src/data/recipes/*.ts` (add structured ingredient→food links + gram weights + prep state; nutrition becomes **generated**).
- `src/utils/nutrition.ts` (add canonical scaling/sum/contribution helpers; keep existing signatures as adapters).
- `src/utils/shopping.ts` (unchanged interface; can consume gram weights).
- `src/data/conditions/scoring.ts` + `matchers.ts` (read canonical nutrient fields and structured ingredient categories instead of the free-text `nutrition` object; **behaviour preserved**).
- `src/data/conditions/*` evidence content is **unaffected** (medical evidence stays separate from composition).

### 7. Risks to existing saved meal plans
- `SavedMealPlan.totals` stores a `NutritionData` snapshot; `MealSelection` stores `{recipeId, servings}`. As long as `recipeId`s are stable and `NutritionData` remains the display shape, **saved plans keep working**. Migration must keep recipe ids stable and keep producing a `NutritionData` object (now generated) for the same fields. A schema-version marker will be added so old snapshots are read safely.

### 8. Proposed migration architecture
A **canonical food layer** feeds a **recipe-calculation engine**; recipes reference canonical foods through **reviewed ingredient links** with explicit **gram weights** and **preparation state**; generated per-serving `NutritionData`/`MicronutrientData` replaces the hand-authored numbers behind the *same* display contract. Providers (CoFID local, FDC proxy, OFF runtime) sit behind one interface; the browser reads local canonical data for saved recipes and only calls external APIs for authoring/branded lookups.

---

## Current nutrition-model weaknesses (summary)
Hand-authored (unverifiable, non-scalable) values; sodium/potassium duplicated across two objects; no salt/EPA/DHA/vitamin-A speciation; household units with no gram basis; missing-vs-zero ambiguity; no provenance, completeness, or data-quality signalling; no raw/cooked-state discipline.

---

## Proposed canonical schema (Phase 3)

`src/data/food/types.ts` — provider-independent. Highlights (full model as specified in the brief, refined):
- `CanonicalFood` { id, canonicalName, displayName, aliases, source (`cofid|usda-fdc|open-food-facts|manual-reviewed`), sourceRecordId, sourceDescription, sourceUrl?, recordType (`generic|branded|recipe|supplement|unknown`), foodGroup?, subcategory?, preparationState (`raw|cooked|boiled|steamed|fried|baked|grilled|roasted|drained|dried|reconstituted|unknown`), ediblePortion?, **nutrientsPer100g: CanonicalNutrition**, allergens?, ingredientsText?, barcode?, brand?, **dataQuality**, **provenance**, createdAt, updatedAt }.
- `CanonicalNutrition` — every field **unit-suffixed** (`energyKcal, proteinG, carbohydrateG, sugarsG, fibreG, fatG, saturatedFatG, monounsaturatedFatG, polyunsaturatedFatG, transFatG, omega3G, epaMg, dhaMg, alaMg, cholesterolMg, sodiumMg, saltG, potassiumMg, calciumMg, magnesiumMg, ironMg, zincMg, seleniumUg, iodineUg, vitaminAUg, retinolUg, betaCaroteneUg, vitaminDMcg, folateUg, vitaminB12Ug, vitaminCMg, …`). **All optional; missing = `undefined`, never 0.**
- `FoodDataQuality` { completenessPercentage, status (`verified-primary|verified-secondary|label-declared|estimated|incomplete`), warnings[] }.
- `FoodProvenance` { datasetName, datasetVersion?, retrievedAt, originalUnits?, transformations[] }.
- **Documented conversions** (a `conversions.ts` with unit tests): salt↔sodium (×2.5 / ÷2.5), µg↔mg, vitamin D µg↔IU (×40), never conflate folate vs folic acid, niacin vs niacin-equivalents, vitamin A retinol vs RE. Missing values propagate as missing.

## Provider architecture
`FoodDataProvider { searchFoods, getFoodById }` with three implementations:
- **CofidLocalProvider** — reads `src/data/generated/cofid/` + a search index; no network.
- **FoodDataCentralProvider** — calls a **server-side proxy** (`/api/fdc/*`) that injects `FDC_API_KEY`; timeout, retry-on-5xx, 429 backoff, response validation, nutrient-ID→canonical mapping, cache. **Never in the browser bundle with a key.**
- **OpenFoodFactsProvider** — runtime barcode/branded search, custom User-Agent, debounce, request cancellation, transient cache, incomplete-record flagging. **Runtime-only, never bundled** (ODbL).
A `foodSearchService` fans out CoFID → manual → FDC (fallback) → OFF (branded only) with transparent source labels and match scores; **never auto-picks result #1**.

## CoFID import plan
`scripts/import-cofid.ts` (Node, reads the official `.xlsx` from `data-sources/cofid/`): map columns→canonical, preserve food code/name/group, normalise units, convert `N`/`Tr`/blank correctly, detect duplicate codes & malformed numbers, emit `src/data/generated/cofid/{foods.json, index.json, meta.json, validation-report.json}`, keep source file out of the bundle. Reproducible and versioned. **Blocker in this sandbox:** the binary can't be downloaded here, so a **reviewed CoFID-cited subset** (real food codes, OGL-attributed) is authored for the ingredients the 49 recipes use, and the importer is delivered ready to run against the full file.

## Recipe migration plan
For each of the 49 recipes: structure ingredients → assign gram weight (household units via reviewed conversion records: 1 large egg ≈ 58 g, 1 tbsp olive oil ≈ 13.5 g, 1 tsp ground cinnamon ≈ 2.6 g, 1 garlic clove ≈ 4 g, 1 medium banana ≈ 118 g edible, 1 slice bread ≈ 40 g, 1 drained 400 g tin chickpeas ≈ 240 g, …) → tag prep state (raw/cooked/drained) → link to a canonical food (`matchStatus: verified|probable|manual-review-required`) → **calculate** nutrition → **compare with the existing hand-authored value** → emit a discrepancy report (flags: kcal/protein/carb/fat > 10 %, fibre > 20 %). Flags trigger review; nothing is silently overwritten.

## Recipe coverage analysis plan
After the engine is trusted, build a coverage matrix (meal type × protein × dietary tags × oily-fish/legume/wholegrain/calcium/soy × evidence-linked × prep time × budget × meal-prep) to find **genuine gaps** before authoring new recipes. Expansion to ~180–240 recipes is a **later, separate phase** — per the brief's ordering rule, not now.

## Exact files to CREATE
`src/data/food/{types,conversions,quality,provenance}.ts`; `src/data/food/providers/{provider,cofidLocal,foodDataCentral,openFoodFacts,foodSearchService}.ts`; `src/data/generated/cofid/{foods.json,index.json,meta.json}` (reviewed subset); `src/data/food/householdMeasures.ts`; `src/utils/recipeNutrition.ts` (contribution/total/per-serving/portion, canonical scaling/add/divide); `src/data/recipes/ingredientLinks.ts` (reviewed `RecipeIngredientFoodLink[]`); `scripts/import-cofid.ts`, `scripts/validate-food-data.ts`; `server/` (or `api/`) FDC proxy stub + `.env.example`; components `NutritionSourcesPanel.tsx`, and a dev-only `RecipeAuthoring` route; `docs/food-data-sources.md` (done), this report; tests under `src/**/__tests__` + a test runner (Vitest).

## Exact files to MODIFY (additively)
`src/types.ts` (add canonical types + a `nutritionSource`/`completeness` field on `Recipe`, keep `NutritionData` as display contract); `src/data/recipes/*.ts` (attach links + generated nutrition); `src/utils/nutrition.ts` (adapters over canonical maths); `src/data/conditions/scoring.ts` + `matchers.ts` (read structured categories/canonical fields — behaviour preserved); `src/components/RecipeDetailsModal.tsx` (add the "Nutrition data sources" expandable + engine disclaimer); `src/components/Disclaimer.tsx` (add the estimate/provenance wording); `README.md`; `package.json` (vitest, tsx, import/validate scripts).

## Risks & mitigations
| Risk | Mitigation |
|---|---|
| CoFID binary not downloadable in sandbox | Ship reviewed **cited subset** now; deliver reproducible importer for the real file. |
| No backend/serverless + no FDC key here | Build provider + **documented proxy stub + `.env.example`**; CoFID-local works fully offline; FDC/OFF are optional enrichment, not required for saved-plan calc. |
| OFF ODbL share-alike | Runtime-only, never bundled or merged into the canonical store; transient cache; attributed. |
| Recalculated values differ from hand-authored | Discrepancy report + review thresholds; **no silent overwrite**; keep old value until reviewed. |
| Saved plans break | Stable recipe ids; keep `NutritionData` display shape; add storage schema-version guard. |
| Bundle bloat from CoFID | Generated JSON subset + search index; lazy-load; full dataset stays server/seed side. |
| Health-claim leakage from composition | Composition layer forbidden from producing claims; evidence stays in the Condition Engine; recipe evidence uses the "contains studied ingredients — not the same as the recipe being tested" wording and whole-food vs supplement exposure categories. |

---

## Most-important-rules compliance (how each is enforced)
Never invent data (values come from cited CoFID/FDC records or are flagged `estimated`); missing ≠ 0 (optional fields stay `undefined`); no auto-pick of result #1 (match scores + review); no careless raw/cooked mixing (explicit prep state + warnings); no exposed keys (server proxy + `.env.example`); no live-API dependency for saved calc (CoFID-local canonical store); no API-generated medical claims (composition/evidence separation); supplement ≠ culinary exposure (exposure categories); foundation before recipes (this phase builds/validates the engine + migrates the existing 49 only).
