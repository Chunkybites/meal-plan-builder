/**
 * Recipe coverage matrix. Analyses the current recipe library by meal slot,
 * primary base, dietary tags, nutritional characteristics, practical use and
 * condition evidence-linkage — to find genuine gaps before authoring new recipes.
 * Reproducible: re-run after every batch. Run: npm run coverage-matrix
 */
import { ALL_RECIPES } from '../src/data/recipes';
import { INGREDIENT_MAP } from '../src/data/ingredients';
import { CONDITIONS } from '../src/data/conditions/engine';
import { getRecipeEvidence } from '../src/data/conditions/matchers';
import type { Recipe } from '../src/types';

const tally = (title: string, rows: [string, number][]) => {
  console.log(`\n## ${title}`);
  for (const [k, v] of rows) console.log(`  ${k.padEnd(28)} ${v}`);
};

const countBy = (pred: (r: Recipe) => boolean) => ALL_RECIPES.filter(pred).length;
const slot = (s: string) => (r: Recipe) => r.mealCategories.includes(s as Recipe['mealCategories'][number]);
const tag = (t: string) => (r: Recipe) => r.dietaryTags.includes(t as Recipe['dietaryTags'][number]);

console.log(`# Coverage matrix — ${ALL_RECIPES.length} recipes\n`);

tally('Meal slot (recipes may carry >1)', [
  ['breakfast', countBy(slot('breakfast'))],
  ['lunch', countBy(slot('lunch'))],
  ['dinner', countBy(slot('dinner'))],
  ['snack', countBy(slot('snack'))],
]);

// Primary base ingredient (via ingredients catalogue name)
const baseCounts = new Map<string, number>();
for (const r of ALL_RECIPES) {
  const name = INGREDIENT_MAP[r.primaryIngredient]?.name ?? r.primaryIngredient;
  baseCounts.set(name, (baseCounts.get(name) ?? 0) + 1);
}
tally('Primary base', [...baseCounts.entries()].sort((a, b) => b[1] - a[1]));

const TAGS = ['high-protein', 'high-fibre', 'low-calorie', 'low-carb', 'lower-fat', 'vegetarian', 'vegan', 'pescatarian', 'gluten-free', 'dairy-free', 'nut-free', 'quick', 'under-20', 'meal-prep', 'budget'];
tally('Dietary / nutritional tags', TAGS.map((t) => [t, countBy(tag(t))] as [string, number]));

// Condition evidence linkage (how many recipes surface ≥1 evidence link per condition)
tally('Condition evidence-linked recipes', CONDITIONS.map((c) => {
  const n = ALL_RECIPES.filter((r) => getRecipeEvidence(r, c.id).length > 0).length;
  return [c.shortName, n] as [string, number];
}));

// Calculated vs authored
import('../src/utils/recipeCalc').then(({ isRecipeLinked }) => {
  const linked = ALL_RECIPES.filter(isRecipeLinked).length;
  tally('Nutrition source', [
    ['calculated (fully linked)', linked],
    ['authored (legacy)', ALL_RECIPES.length - linked],
  ]);
});
