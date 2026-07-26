import type { Recipe } from '../../types';
import { breakfastRecipes } from './breakfast';
import { lunchRecipes } from './lunch';
import { dinnerRecipes } from './dinner';
import { snackRecipes } from './snacks';
import { pilotRecipes } from './pilot';
import { batch2Recipes } from './batch2';
import { batch3Recipes } from './batch3';
import { batch4Recipes } from './batch4';

/**
 * The mock recipe database. To connect a real recipe or nutrition API later,
 * replace this module with an async data source that resolves to Recipe[] —
 * everything else in the app consumes recipes through ALL_RECIPES/getRecipe.
 */
export const ALL_RECIPES: Recipe[] = [
  ...breakfastRecipes,
  ...lunchRecipes,
  ...dinnerRecipes,
  ...snackRecipes,
  ...pilotRecipes,
  ...batch2Recipes,
  ...batch3Recipes,
  ...batch4Recipes,
];

const BY_ID = new Map(ALL_RECIPES.map((r) => [r.id, r]));

export function getRecipe(id: string): Recipe | undefined {
  return BY_ID.get(id);
}
