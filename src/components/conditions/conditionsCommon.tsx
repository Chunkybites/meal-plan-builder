import { useState } from 'react';
import { ExternalLink, FileSearch } from 'lucide-react';
import {
  EVIDENCE_LEVEL_META,
  OUTCOME_CATEGORY_LABELS,
  type EvidenceLevel,
  type OutcomeCategory,
} from '../../data/conditions/types';
import { getReferences } from '../../data/conditions/references';
import { ResearchDetailModal } from './ResearchDetailModal';

export function EvidenceLevelBadge({ level }: { level: EvidenceLevel }) {
  const meta = EVIDENCE_LEVEL_META[level];
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${meta.colorClass}`}
      title={`Evidence ${level} — ${meta.label}`}
    >
      {level}
    </span>
  );
}

const CATEGORY_STYLES: Record<OutcomeCategory, string> = {
  symptom: 'bg-sky-400/15 text-sky-200',
  'biochemical-marker': 'bg-amber-400/15 text-amber-200',
  'clinical-outcome': 'bg-emerald-400/15 text-emerald-200',
  'quality-of-life': 'bg-fuchsia-400/15 text-fuchsia-200',
};

/** Renders the biomarker≠symptom distinction explicitly. */
export function OutcomeCategoryChip({ category }: { category: OutcomeCategory }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_STYLES[category]}`} title="What kind of outcome was measured">
      {OUTCOME_CATEGORY_LABELS[category]}
    </span>
  );
}

const STUDY_TYPE_LABELS: Record<string, string> = {
  'systematic-review': 'Systematic review',
  'meta-analysis': 'Meta-analysis',
  'umbrella-review': 'Umbrella review',
  'cochrane-review': 'Cochrane review',
  'randomised-controlled-trial': 'RCT',
  'controlled-trial': 'Controlled trial',
  cohort: 'Prospective cohort',
  observational: 'Observational',
  mechanistic: 'Mechanistic',
  guideline: 'Guideline',
  reference: 'Reference',
  other: 'Study',
};

const VERIFICATION_LABELS: Record<string, string> = {
  'independently-verified': 'Citation re-checked against source',
  'agent-verified': 'Citation read from source page',
  'listing-verified': 'Citation from database listing',
};

export function ReferenceList({ referenceIds }: { referenceIds: string[] }) {
  const refs = getReferences(referenceIds);
  const [detailId, setDetailId] = useState<string | null>(null);
  if (refs.length === 0) return null;
  return (
    <>
      <ul className="space-y-2">
        {refs.map((r) => {
          const hasDetail = Boolean(r.keyFindings || r.population || r.nullFindings);
          return (
            <li key={r.id} className="text-sm">
              <div className="flex items-start justify-between gap-2">
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1.5 text-ink-100 hover:text-fuchsia-300">
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-400 group-hover:text-fuchsia-300" aria-hidden="true" />
                  <span>
                    <span className="font-medium">{r.title}</span>{' '}
                    <span className="text-ink-400">
                      {r.authors ? `${r.authors} · ` : ''}
                      {r.journal ? `${r.journal} · ` : ''}
                      {r.year} · {STUDY_TYPE_LABELS[r.studyType] ?? r.studyType}
                      {r.pubmedId ? ` · PMID ${r.pubmedId}` : ''}
                      {r.doi ? ` · DOI ${r.doi}` : ''}
                    </span>
                  </span>
                </a>
                {hasDetail && (
                  <button type="button" onClick={() => setDetailId(r.id)} className="btn-ghost shrink-0 !px-2 !py-1 text-[11px]">
                    <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
                    Details
                  </button>
                )}
              </div>
              {r.note && <p className="ml-5 mt-0.5 text-xs italic text-amber-300/90">{r.note}</p>}
              <p className="ml-5 text-[11px] text-ink-500">{VERIFICATION_LABELS[r.verification]}</p>
            </li>
          );
        })}
      </ul>
      {detailId && <ResearchDetailModal referenceId={detailId} onClose={() => setDetailId(null)} />}
    </>
  );
}

export function ConditionEvidenceButton({ label, onClick, accent = 'fuchsia' }: { label: string; onClick: () => void; accent?: 'fuchsia' | 'sky' | 'amber' }) {
  const styles = {
    fuchsia: 'border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-200 hover:bg-fuchsia-400/20',
    sky: 'border-sky-400/50 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20',
    amber: 'border-amber-400/50 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20',
  }[accent];
  return (
    <button type="button" onClick={onClick} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${styles}`}>
      <span aria-hidden="true">🔬</span>
      {label}
    </button>
  );
}
