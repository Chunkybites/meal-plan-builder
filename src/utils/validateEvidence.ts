import { ALL_EVIDENCE, CONDITIONS } from '../data/conditions/engine';
import { POPULAR_CLAIMS } from '../data/conditions/evidence/claims';
import { REFERENCES, getReference } from '../data/conditions/references';

/**
 * Evidence-integrity validation. Checks the whole condition database for
 * structural problems: missing/duplicate reference ids, evidence outcomes with
 * no supporting references, missing review dates, missing safety summaries, and
 * broken internal reference links. Run via `npm run validate-evidence`.
 */
export interface ValidationIssue {
  level: 'error' | 'warning';
  where: string;
  message: string;
}

export function validateEvidence(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const refIds = new Set(REFERENCES.map((r) => r.id));

  // Duplicate reference ids
  const seenRef = new Set<string>();
  for (const r of REFERENCES) {
    if (seenRef.has(r.id)) issues.push({ level: 'error', where: `reference:${r.id}`, message: 'Duplicate reference id' });
    seenRef.add(r.id);
    if (!r.url) issues.push({ level: 'error', where: `reference:${r.id}`, message: 'Missing url' });
    if (!r.pubmedId && !r.doi && r.studyType !== 'reference' && r.studyType !== 'guideline')
      issues.push({ level: 'warning', where: `reference:${r.id}`, message: 'No PubMed id or DOI' });
  }

  // Duplicate DOIs / PubMed ids
  const dois = new Map<string, string>();
  const pmids = new Map<string, string>();
  for (const r of REFERENCES) {
    if (r.doi) {
      if (dois.has(r.doi)) issues.push({ level: 'warning', where: `reference:${r.id}`, message: `Duplicate DOI shared with ${dois.get(r.doi)}` });
      else dois.set(r.doi, r.id);
    }
    if (r.pubmedId) {
      if (pmids.has(r.pubmedId)) issues.push({ level: 'warning', where: `reference:${r.id}`, message: `Duplicate PubMed id shared with ${pmids.get(r.pubmedId)}` });
      else pmids.set(r.pubmedId, r.id);
    }
  }

  const usedRefs = new Set<string>();
  const checkRefs = (ids: string[], where: string) => {
    if (ids.length === 0) issues.push({ level: 'warning', where, message: 'No supporting references' });
    for (const id of ids) {
      usedRefs.add(id);
      if (!refIds.has(id)) issues.push({ level: 'error', where, message: `Broken reference link: ${id}` });
    }
  };

  // Evidence items
  const seenItem = new Set<string>();
  for (const item of ALL_EVIDENCE) {
    if (seenItem.has(item.id)) issues.push({ level: 'error', where: `evidence:${item.id}`, message: 'Duplicate evidence item id' });
    seenItem.add(item.id);
    if (!item.lastEvidenceReview) issues.push({ level: 'error', where: `evidence:${item.id}`, message: 'Missing lastEvidenceReview date' });
    if (!item.safety || !item.safety.safetySummary) issues.push({ level: 'error', where: `evidence:${item.id}`, message: 'Missing safety summary' });
    if (item.conditions.length === 0) issues.push({ level: 'error', where: `evidence:${item.id}`, message: 'No condition links' });
    checkRefs(item.referenceIds, `evidence:${item.id}.referenceIds`);
    for (const link of item.conditions) {
      if (link.outcomes.length === 0) issues.push({ level: 'warning', where: `evidence:${item.id}/${link.conditionId}`, message: 'Condition link has no outcomes' });
      for (const o of link.outcomes) checkRefs(o.referenceIds, `evidence:${item.id}/${link.conditionId}/${o.outcomeId}`);
    }
    for (const m of item.safety.medicationInteractions) checkRefs(m.referenceIds, `evidence:${item.id}/interaction:${m.medicationOrClass}`);
  }

  // Popular claims
  for (const c of POPULAR_CLAIMS) checkRefs(c.referenceIds, `claim:${c.id}`);

  // Condition definitions
  for (const def of CONDITIONS) {
    const weightSum = def.relevanceFactors.reduce((s, f) => s + f.weight, 0);
    if (weightSum < 90 || weightSum > 110)
      issues.push({ level: 'warning', where: `condition:${def.id}`, message: `Relevance factor weights sum to ${weightSum} (expected ~100)` });
    if (!def.disclaimer) issues.push({ level: 'error', where: `condition:${def.id}`, message: 'Missing disclaimer' });
  }

  // Unused references (informational)
  for (const id of refIds) {
    if (!usedRefs.has(id)) issues.push({ level: 'warning', where: `reference:${id}`, message: 'Reference is not used by any item/claim' });
  }

  void getReference;
  return issues;
}
