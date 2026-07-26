import type { DailyTargets, Goal } from '../types';

export const DEFAULT_TARGETS: DailyTargets = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 65,
  fibre: 30,
  goal: 'maintain',
};

export const GOALS: { id: Goal; label: string }[] = [
  { id: 'fat-loss', label: 'Fat loss' },
  { id: 'maintain', label: 'Maintain weight' },
  { id: 'build-muscle', label: 'Build muscle' },
  { id: 'general-health', label: 'Improve general health' },
];

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very' | 'extra';

export const ACTIVITY_LEVELS: { id: ActivityLevel; label: string; factor: number }[] = [
  { id: 'sedentary', label: 'Sedentary (little exercise)', factor: 1.2 },
  { id: 'light', label: 'Lightly active (1–3 sessions/week)', factor: 1.375 },
  { id: 'moderate', label: 'Moderately active (3–5 sessions/week)', factor: 1.55 },
  { id: 'very', label: 'Very active (6–7 sessions/week)', factor: 1.725 },
  { id: 'extra', label: 'Extremely active (physical job + training)', factor: 1.9 },
];

export interface TargetCalculatorInput {
  age: number;
  sex: 'male' | 'female';
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
}

/**
 * Estimate daily targets using the Mifflin-St Jeor equation.
 * The result is a general estimate for planning, not medical advice.
 */
export function calculateTargets(input: TargetCalculatorInput): DailyTargets {
  const { age, sex, heightCm, weightKg, activity, goal } = input;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);
  const factor = ACTIVITY_LEVELS.find((a) => a.id === activity)?.factor ?? 1.375;
  let calories = bmr * factor;

  if (goal === 'fat-loss') calories *= 0.85;
  if (goal === 'build-muscle') calories *= 1.1;
  calories = Math.max(1200, Math.round(calories / 10) * 10);

  const proteinPerKg = goal === 'build-muscle' || goal === 'fat-loss' ? 1.8 : 1.4;
  const protein = Math.round(weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(50, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat, fibre: 30, goal };
}
