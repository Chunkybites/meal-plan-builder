/**
 * Extract the CoFID records referenced by reviewed recipe ingredient links into a
 * small bundled JSON, so linked recipes calculate synchronously and offline
 * without shipping the full 6.5 MB CoFID dataset in the browser bundle.
 * Run after import-cofid: npm run extract-recipe-foods
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ALL_INGREDIENT_LINKS as INGREDIENT_LINKS } from '../src/data/recipes/ingredientLinks';
import type { CanonicalFood } from '../src/data/food/types';

const FOODS = path.resolve('src/data/generated/cofid/foods.json');
const OUT = path.resolve('src/data/generated/cofid/recipeFoods.json');

if (!fs.existsSync(FOODS)) {
  console.error('No generated CoFID foods.json — run `npm run import-cofid` first.');
  process.exit(2);
}
const all = JSON.parse(fs.readFileSync(FOODS, 'utf8')) as CanonicalFood[];
const byId = new Map(all.map((f) => [f.id, f]));

const neededCofidIds = [...new Set(INGREDIENT_LINKS.map((l) => l.canonicalFoodId).filter((id) => id.startsWith('cofid-')))];
const extracted: CanonicalFood[] = [];
const missing: string[] = [];
for (const id of neededCofidIds) {
  const f = byId.get(id);
  if (f) extracted.push(f);
  else missing.push(id);
}

fs.writeFileSync(OUT, JSON.stringify(extracted, null, 0));
console.log(`Extracted ${extracted.length}/${neededCofidIds.length} recipe-referenced CoFID records → ${OUT}`);
if (missing.length) console.error(`MISSING (fix the link food ids): ${missing.join(', ')}`);
process.exit(missing.length ? 1 : 0);
