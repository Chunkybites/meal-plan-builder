import type { MicronutrientData, NutritionData } from '../types';
import type { CanonicalFood, CanonicalNutrition, StructuredRecipeIngredient } from '../data/food/types';

/**
 * Recipe nutrition calculation engine.
 *
 * ingredient contribution = food per-100g × gramWeight ÷ 100
 * recipe total            = Σ contributions
 * per serving             = total ÷ servings
 * portion                 = per serving × multiplier
 *
 * Rules:
 * - A missing nutrient is `undefined`, never 0. Sums only add present values.
 * - If some contributing ingredients are missing a nutrient, that nutrient is
 *   flagged PARTIAL (the total is a lower-bound estimate), not silently complete.
 * - Round only for final display, never per-ingredient before summing.
 */

export const NUTRIENT_KEYS: (keyof CanonicalNutrition)[] = [
  'energyKcal', 'energyKj', 'proteinG', 'carbohydrateG', 'sugarsG', 'addedSugarsG', 'fibreG',
  'fatG', 'saturatedFatG', 'monounsaturatedFatG', 'polyunsaturatedFatG', 'transFatG',
  'omega3G', 'omega6G', 'epaMg', 'dhaMg', 'alaMg', 'cholesterolMg',
  'sodiumMg', 'saltG', 'potassiumMg', 'calciumMg', 'phosphorusMg', 'magnesiumMg', 'ironMg',
  'zincMg', 'copperMg', 'manganeseMg', 'seleniumUg', 'iodineUg',
  'vitaminAUg', 'retinolUg', 'betaCaroteneUg', 'vitaminDMcg', 'vitaminEUg', 'vitaminKUg',
  'thiaminMg', 'riboflavinMg', 'niacinMg', 'pantothenicAcidMg', 'vitaminB6Mg', 'biotinUg',
  'folateUg', 'vitaminB12Ug', 'vitaminCMg', 'alcoholG', 'waterG',
];

/** Contribution of a food at a given gram weight (per-100g × grams ÷ 100). */
export function ingredientContribution(per100g: CanonicalNutrition, gramWeight: number): CanonicalNutrition {
  const factor = gramWeight / 100;
  const out: CanonicalNutrition = {};
  for (const key of NUTRIENT_KEYS) {
    const v = per100g[key];
    if (v !== undefined && v !== null) out[key] = v * factor;
  }
  return out;
}

/** Scale a nutrition object by a factor, preserving missing values. */
export function scaleCanonical(n: CanonicalNutrition, factor: number): CanonicalNutrition {
  const out: CanonicalNutrition = {};
  for (const key of NUTRIENT_KEYS) {
    const v = n[key];
    if (v !== undefined && v !== null) out[key] = v * factor;
  }
  return out;
}

export function divideCanonical(n: CanonicalNutrition, divisor: number): CanonicalNutrition {
  return divisor === 0 ? {} : scaleCanonical(n, 1 / divisor);
}

export interface RecipeNutritionResult {
  total: CanonicalNutrition;
  perServing: CanonicalNutrition;
  /** Nutrients where at least one contributing ingredient lacked a value (lower-bound). */
  partialNutrients: (keyof CanonicalNutrition)[];
  /** Ingredient ids that could not be resolved to a food record. */
  unresolvedIngredientIds: string[];
  warnings: string[];
}

/**
 * Compute recipe nutrition from structured ingredients + a food lookup.
 * `getFood` returns the canonical food for an ingredient's foodId (or undefined).
 */
export function computeRecipeNutrition(
  ingredients: StructuredRecipeIngredient[],
  getFood: (foodId: string) => CanonicalFood | undefined,
  servings: number,
): RecipeNutritionResult {
  const total: CanonicalNutrition = {};
  const partial = new Set<keyof CanonicalNutrition>();
  const unresolved: string[] = [];
  const warnings: string[] = [];

  const contributing = ingredients.filter((i) => !i.optional);

  for (const ing of contributing) {
    const food = getFood(ing.foodId);
    if (!food) {
      unresolved.push(ing.id);
      warnings.push(`No food record linked for "${ing.displayText}".`);
      continue;
    }
    // Warn on raw/cooked mismatch between the ingredient basis and the food's state.
    if (food.preparationState && basisMismatch(ing.quantityBasis, food.preparationState)) {
      warnings.push(`"${ing.displayText}" is stated as ${ing.quantityBasis} but linked to a ${food.preparationState} record — verify weights.`);
    }
    const contribution = ingredientContribution(food.nutrientsPer100g, ing.gramWeight);
    for (const key of NUTRIENT_KEYS) {
      const c = contribution[key];
      if (c !== undefined) total[key] = (total[key] ?? 0) + c;
    }
  }

  // Flag partial nutrients: any nutrient present in some (but not all) contributing foods.
  for (const key of NUTRIENT_KEYS) {
    if (total[key] === undefined) continue;
    const anyMissing = contributing.some((ing) => {
      const food = getFood(ing.foodId);
      return food && food.nutrientsPer100g[key] === undefined && likelyContains(food, key);
    });
    if (anyMissing) partial.add(key);
  }

  const perServing = divideCanonical(total, servings > 0 ? servings : 1);
  return { total, perServing, partialNutrients: [...partial], unresolvedIngredientIds: unresolved, warnings };
}

/** Portion-adjusted per-serving nutrition. */
export function portionCanonical(perServing: CanonicalNutrition, multiplier: number): CanonicalNutrition {
  return scaleCanonical(perServing, multiplier);
}

/** Sum several canonical nutrition objects (e.g. a day's meals), missing-safe. */
export function sumCanonical(blocks: CanonicalNutrition[]): CanonicalNutrition {
  const out: CanonicalNutrition = {};
  for (const b of blocks) {
    for (const key of NUTRIENT_KEYS) {
      const v = b[key];
      if (v !== undefined) out[key] = (out[key] ?? 0) + v;
    }
  }
  return out;
}

// ---- Bridge to the existing display contract (NutritionData + MicronutrientData) ----

function r(v: number | undefined, dp = 1): number | undefined {
  if (v === undefined || v === null) return undefined;
  const f = 10 ** dp;
  return Math.round(v * f) / f;
}

/**
 * Map canonical nutrition to the app's display `NutritionData`. The 5 core macros
 * fall back to 0 only if genuinely absent (the validator flags such recipes);
 * optional fields stay undefined when missing.
 */
export function canonicalToNutritionData(n: CanonicalNutrition): NutritionData {
  return {
    calories: Math.round(n.energyKcal ?? 0),
    protein: r(n.proteinG) ?? 0,
    carbs: r(n.carbohydrateG) ?? 0,
    fat: r(n.fatG) ?? 0,
    fibre: r(n.fibreG) ?? 0,
    sugar: r(n.sugarsG),
    addedSugar: r(n.addedSugarsG),
    saturatedFat: r(n.saturatedFatG),
    monounsaturatedFat: r(n.monounsaturatedFatG),
    polyunsaturatedFat: r(n.polyunsaturatedFatG),
    omega3: r(n.omega3G, 2),
    omega6: r(n.omega6G, 2),
    cholesterol: r(n.cholesterolMg),
    sodium: r(n.sodiumMg),
    potassium: r(n.potassiumMg),
  };
}

/** Map canonical nutrition to the app's `MicronutrientData` (partial; missing omitted). */
export function canonicalToMicronutrientData(n: CanonicalNutrition): MicronutrientData {
  const out: MicronutrientData = {};
  const set = (k: keyof MicronutrientData, v: number | undefined) => {
    if (v !== undefined) out[k] = v;
  };
  set('vitaminA', r(n.vitaminAUg));
  set('vitaminB1', r(n.thiaminMg, 2));
  set('vitaminB2', r(n.riboflavinMg, 2));
  set('vitaminB3', r(n.niacinMg, 2));
  set('vitaminB5', r(n.pantothenicAcidMg, 2));
  set('vitaminB6', r(n.vitaminB6Mg, 2));
  set('vitaminB7', r(n.biotinUg, 1));
  set('vitaminB9', r(n.folateUg));
  set('vitaminB12', r(n.vitaminB12Ug, 2));
  set('vitaminC', r(n.vitaminCMg));
  set('vitaminD', r(n.vitaminDMcg, 2));
  set('vitaminE', r(n.vitaminEUg !== undefined ? n.vitaminEUg / 1000 : undefined, 2)); // canonical µg → display mg
  set('vitaminK', r(n.vitaminKUg));
  set('calcium', r(n.calciumMg));
  set('iron', r(n.ironMg, 2));
  set('magnesium', r(n.magnesiumMg));
  set('phosphorus', r(n.phosphorusMg));
  set('potassium', r(n.potassiumMg));
  set('sodium', r(n.sodiumMg));
  set('zinc', r(n.zincMg, 2));
  set('copper', r(n.copperMg, 2));
  set('manganese', r(n.manganeseMg, 2));
  set('selenium', r(n.seleniumUg));
  set('iodine', r(n.iodineUg));
  return out;
}

// ---- helpers ----

function basisMismatch(basis: StructuredRecipeIngredient['quantityBasis'], state: CanonicalFood['preparationState']): boolean {
  if (!state || state === 'unknown') return false;
  if (basis === 'raw') return state !== 'raw' && state !== 'dried';
  if (basis === 'cooked') return state === 'raw';
  return false;
}

/** Whether a food would plausibly report a nutrient (so its absence signals partial data). */
function likelyContains(food: CanonicalFood, key: keyof CanonicalNutrition): boolean {
  // Macros and common minerals are expected in most whole-food records.
  const expected: (keyof CanonicalNutrition)[] = ['energyKcal', 'proteinG', 'carbohydrateG', 'fatG', 'fibreG', 'sugarsG', 'saturatedFatG', 'sodiumMg'];
  return expected.includes(key) && food.recordType !== 'supplement';
}
