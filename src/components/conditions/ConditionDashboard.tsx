import { useMemo, useState } from 'react';
import type { DailyTargets, MealSelection, MealSlot, Recipe } from '../../types';
import { buildConditionDashboard, type ConditionDashboardData, type PlantClass } from '../../data/conditions/scoring';
import type { ConditionDefinition, ConditionEvidenceItem, DashboardMetricDefinition, MetricEvaluator } from '../../data/conditions/types';
import { ProgressBar } from '../common';
import { EvidenceLevelBadge, ConditionEvidenceButton } from './conditionsCommon';
import { IngredientEvidencePanel } from './IngredientEvidencePanel';

const CARB_LABELS: { key: 'wholegrain' | 'legume' | 'fruit' | 'vegetable' | 'refined'; label: string; className: string }[] = [
  { key: 'wholegrain', label: 'Wholegrains', className: 'bg-amber-400' },
  { key: 'legume', label: 'Legumes', className: 'bg-emerald-400' },
  { key: 'vegetable', label: 'Vegetables', className: 'bg-green-400' },
  { key: 'fruit', label: 'Fruit', className: 'bg-fuchsia-400' },
  { key: 'refined', label: 'Refined', className: 'bg-ink-500' },
];
const PLANT_CLASS_LABELS: Record<PlantClass, string> = { fruit: 'Fruits', vegetable: 'Vegetables', legume: 'Legumes', nut: 'Nuts', seed: 'Seeds', wholegrain: 'Wholegrains' };

interface Props {
  condition: ConditionDefinition;
  selections: Partial<Record<MealSlot, MealSelection>>;
  targets: DailyTargets;
  recipeById: (id: string) => Recipe | undefined;
}

export function ConditionDashboard({ condition, selections, targets, recipeById }: Props) {
  const data = useMemo(() => buildConditionDashboard(selections, condition.id, recipeById), [selections, condition.id, recipeById]);
  const [evidenceItem, setEvidenceItem] = useState<ConditionEvidenceItem | null>(null);

  const primary = condition.dashboardMetrics.filter((m) => m.section !== 'gi-symptom-support');
  const gi = condition.dashboardMetrics.filter((m) => m.section === 'gi-symptom-support');

  return (
    <section aria-label={`${condition.shortName} daily dashboard`} className="card p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-white">
        <span aria-hidden="true">{condition.emoji}</span> {condition.shortName} Daily Dashboard
      </h3>
      <p className="mb-5 text-xs text-ink-400">
        A specialist view of nutrition features often discussed in {condition.shortName}. Educational only — every
        figure is an estimate for planning, not a clinical measure. Your selected meals provide approximately these
        amounts; this is not a nutrient-deficiency assessment.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {primary.map((m) => (
          <MetricCard key={m.id} metric={m} data={data} targets={targets} />
        ))}
      </div>

      {gi.length > 0 && (
        <div className="mt-5 rounded-xl border border-sky-400/25 bg-sky-400/5 p-4">
          <h4 className="mb-1 text-sm font-semibold text-white">GI symptom support (separate from endometriosis nutrition)</h4>
          <p className="mb-3 text-xs text-ink-300">
            Some people with endometriosis have overlapping IBS-type gut symptoms. Strategies such as a structured,
            short-term low-FODMAP process are for those <em>GI symptoms</em> — they are not a treatment for
            endometriosis or its lesions.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {gi.map((m) => (
              <MetricCard key={m.id} metric={m} data={data} targets={targets} />
            ))}
          </div>
        </div>
      )}

      {/* Evidence-linked ingredients (always rendered if the condition tracks it) */}
      {condition.dashboardMetrics.some((m) => m.evaluator === 'evidence-linked') && (
        <div className="mt-5 rounded-xl border border-fuchsia-400/25 bg-fuchsia-400/5 p-4">
          <h4 className="mb-1 text-sm font-semibold text-white">Evidence-linked ingredients</h4>
          {data.evidenceLinks.length === 0 ? (
            <p className="text-sm text-ink-300">
              None of your current recipes contain ingredients in the {condition.shortName} evidence database. That is
              not a problem — a balanced overall pattern matters most.
            </p>
          ) : (
            <>
              <p className="mb-3 text-sm text-ink-200">
                Your plan contains {data.evidenceLinks.length} ingredient{data.evidenceLinks.length === 1 ? '' : 's'} with{' '}
                {condition.shortName}-relevant research. Open each to inspect what was studied.
              </p>
              <ul className="space-y-2">
                {data.evidenceLinks.map(({ item, recipeNames }) => {
                  const link = item.conditions.find((c) => c.conditionId === condition.id);
                  const best = link ? link.outcomes.reduce((a, b) => (rank(b.evidenceLevel) > rank(a.evidenceLevel) ? b : a)) : null;
                  return (
                    <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-600 bg-ink-800 p-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white">{item.interventionName}</p>
                        <p className="text-xs text-ink-400">in {recipeNames.join(', ')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {best && <span className="hidden items-center gap-1 text-[11px] text-ink-400 sm:flex">best evidence <EvidenceLevelBadge level={best.evidenceLevel} /></span>}
                        <ConditionEvidenceButton label="Evidence" accent={condition.accent} onClick={() => setEvidenceItem(item)} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      )}

      {evidenceItem && <IngredientEvidencePanel item={evidenceItem} conditionId={condition.id} onClose={() => setEvidenceItem(null)} />}
    </section>
  );
}

function MetricCard({ metric, data, targets }: { metric: DashboardMetricDefinition; data: ConditionDashboardData; targets: DailyTargets }) {
  const body = renderMetric(metric.evaluator, data, targets);
  if (!body) return null;
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
      <h4 className="mb-2 text-sm font-semibold text-white">{metric.label}</h4>
      {body}
      <p className="mt-2 text-xs text-ink-400">{metric.note}</p>
    </div>
  );
}

function rank(level: 'A' | 'B' | 'C' | 'D'): number {
  return { A: 4, B: 3, C: 2, D: 1 }[level];
}

function renderMetric(evaluator: MetricEvaluator, data: ConditionDashboardData, targets: DailyTargets) {
  switch (evaluator) {
    case 'fibre':
      return (
        <>
          <div className="mb-1 flex items-center justify-between text-sm"><span className="text-ink-300">Daily fibre</span><span className="text-ink-300"><span className="font-bold text-white">{data.fibre}g</span> / {targets.fibre}g</span></div>
          <ProgressBar value={data.fibre} target={targets.fibre} colorClass="bg-amber-400" />
        </>
      );
    case 'protein':
      return <p className="text-2xl font-extrabold text-white">{data.proteinTotal}g <span className="text-sm font-medium text-ink-400">total protein</span></p>;
    case 'protein-distribution': {
      const max = Math.max(30, ...data.proteinDistribution.map((p) => p.protein));
      return (
        <ul className="space-y-1.5">
          {data.proteinDistribution.map((p) => (
            <li key={p.slot} className="flex items-center gap-2 text-xs">
              <span className="w-24 shrink-0 text-ink-300">{p.label}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-700"><div className="h-full rounded-full bg-volt-400" style={{ width: `${Math.min(100, (p.protein / max) * 100)}%` }} /></div>
              <span className="w-10 shrink-0 text-right font-semibold text-white">{p.protein}g</span>
            </li>
          ))}
        </ul>
      );
    }
    case 'carb-quality':
      if (data.carbQuality.total === 0) return <p className="text-sm text-ink-300">No major carbohydrate sources to assess yet.</p>;
      return (
        <>
          <div className="mb-2 flex h-3 overflow-hidden rounded-full bg-ink-700">
            {CARB_LABELS.map((c) => { const pct = (data.carbQuality.counts[c.key] / data.carbQuality.total) * 100; return pct > 0 ? <div key={c.key} className={c.className} style={{ width: `${pct}%` }} title={`${c.label}: ${data.carbQuality.counts[c.key]}`} /> : null; })}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            {CARB_LABELS.filter((c) => data.carbQuality.counts[c.key] > 0).map((c) => (<span key={c.key} className="flex items-center gap-1 text-ink-300"><span className={`inline-block h-2 w-2 rounded-full ${c.className}`} aria-hidden="true" />{c.label}: {data.carbQuality.counts[c.key]}</span>))}
          </div>
          <p className="mt-1.5 text-[11px] text-ink-400">{Math.round(data.carbQuality.favourableShare * 100)}% wholegrain, legume, fruit or vegetable.</p>
        </>
      );
    case 'added-sugar':
      return (
        <>
          <p className="text-2xl font-extrabold text-white">{data.addedSugar.total}g <span className="text-sm font-medium text-ink-400">estimated</span></p>
          {!data.addedSugar.complete && <p className="mt-1 text-[11px] text-ink-400">Based on {data.addedSugar.recipesWithData} of {data.addedSugar.recipesTotal} recipes that record added sugar separately.</p>}
        </>
      );
    case 'plant-diversity':
      return <DiversityBlock total={data.plantDiversity.total} byClass={data.plantDiversity.byClass} />;
    case 'fruit-veg-diversity':
      return <DiversityBlock total={data.fruitVegDiversity.total} byClass={data.fruitVegDiversity.byClass} />;
    case 'oily-fish':
      return <SourceList items={data.oilyFishSources} emptyLabel="No oily-fish source in this plan yet." />;
    case 'omega3':
      return <SourceList items={data.omega3Sources} emptyLabel="No notable omega-3 source in this plan yet." />;
    case 'calcium-foods':
      return <SourceList items={data.calciumFoods} emptyLabel="No obvious calcium-rich foods identified yet." />;
    case 'vitamin-d-foods':
      return <SourceList items={data.vitaminDFoods} emptyLabel="No obvious vitamin-D foods identified yet." />;
    case 'soy-foods':
      return <SourceList items={data.soyFoods} emptyLabel="No soy foods in this plan yet." />;
    case 'wholegrain':
      return <p className="text-2xl font-extrabold text-white">{data.carbQuality.counts.wholegrain} <span className="text-sm font-medium text-ink-400">wholegrain sources</span></p>;
    case 'wholefood-proportion':
      return <p className="text-2xl font-extrabold text-white">{Math.round(data.wholefoodProportion * 100)}% <span className="text-sm font-medium text-ink-400">whole-food ingredients</span></p>;
    case 'evidence-linked':
      return <p className="text-2xl font-extrabold text-white">{data.evidenceLinks.length} <span className="text-sm font-medium text-ink-400">evidence-linked ingredient(s)</span></p>;
    default:
      return null;
  }
}

function DiversityBlock({ total, byClass }: { total: number; byClass: Record<PlantClass, string[]> }) {
  return (
    <>
      <p className="mb-2 text-2xl font-extrabold text-white">{total} <span className="text-sm font-medium text-ink-400">distinct plant foods</span></p>
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(byClass) as PlantClass[]).filter((k) => byClass[k].length > 0).map((k) => (
          <span key={k} className="rounded-full bg-ink-700 px-2 py-0.5 text-[11px] text-ink-200" title={byClass[k].join(', ')}>{PLANT_CLASS_LABELS[k]}: {byClass[k].length}</span>
        ))}
      </div>
    </>
  );
}

function SourceList({ items, emptyLabel }: { items: { recipeName: string; detail: string }[]; emptyLabel: string }) {
  if (items.length === 0) return <p className="text-sm text-ink-300">{emptyLabel}</p>;
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((s) => (<li key={s.recipeName + s.detail} className="text-ink-200"><span className="font-medium text-white">{s.recipeName}</span> <span className="text-ink-400">— {s.detail}</span></li>))}
    </ul>
  );
}
