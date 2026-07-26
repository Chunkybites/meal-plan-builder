import type { MicronutrientData, NutritionData, Recipe } from '../types';
import type { CanonicalFood, StructuredRecipeIngredient } from '../data/food/types';
import { getLocalFood } from '../data/food/foodStore';
import { getIngredientLink, FULLY_LINKED_RECIPE_IDS } from '../data/recipes/ingredientLinks';
import {
  canonicalToMicronutrientData,
  canonicalToNutritionData,
  computeRecipeNutrition,
  type RecipeNutritionResult,
} from './recipeNutrition';

/**
 * Bridges the food-composition engine to a Recipe. When a recipe is fully linked
 * (every ingredient has a reviewed canonical-food link), nutrition is CALCULATED
 * from the food records; otherwise the recipe's stored (hand-authored) values are
 * used and the recipe is flagged as not yet migrated. No live API calls happen
 * here — calculation uses the local canonical store, so it works offline.
 */

export interface ProvenanceRow {
  ingredient: string;
  foodName: string;
  sourceLabel: string;
  preparationState: string;
  gramWeight: number;
  quantityBasis: string;
  dataQualityStatus: string;
}

export interface CalculatedRecipeNutrition {
  perServing: NutritionData;
  micros: MicronutrientData;
  raw: RecipeNutritionResult;
  provenance: ProvenanceRow[];
  completenessPercentage: number;
  partialNutrients: string[];
  warnings: string[];
}

const SOURCE_LABEL: Record<CanonicalFood['source'], string> = {
  cofid: 'UK CoFID',
  'usda-fdc': 'USDA FoodData Central',
  'open-food-facts': 'Open Food Facts',
  'manual-reviewed': 'Manually reviewed',
};

export function isRecipeLinked(recipe: Recipe): boolean {
  return FULLY_LINKED_RECIPE_IDS.has(recipe.id) && recipe.ingredients.every((i) => getIngredientLink(recipe.id, i.name));
}

/** Build structured ingredients from a recipe's reviewed links. */
function structuredIngredients(recipe: Recipe): StructuredRecipeIngredient[] | null {
  const out: StructuredRecipeIngredient[] = [];
  for (const ing of recipe.ingredients) {
    const link = getIngredientLink(recipe.id, ing.name);
    if (!link) return null;
    out.push({
      id: link.recipeIngredientId,
      displayText: ing.name,
      foodId: link.canonicalFoodId,
      quantity: ing.quantity,
      unit: ing.unit,
      gramWeight: link.gramWeight,
      quantityBasis: link.quantityBasis,
      optional: link.optional,
    });
  }
  return out;
}

/** Calculated nutrition for a fully-linked recipe, or null if not migrated. */
export function getCalculatedNutrition(recipe: Recipe): CalculatedRecipeNutrition | null {
  if (!isRecipeLinked(recipe)) return null;
  const ingredients = structuredIngredients(recipe);
  if (!ingredients) return null;

  const raw = computeRecipeNutrition(ingredients, getLocalFood, recipe.servings);
  const perServing = canonicalToNutritionData(raw.perServing);
  const micros = canonicalToMicronutrientData(raw.perServing);

  const provenance: ProvenanceRow[] = ingredients.map((ing) => {
    const food = getLocalFood(ing.foodId);
    return {
      ingredient: ing.displayText,
      foodName: food?.displayName ?? ing.foodId,
      sourceLabel: food ? SOURCE_LABEL[food.source] : 'Unknown',
      preparationState: food?.preparationState ?? 'unknown',
      gramWeight: ing.gramWeight,
      quantityBasis: ing.quantityBasis,
      dataQualityStatus: food?.dataQuality.status ?? 'unknown',
    };
  });

  // Completeness = average of contributing foods' completeness.
  const foods = ingredients.map((i) => getLocalFood(i.foodId)).filter((f): f is CanonicalFood => Boolean(f));
  const completenessPercentage = foods.length
    ? Math.round(foods.reduce((s, f) => s + f.dataQuality.completenessPercentage, 0) / foods.length)
    : 0;

  return {
    perServing,
    micros,
    raw,
    provenance,
    completenessPercentage,
    partialNutrients: raw.partialNutrients.map(String),
    warnings: raw.warnings,
  };
}

const EMPTY_NUTRITION: NutritionData = { calories: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };

export interface EffectiveNutrition {
  nutrition: NutritionData;
  micros: MicronutrientData;
  calculated: boolean;
}

/** The nutrition the app should display: calculated when linked, else stored. */
export function effectiveNutrition(recipe: Recipe): EffectiveNutrition {
  const calc = getCalculatedNutrition(recipe);
  if (calc) return { nutrition: calc.perServing, micros: calc.micros, calculated: true };
  // Legacy recipe: hand-authored values. (A recipe with neither links nor authored
  // nutrition is invalid — validate-recipes flags it; we degrade to zeros, not a crash.)
  return { nutrition: recipe.nutrition ?? EMPTY_NUTRITION, micros: recipe.micronutrients ?? {}, calculated: false };
}

/**
 * Memoised accessor — THE single way the app reads a recipe's display nutrition.
 * Recipes are static, so results are cached by id. This is the thin canonical→
 * display adapter: components/utils must call this, never `recipe.nutrition`.
 */
const CACHE = new Map<string, EffectiveNutrition>();
export function getRecipeNutrition(recipe: Recipe): EffectiveNutrition {
  const hit = CACHE.get(recipe.id);
  if (hit) return hit;
  const res = effectiveNutrition(recipe);
  CACHE.set(recipe.id, res);
  return res;
}
