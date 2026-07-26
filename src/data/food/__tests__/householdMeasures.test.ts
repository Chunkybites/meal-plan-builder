import { describe, it, expect } from 'vitest';
import { resolveGrams } from '../householdMeasures';

describe('household-measure → gram resolution', () => {
  it('passes grams through directly', () => {
    expect(resolveGrams('Rolled oats', 50, 'g').grams).toBe(50);
  });
  it('does NOT assume 1 ml = 1 g for oil (uses density 0.918)', () => {
    const r = resolveGrams('Olive oil', 15, 'ml');
    expect(r.grams).toBeCloseTo(13.8, 1);
    expect(r.assumed).toBe(false);
  });
  it('milk ml uses density 1.03', () => {
    expect(resolveGrams('Semi-skimmed milk', 250, 'ml').grams).toBeCloseTo(257.5, 1);
  });
  it('honey tsp resolves via volume × density (not a reviewed spoon record)', () => {
    const r = resolveGrams('Honey', 1, 'tsp');
    expect(r.grams).toBeCloseTo(7.1, 1);
  });
  it('reviewed records: 1 large egg ≈ 58 g, 1 garlic clove ≈ 4 g, 1 tbsp peanut butter ≈ 16 g, 1 tsp cinnamon ≈ 2.6 g', () => {
    expect(resolveGrams('Egg', 1, 'large').grams).toBe(58);
    expect(resolveGrams('Garlic', 1, 'clove').grams).toBe(4);
    expect(resolveGrams('Peanut butter', 1, 'tbsp').grams).toBe(16);
    expect(resolveGrams('Ground cinnamon', 1, 'tsp').grams).toBeCloseTo(2.6, 2);
  });
  it('unlisted count units fall back with a warning', () => {
    const r = resolveGrams('Mystery item', 1, 'pinch');
    expect(r.warnings.length).toBeGreaterThan(0);
    expect(r.grams).toBeGreaterThan(0);
  });
  it('unrecognised liquid flags an assumed density', () => {
    const r = resolveGrams('Weird cordial', 100, 'ml');
    expect(r.assumed).toBe(true);
    expect(r.warnings.some((w) => /assumed density/i.test(w))).toBe(true);
  });
});
