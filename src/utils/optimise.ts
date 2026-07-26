import type {
  DailyTargets,
  MealSelection,
  MealSlot,
  NutritionData,
  Recipe,
} from '../types';
import { round1 } from './nutrition';
import { getRecipeNutrition } from './recipeCalc';

/** Effective (calculated-or-authored) display nutrition for a recipe. */
const nut = (r: Recipe): NutritionData => getRecipeNutrition(r).nutrition;

export interface OptimisationProposal {
  id: string;
  slot: MealSlot;
  kind: 'portion' | 'swap';
  title: string;
  description: string;
  /** For portion proposals */
  proposedServings?: number;
  /** For swap proposals */
  proposedRecipeId?: string;
  deltaCalories: number;
  deltaProtein: number;
}

const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: 'breakfast',
  lunch: 'lunch',
  dinner: 'dinner',
  snack: 'night-time snack',
};

const MIN_SERVINGS = 0.5;
const MAX_SERVINGS = 3;

/** Servings are always suggested in quarter steps. */
const roundQuarter = (v: number) => Math.round(v * 4) / 4;

/**
 * Suggest small, safe changes that bring the day closer to target.
 * Every proposal is shown to the user for approval before it is applied.
 */
export function buildOptimisationProposals(
  totals: NutritionData,
  targets: DailyTargets,
  selections: Partial<Record<MealSlot, MealSelection>>,
  allRecipes: Recipe[],
  recipeById: (id: string) => Recipe | undefined,
): OptimisationProposal[] {
  const proposals: OptimisationProposal[] = [];
  const calDiff = totals.calories - targets.calories;
  const proteinDiff = totals.protein - targets.protein;

  const entries = (Object.entries(selections) as [MealSlot, MealSelection | undefined][]).filter(
    (e): e is [MealSlot, MealSelection] => Boolean(e[1]),
  );

  // 1. Portion adjustment for calorie overshoot/undershoot
  if (calDiff > 75) {
    const sorted = [...entries].sort((a, b) => {
      const ra = recipeById(a[1].recipeId);
      const rb = recipeById(b[1].recipeId);
      const ca = (ra ? nut(ra).calories : 0) * a[1].servings;
      const cb = (rb ? nut(rb).calories : 0) * b[1].servings;
      return cb - ca;
    });
    const [slot, sel] = sorted[0] ?? [];
    if (slot && sel) {
      const recipe = recipeById(sel.recipeId);
      if (recipe) {
        const perServing = nut(recipe).calories;
        const reduceBy = Math.min(
          sel.servings - MIN_SERVINGS,
          Math.max(0.25, Math.round((calDiff / perServing) * 4) / 4),
        );
        if (reduceBy >= 0.25) {
          const newServings = roundQuarter(sel.servings - reduceBy);
          proposals.push({
            id: `portion-down-${slot}`,
            slot,
            kind: 'portion',
            title: `Reduce ${SLOT_LABELS[slot]} portion`,
            description: `Reduce ${recipe.name} from ${sel.servings} to ${newServings} servings to save roughly ${Math.round(reduceBy * perServing)} calories.`,
            proposedServings: newServings,
            deltaCalories: -Math.round(reduceBy * perServing),
            deltaProtein: -round1(reduceBy * nut(recipe).protein),
          });
        }
      }
    }
  }

  if (calDiff < -150 && proteinDiff < 0) {
    const sorted = [...entries].sort((a, b) => {
      const ra = recipeById(a[1].recipeId);
      const rb = recipeById(b[1].recipeId);
      const da = ra && nut(ra).calories > 0 ? nut(ra).protein / nut(ra).calories : 0;
      const db = rb && nut(rb).calories > 0 ? nut(rb).protein / nut(rb).calories : 0;
      return db - da;
    });
    const [slot, sel] = sorted[0] ?? [];
    if (slot && sel) {
      const recipe = recipeById(sel.recipeId);
      if (recipe && sel.servings < MAX_SERVINGS) {
        const perServing = nut(recipe);
        const increaseBy = Math.min(
          MAX_SERVINGS - sel.servings,
          Math.max(0.25, Math.round((-calDiff / perServing.calories) * 4) / 4),
          1,
        );
        const newServings = roundQuarter(sel.servings + increaseBy);
        proposals.push({
          id: `portion-up-${slot}`,
          slot,
          kind: 'portion',
          title: `Increase ${SLOT_LABELS[slot]} portion`,
          description: `Increase ${recipe.name} from ${sel.servings} to ${newServings} servings to add roughly ${Math.round(increaseBy * perServing.calories)} calories and ${round1(increaseBy * perServing.protein)}g protein.`,
          proposedServings: newServings,
          deltaCalories: Math.round(increaseBy * perServing.calories),
          deltaProtein: round1(increaseBy * perServing.protein),
        });
      }
    }
  }

  // 2. Recipe swaps: same slot + same primary ingredient, better fit
  for (const [slot, sel] of entries) {
    const current = recipeById(sel.recipeId);
    if (!current) continue;
    const cur = nut(current);

    const alternatives = allRecipes.filter(
      (r) =>
        r.id !== current.id &&
        r.mealCategories.includes(slot) &&
        r.primaryIngredient === current.primaryIngredient,
    );

    if (calDiff > 100) {
      const lighter = alternatives
        .filter((r) => nut(r).calories < cur.calories - 80 && nut(r).protein >= cur.protein - 8)
        .sort((a, b) => nut(a).calories - nut(b).calories)[0];
      if (lighter && proposals.length < 4) {
        const saved = Math.round((cur.calories - nut(lighter).calories) * sel.servings);
        proposals.push({
          id: `swap-light-${slot}`,
          slot,
          kind: 'swap',
          title: `Swap your ${SLOT_LABELS[slot]}`,
          description: `Swap ${current.name} for ${lighter.name} to save about ${saved} calories while keeping a similar protein intake.`,
          proposedRecipeId: lighter.id,
          deltaCalories: -saved,
          deltaProtein: round1((nut(lighter).protein - cur.protein) * sel.servings),
        });
        break;
      }
    }

    if (proteinDiff < -12) {
      const stronger = alternatives
        .filter((r) => nut(r).protein > cur.protein + 8 && nut(r).calories <= cur.calories + 100)
        .sort((a, b) => nut(b).protein - nut(a).protein)[0];
      if (stronger && proposals.length < 4) {
        const gained = round1((nut(stronger).protein - cur.protein) * sel.servings);
        proposals.push({
          id: `swap-protein-${slot}`,
          slot,
          kind: 'swap',
          title: `Higher-protein ${SLOT_LABELS[slot]}`,
          description: `Swap ${current.name} for ${stronger.name} to add about ${gained}g protein for a similar calorie cost.`,
          proposedRecipeId: stronger.id,
          deltaCalories: Math.round((nut(stronger).calories - cur.calories) * sel.servings),
          deltaProtein: gained,
        });
        break;
      }
    }

    if (totals.fibre < targets.fibre - 6) {
      const fibrous = alternatives
        .filter((r) => nut(r).fibre > cur.fibre + 3)
        .sort((a, b) => nut(b).fibre - nut(a).fibre)[0];
      if (fibrous && proposals.length < 4 && !proposals.some((p) => p.slot === slot && p.kind === 'swap')) {
        proposals.push({
          id: `swap-fibre-${slot}`,
          slot,
          kind: 'swap',
          title: `Higher-fibre ${SLOT_LABELS[slot]}`,
          description: `Swap ${current.name} for ${fibrous.name} to add about ${round1((nut(fibrous).fibre - cur.fibre) * sel.servings)}g fibre.`,
          proposedRecipeId: fibrous.id,
          deltaCalories: Math.round((nut(fibrous).calories - cur.calories) * sel.servings),
          deltaProtein: round1((nut(fibrous).protein - cur.protein) * sel.servings),
        });
      }
    }
  }

  return proposals.slice(0, 4);
}

/**
 * "Adjust to fit my targets" — recommend a portion size for one recipe based
 * on the calories remaining for the day and how many meals are still to plan.
 * Clamped to a sensible 0.5–3 serving range; never extreme.
 */
export function suggestServingsForTargets(
  recipe: Recipe,
  slot: MealSlot,
  selections: Partial<Record<MealSlot, MealSelection>>,
  targets: DailyTargets,
  recipeById: (id: string) => Recipe | undefined,
): number {
  let caloriesUsed = 0;
  let slotsFilled = 0;
  for (const [s, sel] of Object.entries(selections) as [MealSlot, MealSelection | undefined][]) {
    if (!sel || s === slot) continue;
    const r = recipeById(sel.recipeId);
    if (!r) continue;
    caloriesUsed += nut(r).calories * sel.servings;
    slotsFilled += 1;
  }
  void slotsFilled;
  const caloriesRemaining = Math.max(0, targets.calories - caloriesUsed);

  // Weight the share: snacks smaller, dinner larger
  const weights: Record<MealSlot, number> = { breakfast: 1, lunch: 1.05, dinner: 1.35, snack: 0.6 };
  const totalWeight =
    (Object.entries(weights) as [MealSlot, number][])
      .filter(([s]) => s === slot || !selections[s])
      .reduce((sum, [, w]) => sum + w, 0) || 1;
  const share = (weights[slot] / totalWeight) * caloriesRemaining;

  const perServing = nut(recipe).calories;
  if (perServing <= 0) return 1;
  const raw = share / perServing;
  const snapped = Math.round(raw * 4) / 4;
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, snapped || 1));
}
