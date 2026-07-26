import type { MealSelection, MealSlot, Recipe, RecipeIngredient } from '../../types';
import { MEAL_SLOTS } from '../../types';
import { scaleNutrition } from '../../utils/nutrition';
import { getRecipeNutrition } from '../../utils/recipeCalc';
import { getPlanEvidenceLinks, getRecipeEvidence, type EvidenceLink } from './matchers';
import type { ConditionDefinition, ConditionId, MetricEvaluator } from './types';

/**
 * Config-driven relevance + dashboard scoring. Every factor and metric is
 * declared in the ConditionDefinition; this module only supplies the evaluators.
 * Relevance is CATEGORICAL (higher/moderate/lower/insufficient) — no false
 * precision — with a transparent factor breakdown behind it. Glycaemic
 * characterisation is categorical, never an invented GI number.
 */

// ---- Food classification ----
const REFINED_KEYWORDS = ['white rice', 'basmati', 'jasmine rice', 'white bread', 'baguette', 'naan', 'noodle', 'pasta', 'spaghetti', 'flatbread', 'wrap', 'tortilla', 'couscous', 'potato', 'crumpet', 'bagel'];
const WHOLEGRAIN_KEYWORDS = ['oat', 'barley', 'wholemeal', 'wholegrain', 'whole grain', 'brown rice', 'quinoa', 'rye', 'bulgur', 'buckwheat'];
const LEGUME_KEYWORDS = ['lentil', 'chickpea', 'kidney bean', 'black bean', 'butter bean', 'cannellini', 'edamame', 'hummus', 'baked bean', 'pulse'];
const NUT_KEYWORDS = ['walnut', 'almond', 'pistachio', 'cashew', 'pecan', 'hazelnut', 'peanut'];
const SEED_KEYWORDS = ['flaxseed', 'linseed', 'chia', 'pumpkin seed', 'sunflower seed', 'sesame'];
const OILY_FISH_KEYWORDS = ['salmon', 'mackerel', 'sardine', 'trout', 'herring', 'anchovy'];
const OMEGA3_KEYWORDS = [...OILY_FISH_KEYWORDS, 'flaxseed', 'linseed', 'chia', 'walnut'];
const CALCIUM_KEYWORDS = ['yoghurt', 'yogurt', 'milk', 'cheese', 'tofu', 'sardine', 'kale', 'pak choi', 'edamame'];
const VITD_KEYWORDS = ['salmon', 'mackerel', 'sardine', 'trout', 'egg', 'mushroom'];
const SOY_KEYWORDS = ['tofu', 'edamame', 'soy', 'soya', 'tempeh', 'miso'];
const REFINED_OR_PACKAGED = new Set<string>(['Tinned & packaged', 'Sauces & condiments']);

export type CarbClass = 'wholegrain' | 'legume' | 'fruit' | 'vegetable' | 'refined';
export type PlantClass = 'fruit' | 'vegetable' | 'legume' | 'nut' | 'seed' | 'wholegrain';
export type GlycaemicCategory = 'lower' | 'moderate' | 'higher' | 'unknown';
export type RelevanceCategory = 'higher' | 'moderate' | 'lower' | 'insufficient-data';

function nameHas(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase();
  return keywords.some((k) => n.includes(k));
}

export function classifyCarbSource(ing: RecipeIngredient): CarbClass | null {
  const name = ing.name.toLowerCase();
  if (nameHas(name, WHOLEGRAIN_KEYWORDS)) return 'wholegrain';
  if (nameHas(name, LEGUME_KEYWORDS)) return 'legume';
  if (nameHas(name, REFINED_KEYWORDS)) return 'refined';
  if (ing.category === 'Carbohydrates') return 'refined';
  if (ing.category === 'Fruit') return 'fruit';
  return null;
}

export function classifyPlant(ing: RecipeIngredient): { class: PlantClass; key: string } | null {
  const name = ing.name.toLowerCase();
  if (nameHas(name, SEED_KEYWORDS)) return { class: 'seed', key: normalisePlant(name) };
  if (nameHas(name, NUT_KEYWORDS)) return { class: 'nut', key: normalisePlant(name) };
  if (nameHas(name, LEGUME_KEYWORDS)) return { class: 'legume', key: normalisePlant(name) };
  if (nameHas(name, WHOLEGRAIN_KEYWORDS)) return { class: 'wholegrain', key: normalisePlant(name) };
  if (ing.category === 'Fruit') return { class: 'fruit', key: normalisePlant(name) };
  if (ing.category === 'Vegetables') return { class: 'vegetable', key: normalisePlant(name) };
  return null;
}

function normalisePlant(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(baby|fresh|frozen|tinned|dried|chopped|sliced|ground|raw|cooked|large|small|medium|ripe|red|green|yellow|mixed|whole)\b/g, '')
    .replace(/[^a-z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function distinctPlants(recipe: Recipe, classes?: PlantClass[]): Set<string> {
  const set = new Set<string>();
  for (const ing of recipe.ingredients) {
    const p = classifyPlant(ing);
    if (p && p.key && (!classes || classes.includes(p.class))) set.add(p.key);
  }
  return set;
}

/**
 * Fraction (0..1) of a relevance factor achieved by a single recipe.
 * Returns null when the factor is not assessable for this recipe.
 */
function recipeFactorFraction(recipe: Recipe, evaluator: MetricEvaluator, conditionId: ConditionId): number | null {
  const n = getRecipeNutrition(recipe).nutrition;
  switch (evaluator) {
    case 'fibre':
      return clamp01(n.fibre / 8);
    case 'protein':
    case 'protein-distribution':
      return clamp01(n.protein / 30);
    case 'unsaturated-fat': {
      const unsat = (n.monounsaturatedFat ?? 0) + (n.polyunsaturatedFat ?? 0);
      const sat = n.saturatedFat ?? 0;
      return unsat + sat > 0 ? clamp01(unsat / (unsat + sat)) : null;
    }
    case 'omega3': {
      const o = n.omega3 ?? 0;
      return o >= 0.5 ? 1 : o > 0 ? 0.5 : recipe.ingredients.some((i) => nameHas(i.name, OMEGA3_KEYWORDS)) ? 0.6 : 0;
    }
    case 'oily-fish':
      return recipe.ingredients.some((i) => nameHas(i.name, OILY_FISH_KEYWORDS)) ? 1 : 0;
    case 'carb-quality': {
      const classes = recipe.ingredients.map(classifyCarbSource).filter((c): c is CarbClass => c !== null);
      if (classes.length === 0) return null;
      return classes.filter((c) => c !== 'refined').length / classes.length;
    }
    case 'added-sugar': {
      const a = n.addedSugar;
      return typeof a === 'number' ? clamp01(1 - a / 20) : 0.6; // neutral when unavailable
    }
    case 'plant-diversity':
      return clamp01(distinctPlants(recipe).size / 5);
    case 'fruit-veg-diversity':
      return clamp01(distinctPlants(recipe, ['fruit', 'vegetable']).size / 4);
    case 'legumes':
      return recipe.ingredients.some((i) => nameHas(i.name, LEGUME_KEYWORDS)) ? 1 : 0;
    case 'wholegrain':
      return recipe.ingredients.some((i) => nameHas(i.name, WHOLEGRAIN_KEYWORDS)) ? 1 : 0;
    case 'wholefood-proportion': {
      if (recipe.ingredients.length === 0) return null;
      const whole = recipe.ingredients.filter((i) => !REFINED_OR_PACKAGED.has(i.category) && !nameHas(i.name, REFINED_KEYWORDS)).length;
      return clamp01(whole / recipe.ingredients.length);
    }
    case 'calcium-foods':
      return recipe.ingredients.some((i) => nameHas(i.name, CALCIUM_KEYWORDS)) ? 1 : 0;
    case 'vitamin-d-foods':
      return recipe.ingredients.some((i) => nameHas(i.name, VITD_KEYWORDS)) ? 1 : 0;
    case 'soy-foods':
      return recipe.ingredients.some((i) => nameHas(i.name, SOY_KEYWORDS)) ? 1 : 0;
    case 'evidence-linked': {
      const count = getRecipeEvidence(recipe, conditionId).length;
      return count >= 2 ? 1 : count === 1 ? 0.5 : 0;
    }
    default:
      return null;
  }
}

export interface RelevanceComponent {
  label: string;
  fraction: number;
  weight: number;
  points: number;
  maxPoints: number;
}

export interface GlycaemicAssessment {
  category: GlycaemicCategory;
  label: string;
  note: string;
}

export interface RelevanceResult {
  category: RelevanceCategory;
  categoryLabel: string;
  score: number; // 0..100 internal, shown in the breakdown only
  components: RelevanceComponent[];
  glycaemic: GlycaemicAssessment | null;
  evidenceCount: number;
}

const CATEGORY_LABELS: Record<RelevanceCategory, string> = {
  higher: 'Higher relevance',
  moderate: 'Moderate relevance',
  lower: 'Lower relevance',
  'insufficient-data': 'Insufficient data',
};

export function assessGlycaemic(recipe: Recipe): GlycaemicAssessment {
  const classes = recipe.ingredients.map(classifyCarbSource).filter((c): c is CarbClass => c !== null);
  if (classes.length === 0) {
    return { category: 'unknown', label: 'Unable to estimate reliably', note: 'This recipe has little or no major carbohydrate source to characterise.' };
  }
  const favourable = classes.filter((c) => c === 'wholegrain' || c === 'legume' || c === 'fruit' || c === 'vegetable').length;
  const refined = classes.filter((c) => c === 'refined').length;
  const fibre = getRecipeNutrition(recipe).nutrition.fibre;
  const favourableShare = favourable / classes.length;
  let category: GlycaemicCategory;
  if (favourableShare >= 0.6 && fibre >= 5) category = 'lower';
  else if (refined / classes.length >= 0.6 && fibre < 4) category = 'higher';
  else category = 'moderate';
  const label =
    category === 'lower' ? 'Lower glycaemic carbohydrate profile' : category === 'higher' ? 'Higher glycaemic carbohydrate profile' : 'Moderate glycaemic carbohydrate profile';
  return { category, label, note: 'A category, not a measured GI value. Real glycaemic response also depends on cooking, processing, ripeness, and the fat, protein and fibre eaten alongside.' };
}

/** Categorical relevance for one recipe under the active condition's factor config. */
export function computeRelevance(recipe: Recipe, def: ConditionDefinition): RelevanceResult {
  const components: RelevanceComponent[] = [];
  let assessable = 0;
  let totalWeight = 0;
  let earned = 0;
  for (const factor of def.relevanceFactors) {
    const frac = recipeFactorFraction(recipe, factor.evaluator, def.id);
    totalWeight += factor.weight;
    if (frac !== null) assessable += 1;
    const usedFrac = frac ?? 0.5; // neutral if unassessable
    earned += usedFrac * factor.weight;
    components.push({ label: factor.label, fraction: usedFrac, weight: factor.weight, points: Math.round(usedFrac * factor.weight), maxPoints: factor.weight });
  }
  const score = totalWeight > 0 ? Math.round((earned / totalWeight) * 100) : 0;
  const usesCarbQuality = def.relevanceFactors.some((f) => f.evaluator === 'carb-quality');

  let category: RelevanceCategory;
  if (assessable < Math.max(2, Math.ceil(def.relevanceFactors.length / 3))) category = 'insufficient-data';
  else if (score >= 65) category = 'higher';
  else if (score >= 42) category = 'moderate';
  else category = 'lower';

  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    score,
    components,
    glycaemic: usesCarbQuality ? assessGlycaemic(recipe) : null,
    evidenceCount: getRecipeEvidence(recipe, def.id).length,
  };
}

// ============================ DAY-LEVEL DASHBOARD ============================

const SLOT_LABELS: Record<MealSlot, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Night-time snack' };

export interface ProteinDistributionEntry { slot: MealSlot; label: string; protein: number; recipeName: string | null; }
export interface FoodSource { recipeName: string; slot: MealSlot; detail: string; }
export interface CarbQuality { counts: Record<CarbClass, number>; total: number; favourableShare: number; }
export interface PlantDiversity { total: number; byClass: Record<PlantClass, string[]>; }
export interface AddedSugarSummary { total: number; recipesWithData: number; recipesTotal: number; complete: boolean; }

export interface ConditionDashboardData {
  fibre: number;
  proteinTotal: number;
  proteinDistribution: ProteinDistributionEntry[];
  omega3Sources: FoodSource[];
  oilyFishSources: FoodSource[];
  calciumFoods: FoodSource[];
  vitaminDFoods: FoodSource[];
  soyFoods: FoodSource[];
  plantDiversity: PlantDiversity;
  fruitVegDiversity: PlantDiversity;
  carbQuality: CarbQuality;
  addedSugar: AddedSugarSummary;
  wholefoodProportion: number;
  evidenceLinks: EvidenceLink[];
}

function collectSources(chosen: { slot: MealSlot; recipe: Recipe }[], keywords: string[]): FoodSource[] {
  const out: FoodSource[] = [];
  for (const { slot, recipe } of chosen) {
    const hit = recipe.ingredients.find((i) => nameHas(i.name, keywords));
    if (hit) out.push({ recipeName: recipe.name, slot, detail: `contains ${hit.name.toLowerCase()}` });
  }
  return out;
}

export function buildConditionDashboard(
  selections: Partial<Record<MealSlot, MealSelection>>,
  conditionId: ConditionId,
  recipeById: (id: string) => Recipe | undefined,
): ConditionDashboardData {
  const chosen: { slot: MealSlot; recipe: Recipe; servings: number }[] = [];
  for (const slot of MEAL_SLOTS) {
    const sel = selections[slot];
    const recipe = sel ? recipeById(sel.recipeId) : undefined;
    if (sel && recipe) chosen.push({ slot, recipe, servings: sel.servings });
  }

  let fibre = 0;
  let proteinTotal = 0;
  const proteinDistribution: ProteinDistributionEntry[] = MEAL_SLOTS.map((slot) => {
    const entry = chosen.find((c) => c.slot === slot);
    if (!entry) return { slot, label: SLOT_LABELS[slot], protein: 0, recipeName: null };
    const scaled = scaleNutrition(getRecipeNutrition(entry.recipe).nutrition, entry.servings);
    fibre += scaled.fibre;
    proteinTotal += scaled.protein;
    return { slot, label: SLOT_LABELS[slot], protein: scaled.protein, recipeName: entry.recipe.name };
  });

  const byClass: Record<PlantClass, Set<string>> = { fruit: new Set(), vegetable: new Set(), legume: new Set(), nut: new Set(), seed: new Set(), wholegrain: new Set() };
  for (const { recipe } of chosen) {
    for (const ing of recipe.ingredients) {
      const p = classifyPlant(ing);
      if (p && p.key) byClass[p.class].add(p.key);
    }
  }
  const plantByClass = Object.fromEntries((Object.keys(byClass) as PlantClass[]).map((k) => [k, [...byClass[k]].sort()])) as Record<PlantClass, string[]>;
  const plantTotal = (Object.values(plantByClass) as string[][]).reduce((s, arr) => s + arr.length, 0);
  const fruitVeg = { fruit: plantByClass.fruit, vegetable: plantByClass.vegetable } as Record<PlantClass, string[]>;

  const counts: Record<CarbClass, number> = { wholegrain: 0, legume: 0, fruit: 0, vegetable: 0, refined: 0 };
  let wholeCount = 0;
  let ingCount = 0;
  for (const { recipe } of chosen) {
    for (const ing of recipe.ingredients) {
      const c = classifyCarbSource(ing);
      if (c) counts[c] += 1;
      ingCount += 1;
      if (!REFINED_OR_PACKAGED.has(ing.category) && !nameHas(ing.name, REFINED_KEYWORDS)) wholeCount += 1;
    }
  }
  const carbTotal = (Object.values(counts) as number[]).reduce((s, v) => s + v, 0);
  const favourable = counts.wholegrain + counts.legume + counts.fruit + counts.vegetable;

  let addedSugarTotal = 0;
  let recipesWithData = 0;
  for (const { recipe, servings } of chosen) {
    const addedSugar = getRecipeNutrition(recipe).nutrition.addedSugar;
    if (typeof addedSugar === 'number') {
      addedSugarTotal += addedSugar * servings;
      recipesWithData += 1;
    }
  }

  const omega3Sources = collectSources(chosen, OMEGA3_KEYWORDS);
  const oilyFishSources = collectSources(chosen, OILY_FISH_KEYWORDS);
  const calciumFoods = collectSources(chosen, CALCIUM_KEYWORDS);
  const vitaminDFoods = collectSources(chosen, VITD_KEYWORDS);
  const soyFoods = collectSources(chosen, SOY_KEYWORDS);

  return {
    fibre: Math.round(fibre * 10) / 10,
    proteinTotal: Math.round(proteinTotal * 10) / 10,
    proteinDistribution,
    omega3Sources,
    oilyFishSources,
    calciumFoods,
    vitaminDFoods,
    soyFoods,
    plantDiversity: { total: plantTotal, byClass: plantByClass },
    fruitVegDiversity: { total: fruitVeg.fruit.length + fruitVeg.vegetable.length, byClass: fruitVeg },
    carbQuality: { counts, total: carbTotal, favourableShare: carbTotal > 0 ? favourable / carbTotal : 0 },
    addedSugar: { total: Math.round(addedSugarTotal * 10) / 10, recipesWithData, recipesTotal: chosen.length, complete: recipesWithData === chosen.length && chosen.length > 0 },
    wholefoodProportion: ingCount > 0 ? wholeCount / ingCount : 0,
    evidenceLinks: getPlanEvidenceLinks(chosen.map((c) => c.recipe), conditionId),
  };
}
