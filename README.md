# Build Your Own Meal Plan

A premium, fitness-styled meal-planning prototype. Pick a base ingredient for each meal
(breakfast, lunch, dinner, night-time snack), discover matching recipes, tune portions,
and get a full daily nutrition breakdown — macros, 24 micronutrients, a balance score,
smart recommendations, plan optimisation and a combined shopping list. A reusable,
research-led **Condition Support Engine** adds optional evidence layers for **PCOS,
Endometriosis and Menopause** on top (see below).

Built with **React 18 + TypeScript + Tailwind CSS + Lucide icons + Recharts** (Vite).

## Setup & run

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

```bash
npm run typecheck        # tsc --noEmit
npm run build            # typecheck + production build to dist/
npm run preview          # serve the production build
npm run test             # Vitest unit + integration tests
npm run validate-food    # validate canonical foods, links & composition↔evidence boundary
npm run validate-evidence# validate the condition evidence database
npm run validate-recipes # recipe integrity + allergen/dietary audit + energy plausibility
npm run import-cofid     # import the official CoFID .xlsx (place it in data-sources/cofid/)
npm run migrate-recipes  # recalculate linked recipes & report discrepancies vs authored
npm run coverage-matrix  # recipe coverage by slot/base/tag/condition — run before each batch
npm run find-food -- "chicken breast grilled"   # search CoFID for the right food record
npm run link-recipes     # regenerate reviewed ingredient→food links (pilot + batch2)
npm run extract-recipe-foods # bundle the CoFID records the recipes reference
```

### Recipe expansion pipeline

Nutrition for new recipes is **calculated from CoFID**, never hand-authored. The loop for
each batch is: `coverage-matrix` (find gaps) → author recipes (no `nutrition` field) →
`find-food` (pick correct-prep records) → add matches to `scripts/link-recipes.ts` →
`link-recipes` → `extract-recipe-foods` → `validate-recipes` + `validate-food` +
`migrate-recipes` → browser-test. See [docs/RECIPE_EXPANSION_PIPELINE.md](docs/RECIPE_EXPANSION_PIPELINE.md).

The dev-only **recipe authoring tool** is at `http://localhost:5173/#authoring` (protect this route in production).

## How it works

1. Accept or edit your **daily targets** (or use *Calculate My Targets* — Mifflin-St Jeor estimate).
2. For each meal, pick a **base ingredient** (plus optional extras) → matching recipes appear.
3. Refine with **dietary filters**, prep-time buckets, and calorie/protein ranges.
4. **View Recipe** for full ingredients, method, storage, substitutions, allergens and per-portion nutrition.
5. Add to plan, adjust portions (0.5×–4×, or *Adjust to Fit My Targets*), then continue to the next meal.
6. The **Daily Summary** shows all meals, macro & micronutrient dashboards, a balance score,
   smart recommendations, an approve-each-change **plan optimiser**, and a combined shopping list
   (copy / download / print, tick items you own).
7. Save, duplicate, load, print or export plans. Everything persists to local storage.

## Project structure

```
src/
  types.ts                 # All domain interfaces (Recipe, NutritionData, DailyTargets, …)
  data/
    ingredients.ts         # Base ingredient catalogue
    microDefs.ts           # Micronutrient labels, units, reference intakes
    recipes/               # Mock database: 12+ recipes per meal (breakfast/lunch/dinner/snacks)
      index.ts             # ← swap this module for a real recipe/nutrition API later
  utils/
    nutrition.ts           # Scaling, summing, percentage helpers
    filters.ts             # Recipe filtering & ranking
    targets.ts             # Target defaults + Mifflin-St Jeor calculator
    score.ts               # Nutritional balance score (planning tool, not medical)
    recommendations.ts     # Gap-based general recommendations
    optimise.ts            # Plan optimiser + auto-portion suggestion
    shopping.ts            # Shopping-list merge/format
    storage.ts             # Safe local-storage wrappers
    validateEvidence.ts    # Integrity checks (run: npm run validate-evidence)
  data/conditions/         # Condition Support Engine (see below)
    types.ts               # Shared schema: ConditionDefinition, ConditionEvidenceItem, …
    references.ts          # ONE central, de-duplicated, VERIFIED citation store (real PMIDs/DOIs)
    engine.ts              # Registry: CONDITIONS, getCondition, getEvidenceForCondition
    matchers.ts            # Generic, condition-scoped evidence → recipe/ingredient linking
    scoring.ts             # Config-driven relevance + dashboard metric evaluators
    recommendations.ts     # Config-driven condition recommendation rule runner
    evidence/
      shared.ts            # Interventions studied across >1 condition (one entity, many links)
      pcos.ts              # PCOS-only items + PCOS ConditionDefinition
      endometriosis.ts     # Endometriosis-only items + definition
      menopause.ts         # Menopause-only items + definition
      claims.ts            # "Popular claim vs evidence" cards
      index.ts             # Merged evidence database
  components/              # Header, ProgressTracker, MealBuilder, RecipeCard, dashboards, …
  components/conditions/   # ConditionSelector, IngredientEvidencePanel, ConditionDashboard,
                           # ConditionRelevance, SupplementEvidenceCentre, ResearchCentre,
                           # ResearchDetailModal, PopularClaimCard, safety + methodology
```

## Replacing the mock data with a real API

All recipe access flows through `src/data/recipes/index.ts` (`ALL_RECIPES` / `getRecipe`).
Implement a fetcher that maps your API's response onto the `Recipe` interface in
`src/types.ts` and export the same symbols — no other file needs to change.

## Condition Support Engine (PCOS · Endometriosis · Menopause)

A single reusable evidence architecture. The **Nutrition Support Mode** selector (General is
the default; one condition active at a time; persisted to local storage) switches the layer.
The core UI reads the active `ConditionDefinition` and renders from its config — there is no
`if (condition === 'pcos')` branching in components.

- **Shared interventions are one entity with many links.** `ConditionEvidenceItem.conditions`
  is a `ConditionEvidenceLink[]`, so omega-3, vitamin D, NAC, curcumin, magnesium, melatonin,
  Mediterranean diet, etc. appear once with different outcomes / grades / populations per
  condition — never duplicated.
- **Per-outcome grading + `OutcomeCategory`.** Every outcome is graded A–D and tagged
  `symptom | biochemical-marker | clinical-outcome | quality-of-life`, which structurally
  enforces the biomarker≠symptom rule everywhere in the UI (a testosterone or BMD change is
  never rendered as a symptom improvement).
- **Ingredient / recipe evidence panels** — a "🔬 Evidence" badge opens *Why might this be
  relevant to <condition>?*: outcomes with grades and category chips, what the research
  studied (dose, duration, population, specificity), an explicit *what this does not prove*
  caveat, limitations, safety/interactions, and clickable references (each with a **Research
  Details** view that surfaces null findings, not only positives).
- **Condition Nutrition Relevance** — a **categorical** label (higher / moderate / lower /
  insufficient data), never a clinical score, with a transparent factor breakdown. PCOS also
  shows a categorical glycaemic descriptor — never an invented GI number.
- **Dynamic Condition Dashboard** — renders whatever metrics the condition declares (fibre,
  protein distribution, omega-3 / oily-fish sources, calcium & vitamin-D foods, soy foods,
  plant / fruit-veg diversity, carbohydrate quality, added sugar where recorded, evidence-
  linked ingredients). Endometriosis separates a **GI symptom support** panel from condition
  nutrition; wording is "your meals provide approximately…", never "you are deficient in…".
- **Supplement Evidence Centre & Research Centre** — a research library (no brands, no
  affiliate links) filterable by outcome, evidence level, intervention type and
  condition-specific-only, sortable by strongest / most-researched / recently-reviewed / A–Z,
  plus **Popular claim vs evidence** cards (spearmint, 40:1, seed cycling, gluten→endo, "dairy
  is inflammatory", "soy raises oestrogen", "creatine damages kidneys", "black cohosh is
  natural HRT").

### Adding a new condition

1. Add its id to the `ConditionId` union in `data/conditions/types.ts`.
2. Add a `ConditionDefinition` (tracked outcomes, dashboard metrics, relevance factors,
   recommendation rules) plus its evidence items in a new `evidence/<condition>.ts`.
3. Register both in `evidence/index.ts` and `engine.ts`.

The core UI then renders it automatically. (Future candidates such as perimenopause, type-2
diabetes, insulin resistance, high cholesterol, hypertension, IBS and hypothyroidism are
**not** implemented.)

### Evidence integrity & safety

Every claim is traceable to `data/conditions/references.ts`; **no reference, DOI or PubMed ID
is invented**. Each reference carries a `verification` field (independently-verified /
agent-verified / listing-verified) and integrity `note`s (retraction, Expression of Concern,
"narrative review not a trial", COI). `npm run validate-evidence` checks for broken/duplicate
reference links, outcomes without references, missing review dates and missing safety
summaries. The full evidence review and integrity audit are in
[`docs/CONDITION_SUPPORT_REPORT.md`](docs/CONDITION_SUPPORT_REPORT.md) (and the earlier
[`docs/PCOS_EVIDENCE_REPORT.md`](docs/PCOS_EVIDENCE_REPORT.md)).

Content never claims to diagnose, treat, cure or reverse any condition. Supplement doses are
shown as "research has studied…", never personalised advice; the app never tells users to
stop metformin, hormonal contraception, HRT or other prescribed medication. Drug interactions
are labelled Documented / Potential / Insufficient-information against credible sources.
"PMOS (Polyendocrine Metabolic Ovarian Syndrome)" is **not** a recognised diagnosis and is
intentionally absent; menopause content is framed as *not* a replacement for HRT.

## Food-composition & recipe-calculation engine

A hybrid food-data architecture that calculates recipe nutrition from ingredients instead of
hand-authored numbers. Each source has one role (verified terms in
[`docs/food-data-sources.md`](docs/food-data-sources.md); full audit in
[`docs/FOOD_DATA_ENGINE_AUDIT.md`](docs/FOOD_DATA_ENGINE_AUDIT.md)):

- **UK CoFID** (OGL v3.0, Crown/PHE) — primary source for generic UK foods, imported locally via
  `scripts/import-cofid.ts` (place the official `.xlsx` in `data-sources/cofid/`).
- **USDA FoodData Central** (CC0) — secondary fallback via a **server-side proxy** only (the API
  key never reaches the browser; see `server/fdc-proxy.example.ts` + `.env.example`).
- **Open Food Facts** (ODbL) — branded/packaged products & barcodes, fetched at **runtime** and
  never baked into the shipped dataset (share-alike), with a required User-Agent and debounced,
  rate-limit-friendly search.

Everything downstream depends on a **provider-independent canonical model** (`src/data/food/`):
`CanonicalFood` + `CanonicalNutrition` with **unit-suffixed** fields. Core rules: a missing
nutrient is `undefined`, **never 0**; all maths runs on **gram weights** (household measures →
grams via reviewed conversions in `householdMeasures.ts`; volumes use explicit densities, not
`1 ml = 1 g`); raw/cooked/drained states are kept distinct and mismatches warn; conversions
(salt↔sodium, µg↔mg, vitamin D µg↔IU) are documented and unit-tested. Recipes link each
ingredient **once** to a canonical food (`src/data/recipes/ingredientLinks.ts`), so changing
API results can never silently alter a saved recipe's nutrition, and calculation works offline.

Composition and medical evidence stay **separate**: the food data answers "what nutrients does
this food contain?"; the Condition Evidence Engine answers "what has research investigated?".
`npm run validate-food` flags any supplement evidence that could leak onto culinary food
exposure. A **"Nutrition data sources"** panel (in the recipe modal) shows the calculated
per-serving values, each ingredient's matched food/source/prep/grams, and data completeness.

**Status:** the official **UK CoFID 2021** dataset has been imported — **2,886 records** parsed
from the real `.xlsx` (`npm run import-cofid`), with correct units, salt-from-sodium derivation,
AOAC-preferred fibre and EPA/DHA/ALA from the fatty-acid sheets. The full dataset is
**code-split into a lazy chunk** (the initial bundle stays lean; CoFID loads on first food
search); the small set of CoFID records referenced by recipe links is bundled for offline
synchronous calculation (`npm run extract-recipe-foods`). The `#authoring` tool searches all
2,886 foods live, and Open Food Facts branded/barcode lookup is live. Existing recipes' displayed
values are unchanged; `npm run migrate-recipes` reports calculated-vs-authored discrepancies
(thresholds: kcal/protein/carbs/fat 10%, fibre 20%) for review before any switch — nothing is
silently overwritten. (The CoFID `.xlsx` and generated `foods.json` are data artefacts, not
committed to source.)

## Notes

- UK spelling and units throughout (g, ml, kcal, °C).
- Nutritional values are **estimates** for general planning and education; they do not
  replace advice from a registered healthcare professional or dietitian.
- The UI is keyboard-navigable; modals close with Escape; charts always include numeric text.
