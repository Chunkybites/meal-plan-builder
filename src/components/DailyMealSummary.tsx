import { FileDown, Pencil, Printer, RotateCcw, Wand2 } from 'lucide-react';
import type { MealSelection, MealSlot, Recipe } from '../types';
import { MEAL_SLOTS } from '../types';
import { formatServings, scaleNutrition } from '../utils/nutrition';
import { getRecipeNutrition } from '../utils/recipeCalc';
import { EmptyState } from './common';

const SLOT_LABELS: Record<MealSlot, { label: string; emoji: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅' },
  lunch: { label: 'Lunch', emoji: '🥗' },
  dinner: { label: 'Dinner', emoji: '🍽️' },
  snack: { label: 'Night-Time Snack', emoji: '🌙' },
};

interface DailyMealSummaryProps {
  selections: Partial<Record<MealSlot, MealSelection>>;
  recipeById: (id: string) => Recipe | undefined;
  onEditMeal: (slot: MealSlot) => void;
  onStartAgain: () => void;
  onOptimise: () => void;
  onViewRecipe: (recipe: Recipe, slot: MealSlot) => void;
}

export function DailyMealSummary({
  selections,
  recipeById,
  onEditMeal,
  onStartAgain,
  onOptimise,
  onViewRecipe,
}: DailyMealSummaryProps) {
  const missing = MEAL_SLOTS.filter((s) => !selections[s]);

  return (
    <section aria-label="Daily meal plan summary" className="card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Your Daily Meal Plan</h2>
        <div className="no-print flex flex-wrap gap-2">
          <button type="button" className="btn-secondary !py-2 text-sm" onClick={onOptimise} disabled={missing.length === 4}>
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Optimise My Meal Plan
          </button>
          <button type="button" className="btn-ghost !py-2 text-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print Meal Plan
          </button>
          <button
            type="button"
            className="btn-ghost !py-2 text-sm"
            onClick={() => window.print()}
            title="Use your browser's print dialog and choose ‘Save as PDF’"
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Export as PDF
          </button>
          <button type="button" className="btn-ghost !py-2 text-sm !text-red-300 hover:!border-red-400/60" onClick={onStartAgain}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Start Again
          </button>
        </div>
      </div>

      {missing.length > 0 && (
        <p className="no-print mb-4 rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200" role="status">
          {missing.length === 4
            ? 'You have not selected any meals yet — head back to Breakfast to get started.'
            : `You have not yet selected: ${missing.map((s) => SLOT_LABELS[s].label.toLowerCase()).join(', ')}.`}
        </p>
      )}

      <div className="space-y-3">
        {MEAL_SLOTS.map((slot) => {
          const sel = selections[slot];
          const recipe = sel ? recipeById(sel.recipeId) : undefined;
          const meta = SLOT_LABELS[slot];

          if (!sel || !recipe) {
            return (
              <div key={slot} className="no-print">
                <EmptyState
                  icon={<span className="text-2xl">{meta.emoji}</span>}
                  title={`You have not yet selected a ${meta.label.toLowerCase()}.`}
                />
              </div>
            );
          }

          const n = scaleNutrition(getRecipeNutrition(recipe).nutrition, sel.servings);
          return (
            <article
              key={slot}
              className="flex flex-col gap-3 rounded-xl border border-ink-600 bg-ink-800 p-4 sm:flex-row sm:items-center"
            >
              <div
                className="flex h-16 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg sm:w-20"
                style={{ background: `linear-gradient(135deg, ${recipe.imageColors[0]}, ${recipe.imageColors[1]})` }}
                onClick={() => onViewRecipe(recipe, slot)}
                role="img"
                aria-label={`${recipe.name} illustration`}
              >
                <span className="text-3xl" aria-hidden="true">{recipe.emoji}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-volt-300">
                  {meta.emoji} {meta.label}
                </p>
                <button
                  type="button"
                  className="text-left font-display text-base font-bold text-white hover:text-volt-300"
                  onClick={() => onViewRecipe(recipe, slot)}
                >
                  {recipe.name}
                </button>
                <p className="text-xs text-ink-400">{formatServings(sel.servings)}</p>
              </div>
              <dl className="grid grid-cols-5 gap-2 text-center sm:w-72">
                {(
                  [
                    ['kcal', n.calories],
                    ['Protein', `${n.protein}g`],
                    ['Carbs', `${n.carbs}g`],
                    ['Fat', `${n.fat}g`],
                    ['Fibre', `${n.fibre}g`],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] uppercase tracking-wide text-ink-400">{label}</dt>
                    <dd className="text-sm font-bold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
              <button
                type="button"
                className="btn-ghost no-print !px-3 !py-2 text-sm"
                onClick={() => onEditMeal(slot)}
                aria-label={`Change ${meta.label}`}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
