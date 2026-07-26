import { Check, Wand2 } from 'lucide-react';
import type { OptimisationProposal } from '../utils/optimise';
import { Modal } from './common';

interface OptimiseModalProps {
  proposals: OptimisationProposal[];
  applied: string[];
  onApply: (proposal: OptimisationProposal) => void;
  onClose: () => void;
}

export function OptimiseModal({ proposals, applied, onApply, onClose }: OptimiseModalProps) {
  return (
    <Modal title="Optimise My Meal Plan" onClose={onClose} wide>
      {proposals.length === 0 ? (
        <p className="text-sm text-ink-300">
          Your plan is already closely aligned with your targets — no changes to suggest. Nice work!
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-ink-300">
            Small changes that would bring your day closer to target. Nothing is applied until you approve it.
          </p>
          {proposals.map((p) => {
            const isApplied = applied.includes(p.id);
            return (
              <div key={p.id} className="flex items-start justify-between gap-4 rounded-xl border border-ink-600 bg-ink-800 p-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">{p.title}</h4>
                  <p className="mt-1 text-sm text-ink-300">{p.description}</p>
                  <p className="mt-1.5 text-xs text-ink-400">
                    Impact: {p.deltaCalories >= 0 ? '+' : ''}
                    {p.deltaCalories} kcal · {p.deltaProtein >= 0 ? '+' : ''}
                    {p.deltaProtein}g protein
                  </p>
                </div>
                <button
                  type="button"
                  className={isApplied ? 'btn-secondary shrink-0 !px-3 !py-2 text-sm' : 'btn-primary shrink-0 !px-3 !py-2 text-sm'}
                  disabled={isApplied}
                  onClick={() => onApply(p)}
                >
                  {isApplied ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" /> Applied
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" aria-hidden="true" /> Apply
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
