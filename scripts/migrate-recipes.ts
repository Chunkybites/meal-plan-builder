/**
 * Recipe migration discrepancy report. For every recipe with reviewed ingredient
 * links, compute nutrition from canonical foods and compare with the previously
 * hand-authored per-serving values. Flags (for REVIEW, not auto-overwrite):
 *   calories/protein/carbs/fat > 10%, fibre > 20%.
 * Run: npm run migrate-recipes
 */
import { ALL_RECIPES } from '../src/data/recipes';
import { getCalculatedNutrition, isRecipeLinked } from '../src/utils/recipeCalc';

const THRESHOLDS: Record<string, number> = { calories: 0.1, protein: 0.1, carbs: 0.1, fat: 0.1, fibre: 0.2 };

let linked = 0;
let flagged = 0;
const notLinked: string[] = [];

for (const recipe of ALL_RECIPES) {
  if (!isRecipeLinked(recipe)) {
    notLinked.push(recipe.id);
    continue;
  }
  linked += 1;
  const calc = getCalculatedNutrition(recipe);
  if (!calc) continue;
  const neu = calc.perServing;

  // Calculated-only recipe (no authored baseline to compare) — report the values.
  if (!recipe.nutrition) {
    console.log(`\n${recipe.id} — CALCULATED (no authored baseline) — completeness ${calc.completenessPercentage}%${calc.partialNutrients.length ? `, partial: ${calc.partialNutrients.join(', ')}` : ''}`);
    console.log(`   ${neu.calories} kcal · P ${neu.protein} · C ${neu.carbs} · F ${neu.fat} · fibre ${neu.fibre}`);
    if (calc.warnings.length) console.log(`   warnings: ${calc.warnings.join('; ')}`);
    continue;
  }

  const old = recipe.nutrition;
  const diffs: string[] = [];
  for (const key of Object.keys(THRESHOLDS) as (keyof typeof old)[]) {
    const o = Number(old[key] ?? 0);
    const n = Number(neu[key] ?? 0);
    if (o === 0) continue;
    const rel = Math.abs(n - o) / o;
    const over = rel > THRESHOLDS[key as string];
    diffs.push(`${key}: authored ${o} → calculated ${n} (${(rel * 100).toFixed(0)}%${over ? ' ⚠ REVIEW' : ''})`);
    if (over) flagged += 1;
  }
  console.log(`\n${recipe.id} — completeness ${calc.completenessPercentage}%${calc.partialNutrients.length ? `, partial: ${calc.partialNutrients.join(', ')}` : ''}`);
  for (const d of diffs) console.log(`   ${d}`);
  if (calc.warnings.length) console.log(`   warnings: ${calc.warnings.join('; ')}`);
}

console.log(`\n${linked} recipe(s) linked & recalculated; ${flagged} field flag(s) over threshold for review.`);
console.log(`${notLinked.length} recipe(s) not yet linked (await CoFID import + more canonical foods).`);
