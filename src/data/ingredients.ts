import type { Ingredient } from '../types';

/**
 * Base ingredient catalogue. Recipe.primaryIngredient and
 * Recipe.additionalIngredients reference these ids.
 */
export const INGREDIENTS: Ingredient[] = [
  // Meat
  { id: 'chicken', name: 'Chicken', category: 'Meat', classification: 'Protein', emoji: '🍗' },
  { id: 'beef', name: 'Beef', category: 'Meat', classification: 'Protein', emoji: '🥩' },
  { id: 'turkey', name: 'Turkey', category: 'Meat', classification: 'Protein', emoji: '🦃' },

  // Fish
  { id: 'salmon', name: 'Salmon', category: 'Fish', classification: 'Protein', emoji: '🐟' },
  { id: 'tuna', name: 'Tuna', category: 'Fish', classification: 'Protein', emoji: '🐠' },
  { id: 'white-fish', name: 'White fish', category: 'Fish', classification: 'Protein', emoji: '🎣' },
  { id: 'prawns', name: 'Prawns', category: 'Fish', classification: 'Protein', emoji: '🦐' },
  { id: 'mackerel', name: 'Mackerel', category: 'Fish', classification: 'Protein', emoji: '🐟' },
  { id: 'sardines', name: 'Sardines', category: 'Fish', classification: 'Protein', emoji: '🐟' },

  // Eggs & dairy
  { id: 'eggs', name: 'Eggs', category: 'Eggs & dairy', classification: 'Protein', emoji: '🥚' },
  { id: 'greek-yoghurt', name: 'Greek yoghurt', category: 'Eggs & dairy', classification: 'Protein', emoji: '🥣' },
  { id: 'cottage-cheese', name: 'Cottage cheese', category: 'Eggs & dairy', classification: 'Protein', emoji: '🧀' },
  { id: 'cheese', name: 'Cheese', category: 'Eggs & dairy', classification: 'Protein', emoji: '🧀' },
  { id: 'milk', name: 'Milk', category: 'Eggs & dairy', classification: 'Protein & carbohydrate', emoji: '🥛' },

  // Plant-based proteins
  { id: 'tofu', name: 'Tofu', category: 'Plant-based proteins', classification: 'Protein', emoji: '🍲' },
  { id: 'lentils', name: 'Lentils', category: 'Plant-based proteins', classification: 'Protein & carbohydrate', emoji: '🫘' },
  { id: 'beans', name: 'Beans', category: 'Plant-based proteins', classification: 'Protein & carbohydrate', emoji: '🫘' },
  { id: 'chickpeas', name: 'Chickpeas', category: 'Plant-based proteins', classification: 'Protein & carbohydrate', emoji: '🥙' },
  { id: 'edamame', name: 'Edamame (soya beans)', category: 'Plant-based proteins', classification: 'Protein', emoji: '🫛' },

  // Carbohydrate sources
  { id: 'rice', name: 'Rice', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🍚' },
  { id: 'pasta', name: 'Pasta', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🍝' },
  { id: 'potatoes', name: 'Potatoes', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🥔' },
  { id: 'sweet-potato', name: 'Sweet potato', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🍠' },
  { id: 'oats', name: 'Oats', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🌾' },
  { id: 'bread', name: 'Bread', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🍞' },
  { id: 'quinoa', name: 'Quinoa', category: 'Carbohydrate sources', classification: 'Protein & carbohydrate', emoji: '🌾' },
  { id: 'noodles', name: 'Noodles', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🍜' },
  { id: 'barley', name: 'Barley', category: 'Carbohydrate sources', classification: 'Carbohydrate', emoji: '🌾' },

  // Fruit
  { id: 'banana', name: 'Banana', category: 'Fruit', classification: 'Fruit', emoji: '🍌' },
  { id: 'berries', name: 'Berries', category: 'Fruit', classification: 'Fruit', emoji: '🫐' },
  { id: 'apple', name: 'Apple', category: 'Fruit', classification: 'Fruit', emoji: '🍎' },
  { id: 'kiwi', name: 'Kiwi', category: 'Fruit', classification: 'Fruit', emoji: '🥝' },

  // Other
  { id: 'protein-powder', name: 'Protein powder', category: 'Other', classification: 'Protein', emoji: '💪' },
  { id: 'avocado', name: 'Avocado', category: 'Other', classification: 'Healthy fats', emoji: '🥑' },
  { id: 'peanut-butter', name: 'Peanut butter', category: 'Other', classification: 'Healthy fats', emoji: '🥜' },
  { id: 'walnuts', name: 'Walnuts', category: 'Other', classification: 'Healthy fats', emoji: '🌰' },
  { id: 'dark-chocolate', name: 'Dark chocolate', category: 'Other', classification: 'Other', emoji: '🍫' },
];

export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export function ingredientName(id: string): string {
  return INGREDIENT_MAP[id]?.name ?? id;
}
