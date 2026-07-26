import { useMemo, useState } from 'react';
import { SearchX, Utensils } from 'lucide-react';
import type { DietaryFilterState, MealSelection, MealSlot, Recipe } from '../types';
import type { ConditionDefinition, ConditionEvidenceItem } from '../data/conditions/types';
import { ALL_RECIPES, getRecipe } from '../data/recipes';
import { DEFAULT_FILTERS, filterRecipes } from '../utils/filters';
import { EmptyState } from './common';
import { IngredientSelector } from './IngredientSelector';
import { RecipeCard } from './RecipeCard';
import { RecipeDetailsModal } from './RecipeDetailsModal';
import { RecipeFilters } from './RecipeFilters';
import { SelectedMeal } from './SelectedMeal';
import { IngredientEvidencePanel } from './conditions/IngredientEvidencePanel';

const SLOT_META: Record<MealSlot, { title: string; emoji: string; blurb: string }> = {
  breakfast: {
    title: 'Breakfast',
    emoji: '🌅',
    blurb: 'Start the day right — breakfast-style recipes to fuel your morning.',
  },
  lunch: {
    title: 'Lunch',
    emoji: '🥗',
    blurb: 'Quick, portable and lighter meals to keep you moving through the day.',
  },
  dinner: {
    title: 'Dinner',
    emoji: '🍽️',
    blurb: 'Bigger main meals — your chance to hit the bulk of your macros.',
  },
  snack: {
    title: 'Night-Time Snack',
    emoji: '🌙',
    blurb: 'Lighter bites, desserts and high-protein options to round off the day.',
  },
};

interface MealBuilderProps {
  slot: MealSlot;
  selection: MealSelection | undefined;
  favourites: string[];
  onSelect: (selection: MealSelection) => void;
  onRemove: () => void;
  onChangeServings: (servings: number) => void;
  onToggleFavourite: (recipeId: string) => void;
  onAutoFit: (recipe: Recipe) => number;
  nextLabel: string | null;
  onNext: () => void;
  condition?: ConditionDefinition | null;
}

export function MealBuilder({
  slot,
  selection,
  favourites,
  onSelect,
  onRemove,
  onChangeServings,
  onToggleFavourite,
  onAutoFit,
  nextLabel,
  onNext,
  condition = null,
}: MealBuilderProps) {
  const meta = SLOT_META[slot];
  const [primary, setPrimary] = useState<string | null>(null);
  const [extras, setExtras] = useState<string[]>([]);
  const [filters, setFilters] = useState<DietaryFilterState>({ ...DEFAULT_FILTERS });
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [browsing, setBrowsing] = useState(false);
  const [evidenceItem, setEvidenceItem] = useState<ConditionEvidenceItem | null>(null);

  const selectedRecipe = selection ? getRecipe(selection.recipeId) : undefined;
  const showResults = !selection || browsing;

  const results = useMemo(
    () => filterRecipes(ALL_RECIPES, slot, primary, extras, filters),
    [slot, primary, extras, filters],
  );

  const handleAdd = (recipe: Recipe, servings = 1) => {
    onSelect({ recipeId: recipe.id, servings });
    setBrowsing(false);
    setViewing(null);
  };

  return (
    <section aria-label={meta.title} className="card animate-rise p-4 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">{meta.emoji}</span>
        <div>
          <h2 className="font-display text-xl font-bold text-white sm:text-2xl">{meta.title}</h2>
          <p className="text-sm text-ink-300">{meta.blurb}</p>
        </div>
      </div>

      {selection && selectedRecipe && (
        <div className="mb-5">
          <SelectedMeal
            recipe={selectedRecipe}
            selection={selection}
            onChangeServings={onChangeServings}
            onAutoFit={() => onAutoFit(selectedRecipe)}
            onChangeRecipe={() => setBrowsing(true)}
            onViewRecipe={() => setViewing(selectedRecipe)}
            onRemove={() => {
              onRemove();
              setBrowsing(false);
            }}
            nextLabel={nextLabel}
            onNext={onNext}
          />
        </div>
      )}

      {showResults && (
        <div className="space-y-5">
          <IngredientSelector
            primary={primary}
            extras={extras}
            onSelectPrimary={(id) => {
              setPrimary(id);
              if (!id) setExtras([]);
            }}
            onToggleExtra={(id) =>
              setExtras((cur) => (cur.includes(id) ? cur.filter((e) => e !== id) : [...cur, id]))
            }
            slotLabel={meta.title}
            condition={condition}
          />

          {primary ? (
            <>
              <RecipeFilters filters={filters} onChange={setFilters} />

              {results.length === 0 ? (
                <EmptyState
                  icon={<SearchX className="h-8 w-8" aria-hidden="true" />}
                  title="No recipes match your current filters."
                  hint="Try removing one or more filters, widening the calorie or protein range, or choosing a different base ingredient."
                />
              ) : (
                <>
                  <p className="text-sm text-ink-400" role="status">
                    {results.length} recipe{results.length === 1 ? '' : 's'} found for {meta.title.toLowerCase()}
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((r) => (
                      <RecipeCard
                        key={r.id}
                        recipe={r}
                        isSelected={selection?.recipeId === r.id}
                        isFavourite={favourites.includes(r.id)}
                        onView={() => setViewing(r)}
                        onAdd={() => handleAdd(r)}
                        onSwap={() => setBrowsing(true)}
                        onToggleFavourite={() => onToggleFavourite(r.id)}
                        condition={condition}
                        onOpenEvidence={(item) => setEvidenceItem(item)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <EmptyState
              icon={<Utensils className="h-8 w-8" aria-hidden="true" />}
              title="Select a base ingredient to discover suitable recipes."
              hint={`Pick the main ingredient you fancy for ${meta.title.toLowerCase()} and we will match every suitable recipe.`}
            />
          )}
        </div>
      )}

      {viewing && (
        <RecipeDetailsModal
          recipe={viewing}
          initialServings={selection?.recipeId === viewing.id ? selection.servings : 1}
          onClose={() => setViewing(null)}
          onAdd={(servings) => handleAdd(viewing, servings)}
          addLabel={selection?.recipeId === viewing.id ? 'Update Portion' : 'Add to Meal Plan'}
          condition={condition}
        />
      )}

      {condition && evidenceItem && <IngredientEvidencePanel item={evidenceItem} conditionId={condition.id} onClose={() => setEvidenceItem(null)} />}
    </section>
  );
}
