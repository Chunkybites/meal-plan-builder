/**
 * CoFID food finder — the reusable food-matching tool for recipe authoring.
 * Prints the top canonical-food candidates for a query so an author can pick the
 * correct record (right preparation state, subtype) instead of guessing.
 *
 *   npm run find-food -- "chicken breast grilled"
 *   npm run find-food -- "rice white boiled" 12
 *
 * Never auto-selects; it surfaces candidates + key nutrients for a human decision.
 */
import * as fs from 'node:fs';
import { scoreFood } from '../src/data/food/foodStore';
import type { CanonicalFood } from '../src/data/food/types';

// Full CoFID set (2,886) lives in the generated data, not the bundled subset.
const FOODS_PATH = 'src/data/generated/cofid/foods.json';
const ALL_LOCAL_FOODS: CanonicalFood[] = fs.existsSync(FOODS_PATH)
  ? (JSON.parse(fs.readFileSync(FOODS_PATH, 'utf8')) as CanonicalFood[])
  : [];
if (!ALL_LOCAL_FOODS.length) {
  console.log('No CoFID data found — run: npm run import-cofid');
  process.exit(1);
}

const query = process.argv[2] ?? '';
const limit = Number(process.argv[3] ?? 8);
if (!query) {
  console.log('Usage: npm run find-food -- "<query>" [limit]');
  process.exit(1);
}

const n = (f: CanonicalFood) => f.nutrientsPer100g;
const ranked = ALL_LOCAL_FOODS.map((f) => ({ f, s: scoreFood(f, query) }))
  .filter((x) => x.s > 0)
  .sort((a, b) => b.s - a.s)
  .slice(0, limit);

console.log(`\nTop ${ranked.length} matches for "${query}":\n`);
for (const { f, s } of ranked) {
  const nn = n(f);
  console.log(
    `${f.id.padEnd(16)} ${s.toFixed(2)}  ${f.displayName}` +
      `\n${' '.repeat(24)}[${f.source}/${f.preparationState ?? 'unknown'}] ` +
      `${nn.energyKcal ?? '—'}kcal P${nn.proteinG ?? '—'} C${nn.carbohydrateG ?? '—'} F${nn.fatG ?? '—'} fib${nn.fibreG ?? '—'} ` +
      `Ca${nn.calciumMg ?? '—'} Fe${nn.ironMg ?? '—'} completeness ${f.dataQuality.completenessPercentage}%`,
  );
}
console.log();
