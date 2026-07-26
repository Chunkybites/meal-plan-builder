# API_DOCUMENTATION

The app has **no backend of its own**. It consumes three external food-data sources through provider adapters behind one interface (`FoodDataProvider`). Licences/terms verified in `docs/food-data-sources.md`. All medical evidence is static/local — there is no evidence API.

## Provider contract
```ts
interface FoodDataProvider {
  readonly source: FoodDataSource;
  readonly sourceLabel: string;
  searchFoods(query: FoodSearchQuery): Promise<FoodSearchResult[]>;
  getFoodById(id: string): Promise<CanonicalFood | null>;
}
```
Adapters map each provider's raw response onto `CanonicalFood`/`CanonicalNutrition`. `foodSearchService.ts` orchestrates them.

---

## 1. UK CoFID (local, primary)
- **Purpose:** authoritative generic UK food composition; powers recipe calculation.
- **Access:** none at runtime — official `.xlsx` imported offline (`scripts/import-cofid.ts`) into `data/generated/cofid/`. `cofidLocal.ts` reads local JSON.
- **Auth:** n/a. **Licence:** OGL v3.0 (Crown/PHE), attributed in `Disclaimer`.
- **Data returned:** `CanonicalFood[]` with `status: 'verified-primary'`.
- **Caching:** full 2,886-record set lazy-imported once and cached in memory; small `recipeFoods.json` bundled.
- **Errors/fallback:** if the generated set is absent, falls back to the bundled subset + seed foods; app still works.
- **Version:** CoFID 2021 (19 March 2021), `recordCount: 2886`.

## 2. Open Food Facts (live, branded/barcode only)
- **Purpose:** packaged/branded products, barcode lookup, label ingredients/allergens.
- **Endpoints:** `GET https://world.openfoodfacts.org/api/v2/product/{barcode}.json`; `GET /api/v2/search`.
- **Auth:** none, but a **custom `User-Agent` is required** (`FuelKitchenMealPlanner/1.0`). Browsers strip it → **should be server-proxied in production**.
- **Rate limits:** 15 req/min product, 10 req/min search → **debounce in the UI**, never per-keystroke.
- **Data returned:** `CanonicalFood` with `status: 'label-declared'`, `recordType: 'branded'`, barcode/brand preserved; minerals g→mg; missing nutrients kept `undefined`.
- **Caching:** in-memory, 15-min TTL.
- **Errors/fallback:** `AbortError` re-thrown; other errors → `null`. Never merged into the shipped canonical dataset (**ODbL share-alike**); labelled community-contributed.
- **Licence:** ODbL (data) / DbCL / CC-BY-SA (images) — attributed.

## 3. USDA FoodData Central (proxy stub, secondary fallback)
- **Purpose:** foods/nutrients missing from CoFID (Foundation, SR Legacy prioritised).
- **Endpoints (via proxy):** `POST /v1/foods/search`, `GET /v1/food/{fdcId}` at `https://api.nal.usda.gov/fdc/`.
- **Auth:** **API key required**, obtained from api.data.gov, **kept server-side only**. Adapter calls `VITE_FDC_PROXY_BASE ?? '/api/fdc'`; the (not-yet-built) serverless proxy injects `FDC_API_KEY`. **Never** ship the key in client code.
- **Rate limits:** 1,000 req/hr (key) / 30 hr, 50 day (DEMO_KEY).
- **Data returned:** `CanonicalFood` with `status: 'verified-secondary'`, matchScore ~0.55; ~22 FDC nutrient numbers mapped.
- **Caching:** server-side (to be implemented in the proxy).
- **Errors/fallback:** no proxy configured → returns `[]` gracefully; generic search still served by CoFID.
- **Licence:** CC0 public domain; attribution requested.

## Fan-out & fallback logic (`foodSearchService`)
- `lookupBarcode(code)` → OFF.
- `searchFoods({branded:true})` → OFF only.
- generic search → CoFID-local first; add FDC results **only** if strong local hits (score ≥0.7) < 3 and FDC enabled; merge deduped, local ahead at equal score.
- `resolveFoodById(id)` routes by id prefix (`cofid-`/`food-` local, `fdc-`, `off-`).

## Authentication (app)
None. No user accounts. `#authoring` dev route is unauthenticated and **must be protected/removed in production**.

## Future APIs to integrate
- **FDC serverless proxy** (Vercel/Netlify function) holding the key + response cache — the one piece of backend needed to make FDC live.
- **OFF server proxy** to set the `User-Agent` reliably and centralise caching.
- Optional recipe/nutrition API behind `data/recipes/index.ts`; barcode-scanning device API; auth provider when accounts arrive.
