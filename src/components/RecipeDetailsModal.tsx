import { useState } from 'react';
import { Clock, Flame, Plus, Refrigerator, Replace, UtensilsCrossed } from 'lucide-react';
import type { Recipe } from '../types';
import type { ConditionDefinition, ConditionEvidenceItem } from '../data/conditions/types';
import { MICRO_DEFS } from '../data/microDefs';
import { formatQuantity, scaleMicros, scaleNutrition } from '../utils/nutrition';
import { getRecipeNutrition } from '../utils/recipeCalc';
import { getRecipeEvidence } from '../data/conditions/matchers';
import { Modal, TagPill } from './common';
import { PortionSelector } from './PortionSelector';
import { NutritionSourcesPanel } from './NutritionSourcesPanel';
import { ConditionRelevance } from './conditions/ConditionRelevance';
import { EvidenceLevelBadge, ConditionEvidenceButton } from './conditions/conditionsCommon';
import { IngredientEvidencePanel } from './conditions/IngredientEvidencePanel';

interface RecipeDetailsModalProps {
  recipe: Recipe;
  initialServings?: number;
  onClose: () => void;
  onAdd?: (servings: number) => void;
  addLabel?: string;
  condition?: ConditionDefinition | null;
}

export function RecipeDetailsModal({ recipe, initialServings = 1, onClose, onAdd, addLabel = 'Add to Meal Plan', condition = null }: RecipeDetailsModalProps) {
  const [servings, setServings] = useState(initialServings);
  const [evidenceItem, setEvidenceItem] = useState<ConditionEvidenceItem | null>(null);
  const eff = getRecipeNutrition(recipe);
  const n = scaleNutrition(eff.nutrition, servings);
  const micros = scaleMicros(eff.micros, servings);
  const microEntries = MICRO_DEFS.filter((d) => typeof micros[d.key] === 'number');
  const evidenceItems = condition ? getRecipeEvidence(recipe, condition.id) : [];

  const advanced: [string, number | undefined, string][] = [
    ['Saturated fat', n.saturatedFat, 'g'],
    ['Monounsaturated fat', n.monounsaturatedFat, 'g'],
    ['Polyunsaturated fat', n.polyunsaturatedFat, 'g'],
    ['Omega-3', n.omega3, 'g'],
    ['Omega-6', n.omega6, 'g'],
    ['Total sugar', n.sugar, 'g'],
    ['Added sugar', n.addedSugar, 'g'],
    ['Cholesterol', n.cholesterol, 'mg'],
    ['Sodium', n.sodium, 'mg'],
    ['Potassium', n.potassium, 'mg'],
  ];

  return (
    <Modal title={recipe.name} onClose={onClose} wide>
      <div className="space-y-5">
        <div
          className="flex h-36 items-center justify-center rounded-xl"
          style={{ background: `linear-gradient(135deg, ${recipe.imageColors[0]}, ${recipe.imageColors[1]})` }}
          role="img"
          aria-label={`${recipe.name} illustration`}
        >
          <span className="text-6xl" aria-hidden="true">{recipe.emoji}</span>
        </div>

        <p className="text-sm text-ink-200">{recipe.description}</p>

        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-ink-300">
          <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-volt-400" aria-hidden="true" /> Prep {recipe.prepTime} min</span>
          <span className="inline-flex items-center gap-1.5"><Flame className="h-4 w-4 text-volt-400" aria-hidden="true" /> Cook {recipe.cookTime} min</span>
          <span className="inline-flex items-center gap-1.5"><UtensilsCrossed className="h-4 w-4 text-volt-400" aria-hidden="true" /> {recipe.difficulty}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.map((t) => (
            <TagPill key={t}>{t.replace(/-/g, ' ')}</TagPill>
          ))}
        </div>

        {condition && (
          <div className="space-y-3">
            <ConditionRelevance recipe={recipe} def={condition} />
            {evidenceItems.length > 0 && (
              <section aria-label={`${condition.shortName} evidence in this recipe`} className="rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/5 p-4">
                <h4 className="mb-2 text-sm font-bold text-white">{condition.shortName} evidence in this recipe</h4>
                <ul className="space-y-2">
                  {evidenceItems.map((item) => {
                    const link = item.conditions.find((c) => c.conditionId === condition.id);
                    const best = link ? link.outcomes.reduce((a, b) => (({ A: 4, B: 3, C: 2, D: 1 })[b.evidenceLevel] > ({ A: 4, B: 3, C: 2, D: 1 })[a.evidenceLevel] ? b : a)) : null;
                    return (
                      <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-600 bg-ink-800 p-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.interventionName}</p>
                          {best && <p className="flex items-center gap-1 text-xs text-ink-400">best evidence <EvidenceLevelBadge level={best.evidenceLevel} /></p>}
                        </div>
                        <ConditionEvidenceButton label="Evidence" accent={condition.accent} onClick={() => setEvidenceItem(item)} />
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>
        )}

        <section aria-label="Portion size" className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <h4 className="mb-2 text-sm font-semibold text-white">Portion size</h4>
          <PortionSelector servings={servings} onChange={setServings} idPrefix={`modal-${recipe.id}`} />
        </section>

        <NutritionSourcesPanel recipe={recipe} />

        <div className="grid gap-5 sm:grid-cols-2">
          <section aria-label="Ingredients">
            <h4 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-volt-300">
              Ingredients <span className="normal-case text-ink-400">({servings} serving{servings === 1 ? '' : 's'})</span>
            </h4>
            <ul className="space-y-1.5 text-sm text-ink-200">
              {recipe.ingredients.map((ing) => (
                <li key={ing.name} className="flex justify-between gap-3 border-b border-ink-700/60 pb-1.5">
                  <span>{ing.name}{ing.note ? <span className="text-ink-400"> — {ing.note}</span> : null}</span>
                  <span className="whitespace-nowrap font-medium text-white">{formatQuantity(ing, servings)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-label="Method">
            <h4 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-volt-300">Method</h4>
            <ol className="space-y-2 text-sm text-ink-200">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink-700 text-[11px] font-bold text-volt-300" aria-hidden="true">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section aria-label="Nutrition per selected portion" className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <h4 className="mb-3 text-sm font-semibold text-white">
            Nutrition <span className="font-normal text-ink-400">(for {servings} serving{servings === 1 ? '' : 's'}, estimated)</span>
          </h4>
          <dl className="grid grid-cols-3 gap-3 text-center sm:grid-cols-5">
            {(
              [
                ['Calories', `${n.calories} kcal`],
                ['Protein', `${n.protein}g`],
                ['Carbs', `${n.carbs}g`],
                ['Fat', `${n.fat}g`],
                ['Fibre', `${n.fibre}g`],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-ink-850 px-2 py-2">
                <dt className="text-[11px] uppercase tracking-wide text-ink-400">{label}</dt>
                <dd className="text-sm font-bold text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-medium text-volt-300 hover:text-volt-200">
              Advanced nutrition
            </summary>
            <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
              {advanced
                .filter(([, v]) => typeof v === 'number')
                .map(([label, value, unit]) => (
                  <div key={label} className="flex justify-between border-b border-ink-700/50 pb-1">
                    <dt className="text-ink-300">{label}</dt>
                    <dd className="font-medium text-white">{value}{unit}</dd>
                  </div>
                ))}
            </dl>
            {microEntries.length > 0 && (
              <>
                <h5 className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Micronutrients (estimated)</h5>
                <dl className="mt-1.5 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-3">
                  {microEntries.map((d) => (
                    <div key={d.key} className="flex justify-between border-b border-ink-700/50 pb-1">
                      <dt className="text-ink-300">{d.label.replace(/\s*\(.*\)/, '')}</dt>
                      <dd className="font-medium text-white">{micros[d.key]}{d.unit}</dd>
                    </div>
                  ))}
                </dl>
              </>
            )}
          </details>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section aria-label="Storage and meal prep" className="text-sm">
            <h4 className="mb-1.5 flex items-center gap-1.5 font-semibold text-white">
              <Refrigerator className="h-4 w-4 text-volt-400" aria-hidden="true" /> Storage &amp; meal prep
            </h4>
            <p className="text-ink-300">{recipe.storage}</p>
            <p className="mt-1.5 text-ink-300">{recipe.mealPrep}</p>
          </section>
          <section aria-label="Substitutions and allergens" className="text-sm">
            <h4 className="mb-1.5 flex items-center gap-1.5 font-semibold text-white">
              <Replace className="h-4 w-4 text-volt-400" aria-hidden="true" /> Substitutions
            </h4>
            <ul className="list-inside list-disc space-y-1 text-ink-300">
              {recipe.substitutions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-2 text-ink-300">
              <span className="font-semibold text-white">Allergens:</span>{' '}
              {recipe.allergens.length > 0 ? recipe.allergens.join(', ') : 'None listed'}
            </p>
          </section>
        </div>

        {onAdd && (
          <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 border-t border-ink-700 bg-ink-850 px-1 pt-3">
            <button type="button" className="btn-ghost" onClick={onClose}>Close</button>
            <button type="button" className="btn-primary" onClick={() => onAdd(servings)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {addLabel}
            </button>
          </div>
        )}
      </div>
      {condition && evidenceItem && <IngredientEvidencePanel item={evidenceItem} conditionId={condition.id} onClose={() => setEvidenceItem(null)} />}
    </Modal>
  );
}
