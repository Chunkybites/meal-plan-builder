# CURRENT_STATE

Snapshot as of 2026-07-12.

## Where development stands
A working prototype: meal planner + Condition Support Engine (PCOS/Endometriosis/Menopause) + food-composition engine are all wired and green on typecheck, tests and production build. CoFID 2021 is imported (2,886 records). The active workstream is the **recipe nutrition migration** — replacing hand-authored recipe values with values calculated from CoFID.

## Known bugs / correctness risks
- **Dual nutrition sources.** 48/49 recipes still display hand-authored `nutrition`/`micronutrients`; only `bf-protein-porridge` is fully linked and calculated. `effectiveNutrition` falls back to authored values otherwise — so the app currently mixes calculated (1) and authored (48) figures. This is expected mid-migration but must be finished and reviewed.
- **`sodium` and `potassium` are duplicated** across `NutritionData` and `MicronutrientData` — risk of divergence/double-handling; needs a single source of truth.
- **OFF `User-Agent` is set client-side** but browsers strip it — live OFF calls may be rate-limited/blocked until server-proxied.
- **No component tests** — regressions in UI flows wouldn't be caught automatically.

## Missing features (vs. long-term intent)
- All-recipe calculated nutrition (migration unfinished).
- Live FDC (needs serverless proxy + key).
- Barcode-scanning UI; user accounts/profiles; weekly plans; recipe-library expansion.

## Current blockers
- **FDC + backend:** no serverless runtime or API key in this environment; FDC stays a stub until a proxy is deployed.
- **Recipe relinking volume:** ~400 ingredient links across 48 recipes need matching + human review of prep/subtype accuracy — the reason the auto-matcher approach (tasks 19–22) exists.

## Technical debt
- Migration duality (above) — highest-value debt to clear.
- Duplicated accent-style maps (fuchsia/sky/amber) across `ConditionSelector`, `conditionsCommon`, `ConditionEvidenceButton` → consolidate into one token module.
- `sodium`/`potassium` model duplication.
- No Prettier/ESLint config; formatting is convention-only.
- `#authoring` dev route unauthenticated.
- Almost all state in `App.tsx` — fine now, but growing; watch for prop-drilling.

## Highest-priority next tasks
1. **Finish recipe migration** — run the ingredient auto-matcher, curate high-impact/prep-sensitive matches, `extract-recipe-foods`, `migrate-recipes`, review each discrepancy, then switch recipes to calculated one-by-one.
2. Resolve the `sodium`/`potassium` duplication (pick canonical as source, derive display).
3. Add the FDC serverless proxy + `.env.example`; server-proxy OFF.
4. Add component/E2E tests for add-a-meal + condition evidence flows.
5. Gate the `#authoring` route.

## Architectural review (inconsistencies · duplication · improvements · scalability · performance · security)
**Inconsistencies:** two nutrition representations (canonical vs legacy `NutritionData`) bridged rather than unified; mixed authored/calculated recipes; `sodium`/`potassium` in two models.
**Duplicated functionality:** accent-style maps; general recommendations (`utils/recommendations.ts`) vs condition recommendations (`data/conditions/recommendations.ts`) share intent — keep separate but consider a shared rule primitive; two "score" concepts (general balance score vs condition relevance) — intentionally distinct, document clearly.
**Architectural improvements:** unify on canonical nutrition as the single internal model with a thin display adapter (retire the legacy duplication over time); extract a `useMealPlan` hook/context as `App.tsx` grows; one accent-token module; add Prettier/ESLint + CI.
**Refactoring opportunities:** consolidate accent maps; single source for sodium/potassium; move remaining authored recipes to calculated to delete the dual path; factor provider response-validation into a shared validator.
**Scalability risks:** recipe-library growth (49→240) will pressure the bundle — keep the full CoFID set lazy, consider indexing recipes; all-in-`App.tsx` state won't scale to accounts/weekly plans (introduce context/store then); localStorage size limits for many saved plans.
**Performance:** already lazy-loads CoFID and memoises day derivations; add debounced branded search UI; consider code-splitting the Research/Supplement centres; avoid shipping `foods.json` (keep only `recipeFoods.json`).
**Security:** never expose the FDC key (proxy enforced); protect/remove `#authoring` in production; validate all external provider responses at the boundary; keep OFF data out of the shipped dataset (ODbL); no secrets committed — ship `.env.example`.
