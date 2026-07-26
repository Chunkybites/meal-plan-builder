import type {
  DailyTargets,
  MealSelection,
  MealSlot,
  MicronutrientData,
  NutritionData,
  Recipe,
} from '../types';
import { MICRO_DEFS } from '../data/microDefs';

export interface ScoreComponent {
  label: string;
  points: number;
  maxPoints: number;
  comment: string;
}

export interface NutritionScoreResult {
  score: number;
  components: ScoreComponent[];
  explanation: string;
  suggestions: string[];
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * A general planning score out of 100 — not a medical assessment.
 * Rewards hitting calorie/protein/fibre targets, micronutrient coverage,
 * moderate saturated fat / sugar / sodium, and meal variety.
 */
export function computeNutritionScore(
  totals: NutritionData,
  micros: MicronutrientData,
  targets: DailyTargets,
  selections: Partial<Record<MealSlot, MealSelection>>,
  recipeById: (id: string) => Recipe | undefined,
): NutritionScoreResult {
  const components: ScoreComponent[] = [];
  const suggestions: string[] = [];

  // Calorie accuracy — 20 pts, full marks within ~5% of target
  const calDev = targets.calories > 0 ? Math.abs(totals.calories - targets.calories) / targets.calories : 1;
  const calPts = Math.round(20 * clamp01(1 - Math.max(0, calDev - 0.05) * 4));
  components.push({
    label: 'Calorie accuracy',
    points: calPts,
    maxPoints: 20,
    comment:
      calDev <= 0.05
        ? 'Calories closely match your target.'
        : totals.calories > targets.calories
          ? 'Calories are above your target.'
          : 'Calories are below your target.',
  });
  if (calPts < 12) {
    suggestions.push(
      totals.calories > targets.calories
        ? 'Try a slightly smaller portion at your largest meal to bring calories closer to target.'
        : 'Add a nutritious side — for example fruit, yoghurt or wholegrain bread — to reach your calorie target.',
    );
  }

  // Protein — 15 pts
  const proteinRatio = clamp01(targets.protein > 0 ? totals.protein / targets.protein : 0);
  const proteinPts = Math.round(15 * proteinRatio);
  components.push({
    label: 'Protein intake',
    points: proteinPts,
    maxPoints: 15,
    comment: proteinRatio >= 0.95 ? 'Protein intake is strong.' : 'Protein is below target.',
  });
  if (proteinRatio < 0.9) {
    suggestions.push('Increase a protein portion or choose a higher-protein recipe to close the protein gap.');
  }

  // Fibre — 15 pts
  const fibreRatio = clamp01(targets.fibre > 0 ? totals.fibre / targets.fibre : 0);
  const fibrePts = Math.round(15 * fibreRatio);
  components.push({
    label: 'Fibre intake',
    points: fibrePts,
    maxPoints: 15,
    comment: fibreRatio >= 0.95 ? 'Fibre intake looks great.' : 'Fibre could be improved.',
  });
  if (fibreRatio < 0.85) {
    suggestions.push('Add berries to breakfast, choose wholegrain carbohydrates, or add a serving of green vegetables.');
  }

  // Micronutrient coverage — 15 pts (average % of reference across tracked micros, excluding sodium)
  const microDefs = MICRO_DEFS.filter((d) => !d.isUpperLimit);
  const coverage =
    microDefs.reduce((sum, def) => sum + clamp01((micros[def.key] ?? 0) / def.rda), 0) / microDefs.length;
  const microPts = Math.round(15 * coverage);
  components.push({
    label: 'Micronutrient coverage',
    points: microPts,
    maxPoints: 15,
    comment:
      coverage >= 0.75
        ? 'Vitamin and mineral coverage is broad.'
        : 'Some vitamins and minerals are on the lower side.',
  });
  const lowMicros = microDefs
    .filter((def) => clamp01((micros[def.key] ?? 0) / def.rda) < 0.4)
    .slice(0, 3)
    .map((d) => d.label.replace(/\s*\(.*\)/, ''));
  if (lowMicros.length > 0) {
    suggestions.push(`Coverage of ${lowMicros.join(', ')} looks low — colourful vegetables, oily fish and dairy can help across the week.`);
  }

  // Saturated fat — 10 pts (reference: ~11% of target calories)
  const satFatLimit = (targets.calories * 0.11) / 9;
  const satFat = totals.saturatedFat ?? 0;
  const satPts = Math.round(10 * clamp01(1 - Math.max(0, satFat - satFatLimit) / satFatLimit));
  components.push({
    label: 'Saturated fat',
    points: satPts,
    maxPoints: 10,
    comment: satFat <= satFatLimit ? 'Saturated fat is within a sensible range.' : 'Saturated fat is a little high.',
  });
  if (satPts < 6) suggestions.push('Swap one creamy or cheesy element for a tomato-based or yoghurt-based option.');

  // Sugar — 10 pts (reference: 50g free-sugar style ceiling)
  const sugar = totals.sugar ?? 0;
  const sugarLimit = 60;
  const sugarPts = Math.round(10 * clamp01(1 - Math.max(0, sugar - sugarLimit) / sugarLimit));
  components.push({
    label: 'Sugar',
    points: sugarPts,
    maxPoints: 10,
    comment: sugar <= sugarLimit ? 'Total sugar is in a reasonable range.' : 'Total sugar is on the higher side.',
  });
  if (sugarPts < 6) suggestions.push('Choose lower-sugar snacks or reduce added honey/syrup to bring sugar down.');

  // Sodium — 5 pts (reference max 2400mg)
  const sodium = totals.sodium ?? 0;
  const sodiumPts = Math.round(5 * clamp01(1 - Math.max(0, sodium - 2400) / 2400));
  components.push({
    label: 'Sodium',
    points: sodiumPts,
    maxPoints: 5,
    comment: sodium <= 2400 ? 'Sodium is within the general guideline.' : 'Sodium is relatively high.',
  });
  if (sodiumPts < 3) suggestions.push('Consider a lower-sodium sauce or less added salt in one meal.');

  // Meal variety — 10 pts (distinct primary ingredients across selected meals)
  const primaries = Object.values(selections)
    .filter((s): s is MealSelection => Boolean(s))
    .map((s) => recipeById(s.recipeId)?.primaryIngredient)
    .filter(Boolean);
  const distinct = new Set(primaries).size;
  const varietyPts = Math.round(10 * clamp01(primaries.length === 0 ? 0 : distinct / Math.min(4, primaries.length)));
  components.push({
    label: 'Meal variety',
    points: varietyPts,
    maxPoints: 10,
    comment: varietyPts >= 8 ? 'Good variety across your meals.' : 'Meals share the same base ingredients.',
  });
  if (varietyPts < 8) suggestions.push('Vary your base ingredients across the day — for example fish at one meal and a plant protein at another.');

  const score = components.reduce((s, c) => s + c.points, 0);

  const sorted = [...components].sort((a, b) => b.points / b.maxPoints - a.points / a.maxPoints);
  const strong = sorted.slice(0, 2).map((c) => c.label.toLowerCase());
  const weak = sorted
    .slice(-2)
    .filter((c) => c.points / c.maxPoints < 0.8)
    .map((c) => c.label.toLowerCase());
  const explanation =
    `Your plan scores ${score}/100. ` +
    `${strong.join(' and ')} ${strong.length > 1 ? 'are' : 'is'} strong` +
    (weak.length > 0 ? `; ${weak.join(' and ')} could be improved.` : ' across the board.');

  return { score, components, explanation, suggestions: suggestions.slice(0, 4) };
}
