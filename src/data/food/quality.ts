import type { CanonicalNutrition, FoodDataQuality, FoodDataQualityStatus } from './types';

/**
 * Nutrient-completeness scoring. "Missing" means a key is absent/undefined — a
 * value of 0 counts as present (measured zero). This keeps missing≠zero honest.
 */

/** The canonical nutrients we consider "important" for completeness scoring. */
export const IMPORTANT_NUTRIENTS: (keyof CanonicalNutrition)[] = [
  'energyKcal',
  'proteinG',
  'carbohydrateG',
  'sugarsG',
  'fibreG',
  'fatG',
  'saturatedFatG',
  'sodiumMg',
  'potassiumMg',
  'calciumMg',
  'ironMg',
  'magnesiumMg',
  'zincMg',
  'vitaminAUg',
  'vitaminDMcg',
  'vitaminCMg',
  'folateUg',
  'vitaminB12Ug',
];

export function completenessPercentage(n: CanonicalNutrition, fields: (keyof CanonicalNutrition)[] = IMPORTANT_NUTRIENTS): number {
  const present = fields.filter((k) => n[k] !== undefined && n[k] !== null).length;
  return Math.round((present / fields.length) * 100);
}

export function missingImportantNutrients(n: CanonicalNutrition): (keyof CanonicalNutrition)[] {
  return IMPORTANT_NUTRIENTS.filter((k) => n[k] === undefined || n[k] === null);
}

export function buildQuality(n: CanonicalNutrition, status: FoodDataQualityStatus, extraWarnings: string[] = []): FoodDataQuality {
  const pct = completenessPercentage(n);
  const warnings = [...extraWarnings];
  if (pct < 40) warnings.push('Sparse micronutrient data — many values unavailable.');
  const missingMacros = (['proteinG', 'carbohydrateG', 'fatG', 'energyKcal'] as const).filter((k) => n[k] === undefined);
  if (missingMacros.length) warnings.push(`Missing core macro(s): ${missingMacros.join(', ')}.`);
  const finalStatus: FoodDataQualityStatus = missingMacros.length ? 'incomplete' : status;
  return { completenessPercentage: pct, status: finalStatus, warnings };
}
