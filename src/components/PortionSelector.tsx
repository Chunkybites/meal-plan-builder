import { useState } from 'react';
import { Wand2 } from 'lucide-react';

const PRESETS = [0.5, 1, 1.5, 2];
export const MIN_SERVINGS = 0.25;
export const MAX_SERVINGS = 4;

interface PortionSelectorProps {
  servings: number;
  onChange: (servings: number) => void;
  /** Optional "Adjust to Fit My Targets" handler; returns the suggested serving count */
  onAutoFit?: () => number;
  idPrefix: string;
}

export function PortionSelector({ servings, onChange, onAutoFit, idPrefix }: PortionSelectorProps) {
  const [custom, setCustom] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [autoFitNote, setAutoFitNote] = useState<string | null>(null);

  const applyCustom = (raw: string) => {
    setCustom(raw);
    if (raw === '') {
      setError(null);
      return;
    }
    const v = Number(raw);
    if (!Number.isFinite(v) || v < MIN_SERVINGS || v > MAX_SERVINGS) {
      setError(`Enter a serving amount between ${MIN_SERVINGS} and ${MAX_SERVINGS}.`);
      return;
    }
    setError(null);
    onChange(Math.round(v * 4) / 4);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Portion size">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={servings === p}
            className={`chip ${servings === p ? 'chip-active' : ''}`}
            onClick={() => {
              onChange(p);
              setCustom('');
              setError(null);
              setAutoFitNote(null);
            }}
          >
            {p} {p === 1 ? 'serving' : 'servings'}
          </button>
        ))}
        <label htmlFor={`${idPrefix}-custom`} className="flex items-center gap-1.5 text-sm text-ink-300">
          <span>Custom:</span>
          <input
            id={`${idPrefix}-custom`}
            type="number"
            min={MIN_SERVINGS}
            max={MAX_SERVINGS}
            step={0.25}
            placeholder={String(servings)}
            value={custom}
            onChange={(e) => applyCustom(e.target.value)}
            className="input-field !w-20 !px-2 !py-1.5 text-sm"
            aria-label="Custom serving amount"
          />
        </label>
        {onAutoFit && (
          <button
            type="button"
            className="btn-secondary !px-3 !py-1.5 text-sm"
            onClick={() => {
              const suggested = onAutoFit();
              onChange(suggested);
              setCustom('');
              setError(null);
              setAutoFitNote(`Suggested ${suggested} serving${suggested === 1 ? '' : 's'} based on your remaining targets.`);
            }}
          >
            <Wand2 className="h-4 w-4" aria-hidden="true" />
            Adjust to Fit My Targets
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {autoFitNote && !error && (
        <p role="status" className="mt-2 text-sm text-volt-300">
          {autoFitNote}
        </p>
      )}
    </div>
  );
}
