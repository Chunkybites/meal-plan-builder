import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Ingredient, IngredientCategory } from '../types';
import type { ConditionDefinition, ConditionEvidenceItem } from '../data/conditions/types';
import { INGREDIENTS } from '../data/ingredients';
import { getIngredientEvidence, ingredientHasEvidence } from '../data/conditions/matchers';
import { IngredientEvidencePanel } from './conditions/IngredientEvidencePanel';

const CATEGORY_ORDER: IngredientCategory[] = [
  'Meat',
  'Fish',
  'Eggs & dairy',
  'Plant-based proteins',
  'Carbohydrate sources',
  'Fruit',
  'Other',
];

interface IngredientSelectorProps {
  primary: string | null;
  extras: string[];
  onSelectPrimary: (id: string | null) => void;
  onToggleExtra: (id: string) => void;
  slotLabel: string;
  condition?: ConditionDefinition | null;
}

export function IngredientSelector({ primary, extras, onSelectPrimary, onToggleExtra, slotLabel, condition = null }: IngredientSelectorProps) {
  const [search, setSearch] = useState('');
  const [evidenceItem, setEvidenceItem] = useState<ConditionEvidenceItem | null>(null);

  const selectedWithEvidence = condition
    ? [primary, ...extras].filter((id): id is string => Boolean(id) && ingredientHasEvidence(id!, condition.id))
    : [];

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const visible = q ? INGREDIENTS.filter((i) => i.name.toLowerCase().includes(q)) : INGREDIENTS;
    const map = new Map<IngredientCategory, Ingredient[]>();
    for (const cat of CATEGORY_ORDER) {
      const items = visible.filter((i) => i.category === cat);
      if (items.length > 0) map.set(cat, items);
    }
    return map;
  }, [search]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold text-white">Pick a base ingredient</h3>
          <p className="text-sm text-ink-400">
            Choose the star of your {slotLabel.toLowerCase()}, then optionally tap extra ingredients to refine the match.
          </p>
        </div>
        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Search ingredients</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            className="input-field !pl-9"
            placeholder="Search ingredients"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      {grouped.size === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-600 px-4 py-6 text-center text-sm text-ink-400">
          No ingredients match “{search}”. Try a different search term.
        </p>
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([category, items]) => (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">{category}</h4>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((ing) => {
                  const isPrimary = primary === ing.id;
                  const isExtra = extras.includes(ing.id);
                  return (
                    <button
                      key={ing.id}
                      type="button"
                      aria-pressed={isPrimary || isExtra}
                      onClick={() => {
                        if (isPrimary) {
                          onSelectPrimary(null);
                        } else if (!primary) {
                          onSelectPrimary(ing.id);
                        } else if (isExtra) {
                          onToggleExtra(ing.id);
                        } else {
                          onToggleExtra(ing.id);
                        }
                      }}
                      className={`group relative flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all ${
                        isPrimary
                          ? 'border-volt-400 bg-volt-400/10 shadow-glow'
                          : isExtra
                            ? 'border-sky-400/70 bg-sky-400/10'
                            : 'border-ink-700 bg-ink-800 hover:border-ink-500 hover:bg-ink-700/70'
                      }`}
                    >
                      <span className="text-2xl" aria-hidden="true">{ing.emoji}</span>
                      <span className="text-sm font-semibold text-white">{ing.name}</span>
                      <span className="text-[11px] text-ink-400">{ing.classification}</span>
                      {isPrimary && (
                        <span className="absolute right-2 top-2 rounded-full bg-volt-400 px-1.5 py-0.5 text-[10px] font-bold text-ink-950">
                          BASE
                        </span>
                      )}
                      {isExtra && (
                        <span className="absolute right-2 top-2 rounded-full bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold text-ink-950">
                          EXTRA
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {primary && (
        <p className="mt-3 text-sm text-ink-300">
          Base: <span className="font-semibold text-volt-300">{INGREDIENTS.find((i) => i.id === primary)?.name}</span>
          {extras.length > 0 && (
            <>
              {' '}· Extras:{' '}
              <span className="text-sky-300">
                {extras.map((e) => INGREDIENTS.find((i) => i.id === e)?.name).filter(Boolean).join(', ')}
              </span>
            </>
          )}
          <button type="button" className="ml-3 text-xs text-ink-400 underline hover:text-white" onClick={() => onSelectPrimary(null)}>
            Clear selection
          </button>
        </p>
      )}

      {condition && selectedWithEvidence.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 p-2.5">
          <span className="text-xs text-ink-300">Why might this be relevant to {condition.shortName}?</span>
          {selectedWithEvidence.map((id) => {
            const items = getIngredientEvidence(id, condition.id);
            const name = INGREDIENTS.find((i) => i.id === id)?.name ?? id;
            return items.map((item) => (
              <button
                key={`${id}-${item.id}`}
                type="button"
                onClick={() => setEvidenceItem(item)}
                className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/50 bg-fuchsia-400/10 px-2.5 py-1 text-xs font-semibold text-fuchsia-200 transition-colors hover:bg-fuchsia-400/20"
              >
                <span aria-hidden="true">🔬</span>
                {name}
              </button>
            ));
          })}
        </div>
      )}

      {condition && evidenceItem && <IngredientEvidencePanel item={evidenceItem} conditionId={condition.id} onClose={() => setEvidenceItem(null)} />}
    </div>
  );
}
