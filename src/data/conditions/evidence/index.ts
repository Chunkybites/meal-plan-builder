import type { ConditionEvidenceItem } from '../types';
import { sharedEvidence } from './shared';
import { pcosEvidence } from './pcos';
import { endometriosisEvidence } from './endometriosis';
import { menopauseEvidence } from './menopause';

/**
 * Merged evidence database across all conditions. Shared interventions appear
 * once (from shared.ts) with multiple condition links; condition-only items are
 * appended. To add a condition later: add its evidence module here and register
 * its ConditionDefinition in ../engine.ts.
 */
export const ALL_EVIDENCE: ConditionEvidenceItem[] = [
  ...sharedEvidence,
  ...pcosEvidence,
  ...endometriosisEvidence,
  ...menopauseEvidence,
];
