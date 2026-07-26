import { SlidersHorizontal, X } from 'lucide-react';
import type { DietaryFilterState, DietaryTag } from '../types';
import { DEFAULT_FILTERS, PREP_BUCKETS } from '../utils/filters';

const TAG_LABELS: { id: DietaryTag; label: string }[] = [
  { id: 'high-protein', label: 'High protein' },
  { id: 'low-calorie', label: 'Low calorie' },
  { id: 'low-carb', label: 'Low carb' },
  { id: 'lower-fat', label: 'Lower fat' },
  { id: 'high-fibre', label: 'High fibre' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'gluten-free', label: 'Gluten-free' },
  { id: 'dairy-free', label: 'Dairy-free' },
  { id: 'nut-free', label: 'Nut-free' },
  { id: 'quick', label: 'Quick meals' },
  { id: 'meal-prep', label: 'Meal prep friendly' },
  { id: 'under-20', label: 'Under 20 minutes' },
  { id: 'budget', label: 'Budget friendly' },
];

interface RecipeFiltersProps {
  filters: DietaryFilterState;
  onChange: (f: DietaryFilterState) => void;
}

export function RecipeFilters({ filters, onChange }: RecipeFiltersProps) {
  const hasActive =
    filters.tags.length > 0 ||
    filters.prepBucket !== 'any' ||
    filters.search !== '' ||
    filters.calorieRange[0] !== DEFAULT_FILTERS.calorieRange[0] ||
    filters.calorieRange[1] !== DEFAULT_FILTERS.calorieRange[1] ||
    filters.proteinRange[0] !== DEFAULT_FILTERS.proteinRange[0] ||
    filters.proteinRange[1] !== DEFAULT_FILTERS.proteinRange[1];

  const toggleTag = (tag: DietaryTag) => {
    onChange({
      ...filters,
      tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    });
  };

  return (
    <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-volt-400" aria-hidden="true" />
          Refine recipes
        </h4>
        {hasActive && (
          <button type="button" className="btn-ghost !px-2.5 !py-1 text-xs" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Clear filters
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Dietary filters">
        {TAG_LABELS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={filters.tags.includes(t.id)}
            className={`chip !px-2.5 !py-1 !text-xs ${filters.tags.includes(t.id) ? 'chip-active' : ''}`}
            onClick={() => toggleTag(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">Preparation time</legend>
          <div className="flex flex-wrap gap-1.5">
            {PREP_BUCKETS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={filters.prepBucket === b.id}
                className={`chip !px-2.5 !py-1 !text-xs ${filters.prepBucket === b.id ? 'chip-active' : ''}`}
                onClick={() => onChange({ ...filters, prepBucket: b.id })}
              >
                {b.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">
            Calories per serving: {filters.calorieRange[0]}–{filters.calorieRange[1]} kcal
          </legend>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-ink-400">
              Min
              <input
                type="range"
                min={0}
                max={800}
                step={25}
                value={filters.calorieRange[0]}
                aria-label="Minimum calories"
                className="w-full accent-volt-400"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    calorieRange: [Math.min(Number(e.target.value), filters.calorieRange[1]), filters.calorieRange[1]],
                  })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-400">
              Max
              <input
                type="range"
                min={100}
                max={1000}
                step={25}
                value={filters.calorieRange[1]}
                aria-label="Maximum calories"
                className="w-full accent-volt-400"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    calorieRange: [filters.calorieRange[0], Math.max(Number(e.target.value), filters.calorieRange[0])],
                  })
                }
              />
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">
            Protein per serving: {filters.proteinRange[0]}–{filters.proteinRange[1]}g
          </legend>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-xs text-ink-400">
              Min
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={filters.proteinRange[0]}
                aria-label="Minimum protein"
                className="w-full accent-volt-400"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    proteinRange: [Math.min(Number(e.target.value), filters.proteinRange[1]), filters.proteinRange[1]],
                  })
                }
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-400">
              Max
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={filters.proteinRange[1]}
                aria-label="Maximum protein"
                className="w-full accent-volt-400"
                onChange={(e) =>
                  onChange({
                    ...filters,
                    proteinRange: [filters.proteinRange[0], Math.max(Number(e.target.value), filters.proteinRange[0])],
                  })
                }
              />
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
