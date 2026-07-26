import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, RefreshCw, Scale, Trash2 } from 'lucide-react';
import type { MealSelection, Recipe } from '../types';
import { formatServings, scaleNutrition } from '../utils/nutrition';
import { getRecipeNutrition } from '../utils/recipeCalc';
import { PortionSelector } from './PortionSelector';

interface SelectedMealProps {
  recipe: Recipe;
  selection: MealSelection;
  onChangeServings: (servings: number) => void;
  onAutoFit: () => number;
  onChangeRecipe: () => void;
  onViewRecipe: () => void;
  onRemove: () => void;
  nextLabel: string | null;
  onNext: () => void;
}

export function SelectedMeal({
  recipe,
  selection,
  onChangeServings,
  onAutoFit,
  onChangeRecipe,
  onViewRecipe,
  onRemove,
  nextLabel,
  onNext,
}: SelectedMealProps) {
  const [showPortion, setShowPortion] = useState(false);
  const n = scaleNutrition(getRecipeNutrition(recipe).nutrition, selection.servings);

  return (
    <div className="rounded-2xl border border-volt-400/50 bg-volt-400/5 p-4 shadow-glow sm:p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-volt-300">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        Selected for this meal
      </p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="flex h-20 w-full shrink-0 items-center justify-center rounded-xl sm:w-28"
          style={{ background: `linear-gradient(135deg, ${recipe.imageColors[0]}, ${recipe.imageColors[1]})` }}
          role="img"
          aria-label={`${recipe.name} illustration`}
        >
          <span className="text-4xl" aria-hidden="true">{recipe.emoji}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-lg font-bold text-white">{recipe.name}</h4>
          <p className="text-sm text-ink-300">{formatServings(selection.servings)}</p>
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {(
              [
                ['Calories', `${n.calories} kcal`],
                ['Protein', `${n.protein}g`],
                ['Carbs', `${n.carbs}g`],
                ['Fat', `${n.fat}g`],
                ['Fibre', `${n.fibre}g`],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="flex gap-1.5">
                <dt className="text-ink-400">{label}:</dt>
                <dd className="font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-ghost !py-2 text-sm" onClick={onChangeRecipe}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Change Recipe
        </button>
        <button
          type="button"
          className="btn-ghost !py-2 text-sm"
          onClick={() => setShowPortion((s) => !s)}
          aria-expanded={showPortion}
        >
          <Scale className="h-4 w-4" aria-hidden="true" /> Adjust Portion
        </button>
        <button type="button" className="btn-ghost !py-2 text-sm" onClick={onViewRecipe}>
          <BookOpen className="h-4 w-4" aria-hidden="true" /> View Full Recipe
        </button>
        <button type="button" className="btn-ghost !py-2 text-sm !text-red-300 hover:!border-red-400/60" onClick={onRemove}>
          <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove Meal
        </button>
        {nextLabel && (
          <button type="button" className="btn-primary ml-auto !py-2 text-sm" onClick={onNext}>
            {nextLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {showPortion && (
        <div className="mt-4 rounded-xl border border-ink-600 bg-ink-850 p-4">
          <PortionSelector
            servings={selection.servings}
            onChange={onChangeServings}
            onAutoFit={onAutoFit}
            idPrefix={`sel-${recipe.id}`}
          />
        </div>
      )}
    </div>
  );
}
