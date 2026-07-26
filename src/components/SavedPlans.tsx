import { useState } from 'react';
import { Copy, FolderOpen, Save, Trash2 } from 'lucide-react';
import type { SavedMealPlan } from '../types';
import { Modal } from './common';

interface SavedPlansProps {
  plans: SavedMealPlan[];
  onSave: (name: string) => void;
  onLoad: (plan: SavedMealPlan) => void;
  onDuplicate: (plan: SavedMealPlan) => void;
  onDelete: (id: string) => void;
  canSave: boolean;
}

export function SavedPlans({ plans, onSave, onLoad, onDuplicate, onDelete, canSave }: SavedPlansProps) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  return (
    <section aria-label="Saved meal plans" className="card no-print p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold text-white">Saved Meal Plans</h3>
        <button type="button" className="btn-primary !py-2 text-sm" onClick={() => setNaming(true)} disabled={!canSave}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Meal Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <p className="text-sm text-ink-400">
          No saved plans yet. Build your day and save it — plans are stored in your browser.
        </p>
      ) : (
        <ul className="space-y-2">
          {plans.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-600 bg-ink-800 p-3">
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-ink-400">
                  {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} ·{' '}
                  {p.totals.calories} kcal · {p.totals.protein}g protein
                </p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => onLoad(p)}>
                  <FolderOpen className="h-3.5 w-3.5" aria-hidden="true" /> Load
                </button>
                <button type="button" className="btn-ghost !px-2.5 !py-1.5 text-xs" onClick={() => onDuplicate(p)}>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Duplicate
                </button>
                <button
                  type="button"
                  className="btn-ghost !px-2.5 !py-1.5 text-xs !text-red-300 hover:!border-red-400/60"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {naming && (
        <Modal title="Name your meal plan" onClose={() => setNaming(false)}>
          <label htmlFor="plan-name" className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Plan name</span>
            <input
              id="plan-name"
              type="text"
              className="input-field"
              placeholder="e.g. Monday High-Protein Meal Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoFocus
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setNaming(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSave(name.trim() || 'My meal plan');
                setName('');
                setNaming(false);
              }}
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
