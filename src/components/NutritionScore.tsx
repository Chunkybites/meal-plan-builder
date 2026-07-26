import { Lightbulb } from 'lucide-react';
import type { NutritionScoreResult } from '../utils/score';
import { ProgressBar } from './common';

export function NutritionScore({ result }: { result: NutritionScoreResult }) {
  const { score, components, explanation, suggestions } = result;
  const ringColor = score >= 75 ? '#D4FF3F' : score >= 50 ? '#FBBF24' : '#FB7185';

  return (
    <section aria-label="Nutritional balance score" className="card p-4 sm:p-6">
      <h3 className="mb-1 font-display text-lg font-bold text-white">Nutritional Balance Score</h3>
      <p className="mb-4 text-xs text-ink-400">A general planning score — not a medical assessment.</p>

      <div className="grid gap-6 md:grid-cols-[180px_1fr]">
        <div className="mx-auto flex flex-col items-center">
          <div
            className="flex h-36 w-36 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(${ringColor} ${score * 3.6}deg, #1D2430 ${score * 3.6}deg)`,
            }}
            role="img"
            aria-label={`Score ${score} out of 100`}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-ink-850">
              <span className="font-display text-3xl font-extrabold text-white">{score}</span>
              <span className="text-xs text-ink-400">/ 100</span>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-4 text-sm text-ink-200">{explanation}</p>
          <div className="grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
            {components.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-200">{c.label}</span>
                  <span className="font-semibold text-white">
                    {c.points}/{c.maxPoints}
                  </span>
                </div>
                <ProgressBar value={c.points} target={c.maxPoints} colorClass="bg-volt-400/80" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-5 rounded-xl border border-ink-600 bg-ink-800 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Lightbulb className="h-4 w-4 text-volt-400" aria-hidden="true" />
            Ways to improve
          </h4>
          <ul className="list-inside list-disc space-y-1 text-sm text-ink-300">
            {suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
