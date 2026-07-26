import type {
  MealSelection,
  MealSlot,
  Recipe,
  ShoppingCategory,
  ShoppingListItem,
} from '../types';
import { scaleQuantity } from './nutrition';

export const SHOPPING_CATEGORY_ORDER: ShoppingCategory[] = [
  'Meat & fish',
  'Dairy & eggs',
  'Fruit',
  'Vegetables',
  'Carbohydrates',
  'Tinned & packaged',
  'Herbs & spices',
  'Sauces & condiments',
  'Other',
];

/**
 * Build a combined shopping list from the selected meals, merging duplicate
 * ingredients (matched on normalised name + unit) and summing quantities.
 */
export function buildShoppingList(
  selections: Partial<Record<MealSlot, MealSelection>>,
  recipeById: (id: string) => Recipe | undefined,
): ShoppingListItem[] {
  const merged = new Map<string, ShoppingListItem>();

  for (const selection of Object.values(selections)) {
    if (!selection) continue;
    const recipe = recipeById(selection.recipeId);
    if (!recipe) continue;
    for (const ing of recipe.ingredients) {
      const qty = scaleQuantity(ing, selection.servings);
      const key = `${ing.name.trim().toLowerCase()}|${ing.unit}`;
      const existing = merged.get(key);
      if (existing) {
        existing.quantity = Math.round((existing.quantity + qty) * 100) / 100;
      } else {
        merged.set(key, {
          name: ing.name,
          quantity: qty,
          unit: ing.unit,
          category: ing.category,
          owned: false,
        });
      }
    }
  }

  return [...merged.values()].sort(
    (a, b) =>
      SHOPPING_CATEGORY_ORDER.indexOf(a.category) - SHOPPING_CATEGORY_ORDER.indexOf(b.category) ||
      a.name.localeCompare(b.name),
  );
}

export function formatShoppingItem(item: ShoppingListItem): string {
  const unitless = ['small', 'medium', 'large', 'item'];
  const qty = unitless.includes(item.unit)
    ? `${item.quantity}${item.unit === 'item' ? '' : ` ${item.unit}`}`
    : `${item.quantity} ${item.unit}`;
  return `${qty} ${item.name}`;
}

export function shoppingListAsText(items: ShoppingListItem[]): string {
  const lines: string[] = ['Shopping list — Build Your Own Meal Plan', ''];
  let currentCategory: ShoppingCategory | null = null;
  for (const item of items) {
    if (item.category !== currentCategory) {
      currentCategory = item.category;
      lines.push(`${currentCategory}:`);
    }
    lines.push(`  - ${formatShoppingItem(item)}${item.owned ? ' (already owned)' : ''}`);
  }
  return lines.join('\n');
}
