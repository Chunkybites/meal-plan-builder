import type { CanonicalFood, FoodDataProvider, FoodSearchQuery, FoodSearchResult } from '../types';
import { allLocalFoods, getLocalFood, scoreFood } from '../foodStore';

/**
 * Local canonical-food provider (UK CoFID + reviewed manual records).
 *
 * The small bundled set (recipe-linked CoFID + manual seed) drives offline recipe
 * calculation synchronously. The FULL CoFID dataset (~2,886 records, ~6.5 MB) is
 * lazy-loaded on first search via a dynamic import, so it forms a separate chunk
 * and never inflates the initial bundle.
 */
let fullCache: CanonicalFood[] | null = null;
async function loadFullCofid(): Promise<CanonicalFood[]> {
  if (fullCache) return fullCache;
  try {
    const mod = await import('../../generated/cofid/foods.json');
    fullCache = ((mod as { default?: unknown }).default ?? mod) as CanonicalFood[];
  } catch {
    fullCache = []; // dataset not present → fall back to the bundled subset
  }
  return fullCache;
}

export class CofidLocalProvider implements FoodDataProvider {
  readonly source = 'cofid' as const;
  readonly sourceLabel = 'UK CoFID / reviewed';

  async searchFoods(query: FoodSearchQuery): Promise<FoodSearchResult[]> {
    const limit = query.limit ?? 20;
    // Union of the bundled set and the lazily-loaded full CoFID dataset, deduped by id.
    const seen = new Set<string>();
    const pool: CanonicalFood[] = [];
    for (const f of [...(await loadFullCofid()), ...allLocalFoods()]) {
      if (seen.has(f.id)) continue;
      seen.add(f.id);
      pool.push(f);
    }

    const results: FoodSearchResult[] = [];
    for (const food of pool) {
      if (query.foodGroup && food.foodGroup !== query.foodGroup) continue;
      if (query.preparationState && food.preparationState !== query.preparationState) continue;
      const score = scoreFood(food, query.text);
      if (score > 0) results.push({ food, matchScore: score, sourceLabel: labelFor(food) });
    }
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  }

  async getFoodById(id: string): Promise<CanonicalFood | null> {
    const local = getLocalFood(id);
    if (local) return local;
    const full = await loadFullCofid();
    return full.find((f) => f.id === id) ?? null;
  }
}

function labelFor(food: CanonicalFood): string {
  switch (food.source) {
    case 'cofid':
      return 'UK CoFID';
    case 'usda-fdc':
      return 'USDA FoodData Central';
    case 'open-food-facts':
      return 'Open Food Facts';
    default:
      return 'Manually reviewed';
  }
}
