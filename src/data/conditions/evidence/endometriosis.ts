/**
 * Endometriosis — condition definition + endometriosis-UNIQUE evidence items.
 *
 * SHARED interventions (omega-3, vitamin D, NAC, curcumin, magnesium, melatonin,
 * Mediterranean diet, probiotics, resveratrol, leafy greens/cruciferous, berries,
 * legumes, extra-virgin olive oil, dairy, …) live in ../evidence/shared.ts as a
 * single item with multiple condition links. Only endometriosis-specific
 * interventions are authored here.
 *
 * Editorial guardrails (ESHRE 2022 / NICE NG73): no specific diet or supplement is
 * recommended; most food evidence is OBSERVATIONAL RISK-OF-DEVELOPING, not treatment;
 * biochemical markers are graded separately from pain symptoms; GI-symptom support
 * (e.g. low-FODMAP) is NOT treatment of endometriosis or its lesions.
 */
import type { ConditionDefinition, ConditionEvidenceItem } from '../types';

export const endometriosisDefinition: ConditionDefinition = {
  id: 'endometriosis',
  name: 'Endometriosis Support',
  shortName: 'Endometriosis',
  emoji: '🎗️',
  accent: 'sky',
  tagline: 'Nutrition education for living with endometriosis — not a diagnosis or treatment.',
  description:
    'A nutrition-education layer for people with endometriosis. It highlights whole-food, ' +
    'anti-inflammatory eating patterns and helps track symptoms and food diversity. It is NOT a ' +
    'diagnostic tool or a treatment. Both the ESHRE 2022 endometriosis guideline and NICE NG73 ' +
    'recommend NO specific diet or supplement for endometriosis — the evidence is limited, mostly ' +
    'observational, and potential benefits and harms remain unclear. Diet is complementary to, and ' +
    'never a replacement for, medical and surgical care.',
  whatItTracks: [
    'Pelvic pain and dysmenorrhoea',
    'GI and bloating symptoms (IBS-type overlap)',
    'Inflammation-related markers',
    'Fruit & vegetable diversity',
    'Omega-3 food sources',
    'Fibre intake',
    'Whole-food proportion of the plan',
  ],
  trackedOutcomes: [
    { id: 'dysmenorrhoea', label: 'Dysmenorrhoea (period pain)', category: 'symptom', group: 'Pain & symptoms' },
    { id: 'chronic-pelvic-pain', label: 'Chronic pelvic pain', category: 'symptom', group: 'Pain & symptoms' },
    { id: 'dyspareunia', label: 'Dyspareunia (pain with sex)', category: 'symptom', group: 'Pain & symptoms' },
    { id: 'gi-symptoms', label: 'GI & bloating symptoms', category: 'symptom', group: 'GI symptoms' },
    { id: 'inflammation', label: 'Inflammation markers', category: 'biochemical-marker', group: 'Inflammation' },
    { id: 'oxidative-stress', label: 'Oxidative-stress markers', category: 'biochemical-marker', group: 'Inflammation' },
    { id: 'quality-of-life', label: 'Quality of life', category: 'quality-of-life', group: 'Quality of life' },
    { id: 'analgesic-use', label: 'Analgesic use', category: 'symptom', group: 'Pain & symptoms' },
    { id: 'fertility', label: 'Fertility', category: 'clinical-outcome', group: 'Fertility' },
  ],
  dashboardMetrics: [
    { id: 'fruit-veg-diversity', label: 'Fruit & vegetable diversity', evaluator: 'fruit-veg-diversity', note: 'Variety of fruit and vegetables across the plan; citrus/fruit intake is associated with lower risk of developing endometriosis (observational).', section: 'primary' },
    { id: 'fibre', label: 'Fibre', evaluator: 'fibre', note: 'Supports gut health and steady digestion; part of a whole-food pattern.', section: 'primary' },
    { id: 'oily-fish', label: 'Oily fish', evaluator: 'oily-fish', note: 'Source of long-chain omega-3s; part of an anti-inflammatory eating pattern.', section: 'primary' },
    { id: 'omega3', label: 'Omega-3 sources', evaluator: 'omega3', note: 'Marine and plant omega-3 foods across the plan.', section: 'primary' },
    { id: 'plant-diversity', label: 'Plant diversity', evaluator: 'plant-diversity', note: 'Breadth of different plant foods, which supports the gut microbiome.', section: 'primary' },
    { id: 'wholefood-proportion', label: 'Whole-food proportion', evaluator: 'wholefood-proportion', note: 'Share of minimally processed foods; lower red/processed meat is associated with lower risk (observational).', section: 'primary' },
    { id: 'evidence-linked', label: 'Evidence-linked ingredients', evaluator: 'evidence-linked', note: 'Ingredients that appear in the endometriosis evidence library, with graded outcomes.', section: 'primary' },
    { id: 'gi-symptom-support', label: 'GI-symptom support', evaluator: 'evidence-linked', note: 'GI-symptom strategies such as a short-term, dietitian-supervised low-FODMAP protocol are for overlapping IBS-type gut symptoms only. They are SEPARATE from — and are not a treatment for — endometriosis or its lesions.', section: 'gi-symptom-support' },
  ],
  relevanceFactors: [
    { id: 'fruit-veg-diversity', label: 'Fruit & vegetable diversity', weight: 25, evaluator: 'fruit-veg-diversity' },
    { id: 'fibre', label: 'Fibre', weight: 20, evaluator: 'fibre' },
    { id: 'omega3', label: 'Omega-3 sources', weight: 18, evaluator: 'omega3' },
    { id: 'wholefood-proportion', label: 'Whole-food proportion', weight: 15, evaluator: 'wholefood-proportion' },
    { id: 'oily-fish', label: 'Oily fish', weight: 12, evaluator: 'oily-fish' },
    { id: 'plant-diversity', label: 'Plant diversity', weight: 5, evaluator: 'plant-diversity' },
    { id: 'evidence-linked', label: 'Evidence-linked ingredients', weight: 5, evaluator: 'evidence-linked' },
  ],
  recommendationRules: [
    {
      id: 'no-oily-fish',
      trigger: 'no-oily-fish',
      tone: 'suggestion',
      text: 'No oily fish is planned this week. Oily fish such as salmon, mackerel or sardines provides long-chain omega-3s and fits an anti-inflammatory eating pattern often studied in endometriosis. Evidence remains limited, and this supports overall diet quality rather than treating endometriosis.',
    },
    {
      id: 'low-fruit-veg-diversity',
      trigger: 'low-fruit-veg-diversity',
      tone: 'suggestion',
      text: 'Fruit and vegetable variety is on the low side. A wider range — including citrus fruit — has been studied in relation to a lower risk of developing endometriosis in observational cohorts. This is about long-term dietary quality, not a treatment for existing endometriosis.',
    },
    {
      id: 'fibre-low',
      trigger: 'fibre-low',
      tone: 'suggestion',
      text: 'Fibre looks low across the plan. Adding wholegrains, legumes, fruit and vegetables supports digestion and overall diet quality. Fibre is not a treatment for endometriosis, but it underpins a whole-food pattern.',
    },
    {
      id: 'gi-symptom-note',
      trigger: 'gi-symptom-note',
      tone: 'suggestion',
      text: 'If bloating or IBS-type gut symptoms are prominent, a short-term, dietitian-supervised low-FODMAP elimination-and-reintroduction protocol has been studied for GI symptoms in endometriosis. Important: this targets overlapping gut symptoms only — it is NOT a treatment for endometriosis or its lesions, and it is not meant to be followed long-term.',
    },
    {
      id: 'has-evidence-ingredients',
      trigger: 'has-evidence-ingredients',
      tone: 'positive',
      text: 'This plan includes ingredients that appear in the endometriosis evidence library ({list}). Each is graded by outcome so you can see what has — and has not — been shown.',
    },
    {
      id: 'supplement-context',
      trigger: 'supplement-context',
      tone: 'suggestion',
      text: 'Some endometriosis supplements (for example combined vitamin C and E) show emerging, small-trial signals for pain. Evidence remains limited, ESHRE and NICE recommend no specific supplement, and none is shown to treat or reverse endometriosis — discuss any supplement with your clinician first.',
    },
  ],
  outcomeFilterGroups: [
    'Pain & symptoms',
    'GI symptoms',
    'Inflammation',
    'Oxidative stress',
    'Quality of life',
    'Fertility',
  ],
  disclaimer:
    'This endometriosis layer is for nutrition education only. It does not diagnose, treat, cure or ' +
    'reverse endometriosis, and it does not replace advice from your doctor or a registered dietitian. ' +
    'The ESHRE 2022 guideline and NICE NG73 do not recommend any specific diet or supplement for ' +
    'endometriosis. Always seek professional advice before changing your diet, starting a supplement, ' +
    'or following any restrictive elimination diet.',
  researchMethodologyNotes: [
    'Most endometriosis food evidence is OBSERVATIONAL and about the risk of DEVELOPING endometriosis (e.g. NHS II cohort), not about treating established disease; reverse causation is possible.',
    'Biochemical markers (inflammation, oxidative stress) are graded separately from pain symptoms — an improvement in a marker is not the same as pain relief.',
    'Restrictive diets (gluten-free, low-nickel, low-FODMAP) carry nutritional and quality-of-life risks and should be short-term and dietitian-supervised.',
    'Low-FODMAP is management of overlapping IBS-type GI symptoms, not treatment of endometriosis lesions; pain has generally not been a controlled endpoint.',
  ],
};

export const endometriosisEvidence: ConditionEvidenceItem[] = [
  // 1) Low-FODMAP diet ------------------------------------------------------
  {
    id: 'endo-low-fodmap',
    interventionName: 'Low-FODMAP diet',
    interventionType: 'dietary-pattern',
    aliases: ['low FODMAP', 'FODMAP elimination diet', 'low fermentable carbohydrate diet'],
    mechanismSummary:
      'Restricting fermentable oligo-, di-, monosaccharides and polyols reduces colonic gas and osmotic load, ' +
      'easing IBS-type gut symptoms that frequently overlap with endometriosis. It does not act on endometriotic lesions.',
    studiedDose: 'FODMAP intake reduced to <5 g/day during the elimination phase',
    studiedDuration: '28 days elimination (EndoFOD crossover); structured reintroduction thereafter',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'A randomised crossover feeding study (EndoFOD) and a prospective cohort assessed a low-FODMAP diet in ' +
          'women with endometriosis and GI symptoms. GI symptoms improved; endometriosis pain was not a controlled endpoint.',
        overallNote:
          'Helps overlapping IBS-type GI symptoms in some people with endometriosis. It is NOT a treatment for ' +
          'endometriosis or its lesions. It is a short-term, dietitian-supervised elimination-and-reintroduction ' +
          'protocol, not a long-term way of eating.',
        studiedPopulation: 'Women with endometriosis and coexisting gastrointestinal symptoms',
        limitations: [
          'GI symptoms were the outcome; endometriosis pain was not a study endpoint',
          'Short-term (28-day) elimination phase; cohort was uncontrolled with high dropout',
          'Requires structured reintroduction and dietitian supervision to avoid unnecessary restriction',
          'GI symptoms occur irrespective of whether the bowel is infiltrated by endometriosis',
        ],
        outcomes: [
          {
            outcomeId: 'gi-symptoms',
            label: 'GI & bloating symptoms',
            category: 'symptom',
            direction: 'improved',
            evidenceLevel: 'B',
            summary:
              'In the EndoFOD randomised crossover feeding study, 60% were GI responders on the low-FODMAP arm vs 26% on the control diet (p=0.008); a prospective cohort found constipation improved.',
            clinicalRelevance:
              'Targets overlapping IBS-type gut symptoms only — improvement here says nothing about endometriosis activity or lesions.',
            referenceIds: ['varney-2025-endofod', 'keukens-2025-fodmap'],
          },
          {
            outcomeId: 'endometriosis-pain',
            label: 'Endometriosis pain',
            category: 'symptom',
            direction: 'insufficient-evidence',
            evidenceLevel: 'D',
            summary:
              'Endometriosis pain was NOT a controlled endpoint of these studies. GI symptoms occur irrespective of bowel infiltration, and any pain figures in the uncontrolled cohort are confounded.',
            clinicalRelevance:
              'There is no reliable evidence that low-FODMAP relieves endometriosis pain or affects lesions.',
            referenceIds: ['varney-2025-endofod', 'keukens-2025-fodmap'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'A restrictive short-term diet best delivered as a structured elimination-and-reintroduction protocol under ' +
        'dietitian supervision. Long-term or unsupervised restriction risks nutritional inadequacy and altered gut microbiota.',
      contraindications: [
        'Active or history of disordered eating',
        'Unsupervised long-term use',
      ],
      medicationInteractions: [],
      pregnancyConsiderations: 'Only under dietitian supervision to ensure nutritional adequacy in pregnancy.',
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['varney-2025-endofod', 'keukens-2025-fodmap'],
    lastEvidenceReview: '2026-07-12',
  },

  // 2) Gluten-free diet -----------------------------------------------------
  {
    id: 'endo-gluten-free',
    interventionName: 'Gluten-free diet',
    interventionType: 'dietary-pattern',
    aliases: ['gluten free diet', 'gluten avoidance', 'no-gluten diet'],
    mechanismSummary:
      'A proposed anti-inflammatory or symptom-modifying effect of removing gluten-containing grains. No lesion-level ' +
      'mechanism has been demonstrated in endometriosis, and no coeliac mechanism is established here.',
    studiedDuration: '12 months (single uncontrolled retrospective study)',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'The evidence rests on a single uncontrolled retrospective study reporting reduced painful symptoms, with no ' +
          'coeliac screening and heavy confounding. A critical review advises against recommending gluten-free absent a coeliac diagnosis.',
        overallNote:
          'There is no reliable evidence that a gluten-free diet treats endometriosis. The main study is uncontrolled and ' +
          'confounded, with no lesion outcome. Avoid recommending gluten restriction unless coeliac disease is diagnosed.',
        studiedPopulation: 'Women with painful endometriosis (single retrospective series)',
        limitations: [
          'One uncontrolled, retrospective study with no comparison group',
          'No coeliac screening performed',
          'Confounded by placebo effect, broader dietary change and responder selection',
          'No lesion or objective disease outcome measured',
        ],
        outcomes: [
          {
            outcomeId: 'endometriosis-pain',
            label: 'Endometriosis pain',
            category: 'symptom',
            direction: 'insufficient-evidence',
            evidenceLevel: 'D',
            summary:
              'A single retrospective series reported 75% of women describing reduced painful symptoms on a gluten-free diet, but the study was uncontrolled, had no coeliac screen and was heavily confounded. A critical review concludes gluten-free should not be advised without a coeliac diagnosis.',
            clinicalRelevance:
              'Insufficient and low-quality evidence; any benefit cannot be attributed to gluten removal, and restriction carries nutritional and social cost.',
            referenceIds: ['marziali-2012-gf', 'brouns-2023-gluten'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Unnecessary gluten restriction can reduce wholegrain and fibre intake, raise cost and burden, and may complicate ' +
        'later coeliac testing. Not indicated without a confirmed coeliac or gluten-related diagnosis.',
      contraindications: ['Undiagnosed coeliac symptoms (test before restricting)'],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['marziali-2012-gf', 'brouns-2023-gluten'],
    lastEvidenceReview: '2026-07-12',
  },

  // 3) Low-nickel diet ------------------------------------------------------
  {
    id: 'endo-low-nickel',
    interventionName: 'Low-nickel diet',
    interventionType: 'dietary-pattern',
    aliases: ['low nickel diet', 'nickel-restricted diet', 'low-Ni diet'],
    mechanismSummary:
      'Hypothesis that systemic nickel allergy/sensitivity contributes to IBS-like gut symptoms in some women with ' +
      'endometriosis; restricting dietary nickel is proposed to ease those gut symptoms. Mechanism is unproven and lesion-independent.',
    studiedDuration: 'Open-label pilot (31 completers)',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'A single open-label, uncontrolled pilot study reported reduced IBS-like GI symptoms on a low-nickel diet in women ' +
          'with endometriosis and nickel sensitivity. Hypothesis-generating only.',
        overallNote:
          'Very preliminary. Any benefit is limited to overlapping IBS-type GI symptoms in a selected subgroup — not to ' +
          'endometriosis itself. There is no control group, so results cannot be attributed to nickel restriction.',
        studiedPopulation: 'Women with endometriosis, IBS-like symptoms and suspected nickel sensitivity',
        limitations: [
          'Open-label, uncontrolled pilot (no comparison group)',
          'Small, selected sample; hypothesis-generating',
          'GI symptoms only; no endometriosis or lesion outcome',
          'Low-nickel diets are highly restrictive and hard to sustain',
        ],
        outcomes: [
          {
            outcomeId: 'gi-symptoms',
            label: 'GI & bloating symptoms',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'D',
            summary:
              'An open-label pilot study reported reduced IBS-like gastrointestinal symptoms on a low-nickel diet in women with endometriosis and nickel sensitivity. Uncontrolled and preliminary.',
            clinicalRelevance:
              'Only addresses overlapping gut symptoms in a selected subgroup; not a treatment for endometriosis.',
            referenceIds: ['borghini-2020-nickel'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Low-nickel diets are highly restrictive (limiting many legumes, wholegrains, nuts and some vegetables) and risk ' +
        'nutritional inadequacy. Should only be trialled short-term with dietitian supervision in confirmed nickel sensitivity.',
      contraindications: ['Unsupervised or long-term use'],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['borghini-2020-nickel'],
    lastEvidenceReview: '2026-07-12',
  },

  // 4) Higher fruit & citrus intake ----------------------------------------
  {
    id: 'endo-fruit-citrus',
    interventionName: 'Higher fruit & citrus intake',
    interventionType: 'food',
    aliases: ['citrus fruit', 'oranges', 'grapefruit', 'fruit intake'],
    mechanismSummary:
      'Citrus fruit is a source of beta-cryptoxanthin, vitamin C and flavonoids; higher intake is hypothesised to relate ' +
      'to lower endometriosis risk. This is an association from cohort data, not a demonstrated treatment mechanism.',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'In the Nurses’ Health Study II cohort, higher citrus/fruit intake was associated with a lower risk of DEVELOPING ' +
          'endometriosis (≥1 citrus serving/day RR ~0.78). Cruciferous vegetables showed a higher risk, likely reverse causation.',
        overallNote:
          'This is observational RISK-OF-DEVELOPING evidence from a large cohort, not treatment of established endometriosis. ' +
          'Reverse causation is possible, and no causal or lesion effect is shown. A varied fruit intake is a reasonable ' +
          'general dietary goal regardless.',
        studiedPopulation: 'Women in the Nurses’ Health Study II cohort (70,835 women), free of endometriosis at baseline',
        limitations: [
          'Observational cohort — cannot establish cause and effect',
          'About risk of developing endometriosis, not treating it',
          'Reverse causation possible (cruciferous vegetables were associated with higher risk)',
          'Dietary intake self-reported',
        ],
        outcomes: [
          {
            outcomeId: 'endometriosis-risk',
            label: 'Risk of developing endometriosis',
            category: 'clinical-outcome',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'In the NHS II cohort, women eating ≥1 citrus fruit serving/day had roughly 22% lower risk of a later endometriosis diagnosis (RR ~0.78). This is an association in initially unaffected women, not evidence of treatment.',
            clinicalRelevance:
              'Supports fruit variety as a general dietary goal; does not show that citrus treats or improves existing endometriosis.',
            referenceIds: ['harris-2018-fruitveg'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Fruit and citrus are foods with no meaningful safety concern in ordinary dietary amounts. Grapefruit specifically can ' +
        'interact with certain medications via CYP3A4, so people on those drugs should check with a pharmacist.',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: ['orange', 'citrus', 'lemon', 'grapefruit'],
    isSupplement: false,
    referenceIds: ['harris-2018-fruitveg'],
    lastEvidenceReview: '2026-07-12',
  },

  // 5) Lower red & processed meat ------------------------------------------
  {
    id: 'endo-lower-red-meat',
    interventionName: 'Lower red & processed meat',
    interventionType: 'food',
    aliases: ['reduced red meat', 'less processed meat', 'lower red meat intake'],
    mechanismSummary:
      'High red/processed meat intake has been hypothesised to influence steroid hormones and inflammation. The evidence is ' +
      'an association with risk of developing endometriosis, not a demonstrated treatment mechanism.',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'In the Nurses’ Health Study II cohort, higher red meat intake was associated with greater risk of DEVELOPING ' +
          'endometriosis (>2 servings/day red meat RR 1.56); fish intake itself was null.',
        overallNote:
          'Observational RISK-OF-DEVELOPING evidence, not treatment. Lower red/processed meat is a reasonable general dietary ' +
          'pattern but is not shown to treat or improve existing endometriosis.',
        studiedPopulation: 'Women in the Nurses’ Health Study II cohort, free of endometriosis at baseline',
        limitations: [
          'Observational cohort — cannot establish cause and effect',
          'About risk of developing endometriosis, not treating it',
          'Residual confounding by overall diet and lifestyle likely',
          'Dietary intake self-reported',
        ],
        outcomes: [
          {
            outcomeId: 'endometriosis-risk',
            label: 'Risk of developing endometriosis',
            category: 'clinical-outcome',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'In the NHS II cohort, women eating more than 2 servings/day of red meat had ~56% higher risk of a later endometriosis diagnosis (RR 1.56), so lower intake tracks with lower risk. Fish intake itself was not associated.',
            clinicalRelevance:
              'Supports moderating red/processed meat as a general goal; does not show that cutting meat treats existing endometriosis.',
            referenceIds: ['yamamoto-2018-meat'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Reducing red and processed meat is consistent with general healthy-eating guidance. Ensure adequate iron, zinc, B12 and ' +
        'protein from other sources (legumes, fish, poultry, eggs, dairy or fortified foods).',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['yamamoto-2018-meat'],
    lastEvidenceReview: '2026-07-12',
  },

  // 6) Combined vitamin C & E (antioxidants) -------------------------------
  {
    id: 'endo-vitamin-c-e',
    interventionName: 'Combined vitamin C & E (antioxidants)',
    interventionType: 'supplement',
    aliases: ['vitamin C and E', 'ascorbic acid and tocopherol', 'antioxidant vitamins C+E'],
    mechanismSummary:
      'Vitamins C and E are antioxidants proposed to reduce oxidative stress in the peritoneal environment, which is elevated ' +
      'in endometriosis. Reducing oxidative markers is a biochemical effect and is not the same as relieving pain.',
    studiedDose: 'Vitamin C 1000 mg/day + vitamin E ~400 IU/day (as used in the small RCTs)',
    studiedDuration: '~8 weeks (small single-country trials)',
    conditions: [
      {
        conditionId: 'endometriosis',
        specificity: 'condition-specific',
        evidenceSummary:
          'Two small randomised controlled trials of combined vitamin C and E reported reduced pelvic pain and dysmenorrhoea ' +
          'alongside reduced oxidative-stress markers. A meta-analysis found antioxidant supplements reduced dysmenorrhoea only.',
        overallNote:
          'Emerging, small-trial signal for pain from combined vitamin C and E. Trials are small, short and single-country, and ' +
          'the reduction in oxidative markers is a biochemical finding graded separately from pain. Not shown to treat lesions ' +
          'or alter disease course; ESHRE/NICE recommend no specific supplement.',
        studiedPopulation: 'Women with endometriosis-related pelvic pain (small single-country RCTs)',
        limitations: [
          'Small sample sizes and short durations',
          'Single-country trials; limited replication',
          'Meta-analysis found benefit only for dysmenorrhoea, not chronic pelvic pain or dyspareunia; moderate-to-high risk of bias',
          'Oxidative-marker change is a biomarker, not a pain outcome',
        ],
        outcomes: [
          {
            outcomeId: 'pelvic-pain',
            label: 'Pelvic pain',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'Two small triple-/placebo-controlled RCTs reported reduced pelvic pain and dysmenorrhoea with combined vitamin C and E; a meta-analysis of dietary interventions found antioxidant supplements reduced dysmenorrhoea specifically.',
            clinicalRelevance:
              'A promising but low-certainty signal for period and pelvic pain; not a demonstrated treatment for endometriosis itself.',
            referenceIds: ['amini-2021-cvite', 'santanam-2013-antiox', 'meneghetti-2024-diet'],
          },
          {
            outcomeId: 'oxidative-stress',
            label: 'Oxidative-stress markers',
            category: 'biochemical-marker',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'Combined vitamin C and E supplementation reduced oxidative-stress markers versus placebo in a small RCT. These are biochemical markers, not pain, and a marker change does not itself demonstrate symptom benefit.',
            clinicalRelevance:
              'Confirms an antioxidant biological effect; kept separate from pain outcomes and not evidence of disease modification.',
            referenceIds: ['amini-2021-cvite'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Vitamin C and E at the doses studied are generally well tolerated. High-dose vitamin E (typically >400 IU/day) may ' +
        'increase bleeding risk, especially with anticoagulant or antiplatelet medicines; high-dose vitamin C can cause GI upset ' +
        'and, rarely, kidney stones in susceptible people. Discuss supplements with a clinician.',
      contraindications: ['Known vitamin E hypersensitivity'],
      medicationInteractions: [
        {
          medicationOrClass: 'Anticoagulants / antiplatelets (e.g. warfarin, DOACs, aspirin)',
          status: 'potential',
          summary:
            'High-dose vitamin E may add to bleeding risk with anticoagulant or antiplatelet drugs; monitor and seek clinician advice before combining.',
          referenceIds: ['amini-2021-cvite'],
        },
      ],
      pregnancyConsiderations:
        'Avoid high-dose antioxidant supplements in pregnancy unless advised by a clinician; obtain vitamins C and E from food where possible.',
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['amini-2021-cvite', 'santanam-2013-antiox', 'meneghetti-2024-diet'],
    lastEvidenceReview: '2026-07-12',
  },
];
