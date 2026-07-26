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
 * USDA FoodData Central provider — SECONDARY FALLBACK for generic foods/nutrients
 * missing from CoFID.
 *
 * SECURITY: the FDC API key is NEVER in client code. This provider calls a
 * server-side proxy (default `/api/fdc`, configurable via VITE_FDC_PROXY_BASE)
 * that injects `FDC_API_KEY` from the environment. If the proxy is not
 * configured/available, the provider returns empty results — the app keeps
 * working from local data. See server/fdc-proxy.example.ts and .env.example.
 */
const PROXY_BASE = (import.meta as { env?: Record<string, string> }).env?.VITE_FDC_PROXY_BASE ?? '/api/fdc';

/** Map of FDC nutrient number → canonical field + unit expectation. */
const FDC_NUTRIENT_MAP: Record<string, { key: keyof CanonicalNutrition; expect: 'g' | 'mg' | 'ug' | 'kcal' }> = {
  '1008': { key: 'energyKcal', expect: 'kcal' },
  '1003': { key: 'proteinG', expect: 'g' },
  '1005': { key: 'carbohydrateG', expect: 'g' },
  '2000': { key: 'sugarsG', expect: 'g' },
  '1079': { key: 'fibreG', expect: 'g' },
  '1004': { key: 'fatG', expect: 'g' },
  '1258': { key: 'saturatedFatG', expect: 'g' },
  '1257': { key: 'transFatG', expect: 'g' },
  '1253': { key: 'cholesterolMg', expect: 'mg' },
  '1093': { key: 'sodiumMg', expect: 'mg' },
  '1092': { key: 'potassiumMg', expect: 'mg' },
  '1087': { key: 'calciumMg', expect: 'mg' },
  '1091': { key: 'phosphorusMg', expect: 'mg' },
  '1090': { key: 'magnesiumMg', expect: 'mg' },
  '1089': { key: 'ironMg', expect: 'mg' },
  '1095': { key: 'zincMg', expect: 'mg' },
  '1098': { key: 'copperMg', expect: 'mg' },
  '1103': { key: 'seleniumUg', expect: 'ug' },
  '1162': { key: 'vitaminCMg', expect: 'mg' },
  '1114': { key: 'vitaminDMcg', expect: 'ug' },
  '1178': { key: 'vitaminB12Ug', expect: 'ug' },
  '1177': { key: 'folateUg', expect: 'ug' },
};

interface FdcNutrient {
  nutrient?: { number?: string; unitName?: string };
  amount?: number;
  // search response variant
  nutrientNumber?: string;
  unitName?: string;
  value?: number;
}
interface FdcFood {
  fdcId: number;
  description: string;
  dataType?: string;
  foodCategory?: string | { description?: string };
  foodNutrients?: FdcNutrient[];
}

export class FoodDataCentralProvider implements FoodDataProvider {
  readonly source = 'usda-fdc' as const;
  readonly sourceLabel = 'USDA FoodData Central';

  async searchFoods(query: FoodSearchQuery): Promise<FoodSearchResult[]> {
    if (!query.text.trim()) return [];
    try {
      const res = await fetch(`${PROXY_BASE}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.text, dataType: ['Foundation', 'SR Legacy'], pageSize: query.limit ?? 10 }),
        signal: query.signal,
      });
      if (!res.ok) return [];
      const json = (await res.json()) as { foods?: FdcFood[] };
      return (json.foods ?? []).map((f) => ({ food: mapFdcFood(f), matchScore: 0.55, sourceLabel: this.sourceLabel }));
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') throw err;
      return []; // proxy unavailable → graceful empty
    }
  }

  async getFoodById(id: string): Promise<CanonicalFood | null> {
    const fdcId = id.replace(/^fdc-/, '');
    try {
      const res = await fetch(`${PROXY_BASE}/food/${encodeURIComponent(fdcId)}`);
      if (!res.ok) return null;
      const json = (await res.json()) as FdcFood;
      return mapFdcFood(json);
    } catch {
      return null;
    }
  }
}

function mapFdcFood(f: FdcFood): CanonicalFood {
  const n: CanonicalNutrition = {};
  for (const fn of f.foodNutrients ?? []) {
    const num = fn.nutrient?.number ?? fn.nutrientNumber;
    const value = fn.amount ?? fn.value;
    if (!num || value === undefined) continue;
    const map = FDC_NUTRIENT_MAP[num];
    if (map) n[map.key] = value; // FDC uses canonical-matching units for these fields
  }
  const nutrition = backfillDerivedNutrients(n);
  const category = typeof f.foodCategory === 'string' ? f.foodCategory : f.foodCategory?.description;
  const now = '2026-07-12';
  return {
    id: `fdc-${f.fdcId}`,
    canonicalName: f.description.toLowerCase(),
    displayName: f.description,
    aliases: [],
    source: 'usda-fdc',
    sourceRecordId: String(f.fdcId),
    sourceDescription: f.description,
    sourceUrl: `https://fdc.nal.usda.gov/fdc-app.html#/food-details/${f.fdcId}/nutrients`,
    recordType: f.dataType === 'Branded' ? 'branded' : 'generic',
    foodGroup: category,
    preparationState: 'unknown',
    nutrientsPer100g: nutrition,
    dataQuality: buildQuality(nutrition, 'verified-secondary', ['US food matrix — verify UK relevance (fortification, cut names).']),
    provenance: {
      datasetName: `USDA FoodData Central (${f.dataType ?? 'unknown'})`,
      retrievedAt: now,
      transformations: ['Mapped FDC nutrient numbers to canonical fields via server proxy.'],
    },
    createdAt: now,
    updatedAt: now,
  };
}
