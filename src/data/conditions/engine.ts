import type { ConditionDefinition, ConditionEvidenceItem, ConditionId } from './types';
import { ALL_EVIDENCE } from './evidence';
import { pcosDefinition } from './evidence/pcos';
import { endometriosisDefinition } from './evidence/endometriosis';
import { menopauseDefinition } from './evidence/menopause';

/**
 * Condition Support Engine registry. The core UI consumes conditions through
 * this module only. Registering a new condition here (plus its evidence module
 * in ./evidence/index.ts) makes it render automatically — no component changes.
 */
export const CONDITIONS: ConditionDefinition[] = [pcosDefinition, endometriosisDefinition, menopauseDefinition];

const CONDITION_MAP: Record<ConditionId, ConditionDefinition> = {
  pcos: pcosDefinition,
  endometriosis: endometriosisDefinition,
  menopause: menopauseDefinition,
};

export function getCondition(id: ConditionId): ConditionDefinition {
  return CONDITION_MAP[id];
}

export function isConditionId(value: string): value is ConditionId {
  return value === 'pcos' || value === 'endometriosis' || value === 'menopause';
}

/** Evidence items that carry a link for the given condition. */
export function getEvidenceForCondition(id: ConditionId): ConditionEvidenceItem[] {
  return ALL_EVIDENCE.filter((item) => item.conditions.some((c) => c.conditionId === id));
}

/** Supplement-type evidence items for a condition (for the Supplement Evidence Centre). */
export function getSupplementsForCondition(id: ConditionId): ConditionEvidenceItem[] {
  return getEvidenceForCondition(id).filter((item) => item.isSupplement);
}

const EVIDENCE_BY_ID: Record<string, ConditionEvidenceItem> = Object.fromEntries(
  ALL_EVIDENCE.map((e) => [e.id, e]),
);

export function getEvidenceItem(id: string): ConditionEvidenceItem | undefined {
  return EVIDENCE_BY_ID[id];
}

/** Pull the single condition link for an item (or undefined if not linked). */
export function getConditionLink(item: ConditionEvidenceItem, conditionId: ConditionId) {
  return item.conditions.find((c) => c.conditionId === conditionId);
}

export { ALL_EVIDENCE };
export { pcosDefinition, endometriosisDefinition, menopauseDefinition };
