import { Sparkles, ThumbsUp } from 'lucide-react';
import type { Recommendation } from '../utils/recommendations';

export function SmartRecommendations({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) return null;
  return (
    <section aria-label="Smart recommendations" className="card p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-white">
        <Sparkles className="h-5 w-5 text-volt-400" aria-hidden="true" />
        Smart Recommendations
      </h3>
      <p className="mb-4 text-xs text-ink-400">
        Practical ideas based on your remaining targets — general guidance, not medical advice.
      </p>
      <ul className="space-y-2.5">
        {recommendations.map((r) => (
          <li
            key={r.id}
            className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
              r.tone === 'positive'
                ? 'border-volt-400/30 bg-volt-400/5 text-ink-100'
                : 'border-ink-600 bg-ink-800 text-ink-200'
            }`}
          >
            {r.tone === 'positive' ? (
              <ThumbsUp className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" aria-hidden="true" />
            ) : (
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
            )}
            {r.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
