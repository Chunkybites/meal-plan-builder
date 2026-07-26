import type { RecipeUnit } from './types';

/**
 * Reviewed household-measure → gram conversions. Every conversion is editable and
 * traceable (each carries a `note`/`source`). ALL nutrition maths ultimately uses
 * grams.
 *
 * Rule: we do NOT assume 1 ml = 1 g. Volume→gram uses an explicit density, and a
 * warning is emitted when a density has to be assumed for an unrecognised liquid.
 */

export interface GramResolution {
  grams: number;
  note: string;
  warnings: string[];
  /** True when a value was assumed rather than from a reviewed record. */
  assumed: boolean;
}

/** Density in g/ml for volume→gram conversion, by ingredient keyword. */
interface DensityRecord {
  keywords: string[];
  gPerMl: number;
  note: string;
}
const DENSITIES: DensityRecord[] = [
  { keywords: ['olive oil', 'rapeseed oil', 'vegetable oil', 'sunflower oil', 'oil'], gPerMl: 0.918, note: 'Culinary oil density ≈ 0.918 g/ml.' },
  { keywords: ['honey'], gPerMl: 1.42, note: 'Honey density ≈ 1.42 g/ml.' },
  { keywords: ['maple syrup', 'golden syrup', 'syrup'], gPerMl: 1.37, note: 'Syrup density ≈ 1.37 g/ml.' },
  { keywords: ['milk', 'semi-skimmed', 'whole milk', 'skimmed'], gPerMl: 1.03, note: 'Cow’s milk density ≈ 1.03 g/ml.' },
  { keywords: ['soy milk', 'soya milk', 'oat milk', 'almond milk', 'plant milk'], gPerMl: 1.03, note: 'Plant milk density ≈ 1.03 g/ml.' },
  { keywords: ['yoghurt', 'yogurt', 'kefir'], gPerMl: 1.03, note: 'Yoghurt density ≈ 1.03 g/ml.' },
  { keywords: ['stock', 'broth', 'passata', 'juice', 'water', 'soy sauce', 'tamari', 'vinegar'], gPerMl: 1.0, note: 'Aqueous liquid — density ≈ 1.0 g/ml.' },
];
const DEFAULT_AQUEOUS_DENSITY = 1.0;

/** Reviewed per-item / per-spoon gram weights, by ingredient keyword + unit. */
interface HouseholdRecord {
  keywords: string[]; // matched against the ingredient name (lower-case, substring)
  unit: RecipeUnit;
  grams: number;
  note: string;
}
const HOUSEHOLD: HouseholdRecord[] = [
  // Eggs
  { keywords: ['egg'], unit: 'large', grams: 58, note: '1 large egg ≈ 58 g (edible, no shell).' },
  { keywords: ['egg'], unit: 'medium', grams: 50, note: '1 medium egg ≈ 50 g.' },
  { keywords: ['egg'], unit: 'small', grams: 45, note: '1 small egg ≈ 45 g.' },
  { keywords: ['egg'], unit: 'item', grams: 55, note: '1 egg ≈ 55 g (assumed medium–large).' },
  // Fruit (edible portion)
  { keywords: ['banana'], unit: 'medium', grams: 118, note: '1 medium banana ≈ 118 g edible.' },
  { keywords: ['banana'], unit: 'large', grams: 136, note: '1 large banana ≈ 136 g edible.' },
  { keywords: ['banana'], unit: 'small', grams: 101, note: '1 small banana ≈ 101 g edible.' },
  { keywords: ['apple'], unit: 'medium', grams: 150, note: '1 medium apple ≈ 150 g edible.' },
  { keywords: ['avocado'], unit: 'medium', grams: 100, note: '½–1 medium avocado flesh; 1 medium ≈ 100 g flesh.' },
  { keywords: ['lemon', 'lime'], unit: 'item', grams: 60, note: '1 lemon/lime ≈ 60 g.' },
  { keywords: ['tomato', 'cherry tomato'], unit: 'item', grams: 15, note: '1 cherry tomato ≈ 15 g; adjust for larger tomatoes.' },
  { keywords: ['tomato'], unit: 'medium', grams: 120, note: '1 medium tomato ≈ 120 g.' },
  // Bread / grains
  { keywords: ['bread', 'toast', 'rye', 'wholemeal'], unit: 'slice', grams: 40, note: '1 medium slice of bread ≈ 40 g.' },
  { keywords: ['flatbread', 'wrap', 'tortilla'], unit: 'large', grams: 60, note: '1 large flatbread/wrap ≈ 60 g.' },
  { keywords: ['cracker', 'oatcake', 'crispbread'], unit: 'item', grams: 10, note: '1 cracker/oatcake ≈ 10 g.' },
  // Vegetables sold by the piece
  { keywords: ['potato'], unit: 'large', grams: 300, note: '1 large baking potato ≈ 300 g.' },
  { keywords: ['pepper', 'capsicum'], unit: 'medium', grams: 160, note: '1 medium pepper ≈ 160 g edible.' },
  { keywords: ['onion'], unit: 'medium', grams: 110, note: '1 medium onion ≈ 110 g.' },
  { keywords: ['onion'], unit: 'small', grams: 70, note: '1 small onion ≈ 70 g.' },
  { keywords: ['spring onion'], unit: 'item', grams: 15, note: '1 spring onion ≈ 15 g.' },
  { keywords: ['carrot'], unit: 'medium', grams: 90, note: '1 medium carrot ≈ 90 g.' },
  { keywords: ['carrot'], unit: 'large', grams: 130, note: '1 large carrot ≈ 130 g.' },
  { keywords: ['courgette'], unit: 'medium', grams: 200, note: '1 medium courgette ≈ 200 g.' },
  { keywords: ['cucumber'], unit: 'medium', grams: 300, note: '1 medium cucumber ≈ 300 g (recipes usually use part).' },
  { keywords: ['celery'], unit: 'item', grams: 40, note: '1 celery stick ≈ 40 g.' },
  { keywords: ['olive'], unit: 'item', grams: 4, note: '1 olive ≈ 4 g.' },
  { keywords: ['lettuce', 'gem'], unit: 'handful', grams: 25, note: '1 handful of lettuce ≈ 25 g.' },
  { keywords: ['stock cube'], unit: 'item', grams: 10, note: '1 stock cube ≈ 10 g.' },
  // Aromatics
  { keywords: ['garlic'], unit: 'clove', grams: 4, note: '1 garlic clove ≈ 4 g.' },
  // Spoons of common solids
  { keywords: ['cinnamon', 'turmeric', 'ground'], unit: 'tsp', grams: 2.6, note: '1 tsp ground spice ≈ 2.6 g.' },
  { keywords: ['peanut butter', 'nut butter', 'tahini'], unit: 'tbsp', grams: 16, note: '1 tbsp nut butter ≈ 16 g.' },
  { keywords: ['peanut butter', 'nut butter'], unit: 'tsp', grams: 5.3, note: '1 tsp nut butter ≈ 5.3 g.' },
  { keywords: ['flaxseed', 'linseed', 'chia'], unit: 'tbsp', grams: 10, note: '1 tbsp seeds ≈ 10 g.' },
  { keywords: ['flaxseed', 'linseed', 'chia'], unit: 'tsp', grams: 3.3, note: '1 tsp seeds ≈ 3.3 g.' },
  // Protein powder scoop
  { keywords: ['protein', 'whey', 'casein'], unit: 'scoop', grams: 30, note: '1 protein scoop ≈ 30 g.' },
  // Leafy handful
  { keywords: ['spinach', 'rocket', 'salad', 'leaves', 'kale', 'watercress'], unit: 'handful', grams: 25, note: '1 handful of leaves ≈ 25 g.' },
  { keywords: ['berries', 'blueberr', 'raspberr'], unit: 'handful', grams: 40, note: '1 handful of berries ≈ 40 g.' },
];

/** Generic spoon volumes (ml) when the solid has no reviewed spoon record. */
const SPOON_ML: Partial<Record<RecipeUnit, number>> = { tsp: 5, tbsp: 15 };
/** Generic fallbacks for count-ish units when no reviewed record matches. */
const GENERIC_FALLBACK_GRAMS: Partial<Record<RecipeUnit, number>> = {
  pinch: 0.4,
  handful: 30,
  scoop: 30,
  slice: 30,
  clove: 4,
  item: 60,
  small: 60,
  medium: 90,
  large: 120,
  portion: 100,
};

function nameHas(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase();
  return keywords.some((k) => n.includes(k));
}

function densityFor(name: string): { gPerMl: number; note: string; assumed: boolean } {
  for (const d of DENSITIES) if (nameHas(name, d.keywords)) return { gPerMl: d.gPerMl, note: d.note, assumed: false };
  return { gPerMl: DEFAULT_AQUEOUS_DENSITY, note: 'Unrecognised liquid — assumed density 1.0 g/ml.', assumed: true };
}

/**
 * Resolve a recipe ingredient's quantity+unit to grams, with traceability.
 * The result is used to author reviewed RecipeIngredientFoodLink.gramWeight.
 */
export function resolveGrams(name: string, quantity: number, unit: RecipeUnit): GramResolution {
  if (unit === 'g') return { grams: quantity, note: 'Direct gram weight.', warnings: [], assumed: false };

  if (unit === 'ml') {
    const d = densityFor(name);
    return {
      grams: round1(quantity * d.gPerMl),
      note: `${quantity} ml × ${d.gPerMl} g/ml. ${d.note}`,
      warnings: d.assumed ? ['Volume→gram used an assumed density (1.0 g/ml).'] : [],
      assumed: d.assumed,
    };
  }

  // Reviewed household record?
  const rec = HOUSEHOLD.find((h) => h.unit === unit && nameHas(name, h.keywords));
  if (rec) return { grams: round1(quantity * rec.grams), note: `${quantity} × ${rec.grams} g. ${rec.note}`, warnings: [], assumed: false };

  // Spoon of an unlisted solid → volume via density.
  if ((unit === 'tsp' || unit === 'tbsp') && SPOON_ML[unit]) {
    const d = densityFor(name);
    const grams = round1(quantity * (SPOON_ML[unit] as number) * d.gPerMl);
    return { grams, note: `${quantity} ${unit} ≈ ${quantity * (SPOON_ML[unit] as number)} ml × ${d.gPerMl} g/ml.`, warnings: ['Spoon→gram estimated from volume; add a reviewed record for accuracy.'], assumed: true };
  }

  const fallback = GENERIC_FALLBACK_GRAMS[unit];
  if (fallback !== undefined) {
    return { grams: round1(quantity * fallback), note: `${quantity} × ${fallback} g (generic ${unit} fallback).`, warnings: [`No reviewed ${unit} record for "${name}" — used a generic fallback.`], assumed: true };
  }

  return { grams: 0, note: 'Unresolved unit.', warnings: [`Could not resolve unit "${unit}" for "${name}".`], assumed: true };
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}
