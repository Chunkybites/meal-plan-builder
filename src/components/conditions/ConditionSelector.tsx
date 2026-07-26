import { BookOpen, Check, Utensils } from 'lucide-react';
import { CONDITIONS } from '../../data/conditions/engine';
import type { ConditionDefinition, SupportMode } from '../../data/conditions/types';

interface ConditionSelectorProps {
  active: SupportMode;
  onSelect: (mode: SupportMode) => void;
  onOpenMethodology: () => void;
}

const ACCENT_RING: Record<ConditionDefinition['accent'], string> = {
  fuchsia: 'border-fuchsia-400/70 bg-fuchsia-400/10 shadow-[0_0_0_1px_rgba(232,121,249,0.3)]',
  sky: 'border-sky-400/70 bg-sky-400/10 shadow-[0_0_0_1px_rgba(56,189,248,0.3)]',
  amber: 'border-amber-400/70 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.3)]',
};

export function ConditionSelector({ active, onSelect, onOpenMethodology }: ConditionSelectorProps) {
  return (
    <section aria-label="Nutrition support mode" className="card no-print p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-white">Nutrition Support Mode</h2>
          <p className="max-w-2xl text-sm text-ink-300">
            Optional, evidence-led layers for specific conditions. They add research context and a specialist
            dashboard — they never change how you build meals, and never diagnose or treat. One at a time.
          </p>
        </div>
        <button type="button" className="btn-ghost !py-1.5 text-sm" onClick={onOpenMethodology}>
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Research methodology
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="radiogroup" aria-label="Choose a nutrition support mode">
        <button
          type="button"
          role="radio"
          aria-checked={active === 'general'}
          onClick={() => onSelect('general')}
          className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors ${active === 'general' ? 'border-volt-400/70 bg-volt-400/10' : 'border-ink-700 bg-ink-800 hover:border-ink-500'}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xl" aria-hidden="true">🍽️</span>
            {active === 'general' && <Check className="h-4 w-4 text-volt-400" aria-hidden="true" />}
          </div>
          <h3 className="font-display text-base font-bold text-white">General Nutrition</h3>
          <p className="text-xs text-ink-300">The standard planner: macros, micronutrients, balance score and shopping list.</p>
          <p className="mt-auto pt-2 text-[11px] uppercase tracking-wide text-ink-500">Default</p>
        </button>

        {CONDITIONS.map((c) => {
          const isActive = active === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSelect(c.id)}
              className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors ${isActive ? ACCENT_RING[c.accent] : 'border-ink-700 bg-ink-800 hover:border-ink-500'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl" aria-hidden="true">{c.emoji}</span>
                {isActive && <Check className="h-4 w-4 text-white" aria-hidden="true" />}
              </div>
              <h3 className="font-display text-base font-bold text-white">{c.name}</h3>
              <p className="text-xs text-ink-300">{c.tagline}</p>
              <p className="mt-auto pt-2 text-[11px] text-ink-400">
                <span className="font-medium text-ink-300">Tracks:</span> {c.whatItTracks.slice(0, 3).join(', ')}…
              </p>
            </button>
          );
        })}
      </div>

      {active !== 'general' && (
        <p className="mt-3 flex items-start gap-2 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-xs text-ink-300">
          <Utensils className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400" aria-hidden="true" />
          {CONDITIONS.find((c) => c.id === active)?.disclaimer}
        </p>
      )}
    </section>
  );
}
