/**
 * Menopause — condition definition and menopause-UNIQUE evidence items.
 *
 * Shared interventions (omega-3, vitamin D, magnesium, melatonin, Mediterranean
 * diet, flaxseed, probiotics, leafy greens/cruciferous, berries, legumes,
 * wholegrains, extra virgin olive oil, dairy, nuts) live in shared.ts and link to
 * menopause from there — they are NOT duplicated here.
 *
 * Editorial invariants enforced in this file:
 * - Bone mineral density (BMD) is graded as a 'biochemical-marker' (a surrogate),
 *   NEVER as a clinical fracture outcome. No food or supplement here demonstrates
 *   fracture reduction.
 * - Creatine's muscle/strength benefit is conditional on resistance training; the
 *   dependency is kept explicit in every relevant field.
 * - Hot flushes are graded as 'symptom'.
 * - Nothing here is framed as a replacement for, or equivalent to, HRT.
 */

import type { ConditionDefinition, ConditionEvidenceItem } from '../types';

export const menopauseDefinition: ConditionDefinition = {
  id: 'menopause',
  name: 'Menopause Support',
  shortName: 'Menopause',
  emoji: '🌸',
  accent: 'amber',
  tagline: 'Nutrition education for the peri- and postmenopause transition — not a substitute for HRT.',
  description:
    'This layer highlights foods studied in relation to menopause symptoms and long-term bone, muscle and cardiometabolic health across the peri- and postmenopause transition. It is nutrition education only. It is NOT a replacement for hormone replacement therapy (HRT), which has a substantially larger evidence base and a different clinical role. NICE NG23 keeps HRT first-line for troublesome vasomotor symptoms; the effects of the foods below are generally smaller, slower and less certain, and several popular botanical remedies perform no better than placebo. Speak to a clinician about symptom management and bone protection.',
  whatItTracks: [
    'Protein quantity and its distribution across meals',
    'Calcium-rich foods',
    'Vitamin D foods',
    'Oily fish',
    'Soy foods (tofu, edamame, tempeh, miso)',
    'Fruit and vegetable diversity',
    'Wholegrains',
    'Foods studied in relation to hot flushes',
  ],
  trackedOutcomes: [
    { id: 'hot-flush-frequency', label: 'Hot flush frequency', category: 'symptom', group: 'Vasomotor & sleep' },
    { id: 'hot-flush-severity', label: 'Hot flush severity', category: 'symptom', group: 'Vasomotor & sleep' },
    { id: 'night-sweats', label: 'Night sweats', category: 'symptom', group: 'Vasomotor & sleep' },
    { id: 'sleep', label: 'Sleep', category: 'symptom', group: 'Vasomotor & sleep' },
    { id: 'mood', label: 'Mood', category: 'symptom', group: 'Mood' },
    { id: 'bone-mineral-density', label: 'Bone mineral density (surrogate marker)', category: 'biochemical-marker', group: 'Bone' },
    { id: 'muscle-protein-synthesis', label: 'Muscle protein synthesis', category: 'biochemical-marker', group: 'Muscle' },
    { id: 'muscle-strength', label: 'Muscle strength', category: 'clinical-outcome', group: 'Muscle & bone' },
    { id: 'lean-mass', label: 'Lean mass', category: 'clinical-outcome', group: 'Muscle & bone' },
    { id: 'fracture', label: 'Fracture', category: 'clinical-outcome', group: 'Muscle & bone' },
    { id: 'ldl-cholesterol', label: 'LDL cholesterol', category: 'biochemical-marker', group: 'Cardiometabolic' },
    { id: 'blood-pressure', label: 'Blood pressure', category: 'biochemical-marker', group: 'Cardiometabolic' },
    { id: 'quality-of-life', label: 'Quality of life', category: 'quality-of-life', group: 'Quality of life' },
  ],
  dashboardMetrics: [
    {
      id: 'protein',
      label: 'Protein',
      evaluator: 'protein',
      note: 'Your selected meals provide approximately this much protein — relevant for preserving muscle across the transition, most effective alongside resistance exercise.',
      section: 'primary',
    },
    {
      id: 'protein-distribution',
      label: 'Protein distribution',
      evaluator: 'protein-distribution',
      note: 'Your selected meals spread protein across the day roughly like this. Even distribution is plausible and harmless, though the outcome evidence is limited.',
      section: 'primary',
    },
    {
      id: 'calcium-foods',
      label: 'Calcium-rich foods',
      evaluator: 'calcium-foods',
      note: 'Your selected meals provide approximately this many servings of calcium-rich foods — dietary adequacy matters for bone health.',
      section: 'primary',
    },
    {
      id: 'vitamin-d-foods',
      label: 'Vitamin D foods',
      evaluator: 'vitamin-d-foods',
      note: 'Your selected meals provide approximately this many vitamin-D-containing foods. Diet alone rarely meets requirements; sunlight and testing matter too.',
      section: 'primary',
    },
    {
      id: 'oily-fish',
      label: 'Oily fish',
      evaluator: 'oily-fish',
      note: 'Your selected meals provide approximately this much oily fish, a source of omega-3 and vitamin D.',
      section: 'primary',
    },
    {
      id: 'soy-foods',
      label: 'Soy foods',
      evaluator: 'soy-foods',
      note: 'Your selected meals provide approximately this much soy. Soy isoflavones have been studied for hot flushes; the effect is modest and depends partly on equol-producer status.',
      section: 'primary',
    },
    {
      id: 'fruit-veg-diversity',
      label: 'Fruit & vegetable diversity',
      evaluator: 'fruit-veg-diversity',
      note: 'Your selected meals include approximately this range of different fruits and vegetables.',
      section: 'primary',
    },
    {
      id: 'wholegrain',
      label: 'Wholegrains',
      evaluator: 'wholegrain',
      note: 'Your selected meals provide approximately this many wholegrain servings.',
      section: 'primary',
    },
    {
      id: 'evidence-linked',
      label: 'Evidence-linked foods',
      evaluator: 'evidence-linked',
      note: 'Your selected meals include approximately this many foods with a menopause-relevant evidence entry.',
      section: 'primary',
    },
  ],
  relevanceFactors: [
    { id: 'protein', label: 'Protein', weight: 22, evaluator: 'protein' },
    { id: 'protein-distribution', label: 'Protein distribution', weight: 12, evaluator: 'protein-distribution' },
    { id: 'calcium-foods', label: 'Calcium-rich foods', weight: 14, evaluator: 'calcium-foods' },
    { id: 'vitamin-d-foods', label: 'Vitamin D foods', weight: 8, evaluator: 'vitamin-d-foods' },
    { id: 'oily-fish', label: 'Oily fish', weight: 10, evaluator: 'oily-fish' },
    { id: 'soy-foods', label: 'Soy foods', weight: 10, evaluator: 'soy-foods' },
    { id: 'fruit-veg-diversity', label: 'Fruit & vegetable diversity', weight: 12, evaluator: 'fruit-veg-diversity' },
    { id: 'wholegrain', label: 'Wholegrains', weight: 7, evaluator: 'wholegrain' },
    { id: 'evidence-linked', label: 'Evidence-linked foods', weight: 5, evaluator: 'evidence-linked' },
  ],
  recommendationRules: [
    {
      id: 'protein-uneven',
      trigger: 'protein-uneven',
      tone: 'suggestion',
      text: 'Breakfast provides {value}g protein while dinner provides more; a more even distribution across meals may help when planning around muscle maintenance, though the outcome evidence for even distribution is limited.',
    },
    {
      id: 'low-calcium-foods',
      trigger: 'low-calcium-foods',
      tone: 'suggestion',
      text: 'These meals are light on calcium-rich foods. Dietary calcium adequacy supports bone health across the transition; consider adding a calcium-rich food.',
    },
    {
      id: 'no-soy-foods',
      trigger: 'no-soy-foods',
      tone: 'suggestion',
      text: 'No soy foods here. Soy isoflavones have been studied for hot flushes — the effect is modest and depends partly on whether you produce equol, but soy is a nutritious protein source to consider.',
    },
    {
      id: 'no-oily-fish',
      trigger: 'no-oily-fish',
      tone: 'suggestion',
      text: 'No oily fish this week. Oily fish is a useful source of omega-3 and vitamin D worth including for general cardiometabolic health.',
    },
    {
      id: 'has-evidence-ingredients',
      trigger: 'has-evidence-ingredients',
      tone: 'positive',
      text: 'Nice — these meals include {list}, foods with a menopause-relevant evidence entry.',
    },
    {
      id: 'supplement-context',
      trigger: 'supplement-context',
      tone: 'suggestion',
      text: 'If you are considering supplements, review the evidence entries and discuss with a clinician. None of these foods or supplements replaces HRT, which has a different and stronger evidence base.',
    },
  ],
  outcomeFilterGroups: [
    'Vasomotor & sleep',
    'Mood',
    'Bone',
    'Muscle & bone',
    'Cardiometabolic',
    'Quality of life',
  ],
  disclaimer:
    'This menopause layer is nutrition education only. It is not medical advice and is not a replacement for hormone replacement therapy (HRT) or other treatments, which have a larger evidence base and a different clinical role. Bone mineral density figures are surrogate markers, not fracture outcomes — no food or supplement shown here reduces fractures. Always discuss symptom management, bone protection and any supplement with a qualified clinician.',
  researchMethodologyNotes: [
    'Bone mineral density (BMD) is a surrogate marker. A change in BMD is not the same as a change in fracture risk, and no food or supplement listed here has been shown to reduce fractures.',
    'Hot-flush trials show a large placebo response (often a 20–40% reduction on placebo alone), so apparently positive results must be judged against placebo, not against baseline.',
    'Creatine’s benefits for muscle and strength are conditional on resistance training; the exercise, not the supplement alone, drives the effect.',
    'Botanical extracts (black cohosh, red clover, soy isoflavone concentrates) do not generalise across products — results are specific to the exact extract, dose and standardisation tested.',
    'HRT has a different and substantially stronger evidence base than any of these nutritional interventions and remains first-line for troublesome vasomotor symptoms under NICE NG23.',
  ],
};

export const menopauseEvidence: ConditionEvidenceItem[] = [
  // 1) Soy foods & isoflavones ------------------------------------------------
  {
    id: 'menopause-soy-isoflavones',
    interventionName: 'Soy foods & isoflavones',
    interventionType: 'food',
    aliases: ['soy isoflavones', 'genistein', 'daidzein', 'soya', 'soy protein', 'phytoestrogens'],
    mechanismSummary:
      'Soy isoflavones (genistein, daidzein) are dietary phytoestrogens that bind oestrogen receptors — preferentially ERβ — acting as weak, tissue-selective partial agonists. In a subset of people, gut bacteria convert daidzein to the more potent metabolite equol, which appears to explain much of the between-person variation in response.',
    studiedDose: '~40–80 mg isoflavones/day (genistein aglycone >18.8 mg/day associated with roughly double the effect)',
    studiedDuration: '6 weeks to 12 months across trials',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'Meta-analyses in menopausal women show modest reductions in hot-flush frequency and severity, small LDL reductions, a spine-BMD surrogate signal, and blood-pressure effects limited to hypertensive women.',
        overallNote:
          'Soy does NOT raise circulating oestrogen the way HRT does, and isoflavone intake is neutral-to-protective for breast-cancer risk in the available epidemiology. The benefit for hot flushes is real but smaller and slower than HRT, and effects differ between whole soy foods and high-dose isoflavone supplements. Equol-producer status matters.',
        studiedPopulation: 'Peri- and postmenopausal women; some trials enriched for or stratified by equol-producer status.',
        limitations: [
          'High risk of bias in many included trials (Franco 2016: ~74% high risk of bias).',
          'Large placebo response in hot-flush trials.',
          'Response depends partly on equol-producer status, which most trials did not measure.',
          'BMD signal is a spine surrogate; other meta-analyses are null and there is no fracture data.',
        ],
        outcomes: [
          {
            outcomeId: 'hot-flush-frequency',
            label: 'Hot flush frequency',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'Taku 2012 (meta-analysis of RCTs): isoflavones reduced hot-flush frequency by ~20.6%, with genistein-rich preparations (>18.8 mg/day) roughly twice as potent. Franco 2016 (JAMA): phytoestrogens −1.31 flushes/day, a modest effect. Cochrane (Lethaby 2013) found no conclusive overall benefit but consistent reductions with high-dose genistein extracts.',
            clinicalRelevance:
              'A modest, genuine reduction — smaller than HRT — and partly dependent on whether the individual produces equol.',
            referenceIds: ['taku-2012-soy', 'franco-2016-jama', 'lethaby-2013-cochrane-phyto'],
          },
          {
            outcomeId: 'hot-flush-severity',
            label: 'Hot flush severity',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary: 'Taku 2012 reported a ~26.2% reduction in hot-flush severity alongside the frequency reduction.',
            referenceIds: ['taku-2012-soy'],
          },
          {
            outcomeId: 'ldl-cholesterol',
            label: 'LDL cholesterol',
            category: 'biochemical-marker',
            direction: 'reduced',
            evidenceLevel: 'C',
            summary:
              'Taku 2007 (meta-analysis of 11 RCTs): soy isoflavones lowered LDL by ~3.6% and total cholesterol by ~1.8%, with the strongest effect from whole soy foods.',
            clinicalRelevance: 'A small surrogate-marker improvement, not a demonstrated reduction in cardiovascular events.',
            referenceIds: ['taku-2007-soy-lipids'],
          },
          {
            outcomeId: 'bone-mineral-density',
            label: 'Bone mineral density (spine, surrogate)',
            category: 'biochemical-marker',
            direction: 'increased',
            evidenceLevel: 'C',
            summary:
              'Ma 2008 (meta-analysis): soy isoflavone intake increased spine BMD (+20.6 mg/cm²), a surrogate marker. Other meta-analyses are null and there is no fracture data.',
            clinicalRelevance: 'BMD is a surrogate — this is not evidence of reduced fracture risk.',
            referenceIds: ['ma-2008-soy-bmd'],
          },
          {
            outcomeId: 'blood-pressure',
            label: 'Blood pressure',
            category: 'biochemical-marker',
            direction: 'mixed',
            evidenceLevel: 'C',
            summary:
              'Liu 2012 (meta-analysis): no effect on blood pressure overall, with a significant reduction seen only in hypertensive women.',
            referenceIds: ['liu-2012-soy-bp'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Soy foods are safe as part of a normal diet. Isoflavone intake does not meaningfully raise circulating oestradiol, oestrone or SHBG, and epidemiology shows no increase (and possible reduction) in breast-cancer risk. High-dose isoflavone supplements differ from whole soy foods and are less well characterised. As general guidance, soy taken close to oral levothyroxine may reduce its absorption — if you take thyroid medication, separate the timing and discuss with your clinician.',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: ['tofu', 'edamame', 'soy', 'soya', 'tempeh', 'miso'],
    isSupplement: false,
    referenceIds: [
      'taku-2012-soy',
      'franco-2016-jama',
      'lethaby-2013-cochrane-phyto',
      'taku-2007-soy-lipids',
      'ma-2008-soy-bmd',
      'liu-2012-soy-bp',
      'hooper-2009-soy-hormones',
      'chen-2014-soy-breast',
    ],
    lastEvidenceReview: '2026-07-12',
  },

  // 2) S-equol supplement -----------------------------------------------------
  {
    id: 'menopause-s-equol',
    interventionName: 'S-equol supplement',
    interventionType: 'supplement',
    aliases: ['s-equol', 'equol', 'natural s-equol'],
    mechanismSummary:
      'S-equol is the active gut-bacterial metabolite of the soy isoflavone daidzein and a selective ERβ partial agonist. Only some people (“equol producers”) make it from soy; a supplement supplies it directly, which is the rationale for trials in non-producers.',
    studiedDose: '10 mg/day',
    studiedDuration: '12 weeks',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'In equol non-producers, an S-equol supplement reduced hot-flush frequency more than placebo in RCT and meta-analysis.',
        overallNote:
          'Targeted at people who cannot make equol from soy. The effect is meaningful but demonstrated in small populations, and it is not equivalent to HRT.',
        studiedPopulation: 'Postmenopausal women who are equol non-producers (e.g. Japanese cohort in Aso 2012).',
        limitations: [
          'Studied specifically in equol non-producers; less relevant to natural producers.',
          'Small total sample across trials (Daily 2019 meta-analysis, ~728 subjects).',
        ],
        outcomes: [
          {
            outcomeId: 'hot-flush-frequency',
            label: 'Hot flush frequency',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'B',
            summary:
              'Aso 2012 (RCT, n=160): 10 mg/day S-equol reduced hot flushes by 58.7% vs 34.5% on placebo in equol non-producers. Daily 2019 (meta-analysis) confirmed a significant benefit concentrated in non-producers.',
            clinicalRelevance: 'A useful option for non-producers who do not respond to dietary soy.',
            referenceIds: ['aso-2012-sequol', 'daily-2019-equol'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Well tolerated in the trials to date at 10 mg/day. Long-term and breast-tissue safety data are limited, as with other isoflavone products.',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['aso-2012-sequol', 'daily-2019-equol'],
    lastEvidenceReview: '2026-07-12',
  },

  // 3) Creatine ---------------------------------------------------------------
  {
    id: 'menopause-creatine',
    interventionName: 'Creatine',
    interventionType: 'supplement',
    aliases: ['creatine monohydrate', 'creatine supplement'],
    mechanismSummary:
      'Creatine increases muscle phosphocreatine stores, supporting rapid ATP regeneration during high-intensity effort. The plausible benefit in postmenopausal women is as an adjunct that lets resistance training produce greater gains in strength and possibly bone geometry — the training is the stimulus.',
    studiedDose: '3–5 g/day (or 0.1–0.14 g/kg/day); loading optional',
    studiedDuration: '8 weeks to 2 years',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'As an adjunct to resistance training, creatine modestly improves upper-body strength in older/postmenopausal women. A 2-year RCT found no BMD benefit (only femoral-neck geometry), lean-mass effects are mixed, and cognition data are insufficient.',
        overallNote:
          'Creatine ALONE, without resistance training, is unproven for muscle or strength in this population — the resistance training drives the effect and creatine is only a training adjunct. The idea that “creatine damages women’s kidneys” is not supported in people with healthy kidneys: the small rise in serum creatinine is a metabolic artifact of creatine turnover, not evidence of renal injury (see safety).',
        studiedPopulation: 'Postmenopausal and older women, most trials combining creatine with a supervised resistance-training programme.',
        limitations: [
          'Strength and muscle effects are conditional on resistance training and mainly seen with programmes ≥24 weeks.',
          'The 2-year RCT was null for BMD at all sites.',
          'Cognition data come from a single small (n=36) trial using non-monohydrate forms.',
        ],
        outcomes: [
          {
            outcomeId: 'muscle-strength',
            label: 'Muscle strength',
            category: 'clinical-outcome',
            direction: 'improved',
            evidenceLevel: 'B',
            summary:
              'dos Santos 2021 (meta-analysis): creatine improved (mainly upper-body) strength in older women, but ONLY as an adjunct to resistance training and predominantly in programmes of ≥24 weeks.',
            clinicalRelevance: 'Benefit requires concurrent resistance training; creatine alone is not shown to improve strength.',
            referenceIds: ['dossantos-2021-creatine'],
          },
          {
            outcomeId: 'bone-mineral-density',
            label: 'Bone mineral density (surrogate)',
            category: 'biochemical-marker',
            direction: 'no-significant-effect',
            evidenceLevel: 'C',
            summary:
              'Chilibeck 2023 (2-year RCT, n=237): no effect on BMD at the femoral neck, total hip or lumbar spine; only two femoral-neck geometric strength indices were preserved. The earlier 12-month trial (Chilibeck 2015) attenuated femoral-neck BMD loss but had only 33 completers.',
            clinicalRelevance: 'BMD null over 2 years; any signal is limited to bone geometry, a surrogate, with no fracture data.',
            referenceIds: ['chilibeck-2023-creatine', 'chilibeck-2015-creatine'],
          },
          {
            outcomeId: 'lean-mass',
            label: 'Lean mass',
            category: 'clinical-outcome',
            direction: 'mixed',
            evidenceLevel: 'C',
            summary: 'Chilibeck 2023 and related trials show inconsistent effects of creatine on lean mass in postmenopausal women.',
            referenceIds: ['chilibeck-2023-creatine'],
          },
          {
            outcomeId: 'cognition',
            label: 'Cognition',
            category: 'clinical-outcome',
            direction: 'insufficient-evidence',
            evidenceLevel: 'C',
            summary:
              'Korovljev 2025 (RCT, n=36, non-monohydrate forms, 8 weeks): reaction time improved on some measures, but the trial is small, short and hypothesis-generating.',
            referenceIds: ['korovljev-2025-creatine'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Creatine is well tolerated in healthy adults. It does not impair kidney function in people with healthy kidneys: the small, transient rise in serum creatinine reflects increased creatine turnover (a laboratory artifact), not reduced glomerular filtration. Caution is retained for pre-existing kidney disease, where creatine should be discussed with a clinician.',
      contraindications: ['Pre-existing kidney disease (use only with clinical supervision)'],
      medicationInteractions: [
        {
          medicationOrClass: 'Nephrotoxic drugs',
          status: 'insufficient-information',
          summary:
            'No established interaction in healthy kidneys; combined use with nephrotoxic medication or in kidney disease has not been well studied.',
          referenceIds: ['longobardi-2023-creatine-kidney', 'bmc-2025-creatine-kidney'],
        },
      ],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: [
      'dossantos-2021-creatine',
      'chilibeck-2023-creatine',
      'chilibeck-2015-creatine',
      'korovljev-2025-creatine',
      'longobardi-2023-creatine-kidney',
      'bmc-2025-creatine-kidney',
    ],
    lastEvidenceReview: '2026-07-12',
  },

  // 4) Calcium supplements ----------------------------------------------------
  {
    id: 'menopause-calcium-supplements',
    interventionName: 'Calcium supplements',
    interventionType: 'nutrient',
    aliases: ['calcium', 'calcium carbonate', 'calcium citrate'],
    mechanismSummary:
      'Calcium is the principal mineral of bone. The rationale for supplementation is to support bone mineralisation, but the clinical question is whether routine supplements (as opposed to dietary adequacy) reduce fractures in generally replete postmenopausal women.',
    studiedDose: '1000 mg/day (with 400 IU vitamin D3 in WHI)',
    studiedDuration: '~7 years (WHI)',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'In large trials and meta-analyses of community-dwelling and postmenopausal populations, routine calcium (with or without vitamin D) did not significantly reduce fractures, while increasing kidney-stone risk and carrying a contested cardiovascular signal.',
        overallNote:
          'The value of calcium is dietary adequacy and correcting deficiency, not routine supplementation for fracture prevention in already-replete women. Supplements are not a substitute for medical bone assessment or treatment where indicated.',
        studiedPopulation: 'Postmenopausal women (WHI) and community-dwelling older adults (Zhao 2017).',
        limitations: [
          'WHI population was largely calcium-replete, so the null does not license deficiency.',
          'Adherent per-protocol subgroups suggested benefit, but intention-to-treat was non-significant.',
          'Increased kidney-stone risk and a contested cardiovascular signal.',
        ],
        outcomes: [
          {
            outcomeId: 'fracture',
            label: 'Fracture',
            category: 'clinical-outcome',
            direction: 'no-significant-effect',
            evidenceLevel: 'D',
            summary:
              'WHI (Jackson 2006): intention-to-treat hip-fracture HR 0.88 (non-significant), with kidney stones increased. Zhao 2017 (JAMA meta-analysis, 33 RCTs, ~51,000 participants): no association between calcium (or vitamin D) supplementation and lower fracture risk in community-dwelling older adults.',
            clinicalRelevance: 'Routine supplementation is not supported for fracture prevention in generally replete women.',
            referenceIds: ['jackson-2006-whi-cad', 'zhao-2017-cad-jama'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Calcium supplements increase the risk of kidney stones (WHI) and carry a contested cardiovascular signal: the BMJ 2010 meta-analysis linked calcium supplements without vitamin D to increased myocardial infarction, though later analyses conflict and dietary calcium is not implicated. Prefer dietary calcium and reserve supplements for genuine deficiency.',
      contraindications: ['History of calcium-containing kidney stones (use with caution)', 'Hypercalcaemia'],
      medicationInteractions: [
        {
          medicationOrClass: 'Calcium supplements (kidney stones / cardiovascular)',
          status: 'potential',
          summary: 'Calcium supplements increased kidney stones in WHI and carry a contested cardiovascular signal; general pharmacology also notes calcium can reduce absorption of levothyroxine, some antibiotics and iron if taken together, so separate dosing by several hours.',
          referenceIds: ['jackson-2006-whi-cad', 'bmj-2010-calcium'],
        },
      ],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['jackson-2006-whi-cad', 'zhao-2017-cad-jama', 'bmj-2010-calcium'],
    lastEvidenceReview: '2026-07-12',
  },

  // 5) Vitamin K2 (MK-7) ------------------------------------------------------
  {
    id: 'menopause-vitamin-k2',
    interventionName: 'Vitamin K2 (MK-7)',
    interventionType: 'supplement',
    aliases: ['vitamin k2', 'menaquinone-7', 'mk-7', 'menaquinone'],
    mechanismSummary:
      'Vitamin K2 (menaquinone-7) is a cofactor for γ-carboxylation of osteocalcin, which binds calcium to the bone matrix. The rationale is that better-carboxylated osteocalcin supports bone mineralisation.',
    studiedDose: '180 µg/day MK-7',
    studiedDuration: '3 years',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary: 'A 3-year RCT in healthy postmenopausal women found low-dose MK-7 slowed the decline in bone mineral density (a surrogate).',
        overallNote:
          'The BMD effect is a surrogate; there is no fracture-endpoint data for MK-7 in this population. Evidence rests largely on a single trial.',
        studiedPopulation: 'Healthy postmenopausal women (Knapen 2013, n=244).',
        limitations: [
          'Surrogate endpoint (BMD), no fracture outcomes.',
          'Evidence largely from a single trial.',
        ],
        outcomes: [
          {
            outcomeId: 'bone-mineral-density',
            label: 'Bone mineral density (surrogate)',
            category: 'biochemical-marker',
            direction: 'improved',
            evidenceLevel: 'B',
            summary:
              'Knapen 2013 (RCT, n=244, 180 µg/day, 3 years): MK-7 slowed the age-related decline in spine and femoral-neck BMD versus placebo.',
            clinicalRelevance: 'A surrogate-marker benefit only; no evidence of fracture reduction.',
            referenceIds: ['knapen-2013-k2'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'MK-7 was well tolerated in the 3-year trial. As established general pharmacology, vitamin K counteracts warfarin and other vitamin K antagonists and can destabilise INR — do not take supplementary vitamin K if you are on these anticoagulants unless your prescriber manages it.',
      contraindications: ['On warfarin or another vitamin K antagonist (unless managed by the prescriber)'],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['knapen-2013-k2'],
    lastEvidenceReview: '2026-07-12',
  },

  // 6) Collagen peptides ------------------------------------------------------
  {
    id: 'menopause-collagen-peptides',
    interventionName: 'Collagen peptides',
    interventionType: 'supplement',
    aliases: ['collagen', 'specific collagen peptides', 'hydrolysed collagen', 'collagen hydrolysate'],
    mechanismSummary:
      'Specific collagen peptides are hydrolysed collagen fragments proposed to stimulate osteoblast activity and bone matrix synthesis. The evidence base is small.',
    studiedDose: '5 g/day specific collagen peptides',
    studiedDuration: '12 months',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary: 'A single manufacturer-linked RCT reported improved bone mineral density (a surrogate) in postmenopausal women.',
        overallNote:
          'Evidence is one manufacturer-linked trial reporting a surrogate BMD outcome; there is no independent replication and no fracture data.',
        studiedPopulation: 'Postmenopausal women (König 2018, n=131).',
        limitations: [
          'Single trial, manufacturer-linked.',
          'Surrogate endpoint (BMD T-score), no fracture data.',
          'No independent replication.',
        ],
        outcomes: [
          {
            outcomeId: 'bone-mineral-density',
            label: 'Bone mineral density (surrogate)',
            category: 'biochemical-marker',
            direction: 'improved',
            evidenceLevel: 'C',
            summary:
              'König 2018 (RCT, n=131, 5 g/day, 12 months): specific collagen peptides increased spine and femoral-neck BMD T-score versus placebo — a surrogate outcome from a single manufacturer-linked study.',
            clinicalRelevance: 'Surrogate-marker signal only; not evidence of reduced fractures.',
            referenceIds: ['konig-2018-collagen'],
          },
        ],
      },
    ],
    safety: {
      safetySummary: 'Collagen peptides were well tolerated in the trial. No significant medication interactions are documented.',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['konig-2018-collagen'],
    lastEvidenceReview: '2026-07-12',
  },

  // 7) Black cohosh -----------------------------------------------------------
  {
    id: 'menopause-black-cohosh',
    interventionName: 'Black cohosh',
    interventionType: 'supplement',
    aliases: ['black cohosh', 'cimicifuga racemosa', 'actaea racemosa'],
    mechanismSummary:
      'Black cohosh (Cimicifuga/Actaea racemosa) is a herbal extract marketed for hot flushes. Its mechanism is unclear and considered non-oestrogenic; it is not a source of oestrogen.',
    studiedDose: 'Standardised extract (products vary; commonly ~40 mg/day)',
    studiedDuration: '12 weeks to 12 months',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'A Cochrane review of 16 RCTs found black cohosh no better than placebo for hot flushes, with poorly reported safety data.',
        overallNote:
          'Black cohosh is NOT “natural HRT”: it is not an oestrogen and, overall, performs no better than placebo. Results do not generalise across the many different commercial extracts. It carries a well-established (LiverTox likelihood A) risk of liver injury and is not recommended after breast cancer.',
        studiedPopulation: 'Peri- and postmenopausal women (Leach 2012 Cochrane review, 16 RCTs, ~2,027 women).',
        limitations: [
          'No significant difference versus placebo overall.',
          'Extracts differ between products, so findings do not generalise.',
          'Safety data poorly reported across trials.',
        ],
        outcomes: [
          {
            outcomeId: 'hot-flush-frequency',
            label: 'Hot flush frequency',
            category: 'symptom',
            direction: 'no-significant-effect',
            evidenceLevel: 'D',
            summary:
              'Leach 2012 (Cochrane, 16 RCTs, ~2,027 women): no significant difference between black cohosh and placebo for hot-flush frequency; safety data poorly reported.',
            clinicalRelevance: 'No reliable benefit over placebo; the large placebo response likely explains anecdotal reports.',
            referenceIds: ['leach-2012-blackcohosh'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Black cohosh is a well-established cause of clinically apparent, idiosyncratic liver injury (LiverTox likelihood score A). It is not recommended after breast cancer. NICE NG23 cautions that the exact preparations and doses are uncertain and that herbal remedies can interact with other medicines.',
      contraindications: ['Avoid after breast cancer', 'Pre-existing liver disease / caution with other hepatotoxic agents'],
      medicationInteractions: [
        {
          medicationOrClass: 'Other medicines (general) and hepatotoxic drugs',
          status: 'potential',
          summary:
            'NICE NG23 warns that herbal remedies including black cohosh may interact with other medicines and that preparation quality varies; combining with hepatotoxic drugs may compound liver risk.',
          referenceIds: ['nice-ng23', 'livertox-blackcohosh'],
        },
      ],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['leach-2012-blackcohosh', 'livertox-blackcohosh', 'bms-whc-2025', 'nice-ng23'],
    lastEvidenceReview: '2026-07-12',
  },

  // 8) Red clover -------------------------------------------------------------
  {
    id: 'menopause-red-clover',
    interventionName: 'Red clover',
    interventionType: 'supplement',
    aliases: ['red clover', 'trifolium pratense', 'red clover isoflavones'],
    mechanismSummary:
      'Red clover (Trifolium pratense) extracts are rich in isoflavones (biochanin A, formononetin), which are phytoestrogens with weak, tissue-selective oestrogen-receptor activity.',
    studiedDose: '40–80 mg isoflavones/day (extract-dependent)',
    studiedDuration: '12 weeks to several months',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary: 'A meta-analysis found red clover extract reduced hot flushes by a small, borderline amount, with results specific to the extracts tested.',
        overallNote:
          'The effect is small (about 1.73 fewer flushes/day) with a wide confidence interval and borderline significance, and it is extract-specific. Not recommended after breast cancer.',
        studiedPopulation: 'Peri- and postmenopausal women (Kanadys 2021 meta-analysis).',
        limitations: [
          'Borderline statistical significance with wide confidence intervals.',
          'Effect is specific to the particular extracts studied.',
        ],
        outcomes: [
          {
            outcomeId: 'hot-flush-frequency',
            label: 'Hot flush frequency',
            category: 'symptom',
            direction: 'reduced',
            evidenceLevel: 'C',
            summary:
              'Kanadys 2021 (meta-analysis): red clover extract reduced hot flushes by ~1.73/day, with a wide confidence interval, borderline p-value and extract-specific results.',
            clinicalRelevance: 'A small, uncertain benefit that does not generalise across products.',
            referenceIds: ['kanadys-2021-redclover'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Generally tolerated, but as a phytoestrogen-rich extract it is not recommended after breast cancer per the British Menopause Society / Women’s Health Concern factsheet, and herbal remedies can interact with other medicines.',
      contraindications: ['Avoid after breast cancer'],
      medicationInteractions: [
        {
          medicationOrClass: 'Anticoagulants and other medicines',
          status: 'potential',
          summary: 'Red clover contains coumarin-related compounds; theoretical additive effect with anticoagulants, and herbal extracts may interact with other medicines.',
          referenceIds: ['bms-whc-2025'],
        },
      ],
    },
    matchKeywords: [],
    isSupplement: true,
    referenceIds: ['kanadys-2021-redclover', 'bms-whc-2025'],
    lastEvidenceReview: '2026-07-12',
  },

  // 9) Higher protein intake --------------------------------------------------
  {
    id: 'menopause-higher-protein',
    interventionName: 'Higher protein intake',
    interventionType: 'dietary-pattern',
    aliases: ['higher protein', 'increased protein intake', 'protein for muscle'],
    mechanismSummary:
      'Adequate dietary protein supplies amino acids for muscle protein synthesis. In postmenopausal women, higher protein is proposed to help offset age- and menopause-related loss of muscle mass and strength — but mainly in the context of resistance exercise.',
    studiedDose: '~1.0–1.2 g/kg/day (with resistance training)',
    studiedDuration: 'Weeks to months (RCTs); years (cohorts)',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'Evidence is mixed: an RCT found no extra lean-mass gain above the RDA when combined with resistance exercise, while cohort data associate higher protein with better lean mass and grip strength.',
        overallNote:
          'Aim for roughly 1.0–1.2 g/kg/day alongside resistance exercise. The training dominates the effect; extra protein on its own, above adequate intake, has not clearly added lean mass in trials.',
        studiedPopulation: 'Postmenopausal women (Rossato 2017 RCT; WHI and Framingham cohorts) and older adults.',
        limitations: [
          'RCT (Rossato 2017) showed no benefit of 1.2 vs 0.8 g/kg/day over the RDA with resistance exercise.',
          'Cohort associations (WHI, Framingham) are observational and confounded.',
          'Benefit is tied to concurrent resistance exercise.',
        ],
        outcomes: [
          {
            outcomeId: 'lean-mass',
            label: 'Lean mass',
            category: 'clinical-outcome',
            direction: 'mixed',
            evidenceLevel: 'B',
            summary:
              'Rossato 2017 (RCT, n=23): 1.2 vs 0.8 g/kg/day gave no extra lean-mass gain over the RDA during resistance exercise. Cohort data (Martinez 2017 WHI: highest quintile +6.3–8.5% lean mass; McLean 2016 Framingham: protective against grip-strength decline) associate higher protein with better outcomes.',
            clinicalRelevance: 'Adequate protein plus resistance training matters; extra protein above adequacy has uncertain added benefit.',
            referenceIds: ['rossato-2017-protein', 'martinez-2017-protein', 'mclean-2016-protein'],
          },
          {
            outcomeId: 'muscle-strength',
            label: 'Muscle strength',
            category: 'clinical-outcome',
            direction: 'improved',
            evidenceLevel: 'C',
            summary:
              'Guo 2022 (meta-analysis of 17 RCTs): isolated leucine was null, but leucine combined with vitamin D improved grip strength and gait speed in older adults — consistent with protein quality mattering alongside other factors.',
            referenceIds: ['guo-2022-leucine'],
          },
        ],
      },
    ],
    safety: {
      safetySummary:
        'Protein intakes around 1.0–1.2 g/kg/day are safe for people with healthy kidneys. Those with significant kidney disease should individualise protein intake with a clinician or dietitian.',
      contraindications: ['Advanced kidney disease (individualise with a clinician)'],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['rossato-2017-protein', 'martinez-2017-protein', 'mclean-2016-protein', 'guo-2022-leucine'],
    lastEvidenceReview: '2026-07-12',
  },

  // 10) Even protein distribution across meals --------------------------------
  {
    id: 'menopause-protein-distribution',
    interventionName: 'Even protein distribution across meals',
    interventionType: 'dietary-pattern',
    aliases: ['protein distribution', 'even protein spread', 'balanced protein meals'],
    mechanismSummary:
      'Spreading protein evenly across meals (rather than skewing it toward dinner) is proposed to maximise the number of times daily that the per-meal leucine threshold for muscle protein synthesis is reached.',
    studiedDose: 'Even ~25–30 g protein at each of 3 meals',
    studiedDuration: 'Acute (24 h) to a few weeks',
    conditions: [
      {
        conditionId: 'menopause',
        specificity: 'condition-specific',
        evidenceSummary:
          'Evidence is mixed and indirect: one small acute study in non-menopausal adults showed higher 24-h muscle protein synthesis with even distribution, while an RCT in older adults found no difference at the muscle level.',
        overallNote:
          'Even protein distribution is plausible and harmless, but the strongest supporting evidence is a single 8-person acute study, and no trial has tested a menopause-specific clinical outcome. Reasonable to try, but do not overstate.',
        studiedPopulation: 'Healthy adults (Mamerow 2014, n=8, mean age ~37) and healthy older adults (Agergaard 2023) — not menopause cohorts.',
        limitations: [
          'Mamerow 2014 is small (n=8), acute and in non-menopausal adults.',
          'Agergaard 2023 found no difference in muscle fractional synthesis rate in older adults.',
          'No menopause-specific outcome trial exists.',
        ],
        outcomes: [
          {
            outcomeId: 'muscle-protein-synthesis',
            label: 'Muscle protein synthesis',
            category: 'biochemical-marker',
            direction: 'mixed',
            evidenceLevel: 'C',
            summary:
              'Mamerow 2014 (RCT, n=8, acute): even 30 g×3 distribution gave ~25% higher 24-h muscle protein synthesis than a skewed pattern. Agergaard 2023 (RCT in older adults): no difference in muscle fractional synthesis rate between even and skewed distribution.',
            clinicalRelevance: 'A short-term biomarker signal, not a demonstrated change in muscle mass or strength; plausible and harmless.',
            referenceIds: ['mamerow-2014-protein', 'agergaard-2023-protein'],
          },
        ],
      },
    ],
    safety: {
      safetySummary: 'Redistributing protein across meals carries no specific safety concern within a normal total protein intake.',
      contraindications: [],
      medicationInteractions: [],
    },
    matchKeywords: [],
    isSupplement: false,
    referenceIds: ['mamerow-2014-protein', 'agergaard-2023-protein'],
    lastEvidenceReview: '2026-07-12',
  },
];
