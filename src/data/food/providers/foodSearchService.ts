import type { CanonicalFood, FoodSearchQuery, FoodSearchResult } from '../types';
import { getLocalFood } from '../foodStore';
import { CofidLocalProvider } from './cofidLocal';
import { FoodDataCentralProvider } from './foodDataCentral';
import { OpenFoodFactsProvider } from './openFoodFacts';

/**
 * Shared food-search service. Applies deterministic source priority and never
 * auto-selects a single result — it returns transparently scored, source-labelled
 * candidates for review.
 *
 * Generic foods:  CoFID/reviewed (local) → USDA FDC fallback.
 * Branded/barcode: Open Food Facts (only when `branded`/`barcode` is set).
 */
const cofid = new CofidLocalProvider();
const fdc = new FoodDataCentralProvider();
const off = new OpenFoodFactsProvider();

export interface FoodSearchOptions extends FoodSearchQuery {
  /** Include USDA FDC fallback (needs the server proxy). Default true. */
  includeFdc?: boolean;
}

export async function searchFoods(opts: FoodSearchOptions): Promise<FoodSearchResult[]> {
  const { includeFdc = true, ...query } = opts;

  // Barcode → Open Food Facts directly.
  if (query.barcode) {
    return off.searchFoods(query);
  }

  // Branded search → Open Food Facts (+ nothing else; branded is not in CoFID).
  if (query.branded) {
    return off.searchFoods(query);
  }

  // Generic search → local first, then FDC fallback only if local is thin.
  const local = await cofid.searchFoods(query);
  const strongLocal = local.filter((r) => r.matchScore >= 0.7);
  if (strongLocal.length >= 3 || !includeFdc) return local;

  let fallback: FoodSearchResult[] = [];
  try {
    fallback = await fdc.searchFoods(query);
  } catch {
    fallback = [];
  }
  // Merge, dedupe by id, keep local ahead of FDC at equal score.
  const seen = new Set(local.map((r) => r.food.id));
  const merged = [...local, ...fallback.filter((r) => !seen.has(r.food.id))];
  return merged.sort((a, b) => b.matchScore - a.matchScore).slice(0, query.limit ?? 20);
}

/** Barcode helper for the authoring tool / future scanner. */
export async function lookupBarcode(barcode: string, signal?: AbortSignal): Promise<CanonicalFood | null> {
  return off.getFoodById(barcode.trim());
}

/** Resolve a food by id from any source (local first, then remote by prefix). */
export async function resolveFoodById(id: string): Promise<CanonicalFood | null> {
  const localHit = getLocalFood(id);
  if (localHit) return localHit;
  if (id.startsWith('fdc-')) return fdc.getFoodById(id);
  if (id.startsWith('off-')) return off.getFoodById(id.replace(/^off-/, ''));
  return null;
}

export const providers = { cofid, fdc, off };
