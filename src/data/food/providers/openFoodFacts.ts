import type {
  CanonicalFood,
  CanonicalNutrition,
  FoodDataProvider,
  FoodSearchQuery,
  FoodSearchResult,
} from '../types';
import { buildQuality } from '../quality';
import { backfillDerivedNutrients } from '../conversions';

/**
 * Open Food Facts provider — BRANDED / PACKAGED products & barcodes ONLY.
 *
 * Licence: ODbL (share-alike). OFF data is fetched at RUNTIME and NEVER merged
 * into the shipped canonical store. Records are labelled community-contributed
 * and may be incomplete. Missing nutrients stay missing (never 0).
 *
 * Compliance: OFF asks for an identifying User-Agent. Browsers forbid overriding
 * the User-Agent header (it is silently dropped), so for strict compliance this
 * provider should be proxied server-side in production; we still send an app
 * identifier and keep within the read rate limits by debouncing in the UI.
 */
const OFF_BASE = 'https://world.openfoodfacts.org/api/v2';
const USER_AGENT = 'FuelKitchenMealPlanner/1.0 (dev; contact: example@example.com)';
const FIELDS = 'code,product_name,brands,nutriments,ingredients_text,allergens_tags,nutrition_data_per,quantity';

interface CacheEntry<T> {
  value: T;
  expires: number;
}
const CACHE_TTL_MS = 15 * 60 * 1000;
const cache = new Map<string, CacheEntry<unknown>>();

function cacheGet<T>(key: string): T | undefined {
  const e = cache.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expires) {
    cache.delete(key);
    return undefined;
  }
  return e.value as T;
}
function cacheSet<T>(key: string, value: T): void {
  cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
}

async function offFetch<T>(url: string, signal?: AbortSignal): Promise<T | null> {
  const cached = cacheGet<T>(url);
  if (cached !== undefined) return cached;
  try {
    const res = await fetch(url, { signal, headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    if (!res.ok) return null;
    const json = (await res.json()) as T;
    cacheSet(url, json);
    return json;
  } catch (err) {
    if ((err as { name?: string })?.name === 'AbortError') throw err;
    return null; // network failure → caller shows a helpful message, no data erased
  }
}

export class OpenFoodFactsProvider implements FoodDataProvider {
  readonly source = 'open-food-facts' as const;
  readonly sourceLabel = 'Open Food Facts';

  async getFoodById(barcode: string): Promise<CanonicalFood | null> {
    const url = `${OFF_BASE}/product/${encodeURIComponent(barcode)}.json?fields=${FIELDS}`;
    const json = await offFetch<{ status: number; product?: OffProduct }>(url);
    if (!json || json.status !== 1 || !json.product) return null;
    return mapProduct(barcode, json.product);
  }

  async searchFoods(query: FoodSearchQuery): Promise<FoodSearchResult[]> {
    if (query.barcode) {
      const food = await this.getFoodById(query.barcode);
      return food ? [{ food, matchScore: 1, sourceLabel: this.sourceLabel }] : [];
    }
    if (!query.branded || !query.text.trim()) return [];
    const limit = query.limit ?? 12;
    const url = `${OFF_BASE}/search?search_terms=${encodeURIComponent(query.text)}&page_size=${limit}&fields=${FIELDS}`;
    const json = await offFetch<{ products?: OffProduct[] }>(url, query.signal);
    if (!json?.products) return [];
    return json.products
      .map((p) => mapProduct(p.code ?? '', p))
      .filter((f): f is CanonicalFood => f !== null)
      .map((food) => ({ food, matchScore: 0.5, sourceLabel: this.sourceLabel }));
  }
}

// ---- OFF → canonical mapping ----

interface OffProduct {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: Record<string, number>;
  ingredients_text?: string;
  allergens_tags?: string[];
  nutrition_data_per?: string;
  quantity?: string;
}

/** OFF _100g values: macros in grams, minerals typically in grams (SI) → convert to canonical units. */
function mapNutriments(nut: Record<string, number> | undefined): { nutrition: CanonicalNutrition; missing: string[] } {
  const n: CanonicalNutrition = {};
  const missing: string[] = [];
  const g = (k: string) => nut?.[`${k}_100g`];
  const mgFromG = (k: string) => {
    const v = nut?.[`${k}_100g`];
    return v === undefined ? undefined : v * 1000;
  };

  n.energyKcal = nut?.['energy-kcal_100g'];
  n.proteinG = g('proteins');
  n.carbohydrateG = g('carbohydrates');
  n.sugarsG = g('sugars');
  n.fibreG = g('fiber');
  n.fatG = g('fat');
  n.saturatedFatG = g('saturated-fat');
  n.transFatG = g('trans-fat');
  n.saltG = g('salt');
  n.sodiumMg = mgFromG('sodium');
  n.potassiumMg = mgFromG('potassium');
  n.calciumMg = mgFromG('calcium');
  n.ironMg = mgFromG('iron');
  n.magnesiumMg = mgFromG('magnesium');
  n.zincMg = mgFromG('zinc');
  n.vitaminCMg = mgFromG('vitamin-c');

  // Strip undefined keys (missing ≠ 0) and record what was absent.
  for (const key of Object.keys(n) as (keyof CanonicalNutrition)[]) {
    if (n[key] === undefined) {
      delete n[key];
      missing.push(key);
    }
  }
  return { nutrition: backfillDerivedNutrients(n), missing };
}

function mapProduct(barcode: string, p: OffProduct): CanonicalFood | null {
  if (!p.product_name && !barcode) return null;
  const { nutrition, missing } = mapNutriments(p.nutriments);
  const perNote = p.nutrition_data_per && p.nutrition_data_per !== '100g' ? `Declared per ${p.nutrition_data_per}.` : '';
  const warnings = ['Community-contributed product-label data — may be incomplete or outdated.'];
  if (perNote) warnings.push(perNote);
  if (missing.length) warnings.push(`${missing.length} nutrient field(s) not declared on the label.`);

  const now = '2026-07-12';
  return {
    id: `off-${barcode || slug(p.product_name ?? 'product')}`,
    canonicalName: (p.product_name ?? 'Unknown product').toLowerCase(),
    displayName: p.product_name ?? `Product ${barcode}`,
    aliases: [],
    source: 'open-food-facts',
    sourceRecordId: barcode,
    sourceDescription: [p.brands, p.product_name, p.quantity].filter(Boolean).join(' · '),
    sourceUrl: barcode ? `https://world.openfoodfacts.org/product/${barcode}` : undefined,
    recordType: 'branded',
    brand: p.brands,
    barcode: barcode || undefined,
    ingredientsText: p.ingredients_text,
    allergens: (p.allergens_tags ?? []).map((t) => t.replace(/^en:/, '')),
    nutrientsPer100g: nutrition,
    dataQuality: buildQuality(nutrition, 'label-declared', warnings),
    provenance: {
      datasetName: 'Open Food Facts',
      retrievedAt: now,
      transformations: ['Mapped OFF _100g nutriments to canonical units (minerals g→mg).'],
    },
    createdAt: now,
    updatedAt: now,
  };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}
