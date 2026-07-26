import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import type { DailyTargets, NutritionData } from '../types';
import { pctOf, round1 } from '../utils/nutrition';
import { ProgressBar } from './common';

interface MacroDashboardProps {
  totals: NutritionData;
  targets: DailyTargets;
}

const MACROS: {
  key: 'protein' | 'carbs' | 'fat' | 'fibre';
  label: string;
  color: string;
  barClass: string;
}[] = [
  { key: 'protein', label: 'Protein', color: '#D4FF3F', barClass: 'bg-volt-400' },
  { key: 'carbs', label: 'Carbohydrates', color: '#38BDF8', barClass: 'bg-sky-400' },
  { key: 'fat', label: 'Fat', color: '#FB923C', barClass: 'bg-orange-400' },
  { key: 'fibre', label: 'Fibre', color: '#4ADE80', barClass: 'bg-green-400' },
];

export function MacroDashboard({ totals, targets }: MacroDashboardProps) {
  const calPct = pctOf(totals.calories, targets.calories);
  const calRemaining = Math.round(targets.calories - totals.calories);

  return (
    <section aria-label="Macronutrient dashboard" className="card p-4 sm:p-6">
      <h3 className="mb-4 font-display text-lg font-bold text-white">Macronutrient Dashboard</h3>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <div className="mx-auto text-center">
          <div className="relative h-44 w-44" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={[{ value: Math.min(100, calPct) }]}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  fill={calPct > 112 ? '#FBBF24' : '#D4FF3F'}
                  background={{ fill: '#1D2430' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-2xl font-extrabold text-white">{totals.calories}</span>
              <span className="text-xs text-ink-400">of {targets.calories} kcal</span>
              <span className="text-xs font-semibold text-volt-300">{calPct}%</span>
            </div>
          </div>
          <p className="mt-1 text-sm text-ink-300" role="status">
            Calories: {totals.calories} / {targets.calories} kcal —{' '}
            {calRemaining >= 0
              ? `${calRemaining} kcal remaining`
              : `${Math.abs(calRemaining)} kcal above target`}
          </p>
        </div>

        <div className="space-y-4">
          {MACROS.map((m) => {
            const value = totals[m.key];
            const target = targets[m.key];
            const pct = pctOf(value, target);
            const remaining = round1(target - value);
            return (
              <div key={m.key}>
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3">
                  <span className="text-sm font-semibold text-white">{m.label}</span>
                  <span className="text-sm text-ink-300">
                    <span className="font-bold text-white">{value}g</span> / {target}g
                    <span className="ml-2 text-xs text-ink-400">
                      {remaining >= 0 ? `${remaining}g remaining` : `${Math.abs(remaining)}g above`} · {pct}%
                    </span>
                  </span>
                </div>
                <ProgressBar value={value} target={target} colorClass={m.barClass} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
