import { ShieldAlert } from 'lucide-react';
import type { ConditionDefinition } from '../../data/conditions/types';

const GENERAL_BOUNDARY =
  'This application provides general nutrition education and meal-planning information. PCOS, endometriosis and menopause-related symptoms can require individual medical assessment and treatment. The information provided does not diagnose, treat or replace advice from a doctor, registered dietitian or other appropriately qualified healthcare professional.';

const ACCENTS = {
  fuchsia: 'border-fuchsia-400/25 bg-fuchsia-400/5 text-fuchsia-300',
  sky: 'border-sky-400/25 bg-sky-400/5 text-sky-300',
  amber: 'border-amber-400/25 bg-amber-400/5 text-amber-300',
};

export function ConditionSafetyNotice({ condition, variant = 'general' }: { condition?: ConditionDefinition; variant?: 'general' | 'supplement' }) {
  const accent = condition ? ACCENTS[condition.accent] : ACCENTS.fuchsia;
  return (
    <aside aria-label="Safety information" className={`rounded-xl border p-4 text-xs leading-relaxed text-ink-300 ${accent}`}>
      <p className="flex gap-2">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="text-ink-300">
          {variant === 'supplement' ? (
            <>
              Research doses are displayed to explain the scientific literature. They are <strong>not</strong>{' '}
              personalised dosage recommendations. Supplements may interact with medication or may not be appropriate
              during pregnancy, breastfeeding, or when trying to conceive. Do not stop any prescribed medication
              (including metformin, hormonal contraception, HRT or fertility medication) to take a supplement. Speak to
              your doctor or a registered dietitian first.
            </>
          ) : (
            condition?.disclaimer ?? GENERAL_BOUNDARY
          )}
        </span>
      </p>
    </aside>
  );
}
