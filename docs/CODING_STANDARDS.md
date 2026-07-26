# CODING_STANDARDS

Conventions as actually practised in this codebase. Follow them so the project stays coherent.

## Folder conventions
- `src/data/<domain>/` — domain data + logic (`recipes`, `conditions`, `food`). Domain types live in that domain's `types.ts`; cross-cutting legacy display types in `src/types.ts`.
- `src/utils/` — pure, framework-free helpers (nutrition maths, filters, storage, scoring bridges). No React imports.
- `src/components/` — UI. Subfolder per feature area (`components/conditions/`, `components/dev/`). Shared primitives in `common.tsx` / `conditionsCommon.tsx`.
- `scripts/` — Node tooling run via `tsx` (import, extract, migrate, validate). Never imported by the app bundle.
- `src/data/generated/` — machine-generated data artefacts (gitignored). `data-sources/` — raw inputs (gitignored).
- `docs/` — this documentation set + evidence/audit reports.

## Naming conventions
- Files: components `PascalCase.tsx`; utilities/data `camelCase.ts`; tests `*.test.ts` under `__tests__/`.
- Types/interfaces `PascalCase`; string-literal unions for closed sets (`ConditionId`, `EvidenceLevel`, `MetricEvaluator`, `PreparationState`). Prefer unions + `Record` maps over enums.
- Constants `UPPER_SNAKE_CASE` (`REFERENCES`, `SALT_PER_SODIUM`, `FULLY_LINKED_RECIPE_IDS`). Functions/vars `camelCase`.
- Ids are namespaced strings: foods `cofid-…`/`food-…`/`off-…`/`fdc-…`; recipes `bf-/ln-/dn-/sn-…`; ingredient links `${recipeId}::${lower(name)}`; references short slugs.

## Component structure
- Function components + hooks only. Props via a local `interface XProps`; destructure in the signature; default optional props inline (`condition = null`).
- Keep components presentational; push data/derivation into `data/`+`utils/` and pass results in. State lives high (mostly `App.tsx`); children get values + callbacks (`onSelect`, `onOpenEvidence`).
- Config-driven rendering — read `ConditionDefinition`/metric config; **never** branch on a condition id in a component.
- One default-or-named export per component file matching the filename.

## Hooks
Built-ins only (`useState`, `useMemo`, `useEffect`, `useRef`). Memoise derived day-totals/dashboards/scores keyed on selections + active condition. No custom hooks or state libraries yet; if extracting shared logic, prefer a pure util over a hook unless it needs React state.

## Services
Provider/service modules are plain async functions/objects implementing a typed contract (`FoodDataProvider`). Side-effecting IO (fetch) only in providers; everything downstream is pure. Services return `null`/empty on failure — never throw into the UI.

## Types & interfaces
Strict TypeScript (`strict: true`). Model the domain precisely: optional means "may be absent" (never sentinel 0), unions for closed sets, `Partial<Record<…>>` for sparse maps. Display metadata (labels, colour classes) co-located as `Record<Union, …>` maps beside the type. Avoid `any`; use `unknown` + narrowing at IO boundaries (provider response validation).

## Testing strategy
Vitest. **4 test files, ~34 cases** covering the highest-risk pure logic: `conversions`, `householdMeasures`, `recipeNutrition` (incl. missing-stays-undefined, partial flags, basis mismatch, µg→mg bridge), and food `search`. Run `npm run test`. **Gap:** no component/React tests — add React Testing Library for critical flows (see [CURRENT_STATE](CURRENT_STATE.md)). New pure logic must ship with tests; data changes must pass `validate-evidence`/`validate-food`.

## Error handling
- Storage: wrapped, swallow errors, return fallback (`utils/storage.ts`).
- Providers: `try/catch` → `null`/`[]`; re-throw only `AbortError` for cancellation.
- Calculations: emit structured warnings (unresolved/partial/basis-mismatch) rather than fabricating; surface "data unavailable"/"partial estimate" in UI, never fake zeros.
- Validators flag for review; they never auto-delete.

## Comments
File-top block comment stating purpose + invariants (see `conditions/types.ts`, `food/types.ts` for the house style). Comment the *why* and the non-obvious rules (unit conventions, missing≠0, biomarker≠symptom). Keep density moderate; don't narrate obvious code.

## Formatting
2-space indent, single quotes, semicolons, trailing commas in multiline literals, ~100-col soft wrap — matching existing files. (No Prettier/ESLint config committed yet; keep diffs consistent with surrounding code. Adding Prettier + ESLint is a recommended improvement.)

## Performance standards
- No unnecessary API calls: CoFID search index local; OFF debounced in the UI + 15-min cache; FDC cached server-side. Never search-as-you-type against OFF.
- Keep the full 2,886-record CoFID set out of the initial bundle (lazy dynamic import); ship only `recipeFoods.json`.
- Memoise expensive day-level derivations. Avoid rounding mid-calculation.

## Accessibility standards
Semantic HTML; `Modal` provides `role="dialog"`, `aria-modal`, labelled, focus moved in, Esc + backdrop close, body-scroll lock. Evidence grades and categories always have **text labels**, never colour-only. `aria-expanded` on disclosures, `role="status"` on live counts, `aria-hidden` on decorative icons, visible focus states. Charts always accompanied by numeric text. Test keyboard nav and at ~375 px mobile width for any UI change.
