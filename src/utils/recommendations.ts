import type {
  DailyTargets,
  MealSelection,
  MealSlot,
  MicronutrientData,
  NutritionData,
  Recipe,
} from '../types';
import { round1 } from './nutrition';
import { getRecipeNutrition } from './recipeCalc';

export interface Recommendation {
  id: string;
  tone: 'positive' | 'suggestion';
  text: string;
}

/**
 * Generate friendly, actionable recommendations from the gap between totals
 * and targets. Positive framing only — never shaming, never medical advice.
 */
export function generateRecommendations(
  totals: NutritionData,
  micros: MicronutrientData,
  targets: DailyTargets,
  selections: Partial<Record<MealSlot, MealSelection>>,
  recipeById: (id: string) => Recipe | undefined,
): Recommendation[] {
  const recs: Recommendation[] = [];

  const calDiff = totals.calories - targets.calories;
  if (Math.abs(calDiff) <= targets.calories * 0.05) {
    recs.push({
      id: 'cal-on-track',
      tone: 'positive',
      text: 'Your meal plan is closely aligned with your calorie target — nice work.',
    });
  } else if (calDiff < 0) {
    recs.push({
      id: 'cal-under',
      tone: 'suggestion',
      text: `You have approximately ${Math.abs(Math.round(calDiff))} calories remaining. A piece of fruit, a yoghurt or a slightly larger portion would fit well.`,
    });
  } else {
    const largest = largestMeal(selections, recipeById);
    recs.push({
      id: 'cal-over',
      tone: 'suggestion',
      text: `Your plan is about ${Math.round(calDiff)} calories above target. ${
        largest
          ? `Reducing your ${largest.slotLabel} portion slightly would bring the day closer.`
          : 'A slightly smaller portion at one meal would bring the day closer.'
      }`,
    });
  }

  const proteinDiff = round1(totals.protein - targets.protein);
  if (proteinDiff >= 0) {
    recs.push({
      id: 'protein-hit',
      tone: 'positive',
      text:
        proteinDiff > 5
          ? `You are ${proteinDiff}g above your protein target — great for muscle recovery.`
          : 'You have hit your protein target.',
    });
  } else if (Math.abs(proteinDiff) > 8) {
    const proteinBooster = bestProteinBooster(selections, recipeById);
    recs.push({
      id: 'protein-low',
      tone: 'suggestion',
      text: `You are ${Math.abs(proteinDiff)}g below your protein target.${
        proteinBooster
          ? ` Increasing your ${proteinBooster} portion could close the gap.`
          : ' A high-protein snack such as Greek yoghurt or cottage cheese could close the gap.'
      }`,
    });
  }

  const fibreDiff = round1(totals.fibre - targets.fibre);
  if (fibreDiff < -5) {
    recs.push({
      id: 'fibre-low',
      tone: 'suggestion',
      text: 'Your fibre intake is a little low. Consider adding beans, berries, vegetables or wholegrains to one of your meals.',
    });
  } else if (fibreDiff >= 0) {
    recs.push({ id: 'fibre-hit', tone: 'positive', text: 'Fibre target reached — great for digestion and fullness.' });
  }

  if ((totals.sodium ?? 0) > 2400) {
    recs.push({
      id: 'sodium-high',
      tone: 'suggestion',
      text: 'Your sodium intake is relatively high. Consider using a lower-sodium sauce or stock in one meal.',
    });
  }

  if ((micros.vitaminC ?? 0) < 40) {
    recs.push({
      id: 'vitc-low',
      tone: 'suggestion',
      text: 'Your vitamin C intake could be improved by adding peppers, berries, kiwi or citrus fruit.',
    });
  }

  if ((micros.vitaminD ?? 0) < 5) {
    recs.push({
      id: 'vitd-low',
      tone: 'suggestion',
      text: 'Vitamin D is low today — oily fish, eggs or fortified foods elsewhere in the week can help.',
    });
  }

  const fatDiff = totals.fat - targets.fat;
  if (fatDiff > 15) {
    recs.push({
      id: 'fat-high',
      tone: 'suggestion',
      text: 'Fat is a little above target. Choosing a lower-fat cooking method at one meal would balance the day.',
    });
  }

  return recs.slice(0, 6);
}

function largestMeal(
  selections: Partial<Record<MealSlot, MealSelection>>,
  recipeById: (id: string) => Recipe | undefined,
): { slotLabel: string } | null {
  let best: { slotLabel: string; calories: number } | null = null;
  const labels: Record<string, string> = {
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
    snack: 'night-time snack',
  };
  for (const [slot, sel] of Object.entries(selections)) {
    if (!sel) continue;
    const r = recipeById(sel.recipeId);
    if (!r) continue;
    const cals = getRecipeNutrition(r).nutrition.calories * sel.servings;
    if (!best || cals > best.calories) best = { slotLabel: labels[slot] ?? slot, calories: cals };
  }
  return best;
}

function bestProteinBooster(
  selections: Partial<Record<MealSlot, MealSelection>>,
  recipeById: (id: string) => Recipe | undefined,
): string | null {
  let best: { name: string; density: number } | null = null;
  for (const sel of Object.values(selections)) {
    if (!sel) continue;
    const r = recipeById(sel.recipeId);
    if (!r) continue;
    const rn = getRecipeNutrition(r).nutrition;
    if (rn.calories === 0) continue;
    const density = rn.protein / rn.calories;
    if (!best || density > best.density) best = { name: r.name, density };
  }
  return best?.name ?? null;
}
