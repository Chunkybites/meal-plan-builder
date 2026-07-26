# ROADMAP

Logical development order. Status reflects 2026-07-12.

## ✅ Completed
- Core meal planner: ingredient-led wizard, filters, portion scaling, macro + 24-micro dashboards, balance score, general recommendations, plan optimiser, shopping list, saved plans, favourites, localStorage persistence.
- 49-recipe curated database (13/12/12/12), UK units.
- **Condition Support Engine** (reusable, config-driven): PCOS + Endometriosis + Menopause; 53 evidence items, 8 popular-claim cards, 124 verified references; ingredient/recipe evidence panels, categorical relevance, dynamic dashboards, Supplement Evidence Centre, Research Centre, Research Detail (null findings), safety notices, methodology modal.
- Evidence integrity tooling (`validate-evidence`) + research/audit reports.
- **Food-composition engine**: canonical model, documented conversions, household measures, quality/provenance; providers (CoFID-local, live OFF branded/barcode, FDC proxy stub); recipe-nutrition calculator; provenance UI; dev authoring tool.
- **CoFID 2021 import** (2,886 records) via reproducible `import-cofid`; `extract-recipe-foods`; `migrate-recipes` discrepancy reporter; `validate-food`.
- Unit/integration tests (conversions, measures, recipe maths, search); typecheck + production build green.
- Full documentation set (this `docs/`).

## 🚧 In progress
- **Recipe nutrition migration** — moving recipes from hand-authored numbers to calculated-from-CoFID. **1/49 fully linked** (`bf-protein-porridge`). Active plan (tasks): build an ingredient **auto-matcher** with prep-state heuristics + review report → curate high-impact matches (proteins raw/cooked, grains dry/cooked, drained tins, subtypes) → wire generated links, extract foods, run `migrate-recipes`, review discrepancies **before** switching displayed values → verify.

## ⭐ Next priority
1. Finish linking all 49 recipes; review discrepancy report; flip `effectiveNutrition` to calculated per recipe as each is confirmed.
2. Add the **FDC serverless proxy** (+ `.env.example`, server cache) to make FDC live without exposing the key.
3. Server-proxy the OFF `User-Agent`; add debounced branded-food search UI.
4. Component/E2E tests for the core add-a-meal and condition flows.
5. Protect/remove the `#authoring` route for any non-dev build.

## 🔮 Future features
- Recipe library expansion to ~180–240 (only after calc engine is trusted; coverage-matrix driven; quality-gated; no duplicate/renamed dishes).
- Barcode scanning (camera → OFF).
- User accounts + server persistence; dietary/allergy profiles; weekly/7-day plans; multiple snacks.
- More conditions (perimenopause, T2D, insulin resistance, high cholesterol, hypertension, IBS, hypothyroidism) via the existing engine.
- Optional sourced `NutrientRetentionProfile` cooking-loss factors.

## ✨ Nice-to-have
- Prettier + ESLint config; CI running typecheck/tests/validators.
- PDF/export of a plan; print styles.
- i18n scaffolding; PWA/offline install.
- Consolidated accent-token module (remove duplicated fuchsia/sky/amber maps).

## 🌅 Long-term vision
A defensible, evidence-led women's-health nutrition platform: coach/dietitian accounts, client plans, a continuously version-reviewed evidence base with "last reviewed" governance, and real recipe/nutrition API integration — while never diagnosing, treating, or claiming to cure.
