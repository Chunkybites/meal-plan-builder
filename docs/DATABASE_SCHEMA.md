# DATABASE_SCHEMA

There is **no server database**. "Schema" = the TypeScript data models (source of truth) plus localStorage-persisted state. Models live in `src/types.ts` (legacy display contract), `src/data/food/types.ts` (canonical food), and `src/data/conditions/types.ts` (evidence). This doc maps every model the brief lists onto what actually exists, and notes what is planned.

## Model inventory & relationships

```
User/Profile (localStorage only)──┐
  DailyTargets                     │ selects
  SupportMode ('general'|cond)     ▼
                          MealSelection {recipeId, servings}
                                   │ refers to
                                   ▼
Recipe ──has many──> RecipeIngredient (per-serving qty)
   │                      │ linked once (ingredientLinks.ts) to
   │ hand-authored        ▼
   ├─ nutrition:NutritionData        CanonicalFood ──has──> CanonicalNutrition (per 100g)
   ├─ micronutrients:MicronutrientData     ▲                    │ + FoodDataQuality + FoodProvenance
   └─ dietaryTags/allergens/…              │ source: cofid|usda-fdc|open-food-facts|manual-reviewed
                                           │
ConditionEvidenceItem ──conditions[]──> ConditionEvidenceLink ──outcomes[]──> EvidenceOutcome
   │ matchKeywords ↔ recipe ingredients        │ per ConditionId                 │ referenceIds[]
   │ referenceIds[]                            └─ specificity, limitations         ▼
   └────────────────────────────> ResearchReference (central store) <── PopularClaim.referenceIds
ConditionDefinition (per ConditionId) ── trackedOutcomes / dashboardMetrics / relevanceFactors / recommendationRules
SavedMealPlan { selections, targets, totals }   ShoppingListItem (derived, not stored raw)
```

## Users
Not implemented (no accounts/auth). A user is implicitly the browser. Future: `User { id, email, createdAt }` server-side.

## Profiles
`DailyTargets { calories, protein, carbs, fat, fibre, goal }` (`src/types.ts`) + active `SupportMode` — persisted to localStorage. Future dietary/allergy profiles are not built.

## Foods
`CanonicalFood` (`data/food/types.ts`): `id, canonicalName, displayName, aliases[], source, sourceRecordId, sourceDescription, sourceUrl?, recordType, foodGroup?, subcategory?, preparationState?, ediblePortion?, nutrientsPer100g, allergens?, ingredientsText?, barcode?, brand?, dataQuality, provenance, createdAt, updatedAt`. Populations: **2,886** imported CoFID records (`data/generated/cofid/foods.json`, lazy) + **32** manual seed foods + live OFF/FDC results at runtime. `id` conventions: `cofid-<code>`, `food-<slug>` (manual), `off-<barcode>`, `fdc-<id>`.

## Micronutrients & Macronutrients
Two representations, bridged:
- **Canonical** `CanonicalNutrition` (per 100 g, ~48 unit-suffixed optional fields: `energyKcal, proteinG, carbohydrateG, sugarsG, addedSugarsG, fibreG, fatG, saturatedFatG, mono/polyunsaturatedFatG, transFatG, omega3G/omega6G, epaMg/dhaMg/alaMg, cholesterolMg, sodiumMg/saltG/potassiumMg, calciumMg…seleniumUg/iodineUg, vitaminAUg/retinolUg/betaCaroteneUg, vitaminDMcg, vitaminEUg, vitaminKUg, thiamin…vitaminCMg, alcoholG, waterG`). **Missing = `undefined`, never 0.**
- **Legacy display** `NutritionData` (per serving: 5 core macros + optional sugar/fats/omega/cholesterol/sodium/potassium) and `MicronutrientData = Partial<Record<MicroKey,number>>` over 24 micros; reference intakes in `data/microDefs.ts`. `recipeNutrition.ts` converts canonical→display (e.g. vitamin E µg÷1000→mg).
- **Known duplication:** `sodium` and `potassium` exist in both `NutritionData` and `MicronutrientData` (see [CURRENT_STATE](CURRENT_STATE.md)).

## Conditions
`ConditionId = 'pcos' | 'endometriosis' | 'menopause'`; `SupportMode = 'general' | ConditionId`. Each has a `ConditionDefinition` (name, accent, `whatItTracks`, `trackedOutcomes`, `dashboardMetrics`, `relevanceFactors` weighted to ~100, `recommendationRules`, `disclaimer`, methodology notes). "PMOS" is intentionally excluded (not a real diagnosis).

## Evidence
`ConditionEvidenceItem` (**53 total**: 20 shared/17 pcos/6 endo/10 menopause): `id, interventionName, interventionType, aliases[], conditions: ConditionEvidenceLink[], mechanismSummary?, studiedDose?, studiedDuration?, safety: SafetyProfile, matchKeywords[], isSupplement, referenceIds[], lastEvidenceReview`. Each `ConditionEvidenceLink` carries per-condition `outcomes: EvidenceOutcome[]` (each graded A–D, tagged `OutcomeCategory`, `direction`, `referenceIds[]`), `specificity`, `studiedPopulation`, `limitations[]`. **A shared intervention is one item with several links** (no duplication).

## Research Sources
`ResearchReference` (**124** in `data/conditions/references.ts`, one central de-duplicated store): `id, title, authors?, year, journal?, studyType, doi?, pubmedId?, url, verification, population?, intervention?, comparator?, duration?, keyFindings?, nullFindings?, limitations?, note?`. Referenced by id from evidence items, outcomes, medication interactions and popular claims. Real identifiers only; unverifiable ones excluded.

## Meal Plans
`MealSelection { recipeId, servings }` per slot in `App` state. `SavedMealPlan { id, name, createdAt, selections, targets, totals }` in localStorage (`savedPlans`).

## Recipes
`Recipe` (`src/types.ts`, **49** in `data/recipes/*`): `id, name, description, mealCategories[], primaryIngredient, additionalIngredients[], emoji, imageColors, servings, prepTime, cookTime, difficulty, ingredients: RecipeIngredient[], instructions[], nutrition, micronutrients, dietaryTags[], allergens[], storage, mealPrep, substitutions[]`. `RecipeIngredient { name, quantity(per serving), unit, category, note? }`. **Migration:** `ingredientLinks.ts` maps `${recipeId}::${lower(name)}` → `RecipeIngredientFoodLink { canonicalFoodId, matchStatus, matchedBy, gramWeight, quantityBasis, notes?, reviewedAt? }`; `FULLY_LINKED_RECIPE_IDS` currently = `{ bf-protein-porridge }` (1/49).

## Shopping Lists
`ShoppingListItem { name, quantity, unit, category, owned }` — **derived** at render from selections (`utils/shopping.ts`), aggregating/merging ingredients; not persisted separately.

## Supplement Recommendations
Not a stored user-facing prescription. Supplements are `ConditionEvidenceItem`s with `isSupplement: true`, surfaced read-only in the Supplement Evidence Centre with research doses (never personalised). No dosing recommendations are generated.

## Custom Foods
Manual `CanonicalFood` records (`source: 'manual-reviewed'`, the 32 seed foods; more addable via the authoring tool). No user-persisted custom foods yet.

## Saved Meals
Covered by `SavedMealPlan` (whole-day plans). No single-meal saving; `favourites: string[]` (recipe ids) is the lightweight equivalent.

## User Preferences
`favourites`, active `SupportMode`, `dailyTargets`, and "owned" shopping ticks — localStorage. No server prefs.
