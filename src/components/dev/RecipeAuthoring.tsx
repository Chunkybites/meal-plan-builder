import { useEffect, useMemo, useRef, useState } from 'react';
import { Barcode, Loader2, Plus, Search, Trash2, X } from 'lucide-react';
import type { CanonicalFood, FoodSearchResult, QuantityBasis, RecipeUnit } from '../../data/food/types';
import { searchFoods, lookupBarcode } from '../../data/food/providers/foodSearchService';
import { resolveGrams } from '../../data/food/householdMeasures';
import { computeRecipeNutrition, canonicalToNutritionData } from '../../utils/recipeNutrition';
import type { StructuredRecipeIngredient } from '../../data/food/types';

/**
 * Development-only recipe authoring tool. Reachable at `#authoring` (no auth in
 * this prototype; protect the route in production). Demonstrates the food engine:
 * search canonical foods → pick the correct food + preparation state → enter a
 * quantity → review the gram conversion → live per-serving calculation.
 */

const UNITS: RecipeUnit[] = ['g', 'ml', 'item', 'tsp', 'tbsp', 'slice', 'clove', 'medium', 'large', 'small', 'pinch', 'scoop', 'handful', 'portion'];
const BASES: QuantityBasis[] = ['raw', 'cooked', 'drained', 'reconstituted', 'edible-portion', 'as-served'];

interface Row extends StructuredRecipeIngredient {
  food: CanonicalFood;
  gramNote: string;
  gramWarnings: string[];
}

export function RecipeAuthoring() {
  const [name, setName] = useState('');
  const [servings, setServings] = useState(1);
  const [rows, setRows] = useState<Row[]>([]);

  const foodMap = useMemo(() => new Map(rows.map((r) => [r.food.id, r.food])), [rows]);
  const result = useMemo(
    () => computeRecipeNutrition(rows, (id) => foodMap.get(id), servings),
    [rows, foodMap, servings],
  );
  const perServing = canonicalToNutritionData(result.perServing);

  const addFood = (food: CanonicalFood, quantity: number, unit: RecipeUnit, basis: QuantityBasis) => {
    const g = resolveGrams(food.displayName, quantity, unit);
    const row: Row = {
      id: `${food.id}-${Date.now()}`,
      displayText: `${quantity} ${unit} ${food.displayName}`,
      foodId: food.id,
      quantity,
      unit,
      gramWeight: g.grams,
      quantityBasis: basis,
      food,
      gramNote: g.note,
      gramWarnings: g.warnings,
    };
    setRows((r) => [...r, row]);
  };

  return (
    <div className="min-h-screen bg-ink-900 text-ink-100">
      <header className="border-b border-ink-700 bg-ink-950/80 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-volt-400">Dev tool</p>
            <h1 className="font-display text-xl font-bold text-white">Recipe authoring — food engine</h1>
          </div>
          <a href="#" className="btn-ghost text-sm" onClick={() => { window.location.hash = ''; }}>
            <X className="h-4 w-4" aria-hidden="true" /> Close
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <section className="card p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Recipe name</span>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Protein porridge" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Servings</span>
                <input type="number" min={0.5} step={0.5} className="input-field" value={servings} onChange={(e) => setServings(Math.max(0.5, Number(e.target.value) || 1))} />
              </label>
            </div>
          </section>

          <FoodPicker onAdd={addFood} />

          <section className="card p-4">
            <h2 className="mb-2 font-display text-base font-bold text-white">Ingredients ({rows.length})</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-ink-400">Search for a food above and add it with a quantity.</p>
            ) : (
              <ul className="space-y-2">
                {rows.map((row) => (
                  <li key={row.id} className="flex items-start justify-between gap-3 rounded-lg border border-ink-600 bg-ink-800 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">{row.displayText}</p>
                      <p className="text-xs text-ink-400">
                        {row.food.displayName} · {labelFor(row.food)} · {row.food.preparationState} · <span className="text-ink-300">{row.gramWeight} g</span> ({row.quantityBasis})
                      </p>
                      <p className="text-[11px] text-ink-500">{row.gramNote}</p>
                      {row.gramWarnings.map((w) => (<p key={w} className="text-[11px] text-amber-300/90">{w}</p>))}
                    </div>
                    <button type="button" className="btn-ghost !px-2 !py-1.5" onClick={() => setRows((r) => r.filter((x) => x.id !== row.id))} aria-label="Remove ingredient">
                      <Trash2 className="h-4 w-4 text-red-300" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <section className="card p-4">
            <h2 className="mb-2 font-display text-base font-bold text-white">Per serving (calculated)</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {(
                [
                  ['Calories', `${perServing.calories} kcal`],
                  ['Protein', `${perServing.protein} g`],
                  ['Carbs', `${perServing.carbs} g`],
                  ['Fat', `${perServing.fat} g`],
                  ['Fibre', `${perServing.fibre} g`],
                  ['Sugar', perServing.sugar !== undefined ? `${perServing.sugar} g` : '—'],
                  ['Sat fat', perServing.saturatedFat !== undefined ? `${perServing.saturatedFat} g` : '—'],
                  ['Sodium', perServing.sodium !== undefined ? `${perServing.sodium} mg` : '—'],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-lg bg-ink-800 px-2 py-1.5">
                  <dt className="text-[10px] uppercase tracking-wide text-ink-400">{label}</dt>
                  <dd className="text-sm font-bold text-white">{value}</dd>
                </div>
              ))}
            </dl>
            {result.partialNutrients.length > 0 && (
              <p className="mt-2 text-[11px] text-amber-300/90">Partial estimate — missing in some foods: {result.partialNutrients.slice(0, 6).join(', ')}.</p>
            )}
            {result.warnings.length > 0 && (
              <ul className="mt-2 list-inside list-disc text-[11px] text-amber-300/90">
                {result.warnings.map((w) => (<li key={w}>{w}</li>))}
              </ul>
            )}
            <p className="mt-2 text-[11px] text-ink-500">Totals recalculate live and scale with servings. Grams drive every calculation.</p>
          </section>
        </aside>
      </main>
    </div>
  );
}

function labelFor(food: CanonicalFood): string {
  return { cofid: 'UK CoFID', 'usda-fdc': 'USDA FDC', 'open-food-facts': 'Open Food Facts', 'manual-reviewed': 'Manually reviewed' }[food.source];
}

function FoodPicker({ onAdd }: { onAdd: (food: CanonicalFood, quantity: number, unit: RecipeUnit, basis: QuantityBasis) => void }) {
  const [text, setText] = useState('');
  const [branded, setBranded] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<CanonicalFood | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState<RecipeUnit>('g');
  const [basis, setBasis] = useState<QuantityBasis>('raw');
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search (respects OFF rate limits — no search-as-you-type storm).
  useEffect(() => {
    if (!text.trim()) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const res = await searchFoods({ text, branded, limit: 12, signal: controller.signal });
        setResults(res);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [text, branded]);

  const doBarcode = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    try {
      const food = await lookupBarcode(barcode.trim());
      setResults(food ? [{ food, matchScore: 1, sourceLabel: 'Open Food Facts' }] : []);
      if (!food) alert('No product found for that barcode (or Open Food Facts is unavailable).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search foods</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input className="input-field !pl-9" placeholder={branded ? 'Search branded products (Open Food Facts)…' : 'Search foods (CoFID / reviewed)…'} value={text} onChange={(e) => setText(e.target.value)} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-ink-300">
          <input type="checkbox" checked={branded} onChange={(e) => setBranded(e.target.checked)} className="h-3.5 w-3.5 accent-volt-400" />
          Branded
        </label>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-ink-400" aria-hidden="true" />}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <label className="relative flex-1">
          <Barcode className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input className="input-field !pl-9" placeholder="Barcode lookup (Open Food Facts)…" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </label>
        <button type="button" className="btn-secondary text-sm" onClick={doBarcode}>Look up</button>
      </div>

      {results.length > 0 && (
        <ul className="mb-3 max-h-64 space-y-1.5 overflow-y-auto">
          {results.map((r) => (
            <li key={r.food.id}>
              <button
                type="button"
                onClick={() => { setSelected(r.food); setBasis(r.food.preparationState === 'raw' ? 'raw' : r.food.preparationState === 'unknown' ? 'as-served' : 'cooked'); }}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${selected?.id === r.food.id ? 'border-volt-400 bg-volt-400/10' : 'border-ink-600 bg-ink-800 hover:border-ink-500'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{r.food.displayName}</span>
                  <span className="rounded bg-ink-700 px-1.5 py-0.5 text-[10px] text-ink-200">{r.sourceLabel}</span>
                </div>
                <p className="text-[11px] text-ink-400">
                  {r.food.preparationState} · {r.food.nutrientsPer100g.energyKcal ?? '—'} kcal, P {r.food.nutrientsPer100g.proteinG ?? '—'} / C {r.food.nutrientsPer100g.carbohydrateG ?? '—'} / F {r.food.nutrientsPer100g.fatG ?? '—'} per 100g · {r.food.dataQuality.completenessPercentage}% complete · match {Math.round(r.matchScore * 100)}%
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="rounded-lg border border-ink-600 bg-ink-800 p-3">
          <p className="mb-2 text-sm text-ink-200">Add <span className="font-semibold text-white">{selected.displayName}</span>:</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-400">Qty</span>
              <input type="number" min={0} step={1} className="input-field !w-20" value={quantity} onChange={(e) => setQuantity(Number(e.target.value) || 0)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-400">Unit</span>
              <select className="input-field !w-24" value={unit} onChange={(e) => setUnit(e.target.value as RecipeUnit)}>
                {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wide text-ink-400">Basis</span>
              <select className="input-field !w-36" value={basis} onChange={(e) => setBasis(e.target.value as QuantityBasis)}>
                {BASES.map((b) => (<option key={b} value={b}>{b}</option>))}
              </select>
            </label>
            <button type="button" className="btn-primary text-sm" onClick={() => { onAdd(selected, quantity, unit, basis); setSelected(null); }}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Add
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-500">≈ {resolveGrams(selected.displayName, quantity, unit).grams} g will be used for calculation.</p>
        </div>
      )}
    </section>
  );
}
