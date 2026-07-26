import { AlertTriangle, FlaskConical, Info, Pill, ShieldAlert } from 'lucide-react';
import { Modal } from '../common';
import {
  DIRECTION_LABELS,
  INTERACTION_STATUS_LABELS,
  INTERVENTION_TYPE_LABELS,
  SPECIFICITY_LABELS,
  type ConditionEvidenceItem,
  type ConditionId,
} from '../../data/conditions/types';
import { getCondition } from '../../data/conditions/engine';
import { EvidenceLevelBadge, OutcomeCategoryChip, ReferenceList } from './conditionsCommon';

export function IngredientEvidencePanel({ item, conditionId, onClose }: { item: ConditionEvidenceItem; conditionId: ConditionId; onClose: () => void }) {
  const link = item.conditions.find((c) => c.conditionId === conditionId);
  const condition = getCondition(conditionId);
  if (!link) return null;

  const allReferenceIds = dedupe([
    ...item.referenceIds,
    ...link.outcomes.flatMap((o) => o.referenceIds),
    ...item.safety.medicationInteractions.flatMap((m) => m.referenceIds),
  ]);

  const s = item.safety;
  const hasSafety = s.safetySummary || s.contraindications.length > 0 || s.medicationInteractions.length > 0 || s.pregnancyConsiderations || s.breastfeedingConsiderations || s.tryingToConceiveConsiderations;

  return (
    <Modal title={`Why might ${item.interventionName} be relevant to ${condition.shortName}?`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-ink-200">{INTERVENTION_TYPE_LABELS[item.interventionType]}</span>
          <span className="rounded-full bg-ink-700 px-2.5 py-0.5 text-xs font-medium text-ink-200">Relevant to {condition.shortName}</span>
          <span className="rounded-full bg-ink-700/60 px-2.5 py-0.5 text-xs text-ink-300">{SPECIFICITY_LABELS[link.specificity]}</span>
          <span className="text-xs text-ink-400">Last evidence review: {item.lastEvidenceReview}</span>
        </div>

        <section>
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Evidence summary</h4>
          <p className="text-sm text-ink-100">{link.evidenceSummary}</p>
          <p className="mt-2 rounded-lg border border-ink-600 bg-ink-800 px-3 py-2 text-sm text-ink-200">{link.overallNote}</p>
        </section>

        {item.mechanismSummary && (
          <section>
            <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Proposed mechanism</h4>
            <p className="text-sm text-ink-300">{item.mechanismSummary}</p>
          </section>
        )}

        <section>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Outcomes studied</h4>
          <p className="mb-3 text-xs text-ink-400">
            Each outcome carries its own grade and is tagged with what kind of measure it is — a biochemical marker is
            not the same as a symptom or a clinical outcome.
          </p>
          <ul className="space-y-2.5">
            {link.outcomes.map((o) => (
              <li key={`${o.outcomeId}-${o.label}`} className="rounded-xl border border-ink-600 bg-ink-800 p-3">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">{o.label}</span>
                  <span className="flex items-center gap-1.5">
                    <OutcomeCategoryChip category={o.category} />
                    <span className="rounded-md bg-ink-700 px-1.5 py-0.5 text-[11px] font-medium text-ink-200">{DIRECTION_LABELS[o.direction]}</span>
                    <EvidenceLevelBadge level={o.evidenceLevel} />
                  </span>
                </div>
                <p className="text-sm text-ink-300">{o.summary}</p>
                {o.clinicalRelevance && <p className="mt-1 text-xs italic text-amber-300/90">{o.clinicalRelevance}</p>}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-ink-600 bg-ink-800 p-3">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-300">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> What the research studied
            </h4>
            <dl className="space-y-1 text-sm text-ink-200">
              {item.studiedDose && (<div><dt className="inline text-ink-400">Amount/exposure: </dt><dd className="inline">{item.studiedDose}</dd></div>)}
              {item.studiedDuration && (<div><dt className="inline text-ink-400">Duration: </dt><dd className="inline">{item.studiedDuration}</dd></div>)}
              <div><dt className="inline text-ink-400">Participants: </dt><dd className="inline">{link.studiedPopulation}</dd></div>
            </dl>
          </div>
          <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
            <h4 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-300">
              <Info className="h-3.5 w-3.5" aria-hidden="true" /> What this does not prove
            </h4>
            <p className="text-sm text-ink-200">
              A change in a biochemical marker is not the same as a symptom, clinical or quality-of-life improvement,
              and short studies cannot show durable change. This is education and planning information — it does not
              diagnose, treat, cure or reverse {condition.shortName}.
            </p>
          </div>
        </section>

        {link.limitations.length > 0 && (
          <section>
            <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Evidence limitations</h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-ink-300">
              {link.limitations.map((l) => (<li key={l}>{l}</li>))}
            </ul>
          </section>
        )}

        {hasSafety && (
          <section className="rounded-xl border border-ink-600 bg-ink-800 p-3">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-300">
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Safety &amp; interactions
            </h4>
            {s.safetySummary && <p className="mb-1 text-sm text-ink-300">{s.safetySummary}</p>}
            {s.contraindications.length > 0 && (
              <p className="mb-1 text-sm text-ink-200"><span className="font-semibold text-white">Cautions:</span> {s.contraindications.join('; ')}</p>
            )}
            {s.medicationInteractions.length > 0 && (
              <ul className="mt-1.5 space-y-1.5">
                {s.medicationInteractions.map((m) => (
                  <li key={m.medicationOrClass} className="flex items-start gap-2 text-sm">
                    <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${m.status === 'documented' ? 'bg-red-400/15 text-red-300' : m.status === 'potential' ? 'bg-amber-400/15 text-amber-300' : 'bg-ink-700 text-ink-300'}`}>
                      {INTERACTION_STATUS_LABELS[m.status]}
                    </span>
                    <span className="text-ink-200"><span className="font-medium text-white">{m.medicationOrClass}:</span> {m.summary}</span>
                  </li>
                ))}
              </ul>
            )}
            {(s.pregnancyConsiderations || s.breastfeedingConsiderations || s.tryingToConceiveConsiderations) && (
              <div className="mt-2 space-y-1">
                {s.pregnancyConsiderations && (<p className="flex items-start gap-1.5 text-sm text-amber-200"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span><span className="font-medium">Pregnancy:</span> {s.pregnancyConsiderations}</span></p>)}
                {s.breastfeedingConsiderations && (<p className="text-sm text-amber-200 sm:pl-5"><span className="font-medium">Breastfeeding:</span> {s.breastfeedingConsiderations}</p>)}
                {s.tryingToConceiveConsiderations && (<p className="text-sm text-amber-200 sm:pl-5"><span className="font-medium">Trying to conceive:</span> {s.tryingToConceiveConsiderations}</p>)}
              </div>
            )}
          </section>
        )}

        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-300">
            <Pill className="h-3.5 w-3.5" aria-hidden="true" /> Research
          </h4>
          <ReferenceList referenceIds={allReferenceIds} />
        </section>
      </div>
    </Modal>
  );
}

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)];
}
