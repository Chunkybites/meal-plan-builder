import { useMemo, useState } from 'react';
import { Library, Search } from 'lucide-react';
import { getEvidenceForCondition } from '../../data/conditions/engine';
import { POPULAR_CLAIMS } from '../../data/conditions/evidence/claims';
import {
  EVIDENCE_RANK,
  INTERVENTION_TYPE_LABELS,
  SPECIFICITY_LABELS,
  type ConditionDefinition,
  type ConditionEvidenceItem,
  type EvidenceLevel,
  type InterventionType,
} from '../../data/conditions/types';
import { EvidenceLevelBadge, ConditionEvidenceButton } from './conditionsCommon';
import { IngredientEvidencePanel } from './IngredientEvidencePanel';
import { PopularClaimCard } from './PopularClaimCard';

type SortKey = 'strongest' | 'most-researched' | 'recent' | 'alphabetical';
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'strongest', label: 'Strongest evidence' },
  { id: 'most-researched', label: 'Most researched' },
  { id: 'recent', label: 'Recently reviewed' },
  { id: 'alphabetical', label: 'Alphabetical' },
];
const TYPES: InterventionType[] = ['food', 'beverage', 'nutrient', 'supplement', 'dietary-pattern'];
const LEVELS: EvidenceLevel[] = ['A', 'B', 'C', 'D'];

function link(item: ConditionEvidenceItem, id: ConditionDefinition['id']) {
  return item.conditions.find((c) => c.conditionId === id);
}
function bestLevel(item: ConditionEvidenceItem, id: ConditionDefinition['id']): EvidenceLevel {
  const l = link(item, id);
  if (!l) return 'D';
  return l.outcomes.reduce<EvidenceLevel>((best, o) => (EVIDENCE_RANK[o.evidenceLevel] > EVIDENCE_RANK[best] ? o.evidenceLevel : best), 'D');
}

export function ResearchCentre({ condition }: { condition: ConditionDefinition }) {
  const all = useMemo(() => getEvidenceForCondition(condition.id), [condition.id]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<InterventionType | 'all'>('all');
  const [level, setLevel] = useState<EvidenceLevel | 'all'>('all');
  const [conditionSpecificOnly, setConditionSpecificOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('strongest');
  const [selected, setSelected] = useState<ConditionEvidenceItem | null>(null);

  const claims = POPULAR_CLAIMS.filter((c) => c.conditionIds.includes(condition.id));

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = all.filter((item) => {
      if (type !== 'all' && item.interventionType !== type) return false;
      if (level !== 'all' && bestLevel(item, condition.id) !== level) return false;
      if (conditionSpecificOnly && link(item, condition.id)?.specificity !== 'condition-specific') return false;
      if (q) { const hay = `${item.interventionName} ${item.aliases.join(' ')}`.toLowerCase(); if (!hay.includes(q)) return false; }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'alphabetical') return a.interventionName.localeCompare(b.interventionName);
      if (sort === 'most-researched') return b.referenceIds.length - a.referenceIds.length || a.interventionName.localeCompare(b.interventionName);
      if (sort === 'recent') return b.lastEvidenceReview.localeCompare(a.lastEvidenceReview) || a.interventionName.localeCompare(b.interventionName);
      return EVIDENCE_RANK[bestLevel(b, condition.id)] - EVIDENCE_RANK[bestLevel(a, condition.id)] || b.referenceIds.length - a.referenceIds.length;
    });
    return list;
  }, [all, search, type, level, conditionSpecificOnly, sort, condition.id]);

  return (
    <section aria-label={`${condition.shortName} research and evidence`} className="card p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-white">
        <Library className="h-5 w-5 text-fuchsia-300" aria-hidden="true" /> {condition.shortName} Research &amp; Evidence
      </h3>
      <p className="mb-4 text-xs text-ink-400">Browse every intervention studied for {condition.shortName} — foods, beverages, nutrients, supplements and dietary patterns — with per-outcome grades and verified references.</p>

      <div className="mb-4 flex flex-col gap-3">
        <label className="relative block sm:max-w-xs">
          <span className="sr-only">Search interventions</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input type="search" className="input-field !pl-9" placeholder="Search interventions" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by intervention type">
          <button type="button" aria-pressed={type === 'all'} className={`chip !px-2.5 !py-1 !text-xs ${type === 'all' ? 'chip-active' : ''}`} onClick={() => setType('all')}>All types</button>
          {TYPES.map((t) => (<button key={t} type="button" aria-pressed={type === t} className={`chip !px-2.5 !py-1 !text-xs ${type === t ? 'chip-active' : ''}`} onClick={() => setType(t)}>{INTERVENTION_TYPE_LABELS[t]}</button>))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Evidence</span>
          <button type="button" aria-pressed={level === 'all'} className={`chip !px-2.5 !py-1 !text-xs ${level === 'all' ? 'chip-active' : ''}`} onClick={() => setLevel('all')}>All</button>
          {LEVELS.map((l) => (<button key={l} type="button" aria-pressed={level === l} className={`chip !px-2.5 !py-1 !text-xs ${level === l ? 'chip-active' : ''}`} onClick={() => setLevel(l)}>{l}</button>))}
          <label className="ml-2 inline-flex items-center gap-1.5 text-xs text-ink-300">
            <input type="checkbox" checked={conditionSpecificOnly} onChange={(e) => setConditionSpecificOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-ink-500 bg-ink-800 accent-fuchsia-400" />
            Condition-specific evidence only
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Sort by</span>
          {SORTS.map((s) => (<button key={s.id} type="button" aria-pressed={sort === s.id} className={`chip !px-2.5 !py-1 !text-xs ${sort === s.id ? 'chip-active' : ''}`} onClick={() => setSort(s.id)}>{s.label}</button>))}
        </div>
      </div>

      <p className="mb-3 text-sm text-ink-400" role="status">{items.length} intervention{items.length === 1 ? '' : 's'} shown</p>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-600 px-4 py-6 text-center text-sm text-ink-400">No interventions match your filters.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const l = link(item, condition.id);
            return (
              <li key={item.id} className="flex flex-col gap-2 rounded-xl border border-ink-600 bg-ink-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-display text-base font-bold text-white">{item.interventionName}</h4>
                    <p className="text-[11px] text-ink-400">{INTERVENTION_TYPE_LABELS[item.interventionType]}{l ? ` · ${SPECIFICITY_LABELS[l.specificity]}` : ''}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[11px] text-ink-400">best <EvidenceLevelBadge level={bestLevel(item, condition.id)} /></span>
                </div>
                <p className="line-clamp-3 text-sm text-ink-300">{l?.evidenceSummary}</p>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[11px] text-ink-500">{item.referenceIds.length} ref{item.referenceIds.length === 1 ? '' : 's'}</span>
                  <ConditionEvidenceButton label="View evidence" accent={condition.accent} onClick={() => setSelected(item)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {claims.length > 0 && (
        <div className="mt-6">
          <h4 className="mb-1 font-display text-base font-bold text-white">Popular claim vs the evidence</h4>
          <p className="mb-3 text-xs text-ink-400">Neutral, referenced checks on widely repeated claims. We credit the kernel of truth and distinguish “unproven” from “disproven”.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {claims.map((c) => (<PopularClaimCard key={c.id} claim={c} />))}
          </div>
        </div>
      )}

      {selected && <IngredientEvidencePanel item={selected} conditionId={condition.id} onClose={() => setSelected(null)} />}
    </section>
  );
}
