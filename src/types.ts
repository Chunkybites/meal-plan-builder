/**
 * Core domain types for Build Your Own Meal Plan.
 *
 * The mock recipe database conforms to these interfaces. To connect a real
 * recipe/nutrition API later, implement a fetcher that maps API responses
 * onto `Recipe` and swap it in behind `src/data/recipes/index.ts`.
 */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export type Goal = 'fat-loss' | 'maintain' | 'build-muscle' | 'general-health';

export type DietaryTag =
  | 'high-protein'
  | 'low-calorie'
  | 'low-carb'
  | 'lower-fat'
  | 'high-fibre'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'quick'
  | 'meal-prep'
  | 'under-20'
  | 'budget';

export type IngredientCategory =
  | 'Meat'
  | 'Fish'
  | 'Eggs & dairy'
  | 'Plant-based proteins'
  | 'Carbohydrate sources'
  | 'Fruit'
  | 'Other';

export type IngredientClassification =
  | 'Protein'
  | 'Carbohydrate'
  | 'Protein & carbohydrate'
  | 'Fruit'
  | 'Healthy fats'
  | 'Other';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  classification: IngredientClassification;
  emoji: string;
}

export type ShoppingCategory =
  | 'Meat & fish'
  | 'Dairy & eggs'
  | 'Fruit'
  | 'Vegetables'
  | 'Carbohydrates'
  | 'Tinned & packaged'
  | 'Herbs & spices'
  | 'Sauces & condiments'
  | 'Other';

/** All macro / advanced values are per single serving. */
export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  sugar?: number;
  addedSugar?: number;
  saturatedFat?: number;
  monounsaturatedFat?: number;
  polyunsaturatedFat?: number;
  omega3?: number;
  omega6?: number;
  cholesterol?: number;
  sodium?: number;
  potassium?: number;
}

export type MicroKey =
  | 'vitaminA'
  | 'vitaminB1'
  | 'vitaminB2'
  | 'vitaminB3'
  | 'vitaminB5'
  | 'vitaminB6'
  | 'vitaminB7'
  | 'vitaminB9'
  | 'vitaminB12'
  | 'vitaminC'
  | 'vitaminD'
  | 'vitaminE'
  | 'vitaminK'
  | 'calcium'
  | 'iron'
  | 'magnesium'
  | 'phosphorus'
  | 'potassium'
  | 'sodium'
  | 'zinc'
  | 'copper'
  | 'manganese'
  | 'selenium'
  | 'iodine';

/** Per-serving micronutrient amounts, keyed by MicroKey. Partial: recipes may omit unknown values. */
export type MicronutrientData = Partial<Record<MicroKey, number>>;

export type RecipeUnit =
  | 'g'
  | 'ml'
  | 'tsp'
  | 'tbsp'
  | 'small'
  | 'medium'
  | 'large'
  | 'clove'
  | 'slice'
  | 'item'
  | 'pinch'
  | 'scoop'
  | 'handful';

/** Quantities are for ONE serving so they can be scaled linearly. */
export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: RecipeUnit;
  category: ShoppingCategory;
  note?: string;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Recipe {
  id: string;
  name: string;
  description: string;
  mealCategories: MealSlot[];
  /** Ingredient id from src/data/ingredients.ts */
  primaryIngredient: string;
  /** Additional ingredient ids used to match user selections */
  additionalIngredients: string[];
  /** Emoji used as the recipe image placeholder */
  emoji: string;
  /** Two hex colours for the placeholder image gradient */
  imageColors: [string, string];
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: Difficulty;
  ingredients: RecipeIngredient[];
  instructions: string[];
  /**
   * Per-serving display nutrition. OPTIONAL: fully-linked recipes derive this
   * from canonical foods via the calculation engine (`getRecipeNutrition`);
   * legacy recipes still carry hand-authored values until migrated. Read
   * nutrition through `getRecipeNutrition(recipe)`, never `recipe.nutrition`.
   */
  nutrition?: NutritionData;
  micronutrients?: MicronutrientData;
  dietaryTags: DietaryTag[];
  allergens: string[];
  storage: string;
  mealPrep: string;
  substitutions: string[];
  /** Optional reheating guidance (new calculated recipes). */
  reheating?: string;
  /** Optional budget classification (new calculated recipes). */
  budget?: 'low' | 'medium' | 'high';
}

export interface DailyTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fibre: number;
  goal: Goal;
}

export interface MealSelection {
  recipeId: string;
  servings: number;
}

export interface DietaryFilterState {
  tags: DietaryTag[];
  prepBucket: 'any' | 'under10' | '10-20' | '20-40' | '40plus';
  calorieRange: [number, number];
  proteinRange: [number, number];
  search: string;
}

export interface ShoppingListItem {
  name: string;
  quantity: number;
  unit: string;
  category: ShoppingCategory;
  owned: boolean;
}

export interface SavedMealPlan {
  id: string;
  name: string;
  createdAt: string;
  selections: Partial<Record<MealSlot, MealSelection>>;
  targets: DailyTargets;
  totals: NutritionData;
}
