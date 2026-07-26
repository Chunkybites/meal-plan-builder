import type { PopularClaim } from '../types';

/**
 * "Popular claim vs what the evidence shows" cards. Neutral and non-mocking:
 * each credits the kernel of truth and distinguishes "unproven" from "disproven".
 * Ratings grade the STRONG version of the claim.
 */
export const POPULAR_CLAIMS: PopularClaim[] = [
  {
    id: 'claim-spearmint',
    conditionIds: ['pcos'],
    claim: 'Spearmint tea lowers testosterone and clears PCOS-related hair growth.',
    whatEvidenceShows:
      'The one randomised trial (n=42, 30 days) found free and total testosterone fell significantly — but the objective clinician-rated hirsutism score did NOT differ from placebo (p=0.12). Only patients’ subjective self-rating improved.',
    whyMisleading:
      'The biochemical part has genuine, if modest, single-trial support. But "lowers testosterone" is often stretched to "clears the hair", which the trial did not show — and 30 days is far too short for hair-growth cycles to respond.',
    evidenceLevel: 'C',
    referenceIds: ['grant-2010-spearmint', 'akdogan-2007-spearmint'],
  },
  {
    id: 'claim-40to1',
    conditionIds: ['pcos'],
    claim: 'The 40:1 myo:D-chiro-inositol ratio is the scientifically proven optimal PCOS formulation.',
    whatEvidenceShows:
      '40:1 is the physiological plasma ratio, which is the rationale. Direct evidence traces to one small open-label trial comparing seven ratios (~8 women per arm) plus review/commentary articles. No large blinded independent RCT establishes 40:1 as superior.',
    whyMisleading:
      '"Physiologically plausible and most-marketed" is being upgraded to "proven optimal". Inositol in general has some PCOS evidence, but the ratio-optimality specifically is not established, and much of the literature is from a closely linked group of researchers.',
    evidenceLevel: 'D',
    referenceIds: ['nordio-2019-40to1', 'monastra-2017', 'roseff-2020', 'fitz-2024'],
  },
  {
    id: 'claim-seed-cycling',
    conditionIds: ['pcos', 'menopause'],
    claim: 'Seed cycling (rotating seeds by cycle phase) balances hormones.',
    whatEvidenceShows:
      'A 2025 systematic review found associations between eating some seeds (flax, sesame) and menstrual/PMS measures, but the studies test individual seeds — NOT the specific follicular/luteal phase-rotation protocol, which has essentially no controlled evidence.',
    whyMisleading:
      'Evidence that some seeds are nutritious is repackaged as validation of the phase-timed rotation, which is the actual distinctive (and untested) claim. "Balances hormones" is also non-specific and not a clinical endpoint.',
    evidenceLevel: 'D',
    referenceIds: ['nagarajan-2025-seedcycling'],
  },
  {
    id: 'claim-gluten-endo',
    conditionIds: ['endometriosis'],
    claim: 'Gluten causes endometriosis, so going gluten-free treats the disease.',
    whatEvidenceShows:
      'The cited study is a retrospective, uncontrolled report of 207 women; 75% reported less pain on a gluten-free diet, but there was no control group, no coeliac screening, and it measured pain in existing disease — not causation. A critical review concludes the case is unproven.',
    whyMisleading:
      'A symptom-improvement signal in an uncontrolled study is inflated into a causal claim. Some people may still get subjective relief, but nothing shows gluten causes endometriosis or that a gluten-free diet affects lesions.',
    evidenceLevel: 'D',
    referenceIds: ['marziali-2012-gf', 'brouns-2023-gluten'],
  },
  {
    id: 'claim-dairy-inflammatory',
    conditionIds: ['pcos', 'endometriosis', 'menopause'],
    claim: 'Dairy is inflammatory.',
    whatEvidenceShows:
      'A systematic review of 16 randomised trials found dairy did NOT produce a pro-inflammatory effect; most studies showed a neutral or anti-inflammatory effect on markers such as CRP, IL-6 and TNF-α. In endometriosis cohorts, higher dairy tracked with lower risk.',
    whyMisleading:
      'The population-level "dairy is inflammatory" claim is contradicted by controlled evidence. A true dairy allergy or lactose intolerance can cause symptoms in individuals — but that is different from a general inflammatory effect.',
    evidenceLevel: 'D',
    referenceIds: ['ulven-2019-dairy', 'harris-2013-dairy'],
  },
  {
    id: 'claim-soy-oestrogen',
    conditionIds: ['menopause', 'pcos'],
    claim: 'Soy raises oestrogen and is dangerous for women.',
    whatEvidenceShows:
      'A meta-analysis found no significant effect of soy/isoflavones on estradiol, estrone or SHBG. Isoflavones are weak phytoestrogens that do not raise oestradiol the way HRT does. For breast cancer, soy intake is associated with lower risk in Asian populations and no association in Western women.',
    whyMisleading:
      'Structural similarity to oestrogen is being treated as functional equivalence. Food-level soy (tofu, edamame, soy milk) does not behave like oestrogen therapy. Very high-dose isolated isoflavone supplements are a separate, less-characterised question.',
    evidenceLevel: 'D',
    referenceIds: ['hooper-2009-soy-hormones', 'chen-2014-soy-breast'],
  },
  {
    id: 'claim-creatine-kidneys',
    conditionIds: ['menopause'],
    claim: 'Creatine damages women’s kidneys.',
    whatEvidenceShows:
      'Controlled evidence finds no impairment of kidney function in people with healthy kidneys. Creatine modestly raises the serum creatinine marker because creatine converts to creatinine — a measurement artifact, not kidney damage.',
    whyMisleading:
      'The claim confuses a rise in the creatinine marker with actual injury and generalises from case reports or pre-existing disease to healthy users. There is no evidence that healthy women’s kidneys are uniquely vulnerable. Caution remains sensible for those with existing kidney disease.',
    evidenceLevel: 'D',
    referenceIds: ['longobardi-2023-creatine-kidney', 'bmc-2025-creatine-kidney'],
  },
  {
    id: 'claim-black-cohosh-hrt',
    conditionIds: ['menopause'],
    claim: 'Black cohosh is a natural equivalent of HRT.',
    whatEvidenceShows:
      'Black cohosh is not an oestrogen (its activity is likely non-hormonal). The Cochrane review of 16 RCTs found no significant difference from placebo for hot flushes; HRT clearly outperforms it. It also carries a documented (if rare) liver-injury signal.',
    whyMisleading:
      '"Natural HRT" implies both an oestrogenic mechanism and HRT-like efficacy — neither is established. "Natural = safe" also omits the hepatotoxicity caution. Individual trials are mixed, so it is not "proven useless" — but it is not equivalent to HRT.',
    evidenceLevel: 'D',
    referenceIds: ['leach-2012-blackcohosh', 'livertox-blackcohosh'],
  },
];
