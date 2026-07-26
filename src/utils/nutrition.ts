import type {
  MicronutrientData,
  NutritionData,
  Recipe,
  RecipeIngredient,
} from '../types';

export const EMPTY_NUTRITION: NutritionData = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fibre: 0,
};

const OPTIONAL_KEYS: (keyof NutritionData)[] = [
  'sugar',
  'addedSugar',
  'saturatedFat',
  'monounsaturatedFat',
  'polyunsaturatedFat',
  'omega3',
  'omega6',
  'cholesterol',
  'sodium',
  'potassium',
];

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Scale a per-serving nutrition block by a serving multiplier. */
export function scaleNutrition(n: NutritionData, servings: number): NutritionData {
  const out: NutritionData = {
    calories: Math.round(n.calories * servings),
    protein: round1(n.protein * servings),
    carbs: round1(n.carbs * servings),
    fat: round1(n.fat * servings),
    fibre: round1(n.fibre * servings),
  };
  for (const key of OPTIONAL_KEYS) {
    const v = n[key];
    if (typeof v === 'number') out[key] = round1(v * servings);
  }
  return out;
}

/** Scale per-serving micronutrients by a serving multiplier. */
export function scaleMicros(m: MicronutrientData, servings: number): MicronutrientData {
  const out: MicronutrientData = {};
  for (const [key, value] of Object.entries(m)) {
    if (typeof value === 'number') {
      out[key as keyof MicronutrientData] = round1(value * servings);
    }
  }
  return out;
}

/** Combine several nutrition blocks into daily totals. Missing optional fields are skipped, not treated as zero data. */
export function sumNutrition(blocks: NutritionData[]): NutritionData {
  const out: NutritionData = { ...EMPTY_NUTRITION };
  const seenOptional = new Set<keyof NutritionData>();
  for (const b of blocks) {
    out.calories += b.calories;
    out.protein += b.protein;
    out.carbs += b.carbs;
    out.fat += b.fat;
    out.fibre += b.fibre;
    for (const key of OPTIONAL_KEYS) {
      const v = b[key];
      if (typeof v === 'number') {
        out[key] = (out[key] ?? 0) + v;
        seenOptional.add(key);
      }
    }
  }
  out.calories = Math.round(out.calories);
  out.protein = round1(out.protein);
  out.carbs = round1(out.carbs);
  out.fat = round1(out.fat);
  out.fibre = round1(out.fibre);
  for (const key of seenOptional) out[key] = round1(out[key] ?? 0);
  return out;
}

export function sumMicros(blocks: MicronutrientData[]): MicronutrientData {
  const out: MicronutrientData = {};
  for (const b of blocks) {
    for (const [key, value] of Object.entries(b)) {
      if (typeof value === 'number') {
        const k = key as keyof MicronutrientData;
        out[k] = round1((out[k] ?? 0) + value);
      }
    }
  }
  return out;
}

/** Percentage of target achieved, clamped to [0, 999]. */
export function pctOf(value: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(999, Math.round((value / target) * 100));
}

/** Scale a single ingredient quantity for display, with sensible rounding. */
export function scaleQuantity(ing: RecipeIngredient, servings: number): number {
  const raw = ing.quantity * servings;
  if (ing.unit === 'g' || ing.unit === 'ml') return Math.round(raw);
  return Math.round(raw * 4) / 4; // quarter-steps for eggs, slices, tbsp etc.
}

export function formatQuantity(ing: RecipeIngredient, servings: number): string {
  const q = scaleQuantity(ing, servings);
  const unitless = ['small', 'medium', 'large', 'item'];
  if (unitless.includes(ing.unit)) {
    return `${q} ${ing.unit === 'item' ? '' : ing.unit + ' '}`.trimEnd();
  }
  return `${q} ${ing.unit}`;
}

export function totalTime(r: Recipe): number {
  return r.prepTime + r.cookTime;
}

export function formatServings(servings: number): string {
  return `${servings} serving${servings === 1 ? '' : 's'}`;
}
