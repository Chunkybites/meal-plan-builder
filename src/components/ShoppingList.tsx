import { useMemo, useState } from 'react';
import { Check, ClipboardCopy, Download, Printer, ShoppingCart } from 'lucide-react';
import type { MealSelection, MealSlot, Recipe, ShoppingCategory } from '../types';
import {
  SHOPPING_CATEGORY_ORDER,
  buildShoppingList,
  formatShoppingItem,
  shoppingListAsText,
} from '../utils/shopping';

interface ShoppingListProps {
  selections: Partial<Record<MealSlot, MealSelection>>;
  recipeById: (id: string) => Recipe | undefined;
}

export function ShoppingList({ selections, recipeById }: ShoppingListProps) {
  const baseItems = useMemo(() => buildShoppingList(selections, recipeById), [selections, recipeById]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const items = baseItems.map((i) => ({ ...i, owned: owned.has(`${i.name}|${i.unit}`) }));
  const grouped = SHOPPING_CATEGORY_ORDER.map(
    (cat) => [cat, items.filter((i) => i.category === cat)] as [ShoppingCategory, typeof items],
  ).filter(([, list]) => list.length > 0);

  const toggleOwned = (key: string) => {
    setOwned((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const copyList = async () => {
    const text = shoppingListAsText(items);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your shopping list:', text);
    }
  };

  const downloadList = () => {
    const blob = new Blob([shoppingListAsText(items)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shopping-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (items.length === 0) {
    return (
      <section aria-label="Shopping list" className="card p-4 sm:p-6">
        <h3 className="mb-2 font-display text-lg font-bold text-white">Shopping List</h3>
        <p className="text-sm text-ink-400">Add meals to your plan to generate a combined shopping list.</p>
      </section>
    );
  }

  return (
    <section aria-label="Shopping list" className="card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-bold text-white">
          <ShoppingCart className="h-5 w-5 text-volt-400" aria-hidden="true" />
          Shopping List
        </h3>
        <div className="no-print flex flex-wrap gap-2">
          <button type="button" className="btn-ghost !py-1.5 text-sm" onClick={copyList}>
            {copied ? <Check className="h-4 w-4 text-volt-400" aria-hidden="true" /> : <ClipboardCopy className="h-4 w-4" aria-hidden="true" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button type="button" className="btn-ghost !py-1.5 text-sm" onClick={downloadList}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Download
          </button>
          <button type="button" className="btn-ghost !py-1.5 text-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print
          </button>
        </div>
      </div>

      <p className="mb-4 text-xs text-ink-400">
        Duplicate ingredients across recipes are combined. Tick anything you already have at home.
      </p>

      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
        {grouped.map(([category, list]) => (
          <div key={category}>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-volt-300">{category}</h4>
            <ul className="space-y-1.5">
              {list.map((item) => {
                const key = `${item.name}|${item.unit}`;
                return (
                  <li key={key}>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={item.owned}
                        onChange={() => toggleOwned(key)}
                        className="h-4 w-4 rounded border-ink-500 bg-ink-800 accent-volt-400"
                        aria-label={`Mark ${item.name} as already owned`}
                      />
                      <span className={item.owned ? 'text-ink-500 line-through' : 'text-ink-200'}>
                        {formatShoppingItem(item)}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
