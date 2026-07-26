import { useState } from 'react';
import { ChevronDown, ChevronUp, Database } from 'lucide-react';
import type { Recipe } from '../types';
import { getCalculatedNutrition } from '../utils/recipeCalc';

/**
 * "Nutrition data sources" — an expandable provenance panel shown for recipes
 * whose ingredients are linked to canonical food records. It reveals how the
 * nutrition was calculated (ingredient → matched food → source → grams), the
 * calculated per-serving values, and data-completeness — without cluttering the
 * normal UI. Kept collapsed by default.
 */
export function NutritionSourcesPanel({ recipe }: { recipe: Recipe }) {
  const [open, setOpen] = useState(false);
  const calc = getCalculatedNutrition(recipe);
  if (!calc) return null;

  return (
    <section aria-label="Nutrition data sources" className="rounded-xl border border-ink-600 bg-ink-800/60 p-4">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-2 text-left">
        <span className="flex items-center gap-2 text-sm font-semibold text-white">
          <Database className="h-4 w-4 text-volt-400" aria-hidden="true" />
          Nutrition data sources
          <span className="rounded-full bg-ink-700 px-2 py-0.5 text-[11px] font-medium text-ink-300">calculated from ingredients</span>
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-ink-400" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 text-ink-400" aria-hidden="true" />}
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {(
              [
                ['Calories', `${calc.perServing.calories} kcal`],
                ['Protein', `${calc.perServing.protein}g`],
                ['Carbs', `${calc.perServing.carbs}g`],
                ['Fat', `${calc.perServing.fat}g`],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-ink-850 px-2 py-1.5">
                <div className="text-[10px] uppercase tracking-wide text-ink-400">{label} (calc.)</div>
                <div className="text-sm font-bold text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-xs">
              <thead>
                <tr className="border-b border-ink-700 text-ink-400">
                  <th className="py-1.5 pr-3 font-medium">Ingredient</th>
                  <th className="py-1.5 pr-3 font-medium">Matched food</th>
                  <th className="py-1.5 pr-3 font-medium">Source</th>
                  <th className="py-1.5 pr-3 font-medium">Prep</th>
                  <th className="py-1.5 pr-3 font-medium">Used</th>
                </tr>
              </thead>
              <tbody>
                {calc.provenance.map((p) => (
                  <tr key={p.ingredient} className="border-b border-ink-700/50">
                    <td className="py-1.5 pr-3 text-ink-200">{p.ingredient}</td>
                    <td className="py-1.5 pr-3 text-ink-300">{p.foodName}</td>
                    <td className="py-1.5 pr-3">
                      <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] text-ink-200">{p.sourceLabel}</span>
                    </td>
                    <td className="py-1.5 pr-3 text-ink-400">{p.preparationState}</td>
                    <td className="py-1.5 pr-3 whitespace-nowrap text-ink-300">{p.gramWeight} g <span className="text-ink-500">({p.quantityBasis})</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-ink-400">
            Nutrient completeness across matched foods: <span className="font-semibold text-ink-200">{calc.completenessPercentage}%</span>.
            {calc.partialNutrients.length > 0 && ' Some totals are partial estimates because a contributing food lacked that nutrient (shown as a lower bound, not zero).'}
          </p>
          {calc.warnings.length > 0 && (
            <ul className="list-inside list-disc text-[11px] text-amber-300/90">
              {calc.warnings.map((w) => (<li key={w}>{w}</li>))}
            </ul>
          )}
          <p className="text-[11px] text-ink-500">
            These calculated values come from reviewed food-composition records and the recipe's gram weights. They will
            replace the recipe's stored values once the official UK CoFID import and review are complete.
          </p>
        </div>
      )}
    </section>
  );
}
