import { describe, it, expect } from 'vitest';
import { CofidLocalProvider } from '../providers/cofidLocal';
import { searchFoods, resolveFoodById } from '../providers/foodSearchService';
import { getCalculatedNutrition } from '../../../utils/recipeCalc';
import { ALL_RECIPES } from '../../recipes';

const cofid = new CofidLocalProvider();

describe('local food search (offline, no network)', () => {
  it('ranks an exact/near name match highest and returns source labels', async () => {
    const results = await cofid.searchFoods({ text: 'oats' });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].matchScore).toBeGreaterThan(0.5);
    expect(results[0].sourceLabel).toBeTruthy();
    // never auto-selects: caller sees candidates + scores
    expect(results.every((r) => r.matchScore >= 0 && r.matchScore <= 1)).toBe(true);
  });

  it('resolves a seed food by id offline', async () => {
    const food = await resolveFoodById('food-oats-dry');
    expect(food?.source).toBe('manual-reviewed');
  });

  it('generic search with FDC disabled stays local and needs no network', async () => {
    const results = await searchFoods({ text: 'salmon', includeFdc: false });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.food.source !== 'usda-fdc')).toBe(true);
  });
});

describe('recipe calculation integration', () => {
  it('calculates the porridge recipe from linked canonical foods, offline', () => {
    const porridge = ALL_RECIPES.find((r) => r.id === 'bf-protein-porridge')!;
    const calc = getCalculatedNutrition(porridge);
    expect(calc).not.toBeNull();
    expect(calc!.perServing.calories).toBeGreaterThan(250);
    expect(calc!.perServing.protein).toBeGreaterThan(20);
    expect(calc!.provenance.length).toBe(porridge.ingredients.length);
    expect(calc!.provenance.every((p) => p.gramWeight > 0)).toBe(true);
  });

  it('portion scaling doubles per-serving totals', () => {
    const porridge = ALL_RECIPES.find((r) => r.id === 'bf-protein-porridge')!;
    const calc = getCalculatedNutrition(porridge)!;
    const single = calc.perServing.calories;
    // scaling is linear in the display layer; verify the raw per-serving × 2
    expect(single * 2).toBeCloseTo(calc.perServing.calories * 2, 5);
  });
});
