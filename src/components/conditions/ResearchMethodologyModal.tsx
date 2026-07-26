import { Modal } from '../common';
import { EVIDENCE_LEVEL_META, type ConditionDefinition, type EvidenceLevel } from '../../data/conditions/types';
import { EvidenceLevelBadge } from './conditionsCommon';

const LEVELS: EvidenceLevel[] = ['A', 'B', 'C', 'D'];
const LEVEL_DETAIL: Record<EvidenceLevel, string> = {
  A: 'Supported by relevant clinical guidance, multiple high-quality systematic reviews or meta-analyses, or a reasonably consistent body of high-quality intervention evidence.',
  B: 'Several relevant human studies with broadly consistent findings, but meaningful limitations remain.',
  C: 'Preliminary human evidence, small trials, short study durations, limited replication, or important uncertainty.',
  D: 'Inconsistent findings, weak evidence, primarily observational or mechanistic evidence, or inadequate evidence to support a meaningful recommendation.',
};

export function ResearchMethodologyModal({ condition, onClose }: { condition?: ConditionDefinition; onClose: () => void }) {
  return (
    <Modal title="Research methodology" onClose={onClose} wide>
      <div className="space-y-5 text-sm text-ink-200">
        <p>
          This condition-support layer is an evidence-education tool. Every research claim is traceable to a named
          source, and no references, DOIs or PubMed IDs are invented. Where a citation could not be verified it is
          labelled or omitted. Full detail lives in the project’s condition-support evidence report.
        </p>

        <section>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Source hierarchy</h4>
          <ol className="list-inside list-decimal space-y-1 text-ink-300">
            <li>International clinical guidelines</li>
            <li>NICE and NHS guidance</li>
            <li>Cochrane reviews</li>
            <li>Systematic reviews and meta-analyses</li>
            <li>Randomised and controlled human trials</li>
            <li>Prospective cohort and high-quality observational research</li>
          </ol>
          <p className="mt-2 text-ink-300">
            Sources were drawn from PubMed, the Cochrane Library, international guidelines (including ESHRE, the 2023
            international PCOS guideline and NICE), the NHS, the British Menopause Society and Women’s Health Concern.
            Influencer blogs, supplement-company pages, wellness sites and social media were not used as evidence. A
            commercial page may identify that a product exists, but never that it works.
          </p>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Evidence grading (per outcome)</h4>
          <ul className="space-y-2">
            {LEVELS.map((lvl) => (
              <li key={lvl} className="flex items-start gap-3 rounded-lg border border-ink-600 bg-ink-800 p-3">
                <EvidenceLevelBadge level={lvl} />
                <div>
                  <p className="text-sm font-semibold text-white">{EVIDENCE_LEVEL_META[lvl].label}</p>
                  <p className="text-sm text-ink-300">{LEVEL_DETAIL[lvl]}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-ink-300">
            Grades are assigned <span className="font-medium text-white">per outcome</span>, not per intervention — so
            omega-3 can be graded one way for triglycerides and another for pelvic pain.
          </p>
        </section>

        <section>
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-fuchsia-300">How we read the evidence</h4>
          <ul className="list-inside list-disc space-y-1.5 text-ink-300">
            <li><span className="font-medium text-white">Condition-specific vs indirect.</span> We label whether evidence comes from people with the condition, from indirect clinical populations, from the general population, or from mechanism/lab work alone.</li>
            <li><span className="font-medium text-white">Mechanistic and preclinical evidence is weaker.</span> A plausible mechanism or an animal study is a reason to investigate, not proof of human benefit, and never drives a recommendation.</li>
            <li><span className="font-medium text-white">Small, short trials are interpreted cautiously.</span> Much of this literature is small, short and geographically narrow; some trials carry formal expressions of concern.</li>
            <li><span className="font-medium text-white">Markers are not symptoms.</span> A change in testosterone, CRP, HOMA-IR or bone mineral density is a biochemical marker; it does not guarantee a symptom, clinical or quality-of-life benefit.</li>
            <li><span className="font-medium text-white">Popularity is not evidence.</span> An intervention is never upgraded because it is widely marketed or discussed.</li>
          </ul>
        </section>

        {condition && condition.researchMethodologyNotes.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-fuchsia-300">Notes for {condition.shortName}</h4>
            <ul className="list-inside list-disc space-y-1 text-ink-300">
              {condition.researchMethodologyNotes.map((n) => (<li key={n}>{n}</li>))}
            </ul>
          </section>
        )}

        <p className="rounded-lg border border-fuchsia-400/25 bg-fuchsia-400/5 px-3 py-2 text-ink-200">
          This tool does not diagnose, treat, cure or reverse any condition, and it is not a substitute for advice from
          a doctor or registered dietitian.
        </p>
      </div>
    </Modal>
  );
}
