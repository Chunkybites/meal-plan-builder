import type { RecipeIngredientFoodLink } from '../food/types';
import { PILOT_LINKS } from './pilotLinks';
import { BATCH2_LINKS } from './batch2Links';
import { LEGACY_LINKS, LEGACY_FULLY_LINKED_IDS } from './legacyLinks';
import { BATCH3_LINKS, BATCH3_FULLY_LINKED_IDS } from './batch3Links';
import { BATCH4_LINKS, BATCH4_FULLY_LINKED_IDS } from './batch4Links';

/**
 * Reviewed ingredient → canonical-food links. Each recipe ingredient is matched
 * ONCE to a canonical food, with a resolved gram weight and an explicit
 * quantity basis (raw/cooked/drained). Nutrition is then calculated from the
 * stored food record — changing API search results can NEVER silently alter an
 * existing recipe's nutrition.
 *
 * `recipeIngredientId` = `${recipeId}::${ingredient name lower-cased}`.
 *
 * NOTE: this demonstration set covers recipes fully resolvable by the reviewed
 * seed foods (`src/data/food/seedFoods.ts`). The full 49-recipe migration runs
 * once the official CoFID dataset is imported (see scripts/import-cofid.ts) and
 * more canonical foods exist. `scripts/migrate-recipes.ts` reports the calculated
 * vs previously hand-authored discrepancy for every linked recipe.
 */

const REVIEWED = '2026-07-12';

export const INGREDIENT_LINKS: RecipeIngredientFoodLink[] = [
  // bf-protein-porridge — 1 serving as authored. Linked to reviewed UK CoFID records
  // (whey protein has no CoFID generic, so it uses a reviewed manual record).
  { recipeIngredientId: 'bf-protein-porridge::rolled oats', canonicalFoodId: 'cofid-11-788', matchStatus: 'verified', matchedBy: 'manual', gramWeight: 50, quantityBasis: 'raw', notes: 'CoFID 11-788 Porridge oats, unfortified — 50 g dry.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::semi-skimmed milk', canonicalFoodId: 'cofid-12-313', matchStatus: 'verified', matchedBy: 'manual', gramWeight: 257.5, quantityBasis: 'as-served', notes: 'CoFID 12-313 Milk, semi-skimmed — 250 ml × 1.03 g/ml.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::whey protein powder', canonicalFoodId: 'food-whey-protein', matchStatus: 'probable', matchedBy: 'manual', gramWeight: 30, quantityBasis: 'as-served', notes: 'No CoFID generic for whey protein isolate — reviewed manual record; 1 scoop ≈ 30 g.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::mixed berries', canonicalFoodId: 'cofid-14-325', matchStatus: 'probable', matchedBy: 'manual', gramWeight: 80, quantityBasis: 'raw', notes: 'CoFID 14-325 Blueberries used as the mixed-berry proxy — 80 g.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::peanut butter', canonicalFoodId: 'cofid-14-892', matchStatus: 'verified', matchedBy: 'manual', gramWeight: 5.3, quantityBasis: 'as-served', notes: 'CoFID 14-892 Peanut butter, smooth — 1 tsp ≈ 5.3 g.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::honey', canonicalFoodId: 'cofid-17-050', matchStatus: 'verified', matchedBy: 'manual', gramWeight: 7.1, quantityBasis: 'as-served', notes: 'CoFID 17-050 Honey — 1 tsp ≈ 5 ml × 1.42 g/ml.', reviewedAt: REVIEWED },
  { recipeIngredientId: 'bf-protein-porridge::salt', canonicalFoodId: 'cofid-17-367', matchStatus: 'verified', matchedBy: 'manual', gramWeight: 0.4, quantityBasis: 'as-served', notes: 'CoFID 17-367 Salt — 1 pinch ≈ 0.4 g.', reviewedAt: REVIEWED },
];

/** All reviewed links = the hand-curated porridge demo + the generated pilot batch. */
export const ALL_INGREDIENT_LINKS: RecipeIngredientFoodLink[] = [
  ...INGREDIENT_LINKS,
  ...PILOT_LINKS,
  ...BATCH2_LINKS,
  ...LEGACY_LINKS,
  ...BATCH3_LINKS,
  ...BATCH4_LINKS,
];

const BY_INGREDIENT = new Map(ALL_INGREDIENT_LINKS.map((l) => [l.recipeIngredientId, l]));

export function ingredientLinkKey(recipeId: string, ingredientName: string): string {
  return `${recipeId}::${ingredientName.trim().toLowerCase()}`;
}

export function getIngredientLink(recipeId: string, ingredientName: string): RecipeIngredientFoodLink | undefined {
  return BY_INGREDIENT.get(ingredientLinkKey(recipeId, ingredientName));
}

/** Recipe ids that have a reviewed link for EVERY ingredient (nutrition calculated). */
export const FULLY_LINKED_RECIPE_IDS = new Set<string>([
  'bf-protein-porridge',
  // Pilot batch — calculated from CoFID (see pilot.ts / pilotLinks.ts).
  'bf-berry-chia-overnight-oats',
  'bf-mushroom-spinach-omelette',
  'bf-greek-yoghurt-kiwi-oat-bowl',
  'ln-chicken-barley-salad',
  'ln-chickpea-quinoa-salad',
  'ln-tuna-pasta-salad',
  'dn-salmon-lentil-traybake',
  'dn-tofu-broccoli-stir-fry',
  'dn-mackerel-potato-traybake',
  'sn-tomato-olive-oil-toast',
  'sn-yoghurt-kiwi-walnut-bowl',
  'sn-edamame-bowl',
  // Batch 2 — calculated from CoFID (see batch2.ts / batch2Links.ts).
  'bf-tofu-scramble-toast',
  'bf-sardines-on-toast',
  'bf-cottage-cheese-berry-bowl',
  'bf-smoked-mackerel-scrambled-eggs',
  'bf-banana-oat-pancakes',
  'bf-soya-yoghurt-oat-berry-pot',
  'ln-sardine-tomato-pasta',
  'ln-butter-bean-tuna-salad',
  'ln-lentil-carrot-soup',
  'ln-quinoa-kale-chickpea-bowl',
  'ln-turkey-veg-rice-bowl',
  'ln-cottage-cheese-oatcake-plate',
  'dn-baked-cod-potatoes-greens',
  'dn-sardine-spaghetti',
  'dn-chickpea-spinach-curry',
  'dn-lentil-sweet-potato-pie',
  'dn-kidney-bean-chilli-rice',
  'dn-turkey-courgette-bolognese',
  'dn-cauliflower-chickpea-traybake',
  'dn-butter-bean-kale-stew',
  'sn-soya-yoghurt-berry-pot',
  'sn-cottage-cheese-oatcakes',
  'sn-chickpea-tahini-dip',
  'sn-cheddar-oatcake-apple',
  // Converted legacy library (generated; 2 recipes remain authored — see legacyLinks.ts).
  ...LEGACY_FULLY_LINKED_IDS,
  ...BATCH3_FULLY_LINKED_IDS,
  ...BATCH4_FULLY_LINKED_IDS,
]);
