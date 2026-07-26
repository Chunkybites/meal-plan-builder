import type { QuantityBasis, MatchStatus } from '../src/data/food/types';

/**
 * Name-based reviewed food matches for the LEGACY recipe library.
 *
 * Keyed by lower-cased ingredient name (one entry serves every recipe using that
 * name), which is why 48 recipes need ~140 entries rather than ~400. Preparation
 * state is respected: ingredients stated as "dry weight" map to RAW/dried records,
 * drained tins map to drained records, cooked weights to cooked records.
 *
 * `optional: true` = negligible aromatic/seasoning excluded from the calculation.
 * Ingredients deliberately ABSENT from this map (e.g. hummus, rice noodles) have no
 * suitable CoFID 2021 record; their recipes stay on authored values and are reported
 * rather than matched to something wrong.
 */
export interface NameOverride {
  foodId: string;
  basis: QuantityBasis;
  optional?: boolean;
  status?: MatchStatus;
  note?: string;
}

export const NAME_OVERRIDES: Record<string, NameOverride> = {
  // ---- Fats & oils ----
  'olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'extra virgin olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'rapeseed oil': { foodId: 'cofid-17-038', basis: 'as-served', status: 'probable', note: 'CoFID 2021 has no standalone rapeseed-oil record; olive oil used as an energy/fat-equivalent proxy (fatty-acid profile differs).' },
  'sesame oil': { foodId: 'cofid-17-043', basis: 'as-served' },
  butter: { foodId: 'cofid-17-685', basis: 'as-served' },

  // ---- Dairy & eggs ----
  // The legacy library's authored macros (e.g. 7 g fat per 250 g) show these recipes
  // were written for 0%-fat Greek yoghurt. CoFID 2021 has no 0% Greek record, so the
  // reviewed manual one is used; full-fat CoFID 12-555 is reserved for recipes that
  // explicitly specify "Greek style yoghurt".
  'greek yoghurt': { foodId: 'food-greek-yoghurt-0', basis: 'as-served', status: 'probable', note: 'Authored macros indicate 0%-fat Greek yoghurt.' },
  'greek yoghurt (0% fat)': { foodId: 'food-greek-yoghurt-0', basis: 'as-served', status: 'probable' },
  'semi-skimmed milk': { foodId: 'cofid-12-313', basis: 'as-served' },
  milk: { foodId: 'cofid-12-313', basis: 'as-served' },
  eggs: { foodId: 'cofid-12-937', basis: 'raw' },
  egg: { foodId: 'cofid-12-937', basis: 'raw' },
  'cottage cheese': { foodId: 'cofid-12-539', basis: 'as-served' },
  parmesan: { foodId: 'cofid-12-526', basis: 'as-served' },
  'mature cheddar': { foodId: 'cofid-12-548', basis: 'as-served', status: 'probable' },
  cheddar: { foodId: 'cofid-12-548', basis: 'as-served', status: 'probable' },
  feta: { foodId: 'cofid-12-525', basis: 'as-served' },
  'feta cheese': { foodId: 'cofid-12-525', basis: 'as-served' },
  halloumi: { foodId: 'cofid-12-496', basis: 'as-served' },

  // ---- Fruit ----
  avocado: { foodId: 'food-avocado', basis: 'raw', status: 'probable' },
  banana: { foodId: 'food-banana', basis: 'raw', status: 'probable' },
  apple: { foodId: 'food-apple', basis: 'raw', status: 'probable' },
  'mixed berries': { foodId: 'cofid-14-325', basis: 'raw', status: 'probable', note: 'Blueberries used as the mixed-berry proxy.' },
  blueberries: { foodId: 'cofid-14-325', basis: 'raw' },
  lemon: { foodId: 'cofid-14-277', basis: 'as-served', status: 'probable', note: 'Used for its juice.' },
  'lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  'lime juice': { foodId: 'cofid-14-279', basis: 'as-served' },
  lime: { foodId: 'cofid-14-279', basis: 'as-served', status: 'probable' },

  // ---- Vegetables ----
  'red pepper': { foodId: 'cofid-13-524', basis: 'raw' },
  'roasted red peppers from a jar': { foodId: 'cofid-13-524', basis: 'raw', status: 'probable' },
  'cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  tomato: { foodId: 'cofid-13-517', basis: 'raw' },
  onion: { foodId: 'cofid-13-499', basis: 'raw' },
  'red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'spring onion': { foodId: 'cofid-13-352', basis: 'raw' },
  cucumber: { foodId: 'cofid-13-523', basis: 'raw' },
  carrot: { foodId: 'cofid-13-496', basis: 'raw' },
  'baby spinach': { foodId: 'cofid-13-521', basis: 'raw' },
  courgette: { foodId: 'cofid-13-627', basis: 'raw' },
  'tenderstem broccoli': { foodId: 'cofid-13-502', basis: 'raw', status: 'probable' },
  'green beans': { foodId: 'cofid-13-515', basis: 'cooked' },
  sweetcorn: { foodId: 'cofid-13-529', basis: 'drained' },
  'little gem lettuce': { foodId: 'cofid-13-520', basis: 'raw' },
  'romaine lettuce': { foodId: 'cofid-13-520', basis: 'raw' },
  'mixed salad leaves': { foodId: 'cofid-13-520', basis: 'raw', status: 'probable' },
  rocket: { foodId: 'cofid-13-522', basis: 'raw' },
  'celery stick': { foodId: 'cofid-13-636', basis: 'raw' },
  garlic: { foodId: 'cofid-13-244', basis: 'raw' },
  'edamame beans': { foodId: 'cofid-13-667', basis: 'cooked' },
  'baby potatoes': { foodId: 'cofid-13-495', basis: 'cooked' },
  potatoes: { foodId: 'cofid-13-490', basis: 'cooked' },
  'baking potato': { foodId: 'cofid-13-491', basis: 'cooked' },

  // ---- Carbohydrates (note the dry-vs-cooked discipline) ----
  'rolled oats': { foodId: 'cofid-11-788', basis: 'raw' },
  oats: { foodId: 'cofid-11-788', basis: 'raw' },
  'wholemeal bread': { foodId: 'cofid-11-981', basis: 'as-served' },
  'rye bread': { foodId: 'cofid-11-981', basis: 'as-served', status: 'probable', note: 'No CoFID rye-bread record surfaced; wholemeal bread used as proxy.' },
  'basmati rice': { foodId: 'food-basmati-dry', basis: 'raw', status: 'probable', note: 'Recipes state DRY weight.' },
  'penne pasta': { foodId: 'cofid-11-716', basis: 'raw', note: 'Pasta, white, dried, raw — recipes state dry weight.' },
  spaghetti: { foodId: 'cofid-11-716', basis: 'raw', note: 'Recipes state dry weight.' },
  quinoa: { foodId: 'cofid-14-843', basis: 'raw' },
  'red lentils': { foodId: 'food-red-lentils-dry', basis: 'raw', status: 'probable' },
  'wholemeal tortilla wrap': { foodId: 'cofid-11-925', basis: 'as-served', status: 'probable' },
  'large tortilla wrap': { foodId: 'cofid-11-925', basis: 'as-served', status: 'probable' },
  'wholemeal flatbread': { foodId: 'cofid-11-925', basis: 'as-served', status: 'probable' },

  // ---- Proteins ----
  'chicken breast': { foodId: 'food-chicken-breast-raw', basis: 'raw', status: 'probable' },
  'chicken thigh fillets': { foodId: 'cofid-18-299', basis: 'raw', status: 'probable' },
  'lean beef mince (5% fat)': { foodId: 'cofid-18-508', basis: 'raw' },
  'cooked turkey breast slices': { foodId: 'cofid-18-356', basis: 'cooked' },
  'turkey breast mince (2% fat)': { foodId: 'cofid-18-354', basis: 'cooked', status: 'probable' },
  'salmon fillet': { foodId: 'cofid-16-356', basis: 'raw' },
  'smoked salmon': { foodId: 'cofid-16-412', basis: 'as-served' },
  'tinned tuna in spring water': { foodId: 'cofid-16-416', basis: 'drained' },
  'tinned tuna in olive oil': { foodId: 'cofid-16-417', basis: 'drained' },
  'cooked king prawns': { foodId: 'cofid-16-389', basis: 'cooked' },
  'tinned chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'black beans': { foodId: 'cofid-13-660', basis: 'drained', status: 'probable', note: 'CoFID has no black-turtle-bean record; canned kidney beans used as the closest drained-pulse proxy.' },
  'kidney beans': { foodId: 'cofid-13-660', basis: 'drained' },
  'baked beans': { foodId: 'cofid-13-532', basis: 'as-served' },
  'chocolate protein powder': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable' },
  'chocolate whey protein powder': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable' },
  'vanilla whey protein powder': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable' },

  // ---- Store cupboard / condiments ----
  'soy sauce': { foodId: 'cofid-17-721', basis: 'as-served' },
  'light mayonnaise': { foodId: 'cofid-17-679', basis: 'as-served' },
  'tomato purée': { foodId: 'cofid-13-531', basis: 'as-served' },
  passata: { foodId: 'cofid-13-530', basis: 'as-served', status: 'probable' },
  'chopped tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  honey: { foodId: 'cofid-17-050', basis: 'as-served' },
  'maple syrup': { foodId: 'cofid-17-065', basis: 'as-served', status: 'probable', note: 'Golden syrup used as proxy — no CoFID maple-syrup record.' },
  'dark chocolate': { foodId: 'cofid-17-491', basis: 'as-served' },
  'dark chocolate (70%)': { foodId: 'cofid-17-491', basis: 'as-served', status: 'probable' },
  'peanut butter': { foodId: 'cofid-14-892', basis: 'as-served' },
  'green pesto': { foodId: 'cofid-17-622', basis: 'as-served' },
  // Made-up stock is ~99% water (≈4 kcal/100 ml). It must NOT use the concentrated
  // stock-CUBE record: 400 ml of liquid stock resolved against the cube overstated fat
  // by >1200%. Excluded from the calculation as nutritionally negligible.
  'vegetable stock': { foodId: 'cofid-17-727', basis: 'as-served', optional: true, status: 'probable', note: 'Made-up liquid stock ≈ 4 kcal/100 ml — excluded as negligible; the CoFID record is the dry cube.' },
  'chicken stock': { foodId: 'cofid-17-727', basis: 'as-served', optional: true, status: 'probable', note: 'Made-up liquid stock — excluded as negligible.' },
  'gluten-free beef stock cube': { foodId: 'cofid-17-727', basis: 'as-served', status: 'probable' },
  'beef stock cube': { foodId: 'cofid-17-727', basis: 'as-served', status: 'probable' },
  'cocoa powder': { foodId: 'cofid-12-545', basis: 'as-served' },
  'sesame seeds': { foodId: 'cofid-14-844', basis: 'as-served' },
  'ground cinnamon': { foodId: 'food-cinnamon', basis: 'as-served', status: 'probable' },
  'rice vinegar': { foodId: 'cofid-17-339', basis: 'as-served', status: 'probable' },
  'red wine vinegar': { foodId: 'cofid-17-339', basis: 'as-served', status: 'probable' },
  'white wine vinegar': { foodId: 'cofid-17-339', basis: 'as-served', status: 'probable' },
  salt: { foodId: 'cofid-17-367', basis: 'as-served' },
  'sea salt': { foodId: 'cofid-17-367', basis: 'as-served' },

  // ---- Negligible aromatics / seasonings (excluded from the calculation) ----
  'black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  'cracked black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  'smoked paprika': { foodId: 'cofid-13-879', basis: 'as-served', optional: true },
  paprika: { foodId: 'cofid-13-879', basis: 'as-served', optional: true },
  'ground cumin': { foodId: 'cofid-13-876', basis: 'as-served', optional: true },
  'garam masala': { foodId: 'cofid-13-876', basis: 'as-served', optional: true },
  'chilli powder': { foodId: 'cofid-13-876', basis: 'as-served', optional: true },
  'chilli flakes': { foodId: 'cofid-13-876', basis: 'as-served', optional: true },
  'ground turmeric': { foodId: 'cofid-13-876', basis: 'as-served', optional: true },
  'dried oregano': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'dried mixed herbs': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh basil': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh parsley': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh coriander': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh thyme': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh chives': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  chives: { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  cress: { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'garlic granules': { foodId: 'cofid-13-244', basis: 'as-served', optional: true },
  'fresh ginger': { foodId: 'cofid-13-890', basis: 'as-served', optional: true },
  'vanilla extract': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'baking powder': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'dijon mustard': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'hot sauce': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'peri-peri sauce': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'worcestershire sauce': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'vegetarian worcestershire sauce': { foodId: 'cofid-17-339', basis: 'as-served', optional: true },
  'black olives': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fresh mint': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  'fennel seeds': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  cornflour: { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  water: { foodId: 'cofid-13-804', basis: 'as-served', optional: true, note: 'Water contributes no energy; excluded from the calculation.' },

  // ---- Remaining legacy blockers ----
  'whey protein powder': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable' },
  'casein protein powder (chocolate)': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable', note: 'No CoFID casein record; reviewed whey record used as a protein-powder proxy.' },
  'vanilla protein powder': { foodId: 'food-whey-protein', basis: 'as-served', status: 'probable' },
  'milk (semi-skimmed)': { foodId: 'cofid-12-313', basis: 'as-served' },
  // Legacy recipes state the purchased (raw) fillet weight, so the RAW record is correct —
  // matching a raw weight to the baked record overstated protein/energy by ~30%.
  'cod fillet': { foodId: 'cofid-16-372', basis: 'raw' },
  'new potatoes': { foodId: 'cofid-13-495', basis: 'cooked' },
  'garden peas': { foodId: 'cofid-13-536', basis: 'cooked' },
  'extra-firm tofu': { foodId: 'food-tofu-calcium-set', basis: 'as-served', status: 'probable' },
  'wholewheat noodles': { foodId: 'cofid-11-718', basis: 'raw', status: 'probable', note: 'Wholewheat spaghetti (dried, raw) used as the wholewheat-noodle proxy.' },
  'broccoli florets': { foodId: 'cofid-13-502', basis: 'raw' },
  mozzarella: { foodId: 'cofid-12-360', basis: 'as-served' },
  chickpeas: { foodId: 'cofid-13-670', basis: 'drained' },
  'pineapple chunks': { foodId: 'cofid-14-376', basis: 'raw', status: 'probable' },
  'wholegrain crackers': { foodId: 'cofid-11-1134', basis: 'as-served', status: 'probable' },
  breadcrumbs: { foodId: 'cofid-11-981', basis: 'as-served', status: 'probable', note: 'Wholemeal bread used as the breadcrumb proxy.' },

  // ---- Batch 3 additions ----
  quark: { foodId: 'cofid-12-174', basis: 'as-served' },
  raspberries: { foodId: 'cofid-14-375', basis: 'raw' },
  strawberries: { foodId: 'cofid-14-324', basis: 'raw' },
  'beef stir-fry strips': { foodId: 'cofid-18-052', basis: 'cooked', note: 'CoFID rump-steak strips, stir-fried (lean).' },
  'haddock fillet': { foodId: 'cofid-16-375', basis: 'raw' },
  'white pasta': { foodId: 'cofid-11-1129', basis: 'cooked', note: 'Recipes state cooked weight.' },
  'wholewheat pasta': { foodId: 'cofid-11-723', basis: 'cooked', note: 'Recipes state cooked weight.' },
  aubergine: { foodId: 'cofid-13-651', basis: 'cooked' },
  'firm tofu': { foodId: 'food-tofu-calcium-set', basis: 'as-served', status: 'probable', note: 'Calcium-set tofu — reviewed manual record.' },
  'reduced-fat cheddar': { foodId: 'cofid-12-548', basis: 'as-served' },
  cauliflower: { foodId: 'cofid-13-512', basis: 'raw' },
  peas: { foodId: 'cofid-13-536', basis: 'cooked' },
  'white mushrooms': { foodId: 'cofid-13-505', basis: 'raw' },
  'chia seeds': { foodId: 'food-chia-seeds', basis: 'as-served', status: 'probable' },
  'unsweetened soya milk': { foodId: 'cofid-12-524', basis: 'as-served', status: 'probable' },
  'green lentils': { foodId: 'cofid-13-661', basis: 'drained', status: 'probable', note: 'Canned green lentils matched to CoFID boiled green/brown lentils.' },
  'smoked mackerel': { foodId: 'cofid-16-414', basis: 'as-served' },
  'pumpkin seeds': { foodId: 'cofid-14-842', basis: 'as-served' },
  'curry powder': { foodId: 'cofid-13-876', basis: 'as-served' },
  lettuce: { foodId: 'cofid-13-520', basis: 'raw' },
  broccoli: { foodId: 'cofid-13-502', basis: 'raw' },
  'canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'turkey mince': { foodId: 'cofid-18-354', basis: 'cooked' },

  // ---- Batch 4 additions ----
  'porridge oats': { foodId: 'cofid-11-788', basis: 'raw' },
  'mackerel fillet': { foodId: 'cofid-16-393', basis: 'raw' },
  walnuts: { foodId: 'cofid-14-879', basis: 'as-served' },
  'flaked almonds': { foodId: 'cofid-14-870', basis: 'as-served' },
  'pearl barley': { foodId: 'cofid-11-003', basis: 'cooked', note: 'Recipes state cooked weight.' },
  'brown rice': { foodId: 'cofid-11-867', basis: 'cooked', note: 'Recipes state cooked weight.' },
  'curly kale': { foodId: 'cofid-13-234', basis: 'raw' },
  'tahini paste': { foodId: 'cofid-14-847', basis: 'as-served' },
  'butter beans': { foodId: 'cofid-13-559', basis: 'drained' },
  carrots: { foodId: 'cofid-13-496', basis: 'raw' },
  celery: { foodId: 'cofid-13-636', basis: 'raw' },
  'sweet potato': { foodId: 'cofid-13-646', basis: 'cooked' },
};
