import { Check } from 'lucide-react';
import type { MealSlot, MealSelection } from '../types';

export interface Step {
  id: MealSlot | 'summary';
  label: string;
  emoji: string;
}

export const STEPS: Step[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '🥗' },
  { id: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { id: 'snack', label: 'Night-Time Snack', emoji: '🌙' },
  { id: 'summary', label: 'Daily Summary', emoji: '📊' },
];

interface ProgressTrackerProps {
  activeIndex: number;
  selections: Partial<Record<MealSlot, MealSelection>>;
  onNavigate: (index: number) => void;
}

export function ProgressTracker({ activeIndex, selections, onNavigate }: ProgressTrackerProps) {
  return (
    <nav aria-label="Meal plan progress" className="no-print sticky top-0 z-40 border-b border-ink-700/60 bg-ink-900/90 backdrop-blur">
      <ol className="mx-auto flex max-w-6xl items-stretch gap-1 overflow-x-auto px-2 py-2 sm:gap-2 sm:px-6">
        {STEPS.map((step, i) => {
          const isMeal = step.id !== 'summary';
          const complete = isMeal ? Boolean(selections[step.id as MealSlot]) : false;
          const active = i === activeIndex;
          return (
            <li key={step.id} className="flex min-w-fit flex-1">
              <button
                type="button"
                onClick={() => onNavigate(i)}
                aria-current={active ? 'step' : undefined}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-volt-400 text-ink-950'
                    : complete
                      ? 'bg-ink-800 text-volt-300 hover:bg-ink-700'
                      : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                    active ? 'bg-ink-950/20 text-ink-950' : complete ? 'bg-volt-400 text-ink-950' : 'bg-ink-700 text-ink-200'
                  }`}
                  aria-hidden="true"
                >
                  {complete && !active ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
