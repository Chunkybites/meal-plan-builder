/**
 * Recipe-level validation. Complements validate-food-data (foods/links) and
 * migrate-recipes (calc-vs-authored deltas). Flags for REVIEW, never deletes.
 * Run: npm run validate-recipes
 *
 * Checks:
 *  1. Duplicate recipe ids.
 *  2. Every recipe is fully-linked (calculated) OR has authored nutrition — never neither.
 *  3. Recipe energy plausibility: calculated per-serving kcal vs Atwater from calculated macros.
 *  4. Allergen / dietary audit from ingredient names (catches hidden allergens & tag conflicts).
 *     Flags uncertainty rather than asserting — a warning means "verify", not "wrong".
 */
import { ALL_RECIPES } from '../src/data/recipes';
import { getCalculatedNutrition, isRecipeLinked } from '../src/utils/recipeCalc';
import { atwaterKcal } from '../src/data/food/conversions';
import type { Recipe } from '../src/types';

interface Issue { level: 'error' | 'warning'; where: string; message: string; }
const issues: Issue[] = [];
const err = (where: string, m: string) => issues.push({ level: 'error', where, message: m });
const warn = (where: string, m: string) => issues.push({ level: 'warning', where, message: m });

// ---- 1. Duplicate ids ----
const seen = new Set<string>();
for (const r of ALL_RECIPES) {
  if (seen.has(r.id)) err(`recipe:${r.id}`, 'Duplicate recipe id');
  seen.add(r.id);
}

// ---- dietary/allergen keyword rules (lower-cased substring match on ingredient names) ----
// A hit is a WARNING to review unless it is an unambiguous contradiction (→ error).
// "butter" appears in many non-dairy foods: nut butters, cocoa butter, butter BEANS, butternut squash.
const NON_DAIRY_BUTTER = ['peanut', 'nut', 'almond', 'cashew', 'cocoa', 'seed', 'shea', 'bean', 'squash'];
const containsButterDairy = (name: string) => name.includes('butter') && !NON_DAIRY_BUTTER.some((c) => name.includes(c));

// Plant-based versions of otherwise-dairy words (soya milk, oat cream, coconut yoghurt…).
const PLANT_DAIRY = ['soya', 'soy ', 'oat milk', 'oat cream', 'almond', 'coconut', 'cashew', 'plant', 'vegan', 'dairy-free', 'dairy free', 'rice milk'];
const isPlantVersion = (name: string) => PLANT_DAIRY.some((p) => name.toLowerCase().includes(p));

const MEAT = ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'bacon', 'ham', 'sausage', 'mince', 'gelatin', 'lard'];
const FISH = ['fish', 'salmon', 'tuna', 'mackerel', 'sardine', 'cod', 'prawn', 'anchovy', 'haddock', 'shrimp'];
const DAIRY = ['milk', 'cheese', 'yoghurt', 'yogurt', 'cream', 'whey', 'ghee', 'custard', 'feta', 'mozzarella', 'paneer', 'halloumi'];
const EGG = ['egg'];
const GLUTEN = ['wheat', 'barley', 'rye', 'couscous', 'breadcrumb', 'cracker', 'flour']; // bread/pasta/oats handled separately
const NUTS = ['peanut', 'almond', 'walnut', 'cashew', 'pistachio', 'hazelnut', 'pecan', 'brazil nut', 'pine nut', 'pesto'];
const HIDDEN = [
  { kw: 'soy sauce', allergen: 'gluten (wheat) unless tamari', tags: ['gluten-free'] },
  { kw: 'worcestershire', allergen: 'fish (anchovy) unless a vegetarian version', tags: ['vegetarian', 'vegan', 'pescatarian'] },
  { kw: 'pesto', allergen: 'milk & nuts', tags: ['dairy-free', 'nut-free', 'vegan'] },
  { kw: 'stock cube', allergen: 'gluten/celery (varies by brand)', tags: ['gluten-free'] },
  { kw: 'honey', allergen: 'honey (not vegan)', tags: ['vegan'] },
];

/** True when the ingredient name explicitly states a variant that is safe for `tag`. */
function nameSafeFor(name: string, tag: string): boolean {
  const n = name.toLowerCase();
  if (tag === 'gluten-free') return n.includes('gluten-free') || n.includes('gluten free') || n.includes('tamari');
  if (tag === 'dairy-free') return n.includes('dairy-free') || n.includes('dairy free') || n.includes('plant-based') || n.includes('vegan');
  if (tag === 'vegetarian' || tag === 'pescatarian') return n.includes('vegetarian') || n.includes('vegan');
  if (tag === 'vegan') return n.includes('vegan');
  return false;
}

const anyIng = (r: Recipe, kws: string[]) =>
  r.ingredients.filter((i) => kws.some((k) => i.name.toLowerCase().includes(k))).map((i) => i.name);

for (const r of ALL_RECIPES) {
  const w = `recipe:${r.id}`;
  const linked = isRecipeLinked(r);

  // ---- 2. linked-or-authored ----
  if (!linked && !r.nutrition) err(w, 'Neither fully-linked (calculated) nor authored nutrition — recipe has no usable nutrition.');

  // ---- 3. energy plausibility (linked only; needs calculated macros) ----
  if (linked) {
    const calc = getCalculatedNutrition(r);
    if (calc) {
      const est = atwaterKcal(calc.raw.perServing);
      const kcal = calc.raw.perServing.energyKcal;
      if (est !== undefined && kcal !== undefined && kcal > 0) {
        const diff = Math.abs(est - kcal) / kcal;
        if (diff > 0.2) warn(w, `Per-serving energy ${Math.round(kcal)} kcal vs Atwater-from-macros ${Math.round(est)} kcal (${Math.round(diff * 100)}% — verify links/weights).`);
      }
      if (calc.completenessPercentage < 60) warn(w, `Low nutrient completeness (${calc.completenessPercentage}%).`);
      for (const wn of calc.warnings) warn(w, wn);
    }
  }

  // ---- 4. dietary/allergen audit from ingredient names ----
  const tags = r.dietaryTags;
  const has = (kws: string[]) => anyIng(r, kws);
  const hasDairy = () => has(DAIRY).filter((name) => !isPlantVersion(name));
  if (tags.includes('vegan')) {
    for (const list of [MEAT, FISH, EGG]) { const h = has(list); if (h.length) err(w, `Tagged vegan but contains: ${h.join(', ')}`); }
    const d = hasDairy(); if (d.length) err(w, `Tagged vegan but contains: ${d.join(', ')}`);
    const b = r.ingredients.filter((i) => containsButterDairy(i.name.toLowerCase())).map((i) => i.name); if (b.length) err(w, `Tagged vegan but contains dairy butter: ${b.join(', ')}`);
    const honey = has(['honey']); if (honey.length) err(w, `Tagged vegan but contains: ${honey.join(', ')}`);
  }
  if (tags.includes('vegetarian')) { for (const list of [MEAT, FISH]) { const h = has(list); if (h.length) err(w, `Tagged vegetarian but contains: ${h.join(', ')}`); } }
  if (tags.includes('pescatarian')) { const h = has(MEAT); if (h.length) err(w, `Tagged pescatarian but contains meat: ${h.join(', ')}`); }
  if (tags.includes('dairy-free')) {
    const d = hasDairy(); if (d.length) err(w, `Tagged dairy-free but contains: ${d.join(', ')}`);
    const b = r.ingredients.filter((i) => containsButterDairy(i.name.toLowerCase())).map((i) => i.name); if (b.length) err(w, `Tagged dairy-free but contains dairy butter: ${b.join(', ')}`);
  }
  if (tags.includes('gluten-free')) {
    const h = has(GLUTEN); if (h.length) err(w, `Tagged gluten-free but contains gluten source: ${h.join(', ')}`);
    const bp = has(['bread', 'pasta', 'noodle', 'wrap', 'tortilla', 'pastry']); if (bp.length) warn(w, `Tagged gluten-free — verify these are certified GF: ${bp.join(', ')}`);
    const oats = has(['oat']); if (oats.length) warn(w, `Tagged gluten-free with oats (${oats.join(', ')}) — must be certified gluten-free oats.`);
  }
  if (tags.includes('nut-free')) { const h = has(NUTS); if (h.length) err(w, `Tagged nut-free but contains: ${h.join(', ')}`); }

  // Hidden-allergen prompts (always informational when the ingredient is present).
  for (const hd of HIDDEN) {
    const hit = anyIng(r, [hd.kw]);
    if (hit.length) {
      const conflicting = hd.tags.filter((t) => (tags as string[]).includes(t) && !nameSafeFor(hit[0], t));
      if (conflicting.length) err(w, `Contains "${hit[0]}" (${hd.allergen}) which conflicts with tag(s): ${conflicting.join(', ')}`);
      else warn(w, `Contains "${hit[0]}" — hidden allergen risk: ${hd.allergen}. Verify allergens[].`);
    }
  }
}

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
for (const i of issues) console.log(`${i.level === 'error' ? 'ERROR' : 'warn '}  ${i.where}: ${i.message}`);
console.log(`\n${ALL_RECIPES.length} recipes checked. ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
