/** Enumerate distinct ingredient names across the LEGACY (unlinked) recipes. */
import { ALL_RECIPES } from '../src/data/recipes';
import { getIngredientLink } from '../src/data/recipes/ingredientLinks';

const counts = new Map<string, { n: number; units: Set<string>; notes: Set<string> }>();
let legacyRecipes = 0;

for (const r of ALL_RECIPES) {
  const linked = r.ingredients.every((i) => getIngredientLink(r.id, i.name));
  if (linked) continue;
  legacyRecipes += 1;
  for (const ing of r.ingredients) {
    const key = ing.name;
    const e = counts.get(key) ?? { n: 0, units: new Set<string>(), notes: new Set<string>() };
    e.n += 1;
    e.units.add(ing.unit);
    if (ing.note) e.notes.add(ing.note);
    counts.set(key, e);
  }
}

const sorted = [...counts.entries()].sort((a, b) => b[1].n - a[1].n);
console.log(`${legacyRecipes} legacy recipes · ${sorted.length} distinct ingredient names\n`);
for (const [name, e] of sorted) {
  console.log(`${String(e.n).padStart(3)}  ${name}  [${[...e.units].join('/')}]${e.notes.size ? '  {' + [...e.notes].slice(0, 2).join(' | ') + '}' : ''}`);
}
