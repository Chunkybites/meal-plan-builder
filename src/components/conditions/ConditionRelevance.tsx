import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { Recipe } from '../../types';
import { computeRelevance, type GlycaemicCategory, type RelevanceCategory } from '../../data/conditions/scoring';
import type { ConditionDefinition } from '../../data/conditions/types';
import { ProgressBar } from '../common';

const CATEGORY_STYLES: Record<RelevanceCategory, string> = {
  higher: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
  moderate: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  lower: 'text-ink-300 border-ink-500 bg-ink-700/40',
  'insufficient-data': 'text-ink-300 border-ink-500 bg-ink-700/40',
};

const GLYCAEMIC_STYLES: Record<GlycaemicCategory, string> = {
  lower: 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10',
  moderate: 'text-amber-300 border-amber-400/40 bg-amber-400/10',
  higher: 'text-orange-300 border-orange-400/40 bg-orange-400/10',
  unknown: 'text-ink-300 border-ink-500 bg-ink-700/40',
};

export function ConditionRelevanceChip({ recipe, def }: { recipe: Recipe; def: ConditionDefinition }) {
  const result = computeRelevance(recipe, def);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${CATEGORY_STYLES[result.category]}`}
      title={`${def.shortName} Nutrition Relevance — an educational planning label, not a clinical score`}
    >
      {def.shortName}: {result.categoryLabel}
    </span>
  );
}

export function ConditionRelevance({ recipe, def }: { recipe: Recipe; def: ConditionDefinition }) {
  const [open, setOpen] = useState(false);
  const result = computeRelevance(recipe, def);

  return (
    <section aria-label={`${def.shortName} nutrition relevance`} className="rounded-xl border border-ink-600 bg-ink-800/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-1.5 text-sm font-bold text-white">
            {def.shortName} Nutrition Relevance
            <span className="cursor-help text-ink-400" title="An educational planning label based on the factors this condition tracks. It is NOT a clinical score and does not label a recipe good or bad.">
              <Info className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </h4>
          <p className="text-xs text-ink-400">Educational planning label — not a clinical score.</p>
        </div>
        <div className={`rounded-lg border px-2.5 py-1 text-sm font-bold ${CATEGORY_STYLES[result.category]}`}>{result.categoryLabel}</div>
      </div>

      {result.glycaemic && (
        <>
          <div className={`mt-3 inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${GLYCAEMIC_STYLES[result.glycaemic.category]}`}>{result.glycaemic.label}</div>
          <p className="mt-1.5 text-[11px] text-ink-400">{result.glycaemic.note}</p>
        </>
      )}

      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-300 hover:text-white">
        {open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        {open ? 'Hide factors' : 'Show the factors behind this'}
      </button>

      {open && (
        <ul className="mt-3 space-y-2.5">
          {result.components.map((c) => (
            <li key={c.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-ink-200">{c.label}</span>
                <span className="font-semibold text-white">{c.points}/{c.maxPoints}</span>
              </div>
              <ProgressBar value={c.points} target={c.maxPoints} colorClass="bg-ink-400" />
            </li>
          ))}
          <li className="pt-1 text-[11px] text-ink-500">
            Factors are weighted and combined into the relevance label above. This is a planning aid, not a measurement.
          </li>
        </ul>
      )}
    </section>
  );
}
