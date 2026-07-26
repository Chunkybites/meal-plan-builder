import type { DietaryFilterState, MealSlot, Recipe } from '../types';
import { totalTime } from './nutrition';
import { getRecipeNutrition } from './recipeCalc';

export const DEFAULT_FILTERS: DietaryFilterState = {
  tags: [],
  prepBucket: 'any',
  calorieRange: [0, 1000],
  proteinRange: [0, 100],
  search: '',
};

export const PREP_BUCKETS: { id: DietaryFilterState['prepBucket']; label: string }[] = [
  { id: 'any', label: 'Any time' },
  { id: 'under10', label: 'Under 10 min' },
  { id: '10-20', label: '10–20 min' },
  { id: '20-40', label: '20–40 min' },
  { id: '40plus', label: '40+ min' },
];

function matchesPrepBucket(r: Recipe, bucket: DietaryFilterState['prepBucket']): boolean {
  const t = totalTime(r);
  switch (bucket) {
    case 'any':
      return true;
    case 'under10':
      return t < 10;
    case '10-20':
      return t >= 10 && t <= 20;
    case '20-40':
      return t > 20 && t <= 40;
    case '40plus':
      return t > 40;
  }
}

function usesIngredient(r: Recipe, ingredientId: string): boolean {
  return r.primaryIngredient === ingredientId || r.additionalIngredients.includes(ingredientId);
}

/**
 * Filter the recipe pool for a meal slot and selected ingredients.
 * The primary ingredient is required; extra ingredients boost ranking
 * rather than excluding recipes, so results stay useful.
 */
export function filterRecipes(
  recipes: Recipe[],
  slot: MealSlot,
  primaryIngredient: string | null,
  extraIngredients: string[],
  f: DietaryFilterState,
): Recipe[] {
  if (!primaryIngredient) return [];
  const search = f.search.trim().toLowerCase();

  const matched = recipes.filter((r) => {
    if (!r.mealCategories.includes(slot)) return false;
    if (!usesIngredient(r, primaryIngredient)) return false;
    if (!f.tags.every((tag) => r.dietaryTags.includes(tag))) return false;
    if (!matchesPrepBucket(r, f.prepBucket)) return false;
    const { calories, protein } = getRecipeNutrition(r).nutrition;
    if (calories < f.calorieRange[0] || calories > f.calorieRange[1]) return false;
    if (protein < f.proteinRange[0] || protein > f.proteinRange[1]) return false;
    if (search) {
      const haystack = `${r.name} ${r.description} ${r.dietaryTags.join(' ')}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const score = (r: Recipe): number => {
    let s = 0;
    if (r.primaryIngredient === primaryIngredient) s += 100;
    for (const extra of extraIngredients) {
      if (usesIngredient(r, extra)) s += 10;
    }
    return s;
  };

  return matched.sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
}
