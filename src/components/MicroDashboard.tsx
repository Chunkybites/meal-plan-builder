import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { MicronutrientData, NutritionData } from '../types';
import { MICRO_DEFS, type MicroDef } from '../data/microDefs';
import { pctOf } from '../utils/nutrition';
import { ProgressBar } from './common';

interface MicroDashboardProps {
  micros: MicronutrientData;
  totals: NutritionData;
}

function MicroRow({ def, value }: { def: MicroDef; value: number }) {
  const pct = pctOf(value, def.rda);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-sm text-ink-200">{def.label}</span>
        <span className="whitespace-nowrap text-xs text-ink-400">
          <span className="font-semibold text-white">
            {value}
            {def.unit}
          </span>{' '}
          / {def.rda}
          {def.unit}
          {def.isUpperLimit ? ' max' : ''} · {pct}%
        </span>
      </div>
      <ProgressBar
        value={value}
        target={def.rda}
        colorClass={def.isUpperLimit ? 'bg-amber-400/80' : 'bg-sky-400'}
        upperLimit={def.isUpperLimit}
      />
    </div>
  );
}

export function MicroDashboard({ micros, totals }: MicroDashboardProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const vitamins = MICRO_DEFS.filter((d) => d.group === 'Vitamins' && typeof micros[d.key] === 'number');
  const minerals = MICRO_DEFS.filter((d) => d.group === 'Minerals' && typeof micros[d.key] === 'number');

  const advanced: [string, number | undefined, string][] = [
    ['Saturated fat', totals.saturatedFat, 'g'],
    ['Monounsaturated fat', totals.monounsaturatedFat, 'g'],
    ['Polyunsaturated fat', totals.polyunsaturatedFat, 'g'],
    ['Omega-3', totals.omega3, 'g'],
    ['Omega-6', totals.omega6, 'g'],
    ['Total sugar', totals.sugar, 'g'],
    ['Added sugar', totals.addedSugar, 'g'],
    ['Cholesterol', totals.cholesterol, 'mg'],
    ['Sodium', totals.sodium, 'mg'],
    ['Potassium', totals.potassium, 'mg'],
  ];
  const advancedAvailable = advanced.filter(([, v]) => typeof v === 'number');

  if (vitamins.length === 0 && minerals.length === 0) {
    return (
      <section aria-label="Micronutrient dashboard" className="card p-4 sm:p-6">
        <h3 className="mb-2 font-display text-lg font-bold text-white">Micronutrient Dashboard</h3>
        <p className="text-sm text-ink-400">
          Micronutrient data is not available for the selected recipes. The rest of your plan still works normally.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Micronutrient dashboard" className="card p-4 sm:p-6">
      <h3 className="mb-1 font-display text-lg font-bold text-white">Micronutrient Dashboard</h3>
      <p className="mb-4 text-xs text-ink-400">
        Reference values are general adult estimates. Individual requirements vary with age, sex, health,
        medication, pregnancy and activity level — this is not a diagnostic tool.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-volt-300">Vitamins</h4>
          <div className="space-y-3">
            {vitamins.map((d) => (
              <MicroRow key={d.key} def={d} value={micros[d.key] as number} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-volt-300">Minerals</h4>
          <div className="space-y-3">
            {minerals.map((d) => (
              <MicroRow key={d.key} def={d} value={micros[d.key] as number} />
            ))}
          </div>
        </div>
      </div>

      {advancedAvailable.length > 0 && (
        <div className="mt-5 border-t border-ink-700 pt-4">
          <button
            type="button"
            className="btn-ghost !py-1.5 text-sm"
            onClick={() => setShowAdvanced((s) => !s)}
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
            Advanced Nutrition
          </button>
          {showAdvanced && (
            <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
              {advancedAvailable.map(([label, value, unit]) => (
                <div key={label} className="flex justify-between border-b border-ink-700/50 pb-1.5">
                  <dt className="text-ink-300">{label}</dt>
                  <dd className="font-semibold text-white">
                    {value}
                    {unit}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </section>
  );
}
