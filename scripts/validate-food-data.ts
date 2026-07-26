/**
 * Validate canonical food records, recipe ingredient links, and the
 * composition↔evidence boundary. Flags trigger review, never deletion.
 * Run: npm run validate-food
 */
import { ALL_LOCAL_FOODS } from '../src/data/food/foodStore';
import { NUTRIENT_KEYS } from '../src/utils/recipeNutrition';
import { atwaterKcal, sodiumMgToSaltG } from '../src/data/food/conversions';
import { ALL_INGREDIENT_LINKS as INGREDIENT_LINKS } from '../src/data/recipes/ingredientLinks';
import { getLocalFood } from '../src/data/food/foodStore';
import { ALL_EVIDENCE } from '../src/data/conditions/engine';
import type { CanonicalNutrition } from '../src/data/food/types';

interface Issue { level: 'error' | 'warning'; where: string; message: string; }
const issues: Issue[] = [];
const err = (where: string, message: string) => issues.push({ level: 'error', where, message });
const warn = (where: string, message: string) => issues.push({ level: 'warning', where, message });

// ---- 1. Canonical food records ----
const seenId = new Set<string>();
for (const f of ALL_LOCAL_FOODS) {
  const w = `food:${f.id}`;
  if (seenId.has(f.id)) err(w, 'Duplicate canonical food id');
  seenId.add(f.id);

  const n = f.nutrientsPer100g;
  for (const key of NUTRIENT_KEYS) {
    const v = n[key as keyof CanonicalNutrition];
    if (v === undefined) continue;
    if (typeof v !== 'number' || Number.isNaN(v)) err(w, `${key} is not a number`);
    else if (v < 0) err(w, `${key} is negative (${v})`);
  }
  // Macro mass sanity: protein+carb+fat+... must not exceed ~100 g per 100 g.
  const massG = (n.proteinG ?? 0) + (n.carbohydrateG ?? 0) + (n.fatG ?? 0) + (n.fibreG ?? 0) + (n.alcoholG ?? 0) + (n.waterG ?? 0);
  if (massG > 105) warn(w, `Macro+water mass ${massG.toFixed(1)} g/100g exceeds 100 g — verify.`);
  // Energy vs macro (Atwater) tolerance.
  const est = atwaterKcal(n);
  if (est !== undefined && n.energyKcal !== undefined && est > 0) {
    const diff = Math.abs(est - n.energyKcal) / n.energyKcal;
    if (diff > 0.25) warn(w, `Declared energy ${n.energyKcal} kcal vs Atwater estimate ${Math.round(est)} kcal (${Math.round(diff * 100)}% off).`);
  }
  // Sodium/salt consistency.
  if (n.sodiumMg !== undefined && n.saltG !== undefined) {
    const expected = sodiumMgToSaltG(n.sodiumMg)!;
    if (Math.abs(expected - n.saltG) > Math.max(0.05, expected * 0.1)) warn(w, `salt ${n.saltG} g inconsistent with sodium ${n.sodiumMg} mg (expected ≈ ${expected.toFixed(2)} g).`);
  }
  if (!f.dataQuality?.status) err(w, 'Missing dataQuality.status');
  if (!f.provenance?.datasetName) err(w, 'Missing provenance.datasetName');
  if (f.preparationState === undefined) warn(w, 'No preparationState set (raw/cooked ambiguity).');
}

// ---- 2. Recipe ingredient links ----
const seenLink = new Set<string>();
for (const l of INGREDIENT_LINKS) {
  const w = `link:${l.recipeIngredientId}`;
  if (seenLink.has(l.recipeIngredientId)) err(w, 'Duplicate ingredient link');
  seenLink.add(l.recipeIngredientId);
  if (!getLocalFood(l.canonicalFoodId)) err(w, `Links to unknown food id: ${l.canonicalFoodId}`);
  if (l.gramWeight <= 0) err(w, `Non-positive gramWeight (${l.gramWeight})`);
  const food = getLocalFood(l.canonicalFoodId);
  if (food && food.preparationState === 'raw' && l.quantityBasis === 'cooked') warn(w, 'Cooked basis linked to a raw food record.');
  if (food && (food.preparationState === 'cooked' || food.preparationState === 'boiled') && l.quantityBasis === 'raw') warn(w, 'Raw basis linked to a cooked food record.');
}

// ---- 3. Composition ↔ evidence boundary ----
// Supplement evidence items must NOT match recipe ingredients (supplement ≠ culinary food exposure).
for (const item of ALL_EVIDENCE) {
  if (item.isSupplement && item.matchKeywords.length > 0) {
    warn(`evidence:${item.id}`, 'Supplement evidence item carries recipe matchKeywords — risks applying supplement evidence to food exposure.');
  }
  // Evidence items with matchKeywords that never match any seed food (informational).
  if (!item.isSupplement && item.matchKeywords.length > 0) {
    const anyFood = ALL_LOCAL_FOODS.some((f) => item.matchKeywords.some((kw) => `${f.canonicalName} ${f.aliases.join(' ')}`.includes(kw)));
    if (!anyFood) warn(`evidence:${item.id}`, 'Food evidence matchKeywords match no canonical food in the current store (may match recipe free-text only).');
  }
}

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
for (const i of issues) console.log(`${i.level === 'error' ? 'ERROR' : 'warn '}  ${i.where}: ${i.message}`);
console.log(`\n${ALL_LOCAL_FOODS.length} foods, ${INGREDIENT_LINKS.length} links checked. ${errors.length} error(s), ${warnings.length} warning(s).`);
process.exit(errors.length ? 1 : 0);
