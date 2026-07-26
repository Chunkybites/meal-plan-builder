import { describe, it, expect } from 'vitest';
import type { CanonicalFood, StructuredRecipeIngredient } from '../../data/food/types';
import {
  ingredientContribution,
  scaleCanonical,
  computeRecipeNutrition,
  portionCanonical,
  canonicalToNutritionData,
  canonicalToMicronutrientData,
} from '../recipeNutrition';

function food(id: string, per100: Partial<CanonicalFood['nutrientsPer100g']>, prep: CanonicalFood['preparationState'] = 'raw'): CanonicalFood {
  return {
    id, canonicalName: id, displayName: id, aliases: [], source: 'manual-reviewed', sourceRecordId: id, sourceDescription: id,
    recordType: 'generic', preparationState: prep, nutrientsPer100g: per100,
    dataQuality: { completenessPercentage: 50, status: 'estimated', warnings: [] },
    provenance: { datasetName: 'test', retrievedAt: '2026-07-12', transformations: [] },
    createdAt: '2026-07-12', updatedAt: '2026-07-12',
  };
}

const OATS = food('oats', { energyKcal: 379, proteinG: 13, carbohydrateG: 67, fatG: 8, fibreG: 10, ironMg: 4 });
const MILK = food('milk', { energyKcal: 50, proteinG: 3.4, carbohydrateG: 4.8, fatG: 1.8, calciumMg: 124 }); // note: no fibreG, no ironMg

describe('nutrient scaling', () => {
  it('contribution = per100 × grams ÷ 100, missing stays missing', () => {
    const c = ingredientContribution(OATS.nutrientsPer100g, 50);
    expect(c.energyKcal).toBeCloseTo(189.5, 3);
    expect(c.proteinG).toBeCloseTo(6.5, 3);
    expect(c.vitaminCMg).toBeUndefined();
  });
  it('scaleCanonical preserves undefined', () => {
    expect(scaleCanonical({ proteinG: 10 }, 2).proteinG).toBe(20);
    expect(scaleCanonical({ proteinG: undefined }, 2).proteinG).toBeUndefined();
  });
});

describe('recipe nutrition', () => {
  const getFood = (id: string) => ({ oats: OATS, milk: MILK }[id]);
  const ingredients: StructuredRecipeIngredient[] = [
    { id: 'a', displayText: 'Oats', foodId: 'oats', quantity: 50, unit: 'g', gramWeight: 50, quantityBasis: 'raw' },
    { id: 'b', displayText: 'Milk', foodId: 'milk', quantity: 200, unit: 'ml', gramWeight: 206, quantityBasis: 'as-served' },
  ];

  it('totals sum contributions; per-serving divides by servings', () => {
    const res = computeRecipeNutrition(ingredients, getFood, 2);
    // energy total = 189.5 + (50 × 2.06) = 189.5 + 103 = 292.5
    expect(res.total.energyKcal).toBeCloseTo(292.5, 1);
    expect(res.perServing.energyKcal).toBeCloseTo(146.25, 1);
  });
  it('flags nutrients as partial when a contributing food lacks them', () => {
    const res = computeRecipeNutrition(ingredients, getFood, 1);
    // fibre present only in oats; milk lacks it and would plausibly report it → partial
    expect(res.partialNutrients).toContain('fibreG');
    // ironMg present only in oats; milk lacks it but iron isn't in the "expected" macro set → not flagged partial
    expect(res.total.ironMg).toBeCloseTo(2, 3);
  });
  it('reports unresolved ingredient links, does not crash', () => {
    const res = computeRecipeNutrition(
      [{ id: 'x', displayText: 'Ghost', foodId: 'missing', quantity: 1, unit: 'g', gramWeight: 10, quantityBasis: 'raw' }],
      getFood,
      1,
    );
    expect(res.unresolvedIngredientIds).toEqual(['x']);
  });
  it('warns on raw-vs-cooked basis mismatch', () => {
    const cookedRice = food('rice', { energyKcal: 130, proteinG: 2.7, carbohydrateG: 28 }, 'boiled');
    const res = computeRecipeNutrition(
      [{ id: 'r', displayText: 'Rice', foodId: 'rice', quantity: 100, unit: 'g', gramWeight: 100, quantityBasis: 'raw' }],
      (id) => (id === 'rice' ? cookedRice : undefined),
      1,
    );
    expect(res.warnings.some((w) => /raw|cooked|boiled/i.test(w))).toBe(true);
  });
});

describe('portion scaling and display bridge', () => {
  it('portion multiplies per-serving', () => {
    expect(portionCanonical({ energyKcal: 100 }, 1.5).energyKcal).toBe(150);
  });
  it('maps canonical → display NutritionData with core macros', () => {
    const d = canonicalToNutritionData({ energyKcal: 200.4, proteinG: 10.24, carbohydrateG: 20, fatG: 5, fibreG: 3, sodiumMg: 120 });
    expect(d.calories).toBe(200);
    expect(d.protein).toBe(10.2);
    expect(d.sodium).toBe(120);
    expect(d.sugar).toBeUndefined(); // missing stays missing
  });
  it('maps vitamin E canonical µg → display mg', () => {
    const m = canonicalToMicronutrientData({ vitaminEUg: 2500, folateUg: 40 });
    expect(m.vitaminE).toBeCloseTo(2.5, 2);
    expect(m.vitaminB9).toBe(40);
    expect(m.calcium).toBeUndefined();
  });
});
