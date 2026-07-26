import { ExternalLink } from 'lucide-react';
import { Modal } from '../common';
import { getReference } from '../../data/conditions/references';

const STUDY_TYPE_LABELS: Record<string, string> = {
  'systematic-review': 'Systematic review',
  'meta-analysis': 'Meta-analysis',
  'umbrella-review': 'Umbrella review',
  'cochrane-review': 'Cochrane review',
  'randomised-controlled-trial': 'Randomised controlled trial',
  'controlled-trial': 'Controlled trial',
  cohort: 'Prospective cohort',
  observational: 'Observational study',
  mechanistic: 'Mechanistic study',
  guideline: 'Clinical guideline',
  reference: 'Reference source',
  other: 'Study',
};

/** Deeper per-study view. Deliberately surfaces NULL findings, not only positives. */
export function ResearchDetailModal({ referenceId, onClose }: { referenceId: string; onClose: () => void }) {
  const r = getReference(referenceId);
  if (!r) return null;

  const rows: [string, string | undefined][] = [
    ['Study type', STUDY_TYPE_LABELS[r.studyType] ?? r.studyType],
    ['Year', String(r.year)],
    ['Journal', r.journal],
    ['Population', r.population],
    ['Intervention', r.intervention],
    ['Comparator', r.comparator],
    ['Duration', r.duration],
    ['Key findings', r.keyFindings],
    ['Null / non-significant findings', r.nullFindings],
    ['Limitations', r.limitations],
  ];

  return (
    <Modal title="Research details" onClose={onClose} wide>
      <div className="space-y-4">
        <h4 className="font-display text-base font-bold text-white">{r.title}</h4>
        {r.authors && <p className="text-sm text-ink-300">{r.authors}</p>}

        <dl className="space-y-2.5">
          {rows
            .filter(([, v]) => Boolean(v))
            .map(([label, value]) => (
              <div key={label} className="grid grid-cols-[130px_1fr] gap-3 border-b border-ink-700/50 pb-2 text-sm">
                <dt className={`font-medium ${label.startsWith('Null') ? 'text-amber-300' : 'text-ink-400'}`}>{label}</dt>
                <dd className="text-ink-100">{value}</dd>
              </div>
            ))}
        </dl>

        {r.note && (
          <p className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-3 py-2 text-sm italic text-amber-200">{r.note}</p>
        )}

        <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open source
          {r.pubmedId ? ` (PMID ${r.pubmedId})` : ''}
        </a>

        <p className="text-xs text-ink-500">
          Study details are summarised from the cited source for education. Where a field is not shown, it was not
          separately recorded in our review.
        </p>
      </div>
    </Modal>
  );
}
