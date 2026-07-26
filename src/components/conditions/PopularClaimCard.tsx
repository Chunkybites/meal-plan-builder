import { useState } from 'react';
import { ChevronDown, ChevronUp, ScanSearch } from 'lucide-react';
import type { PopularClaim } from '../../data/conditions/types';
import { EvidenceLevelBadge, ReferenceList } from './conditionsCommon';

/** Neutral "popular claim vs what the evidence shows" card. */
export function PopularClaimCard({ claim }: { claim: PopularClaim }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
      <div className="flex items-start justify-between gap-3">
        <h4 className="flex items-start gap-2 text-sm font-semibold text-white">
          <ScanSearch className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
          <span>“{claim.claim}”</span>
        </h4>
        <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-400">claim strength <EvidenceLevelBadge level={claim.evidenceLevel} /></span>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">What the evidence actually shows</p>
          <p className="text-ink-200">{claim.whatEvidenceShows}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-400">Why the claim may be misleading</p>
          <p className="text-ink-200">{claim.whyMisleading}</p>
        </div>
      </div>

      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ink-300 hover:text-white">
        {open ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        {open ? 'Hide references' : 'References'}
      </button>
      {open && <div className="mt-2"><ReferenceList referenceIds={claim.referenceIds} /></div>}
    </div>
  );
}
