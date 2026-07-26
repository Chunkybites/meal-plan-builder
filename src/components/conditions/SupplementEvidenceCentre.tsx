import { useMemo, useState } from 'react';
import { FlaskConical, Search } from 'lucide-react';
import { getSupplementsForCondition } from '../../data/conditions/engine';
import { EVIDENCE_RANK, type ConditionDefinition, type ConditionEvidenceItem, type EvidenceLevel } from '../../data/conditions/types';
import { EvidenceLevelBadge, ConditionEvidenceButton } from './conditionsCommon';
import { ConditionSafetyNotice } from './ConditionSafetyNotice';
import { IngredientEvidencePanel } from './IngredientEvidencePanel';

type SortKey = 'strongest' | 'most-researched' | 'recent' | 'alphabetical';
const SORTS: { id: SortKey; label: string }[] = [
  { id: 'strongest', label: 'Strongest evidence' },
  { id: 'most-researched', label: 'Most researched' },
  { id: 'recent', label: 'Recently reviewed' },
  { id: 'alphabetical', label: 'Alphabetical' },
];

function conditionLink(item: ConditionEvidenceItem, conditionId: ConditionDefinition['id']) {
  return item.conditions.find((c) => c.conditionId === conditionId);
}
function bestLevel(item: ConditionEvidenceItem, conditionId: ConditionDefinition['id']): EvidenceLevel {
  const link = conditionLink(item, conditionId);
  if (!link) return 'D';
  return link.outcomes.reduce<EvidenceLevel>((best, o) => (EVIDENCE_RANK[o.evidenceLevel] > EVIDENCE_RANK[best] ? o.evidenceLevel : best), 'D');
}

export function SupplementEvidenceCentre({ condition }: { condition: ConditionDefinition }) {
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('strongest');
  const [selected, setSelected] = useState<ConditionEvidenceItem | null>(null);

  const supplements = useMemo(() => getSupplementsForCondition(condition.id), [condition.id]);

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = supplements.filter((item) => {
      if (activeGroup !== 'all') {
        const link = conditionLink(item, condition.id);
        const groups = new Set(link?.outcomes.map((o) => outcomeGroup(o.outcomeId, condition)));
        if (!groups.has(activeGroup)) return false;
      }
      if (q) {
        const hay = `${item.interventionName} ${item.aliases.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === 'alphabetical') return a.interventionName.localeCompare(b.interventionName);
      if (sort === 'most-researched') return b.referenceIds.length - a.referenceIds.length || a.interventionName.localeCompare(b.interventionName);
      if (sort === 'recent') return b.lastEvidenceReview.localeCompare(a.lastEvidenceReview) || a.interventionName.localeCompare(b.interventionName);
      return EVIDENCE_RANK[bestLevel(b, condition.id)] - EVIDENCE_RANK[bestLevel(a, condition.id)] || b.referenceIds.length - a.referenceIds.length;
    });
    return list;
  }, [supplements, search, activeGroup, sort, condition]);

  return (
    <section aria-label={`${condition.shortName} supplement evidence centre`} className="card p-4 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-white">
        <FlaskConical className="h-5 w-5 text-fuchsia-300" aria-hidden="true" /> {condition.shortName} Supplement Evidence
      </h3>
      <p className="mb-4 text-xs text-ink-400">An educational research library — not a shop. No brands, no affiliate links.</p>

      <div className="mb-4"><ConditionSafetyNotice condition={condition} variant="supplement" /></div>

      <div className="mb-4 flex flex-col gap-3">
        <label className="relative block sm:max-w-xs">
          <span className="sr-only">Search supplements</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input type="search" className="input-field !pl-9" placeholder="Search supplements" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by outcome studied">
          <button type="button" aria-pressed={activeGroup === 'all'} className={`chip !px-2.5 !py-1 !text-xs ${activeGroup === 'all' ? 'chip-active' : ''}`} onClick={() => setActiveGroup('all')}>All outcomes</button>
          {condition.outcomeFilterGroups.map((g) => (
            <button key={g} type="button" aria-pressed={activeGroup === g} className={`chip !px-2.5 !py-1 !text-xs ${activeGroup === g ? 'chip-active' : ''}`} onClick={() => setActiveGroup(g)}>{g}</button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Sort by</span>
          {SORTS.map((s) => (<button key={s.id} type="button" aria-pressed={sort === s.id} className={`chip !px-2.5 !py-1 !text-xs ${sort === s.id ? 'chip-active' : ''}`} onClick={() => setSort(s.id)}>{s.label}</button>))}
        </div>
      </div>

      <p className="mb-3 text-sm text-ink-400" role="status">{items.length} supplement{items.length === 1 ? '' : 's'} shown</p>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-600 px-4 py-6 text-center text-sm text-ink-400">No supplements match your filters.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const link = conditionLink(item, condition.id);
            return (
              <li key={item.id} className="flex flex-col gap-2 rounded-xl border border-ink-600 bg-ink-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-display text-base font-bold text-white">{item.interventionName}</h4>
                  <span className="flex items-center gap-1 whitespace-nowrap text-[11px] text-ink-400">best <EvidenceLevelBadge level={bestLevel(item, condition.id)} /></span>
                </div>
                <p className="line-clamp-3 text-sm text-ink-300">{link?.evidenceSummary}</p>
                <div className="flex flex-wrap gap-1">
                  {link?.outcomes.slice(0, 4).map((o) => (<span key={`${o.outcomeId}-${o.label}`} className="inline-flex items-center gap-1 rounded-full bg-ink-700 px-2 py-0.5 text-[11px] text-ink-200">{o.label}<EvidenceLevelBadge level={o.evidenceLevel} /></span>))}
                </div>
                <div className="mt-auto flex items-center justify-between pt-1">
                  <span className="text-[11px] text-ink-500">{item.referenceIds.length} reference{item.referenceIds.length === 1 ? '' : 's'} · reviewed {item.lastEvidenceReview}</span>
                  <ConditionEvidenceButton label="Evidence" accent={condition.accent} onClick={() => setSelected(item)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selected && <IngredientEvidencePanel item={selected} conditionId={condition.id} onClose={() => setSelected(null)} />}
    </section>
  );
}

/** Rough mapping of an outcomeId to one of the condition's filter groups. */
function outcomeGroup(outcomeId: string, condition: ConditionDefinition): string {
  const def = condition.trackedOutcomes.find((o) => o.id === outcomeId);
  return def?.group ?? '';
}
