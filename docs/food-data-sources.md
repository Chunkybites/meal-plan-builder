# Food data sources — roles, licences, attribution & limitations

**Verified:** 2026-07-12 by fetching each source's official page (not from memory). Re-verify before any production release; terms and dataset versions change.

This project uses a **hybrid** food-composition architecture. Each source has one role and must not be used outside it. Composition data answers *"what nutrients does this food contain?"* only — never a medical claim (see the Condition Evidence Engine for that separation).

---

## 1. UK CoFID — Composition of Foods Integrated Dataset — **PRIMARY (generic UK foods)**

- **Publisher / copyright:** Public Health England (now OHID), © Crown copyright.
- **Latest version:** 2021 edition, published **19 March 2021** (McCance & Widdowson's *The Composition of Foods*, integrated dataset; incorporates 2020 pork analysis and corrections to watercress vitamin C, soya yogurt iodine, sweet potato vitamin E/sugars/biotin).
- **Format:** Microsoft **Excel** only (main dataset ≈ 4.42 MB `.xlsx`, plus a legacy "old foods" file and a 37-page PDF user guide). **No official CSV/JSON/API.**
- **Licence:** **Open Government Licence v3.0 (OGL)**. Reuse and redistribution are permitted **with attribution**.
- **Required attribution:** *"Contains public sector information licensed under the Open Government Licence v3.0. Source: McCance and Widdowson's The Composition of Foods Integrated Dataset (CoFID), Public Health England, © Crown copyright 2021."*
- **Source URL:** https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
- **Role here:** authoritative source for generic/raw ingredients, UK food descriptions, UK-relevant nutrient composition and recipe calculation. Imported into a local, normalised dataset (see `scripts/import-cofid.ts`). We do **not** depend on any unofficial third-party CoFID API.
- **Limitations / notes:**
  - The dataset ships as a **binary `.xlsx`**; it cannot be fetched as structured data inside this sandboxed environment. The reproducible importer is written to run against the official file when placed at `data-sources/cofid/` locally. Until then, a **reviewed, food-code-cited subset** (`src/data/generated/cofid/`) covers the ingredients the current recipes actually use.
  - CoFID uses specific missing-value markers (`N` = present but not measured, `Tr` = trace, `''`/blank = not applicable). These map to `undefined` (missing) or a small trace value — **never 0**.
  - CoFID reports many nutrients per 100 g of **edible portion**; some values are for specific preparation states (raw/boiled/fried). Preparation state must be preserved, not averaged.

## 2. USDA FoodData Central (FDC) — **SECONDARY FALLBACK (generic foods/nutrients missing from CoFID)**

- **Publisher:** U.S. Department of Agriculture, Agricultural Research Service.
- **API key:** **Required** (via api.data.gov). A shared `DEMO_KEY` exists for exploration only (≈30 req/IP/hour, 50/day). Production keys allow **1,000 requests/hour/IP**; HTTP 429 on excess.
- **Data licence:** **Public domain — CC0 1.0 Universal.** No permission needed to reuse; USDA requests attribution ("Source: FoodData Central"). No explicit caching/redistribution restriction beyond that.
- **Data types:** Foundation Foods, SR Legacy, Survey (FNDDS), Experimental, Branded.
- **Endpoints:** `POST /v1/foods/search`, `GET /v1/food/{fdcId}` at `https://api.nal.usda.gov/fdc/`.
- **Role here:** fallback only — foods absent from CoFID, or specific nutrients absent from a CoFID record. Prioritise **Foundation** then **SR Legacy** generic records. Not used for branded foods (that is OFF).
- **Security requirement:** the API key must **never** appear in client-side code. Requests go through a server-side proxy / serverless function that injects the key from an environment variable.
- **Limitations / notes:**
  - US food matrix differs from UK (fortification, cut names, units). Use as enrichment, not wholesale replacement of UK values.
  - Never auto-select the first search result; use a transparent match score and preparation-state check.

## 3. Open Food Facts (OFF) — **BRANDED / PACKAGED PRODUCTS & BARCODES ONLY**

- **Publisher:** Open Food Facts (community project).
- **API key:** **None required** for reads.
- **User-Agent:** a **custom, identifying User-Agent is mandatory**, format `AppName/Version (contact email)`.
- **Rate limits:** **15 req/min/IP** for product reads; **10 req/min/IP** for search. Explicitly *not* suitable for search-as-you-type — must debounce.
- **Licence:** database structure under **Open Database License (ODbL)**; contents under **Database Contents License (DbCL)**; images under **CC-BY-SA**. Data is **community-contributed** with no accuracy guarantee.
- **Endpoints:** `GET /api/v2/product/{barcode}.json`, `GET /api/v2/search` at `https://world.openfoodfacts.org`.
- **Role here:** packaged/branded products, barcode lookup, label-declared ingredients, allergens, product nutrition panels; optional future barcode scanning. **Not** an authoritative source for generic ingredients when CoFID/FDC data exists.
- **CRITICAL licence caveat — ODbL share-alike:** ODbL imposes **share-alike** on a redistributed *derived database*. To avoid encumbering our CoFID-primary canonical dataset, **OFF data is never baked into the shipped dataset.** It is fetched **at runtime** for branded/barcode lookups, cached only transiently, always labelled *"community-contributed product-label data — may be incomplete or outdated,"* and kept out of the seeded canonical store.
- **Limitations / notes:** missing nutrients are preserved as missing (never 0); records shown with a data-quality warning; never presented as laboratory-verified.

---

## Source-priority summary (deterministic)

**Generic foods:** (1) exact reviewed CoFID → (2) close reviewed CoFID → (3) USDA Foundation → (4) USDA SR Legacy/other generic → (5) manual reviewed record.

**Branded/packaged foods:** (1) manufacturer-declared (if legally reusable) → (2) OFF barcode record → (3) USDA Branded → (4) manual user entry.

Never merge nutrient values across different foods or preparation states just because names look similar (raw vs cooked salmon; dry vs cooked rice; full-fat vs fat-free yoghurt; salted vs unsalted nuts; calcium-set vs non-calcium-set tofu).

## Environment / security

- FDC key lives only in a server-side environment variable (`FDC_API_KEY`), read by a proxy route. See `.env.example`.
- OFF User-Agent is configured via `OFF_USER_AGENT`.
- No real keys are committed.

## Attribution shown in-app

A "Nutrition data sources" panel and the global disclaimer attribute CoFID (OGL/Crown), FDC (public domain) and OFF (ODbL, community) wherever their data is used.
