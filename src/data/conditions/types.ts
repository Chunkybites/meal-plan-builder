/**
 * Condition Support Engine — shared, reusable evidence model.
 *
 * ONE architecture serves every condition. The core UI reads a ConditionDefinition
 * and renders from its config (trackedOutcomes, dashboardMetrics, relevanceFactors,
 * recommendationRules). There is deliberately NO `if (condition === 'pcos')` logic
 * in components.
 *
 * Editorial invariants baked into the types:
 * - Evidence is graded per OUTCOME, never one universal score per intervention.
 * - `OutcomeCategory` structurally separates biochemical markers from symptoms,
 *   clinical outcomes and quality of life — the biomarker≠symptom rule.
 * - `EvidenceSpecificity` records whether evidence is condition-specific, indirect,
 *   general-population, mechanistic or preclinical.
 * - Shared interventions (omega-3, vitamin D, NAC…) are ONE item with several
 *   condition links, not duplicated per condition.
 *
 * See docs/CONDITION_SUPPORT_REPORT.md for the evidence base and integrity audit.
 * "PMOS (Polyendocrine Metabolic Ovarian Syndrome)" is not a recognised diagnosis
 * and is intentionally absent.
 */

export type ConditionId = 'pcos' | 'endometriosis' | 'menopause';

/** 'general' is the default meal-planning mode with no condition layer. */
export type SupportMode = 'general' | ConditionId;

export type EvidenceLevel = 'A' | 'B' | 'C' | 'D';

export type EvidenceDirection =
  | 'improved'
  | 'reduced'
  | 'increased'
  | 'mixed'
  | 'no-significant-effect'
  | 'insufficient-evidence';

export type EvidenceSpecificity =
  | 'condition-specific'
  | 'indirect-clinical'
  | 'general-population'
  | 'mechanistic'
  | 'preclinical';

/** Enforces the biomarker ≠ symptom ≠ clinical outcome ≠ quality-of-life distinction. */
export type OutcomeCategory = 'symptom' | 'biochemical-marker' | 'clinical-outcome' | 'quality-of-life';

export type InterventionType = 'food' | 'beverage' | 'nutrient' | 'supplement' | 'dietary-pattern';

export type InteractionStatus = 'documented' | 'potential' | 'insufficient-information';

export type StudyType =
  | 'guideline'
  | 'systematic-review'
  | 'meta-analysis'
  | 'umbrella-review'
  | 'cochrane-review'
  | 'randomised-controlled-trial'
  | 'controlled-trial'
  | 'cohort'
  | 'observational'
  | 'mechanistic'
  | 'reference'
  | 'other';

export type ReferenceVerification =
  | 'independently-verified'
  | 'agent-verified'
  | 'listing-verified';

export interface ResearchReference {
  id: string;
  title: string;
  authors?: string;
  year: number;
  journal?: string;
  studyType: StudyType;
  doi?: string;
  pubmedId?: string;
  url: string;
  verification: ReferenceVerification;
  /** Optional study-detail fields for the Research Detail modal. */
  population?: string;
  intervention?: string;
  comparator?: string;
  duration?: string;
  keyFindings?: string;
  nullFindings?: string;
  limitations?: string;
  /** Integrity flags: retraction, Expression of Concern, "narrative review not a trial", COI. */
  note?: string;
}

/** Which relevance-factor / dashboard-metric evaluator to run (keeps content declarative). */
export type MetricEvaluator =
  | 'fibre'
  | 'protein'
  | 'protein-distribution'
  | 'carb-quality'
  | 'added-sugar'
  | 'unsaturated-fat'
  | 'omega3'
  | 'oily-fish'
  | 'legumes'
  | 'wholegrain'
  | 'plant-diversity'
  | 'fruit-veg-diversity'
  | 'wholefood-proportion'
  | 'calcium-foods'
  | 'vitamin-d-foods'
  | 'soy-foods'
  | 'evidence-linked';

export interface ConditionOutcomeDefinition {
  id: string;
  label: string;
  category: OutcomeCategory;
  /** Filter group shown in the Supplement Evidence Centre / Research Centre. */
  group: string;
}

export interface DashboardMetricDefinition {
  id: string;
  label: string;
  evaluator: MetricEvaluator;
  note: string;
  /** Optional: separates e.g. GI-symptom support from condition nutrition. */
  section?: 'primary' | 'gi-symptom-support';
}

export interface RelevanceFactor {
  id: string;
  label: string;
  weight: number;
  evaluator: MetricEvaluator;
}

export type RecommendationTrigger =
  | 'fibre-low'
  | 'breakfast-fibre-low'
  | 'no-oily-fish'
  | 'has-oily-fish'
  | 'refined-carbs'
  | 'low-plant-diversity'
  | 'low-fruit-veg-diversity'
  | 'protein-uneven'
  | 'low-calcium-foods'
  | 'no-soy-foods'
  | 'has-evidence-ingredients'
  | 'gi-symptom-note'
  | 'supplement-context';

export interface RecommendationRule {
  id: string;
  trigger: RecommendationTrigger;
  tone: 'positive' | 'suggestion';
  /** Template text; {value}/{list}/{meal} placeholders filled by the runner. */
  text: string;
}

export interface ConditionDefinition {
  id: ConditionId;
  name: string;
  shortName: string;
  emoji: string;
  tagline: string;
  description: string;
  whatItTracks: string[];
  trackedOutcomes: ConditionOutcomeDefinition[];
  dashboardMetrics: DashboardMetricDefinition[];
  relevanceFactors: RelevanceFactor[];
  recommendationRules: RecommendationRule[];
  /** Outcome filter groups exposed in the evidence/research centres. */
  outcomeFilterGroups: string[];
  disclaimer: string;
  researchMethodologyNotes: string[];
  /** Tailwind accent family used for this condition's UI chrome. */
  accent: 'fuchsia' | 'sky' | 'amber';
}

export interface EvidenceOutcome {
  outcomeId: string;
  label: string;
  category: OutcomeCategory;
  direction: EvidenceDirection;
  evidenceLevel: EvidenceLevel;
  summary: string;
  clinicalRelevance?: string;
  referenceIds: string[];
}

export interface MedicationInteraction {
  medicationOrClass: string;
  status: InteractionStatus;
  summary: string;
  referenceIds: string[];
}

export interface SafetyProfile {
  safetySummary: string;
  contraindications: string[];
  medicationInteractions: MedicationInteraction[];
  pregnancyConsiderations?: string;
  breastfeedingConsiderations?: string;
  tryingToConceiveConsiderations?: string;
}

export interface ConditionEvidenceLink {
  conditionId: ConditionId;
  outcomes: EvidenceOutcome[];
  specificity: EvidenceSpecificity;
  evidenceSummary: string;
  /** Plain-English framing; never a single misleading universal grade. */
  overallNote: string;
  studiedPopulation: string;
  limitations: string[];
}

export interface ConditionEvidenceItem {
  id: string;
  interventionName: string;
  interventionType: InterventionType;
  aliases: string[];
  /** The same intervention can link to several conditions with different evidence. */
  conditions: ConditionEvidenceLink[];
  mechanismSummary?: string;
  studiedDose?: string;
  studiedDuration?: string;
  safety: SafetyProfile;
  /** Lower-cased keywords used to link this item to recipe ingredients. */
  matchKeywords: string[];
  isSupplement: boolean;
  referenceIds: string[];
  lastEvidenceReview: string;
}

export interface PopularClaim {
  id: string;
  conditionIds: ConditionId[];
  claim: string;
  whatEvidenceShows: string;
  whyMisleading: string;
  evidenceLevel: EvidenceLevel;
  referenceIds: string[];
}

// ---- Display metadata ----

export const EVIDENCE_LEVEL_META: Record<
  EvidenceLevel,
  { label: string; colorClass: string; ringClass: string }
> = {
  A: { label: 'Stronger evidence', colorClass: 'text-emerald-300 border-emerald-400/50 bg-emerald-400/10', ringClass: 'bg-emerald-400' },
  B: { label: 'Moderate evidence', colorClass: 'text-volt-300 border-volt-400/50 bg-volt-400/10', ringClass: 'bg-volt-400' },
  C: { label: 'Emerging evidence', colorClass: 'text-amber-300 border-amber-400/50 bg-amber-400/10', ringClass: 'bg-amber-400' },
  D: { label: 'Insufficient / conflicting', colorClass: 'text-ink-300 border-ink-500 bg-ink-700/40', ringClass: 'bg-ink-400' },
};

export const EVIDENCE_RANK: Record<EvidenceLevel, number> = { A: 4, B: 3, C: 2, D: 1 };

export const DIRECTION_LABELS: Record<EvidenceDirection, string> = {
  improved: 'Improved',
  reduced: 'Reduced',
  increased: 'Increased',
  mixed: 'Mixed',
  'no-significant-effect': 'No significant effect',
  'insufficient-evidence': 'Insufficient evidence',
};

export const SPECIFICITY_LABELS: Record<EvidenceSpecificity, string> = {
  'condition-specific': 'Condition-specific',
  'indirect-clinical': 'Indirect clinical',
  'general-population': 'General population',
  mechanistic: 'Mechanistic / theoretical',
  preclinical: 'Preclinical (lab/animal)',
};

export const OUTCOME_CATEGORY_LABELS: Record<OutcomeCategory, string> = {
  symptom: 'Symptom',
  'biochemical-marker': 'Biochemical marker',
  'clinical-outcome': 'Clinical outcome',
  'quality-of-life': 'Quality of life',
};

export const INTERACTION_STATUS_LABELS: Record<InteractionStatus, string> = {
  documented: 'Documented interaction',
  potential: 'Potential interaction',
  'insufficient-information': 'Insufficient information',
};

export const INTERVENTION_TYPE_LABELS: Record<InterventionType, string> = {
  food: 'Food',
  beverage: 'Beverage',
  nutrient: 'Nutrient',
  supplement: 'Supplement',
  'dietary-pattern': 'Dietary pattern',
};
