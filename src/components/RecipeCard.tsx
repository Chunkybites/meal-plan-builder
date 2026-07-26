import { Clock, Eye, Heart, Plus, RefreshCw, Users } from 'lucide-react';
import type { Recipe } from '../types';
import type { ConditionDefinition, ConditionEvidenceItem } from '../data/conditions/types';
import { ingredientName } from '../data/ingredients';
import { totalTime } from '../utils/nutrition';
import { getRecipeNutrition } from '../utils/recipeCalc';
import { getRecipeEvidence } from '../data/conditions/matchers';
import { TagPill } from './common';
import { ConditionEvidenceButton } from './conditions/conditionsCommon';
import { ConditionRelevanceChip } from './conditions/ConditionRelevance';

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  isFavourite: boolean;
  onView: () => void;
  onAdd: () => void;
  onSwap: () => void;
  onToggleFavourite: () => void;
  condition?: ConditionDefinition | null;
  onOpenEvidence?: (item: ConditionEvidenceItem) => void;
}

function strongestEvidence(items: ConditionEvidenceItem[], conditionId: ConditionDefinition['id']): ConditionEvidenceItem {
  const rank = (i: ConditionEvidenceItem) => {
    const link = i.conditions.find((c) => c.conditionId === conditionId);
    return link ? Math.max(0, ...link.outcomes.map((o) => ({ A: 4, B: 3, C: 2, D: 1 })[o.evidenceLevel])) : 0;
  };
  return [...items].sort((a, b) => rank(b) - rank(a))[0];
}

export function RecipeCard({
  recipe,
  isSelected,
  isFavourite,
  onView,
  onAdd,
  onSwap,
  onToggleFavourite,
  condition = null,
  onOpenEvidence,
}: RecipeCardProps) {
  const n = getRecipeNutrition(recipe).nutrition;
  const mains = [recipe.primaryIngredient, ...recipe.additionalIngredients.slice(0, 3)].map(ingredientName);
  const evidenceItems = condition ? getRecipeEvidence(recipe, condition.id) : [];

  return (
    <article
      className={`card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 ${
        isSelected ? 'ring-2 ring-volt-400' : ''
      }`}
    >
      <div
        className="relative flex h-32 items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${recipe.imageColors[0]}, ${recipe.imageColors[1]})` }}
        role="img"
        aria-label={`${recipe.name} illustration`}
      >
        <span className="text-5xl transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
          {recipe.emoji}
        </span>
        <button
          type="button"
          onClick={onToggleFavourite}
          aria-pressed={isFavourite}
          aria-label={isFavourite ? `Remove ${recipe.name} from favourites` : `Add ${recipe.name} to favourites`}
          className="absolute right-2 top-2 rounded-full bg-ink-950/60 p-2 backdrop-blur transition-colors hover:bg-ink-950/90"
        >
          <Heart
            className={`h-4 w-4 ${isFavourite ? 'fill-red-400 text-red-400' : 'text-white'}`}
            aria-hidden="true"
          />
        </button>
        <span className="absolute bottom-2 left-2 rounded-full bg-ink-950/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
          {n.calories} kcal
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div>
          <h4 className="font-display text-base font-bold leading-snug text-white">{recipe.name}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-ink-300">{recipe.description}</p>
        </div>

        <dl className="grid grid-cols-5 gap-1 rounded-lg bg-ink-800 px-2 py-1.5 text-center">
          {(
            [
              ['kcal', n.calories],
              ['P', `${n.protein}g`],
              ['C', `${n.carbs}g`],
              ['F', `${n.fat}g`],
              ['Fib', `${n.fibre}g`],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-[10px] uppercase tracking-wide text-ink-400">{label}</dt>
              <dd className="text-xs font-bold text-white">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {totalTime(recipe)} min
          </span>
          <span>{recipe.difficulty}</span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" aria-hidden="true" />
            {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.dietaryTags.slice(0, 4).map((t) => (
            <TagPill key={t}>{t.replace(/-/g, ' ')}</TagPill>
          ))}
        </div>

        <p className="text-xs text-ink-400">
          <span className="font-medium text-ink-300">Mains:</span> {mains.join(', ')}
        </p>

        {condition && (
          <div className="flex flex-wrap items-center gap-1.5">
            <ConditionRelevanceChip recipe={recipe} def={condition} />
            {evidenceItems.length > 0 && onOpenEvidence && (
              <ConditionEvidenceButton label="Evidence" accent={condition.accent} onClick={() => onOpenEvidence(strongestEvidence(evidenceItems, condition.id))} />
            )}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-1">
          <button type="button" className="btn-ghost flex-1 !px-3 !py-2 text-sm" onClick={onView}>
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Recipe
          </button>
          {isSelected ? (
            <button type="button" className="btn-secondary flex-1 !px-3 !py-2 text-sm" onClick={onSwap}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Swap Recipe
            </button>
          ) : (
            <button type="button" className="btn-primary flex-1 !px-3 !py-2 text-sm" onClick={onAdd}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add to Plan
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
