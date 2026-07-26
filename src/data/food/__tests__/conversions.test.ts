import { describe, it, expect } from 'vitest';
import {
  sodiumMgToSaltG,
  saltGToSodiumMg,
  mgToUg,
  ugToMg,
  vitaminDUgToIu,
  scaleMaybe,
  backfillDerivedNutrients,
  atwaterKcal,
} from '../conversions';

describe('unit conversions', () => {
  it('sodium ↔ salt uses ×2.5', () => {
    expect(sodiumMgToSaltG(1000)).toBeCloseTo(2.5, 6);
    expect(saltGToSodiumMg(2.5)).toBeCloseTo(1000, 6);
  });
  it('mg ↔ µg uses ×1000', () => {
    expect(mgToUg(1)).toBe(1000);
    expect(ugToMg(1000)).toBe(1);
  });
  it('vitamin D µg → IU uses ×40', () => {
    expect(vitaminDUgToIu(10)).toBe(400);
  });
  it('missing values propagate as undefined, never 0', () => {
    expect(scaleMaybe(undefined, 5)).toBeUndefined();
    expect(sodiumMgToSaltG(undefined)).toBeUndefined();
    expect(mgToUg(undefined)).toBeUndefined();
  });
  it('backfill derives complementary salt/sodium and kJ but leaves others missing', () => {
    const n = backfillDerivedNutrients({ sodiumMg: 1000, energyKcal: 100 });
    expect(n.saltG).toBeCloseTo(2.5, 3);
    expect(n.energyKj).toBeCloseTo(418.4, 1);
    expect(n.proteinG).toBeUndefined();
  });
  it('Atwater energy estimate uses 4/4/9 with fibre at 2', () => {
    expect(atwaterKcal({ proteinG: 10, carbohydrateG: 20, fatG: 5, fibreG: 0 })).toBe(10 * 4 + 20 * 4 + 5 * 9);
    expect(atwaterKcal({})).toBeUndefined();
  });
});
