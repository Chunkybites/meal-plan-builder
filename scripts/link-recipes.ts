/**
 * Recipe link generator — turns a reviewed OVERRIDES table (ingredient → CoFID
 * food id + preparation basis) into RecipeIngredientFoodLink[] with gram weights
 * resolved by the shared householdMeasures logic. Writes src/data/recipes/pilotLinks.ts
 * and a review report. Reusable for every future batch (Phase 6).
 * Run: npm run link-recipes
 */
import * as fs from 'node:fs';
import { pilotRecipes } from '../src/data/recipes/pilot';
import { batch2Recipes } from '../src/data/recipes/batch2';
import { batch3Recipes } from '../src/data/recipes/batch3';
import { batch4Recipes } from '../src/data/recipes/batch4';
import { ALL_RECIPES } from '../src/data/recipes';
import { NAME_OVERRIDES } from './legacyOverrides';
import { resolveGrams } from '../src/data/food/householdMeasures';
import { ingredientLinkKey, INGREDIENT_LINKS } from '../src/data/recipes/ingredientLinks';
import type { MatchStatus, QuantityBasis } from '../src/data/food/types';

interface Override { foodId: string; basis: QuantityBasis; optional?: boolean; status?: MatchStatus; note?: string; }

// Reviewed matches: each ingredient → the correct CoFID (or manual) record + basis.
// Preparation state respected (raw≠cooked, dry≠boiled, drained tins, calcium-set tofu).
const OVERRIDES: Record<string, Override> = {
  // bf-berry-chia-overnight-oats
  'bf-berry-chia-overnight-oats::porridge oats': { foodId: 'cofid-11-788', basis: 'raw' },
  'bf-berry-chia-overnight-oats::unsweetened soya milk': { foodId: 'cofid-12-524', basis: 'as-served', status: 'probable' },
  'bf-berry-chia-overnight-oats::chia seeds': { foodId: 'food-chia-seeds', basis: 'as-served', status: 'probable', note: 'No CoFID 2021 chia record; USDA-sourced manual record.' },
  'bf-berry-chia-overnight-oats::blueberries': { foodId: 'cofid-14-325', basis: 'raw' },
  'bf-berry-chia-overnight-oats::flaked almonds': { foodId: 'cofid-14-870', basis: 'as-served' },
  // bf-mushroom-spinach-omelette
  'bf-mushroom-spinach-omelette::eggs': { foodId: 'cofid-12-937', basis: 'raw' },
  'bf-mushroom-spinach-omelette::white mushrooms': { foodId: 'cofid-13-505', basis: 'raw' },
  'bf-mushroom-spinach-omelette::baby spinach': { foodId: 'cofid-13-521', basis: 'raw' },
  'bf-mushroom-spinach-omelette::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'bf-mushroom-spinach-omelette::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'bf-mushroom-spinach-omelette::black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  // bf-greek-yoghurt-kiwi-oat-bowl
  'bf-greek-yoghurt-kiwi-oat-bowl::greek style yoghurt': { foodId: 'cofid-12-555', basis: 'as-served' },
  'bf-greek-yoghurt-kiwi-oat-bowl::kiwi': { foodId: 'cofid-14-371', basis: 'raw' },
  'bf-greek-yoghurt-kiwi-oat-bowl::porridge oats': { foodId: 'cofid-11-788', basis: 'raw' },
  'bf-greek-yoghurt-kiwi-oat-bowl::pumpkin seeds': { foodId: 'cofid-14-842', basis: 'as-served' },
  'bf-greek-yoghurt-kiwi-oat-bowl::honey': { foodId: 'cofid-17-050', basis: 'as-served' },
  // ln-chicken-barley-salad
  'ln-chicken-barley-salad::chicken breast': { foodId: 'cofid-18-323', basis: 'cooked' },
  'ln-chicken-barley-salad::pearl barley': { foodId: 'cofid-11-003', basis: 'cooked' },
  'ln-chicken-barley-salad::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-chicken-barley-salad::cucumber': { foodId: 'cofid-13-523', basis: 'raw' },
  'ln-chicken-barley-salad::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'ln-chicken-barley-salad::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-chicken-barley-salad::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // ln-chickpea-quinoa-salad
  'ln-chickpea-quinoa-salad::chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'ln-chickpea-quinoa-salad::quinoa': { foodId: 'cofid-14-843', basis: 'raw' },
  'ln-chickpea-quinoa-salad::red pepper': { foodId: 'cofid-13-524', basis: 'raw' },
  'ln-chickpea-quinoa-salad::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-chickpea-quinoa-salad::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'ln-chickpea-quinoa-salad::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-chickpea-quinoa-salad::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // ln-tuna-pasta-salad
  'ln-tuna-pasta-salad::wholewheat pasta': { foodId: 'cofid-11-723', basis: 'cooked' },
  'ln-tuna-pasta-salad::tuna in brine': { foodId: 'cofid-16-416', basis: 'drained' },
  'ln-tuna-pasta-salad::sweetcorn': { foodId: 'cofid-13-529', basis: 'drained' },
  'ln-tuna-pasta-salad::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-tuna-pasta-salad::reduced-fat mayonnaise': { foodId: 'cofid-17-679', basis: 'as-served' },
  'ln-tuna-pasta-salad::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  // dn-salmon-lentil-traybake
  'dn-salmon-lentil-traybake::salmon fillet': { foodId: 'cofid-16-356', basis: 'raw' },
  'dn-salmon-lentil-traybake::green lentils': { foodId: 'cofid-13-661', basis: 'drained', status: 'probable', note: 'Canned green lentils matched to CoFID boiled green/brown lentils.' },
  'dn-salmon-lentil-traybake::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'dn-salmon-lentil-traybake::courgette': { foodId: 'cofid-13-627', basis: 'raw' },
  'dn-salmon-lentil-traybake::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // dn-tofu-broccoli-stir-fry
  'dn-tofu-broccoli-stir-fry::firm tofu': { foodId: 'food-tofu-calcium-set', basis: 'as-served', status: 'probable', note: 'Calcium-set tofu — reviewed manual record (CoFID steamed tofu lacks calcium).' },
  'dn-tofu-broccoli-stir-fry::basmati rice': { foodId: 'cofid-11-858', basis: 'cooked' },
  'dn-tofu-broccoli-stir-fry::broccoli': { foodId: 'cofid-13-502', basis: 'raw' },
  'dn-tofu-broccoli-stir-fry::red pepper': { foodId: 'cofid-13-524', basis: 'raw' },
  'dn-tofu-broccoli-stir-fry::soy sauce': { foodId: 'cofid-17-721', basis: 'as-served' },
  'dn-tofu-broccoli-stir-fry::sesame oil': { foodId: 'cofid-17-043', basis: 'as-served' },
  'dn-tofu-broccoli-stir-fry::fresh ginger': { foodId: 'cofid-13-890', basis: 'as-served', optional: true },
  // dn-mackerel-potato-traybake
  'dn-mackerel-potato-traybake::mackerel fillet': { foodId: 'cofid-16-393', basis: 'raw' },
  'dn-mackerel-potato-traybake::new potatoes': { foodId: 'cofid-13-495', basis: 'cooked' },
  'dn-mackerel-potato-traybake::green beans': { foodId: 'cofid-13-515', basis: 'cooked' },
  'dn-mackerel-potato-traybake::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'dn-mackerel-potato-traybake::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // sn-tomato-olive-oil-toast
  'sn-tomato-olive-oil-toast::wholemeal bread': { foodId: 'cofid-11-981', basis: 'as-served' },
  'sn-tomato-olive-oil-toast::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'sn-tomato-olive-oil-toast::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'sn-tomato-olive-oil-toast::fresh basil': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  // sn-yoghurt-kiwi-walnut-bowl
  'sn-yoghurt-kiwi-walnut-bowl::greek style yoghurt': { foodId: 'cofid-12-555', basis: 'as-served' },
  'sn-yoghurt-kiwi-walnut-bowl::kiwi': { foodId: 'cofid-14-371', basis: 'raw' },
  'sn-yoghurt-kiwi-walnut-bowl::walnuts': { foodId: 'cofid-14-879', basis: 'as-served' },
  'sn-yoghurt-kiwi-walnut-bowl::honey': { foodId: 'cofid-17-050', basis: 'as-served' },
  // sn-edamame-bowl
  'sn-edamame-bowl::edamame beans': { foodId: 'cofid-13-667', basis: 'cooked' },
  'sn-edamame-bowl::sea salt': { foodId: 'cofid-17-367', basis: 'as-served' },

  // ================= BATCH 2 =================
  // bf-tofu-scramble-toast
  'bf-tofu-scramble-toast::firm tofu': { foodId: 'food-tofu-calcium-set', basis: 'as-served', status: 'probable', note: 'Calcium-set tofu — reviewed manual record.' },
  'bf-tofu-scramble-toast::wholemeal bread': { foodId: 'cofid-11-981', basis: 'as-served' },
  'bf-tofu-scramble-toast::baby spinach': { foodId: 'cofid-13-521', basis: 'raw' },
  'bf-tofu-scramble-toast::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'bf-tofu-scramble-toast::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'bf-tofu-scramble-toast::paprika': { foodId: 'cofid-13-879', basis: 'as-served', optional: true },
  // bf-sardines-on-toast
  'bf-sardines-on-toast::sardines in tomato sauce': { foodId: 'cofid-16-422', basis: 'as-served' },
  'bf-sardines-on-toast::wholemeal bread': { foodId: 'cofid-11-981', basis: 'as-served' },
  'bf-sardines-on-toast::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  'bf-sardines-on-toast::black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  // bf-cottage-cheese-berry-bowl
  'bf-cottage-cheese-berry-bowl::cottage cheese': { foodId: 'cofid-12-539', basis: 'as-served' },
  'bf-cottage-cheese-berry-bowl::blueberries': { foodId: 'cofid-14-325', basis: 'raw' },
  'bf-cottage-cheese-berry-bowl::pumpkin seeds': { foodId: 'cofid-14-842', basis: 'as-served' },
  'bf-cottage-cheese-berry-bowl::honey': { foodId: 'cofid-17-050', basis: 'as-served' },
  // bf-smoked-mackerel-scrambled-eggs
  'bf-smoked-mackerel-scrambled-eggs::eggs': { foodId: 'cofid-12-937', basis: 'raw' },
  'bf-smoked-mackerel-scrambled-eggs::smoked mackerel': { foodId: 'cofid-16-414', basis: 'as-served' },
  'bf-smoked-mackerel-scrambled-eggs::baby spinach': { foodId: 'cofid-13-521', basis: 'raw' },
  'bf-smoked-mackerel-scrambled-eggs::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'bf-smoked-mackerel-scrambled-eggs::black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  // bf-banana-oat-pancakes
  'bf-banana-oat-pancakes::porridge oats': { foodId: 'cofid-11-788', basis: 'raw' },
  'bf-banana-oat-pancakes::banana': { foodId: 'food-banana', basis: 'raw', status: 'probable' },
  'bf-banana-oat-pancakes::eggs': { foodId: 'cofid-12-937', basis: 'raw' },
  'bf-banana-oat-pancakes::unsweetened soya milk': { foodId: 'cofid-12-524', basis: 'as-served', status: 'probable' },
  'bf-banana-oat-pancakes::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // bf-soya-yoghurt-oat-berry-pot
  'bf-soya-yoghurt-oat-berry-pot::fortified soya yoghurt': { foodId: 'cofid-12-609', basis: 'as-served', status: 'probable', note: 'CoFID fortified soya yoghurt (fruit) used for a plain fortified pot.' },
  'bf-soya-yoghurt-oat-berry-pot::porridge oats': { foodId: 'cofid-11-788', basis: 'raw' },
  'bf-soya-yoghurt-oat-berry-pot::chia seeds': { foodId: 'food-chia-seeds', basis: 'as-served', status: 'probable' },
  'bf-soya-yoghurt-oat-berry-pot::blueberries': { foodId: 'cofid-14-325', basis: 'raw' },
  // ln-sardine-tomato-pasta
  'ln-sardine-tomato-pasta::sardines in tomato sauce': { foodId: 'cofid-16-422', basis: 'as-served' },
  'ln-sardine-tomato-pasta::wholewheat pasta': { foodId: 'cofid-11-723', basis: 'cooked' },
  'ln-sardine-tomato-pasta::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-sardine-tomato-pasta::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'ln-sardine-tomato-pasta::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-sardine-tomato-pasta::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // ln-butter-bean-tuna-salad
  'ln-butter-bean-tuna-salad::butter beans': { foodId: 'cofid-13-559', basis: 'drained' },
  'ln-butter-bean-tuna-salad::tuna in brine': { foodId: 'cofid-16-416', basis: 'drained' },
  'ln-butter-bean-tuna-salad::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-butter-bean-tuna-salad::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'ln-butter-bean-tuna-salad::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-butter-bean-tuna-salad::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // ln-lentil-carrot-soup
  'ln-lentil-carrot-soup::green lentils': { foodId: 'cofid-13-661', basis: 'drained', status: 'probable', note: 'Canned green lentils matched to CoFID boiled green/brown lentils.' },
  'ln-lentil-carrot-soup::carrots': { foodId: 'cofid-13-496', basis: 'raw' },
  'ln-lentil-carrot-soup::celery': { foodId: 'cofid-13-636', basis: 'raw' },
  'ln-lentil-carrot-soup::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'ln-lentil-carrot-soup::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'ln-lentil-carrot-soup::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-lentil-carrot-soup::wholemeal bread': { foodId: 'cofid-11-981', basis: 'as-served' },
  // ln-quinoa-kale-chickpea-bowl
  'ln-quinoa-kale-chickpea-bowl::quinoa': { foodId: 'cofid-14-843', basis: 'raw' },
  'ln-quinoa-kale-chickpea-bowl::chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'ln-quinoa-kale-chickpea-bowl::curly kale': { foodId: 'cofid-13-234', basis: 'raw' },
  'ln-quinoa-kale-chickpea-bowl::tahini paste': { foodId: 'cofid-14-847', basis: 'as-served' },
  'ln-quinoa-kale-chickpea-bowl::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  'ln-quinoa-kale-chickpea-bowl::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // ln-turkey-veg-rice-bowl
  'ln-turkey-veg-rice-bowl::turkey mince': { foodId: 'cofid-18-354', basis: 'cooked' },
  'ln-turkey-veg-rice-bowl::brown rice': { foodId: 'cofid-11-867', basis: 'cooked' },
  'ln-turkey-veg-rice-bowl::peas': { foodId: 'cofid-13-536', basis: 'cooked' },
  'ln-turkey-veg-rice-bowl::carrots': { foodId: 'cofid-13-496', basis: 'raw' },
  'ln-turkey-veg-rice-bowl::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'ln-turkey-veg-rice-bowl::soy sauce': { foodId: 'cofid-17-721', basis: 'as-served' },
  // ln-cottage-cheese-oatcake-plate
  'ln-cottage-cheese-oatcake-plate::cottage cheese': { foodId: 'cofid-12-539', basis: 'as-served' },
  'ln-cottage-cheese-oatcake-plate::oatcakes': { foodId: 'cofid-11-823', basis: 'as-served' },
  'ln-cottage-cheese-oatcake-plate::cucumber': { foodId: 'cofid-13-523', basis: 'raw' },
  'ln-cottage-cheese-oatcake-plate::cherry tomatoes': { foodId: 'cofid-13-519', basis: 'raw' },
  'ln-cottage-cheese-oatcake-plate::black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  // dn-baked-cod-potatoes-greens
  'dn-baked-cod-potatoes-greens::cod fillet': { foodId: 'cofid-16-373', basis: 'cooked' },
  'dn-baked-cod-potatoes-greens::new potatoes': { foodId: 'cofid-13-495', basis: 'cooked' },
  'dn-baked-cod-potatoes-greens::green beans': { foodId: 'cofid-13-515', basis: 'cooked' },
  'dn-baked-cod-potatoes-greens::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'dn-baked-cod-potatoes-greens::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // dn-sardine-spaghetti
  'dn-sardine-spaghetti::sardines in tomato sauce': { foodId: 'cofid-16-422', basis: 'as-served' },
  'dn-sardine-spaghetti::wholewheat pasta': { foodId: 'cofid-11-723', basis: 'cooked' },
  'dn-sardine-spaghetti::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-sardine-spaghetti::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'dn-sardine-spaghetti::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'dn-sardine-spaghetti::fresh basil': { foodId: 'cofid-13-804', basis: 'as-served', optional: true },
  // dn-chickpea-spinach-curry
  'dn-chickpea-spinach-curry::chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'dn-chickpea-spinach-curry::brown rice': { foodId: 'cofid-11-867', basis: 'cooked' },
  'dn-chickpea-spinach-curry::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-chickpea-spinach-curry::baby spinach': { foodId: 'cofid-13-521', basis: 'raw' },
  'dn-chickpea-spinach-curry::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'dn-chickpea-spinach-curry::curry powder': { foodId: 'cofid-13-876', basis: 'as-served' },
  'dn-chickpea-spinach-curry::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // dn-lentil-sweet-potato-pie
  'dn-lentil-sweet-potato-pie::green lentils': { foodId: 'cofid-13-661', basis: 'drained', status: 'probable' },
  'dn-lentil-sweet-potato-pie::sweet potato': { foodId: 'cofid-13-646', basis: 'cooked' },
  'dn-lentil-sweet-potato-pie::carrots': { foodId: 'cofid-13-496', basis: 'raw' },
  'dn-lentil-sweet-potato-pie::celery': { foodId: 'cofid-13-636', basis: 'raw' },
  'dn-lentil-sweet-potato-pie::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-lentil-sweet-potato-pie::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // dn-kidney-bean-chilli-rice
  'dn-kidney-bean-chilli-rice::red kidney beans': { foodId: 'cofid-13-660', basis: 'drained' },
  'dn-kidney-bean-chilli-rice::brown rice': { foodId: 'cofid-11-867', basis: 'cooked' },
  'dn-kidney-bean-chilli-rice::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-kidney-bean-chilli-rice::red pepper': { foodId: 'cofid-13-524', basis: 'raw' },
  'dn-kidney-bean-chilli-rice::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'dn-kidney-bean-chilli-rice::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'dn-kidney-bean-chilli-rice::paprika': { foodId: 'cofid-13-879', basis: 'as-served', optional: true },
  // dn-turkey-courgette-bolognese
  'dn-turkey-courgette-bolognese::turkey mince': { foodId: 'cofid-18-354', basis: 'cooked' },
  'dn-turkey-courgette-bolognese::wholewheat pasta': { foodId: 'cofid-11-723', basis: 'cooked' },
  'dn-turkey-courgette-bolognese::courgette': { foodId: 'cofid-13-627', basis: 'raw' },
  'dn-turkey-courgette-bolognese::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-turkey-courgette-bolognese::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'dn-turkey-courgette-bolognese::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // dn-cauliflower-chickpea-traybake
  'dn-cauliflower-chickpea-traybake::chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'dn-cauliflower-chickpea-traybake::cauliflower': { foodId: 'cofid-13-512', basis: 'raw' },
  'dn-cauliflower-chickpea-traybake::red pepper': { foodId: 'cofid-13-524', basis: 'raw' },
  'dn-cauliflower-chickpea-traybake::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'dn-cauliflower-chickpea-traybake::tahini paste': { foodId: 'cofid-14-847', basis: 'as-served' },
  'dn-cauliflower-chickpea-traybake::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  // dn-butter-bean-kale-stew
  'dn-butter-bean-kale-stew::butter beans': { foodId: 'cofid-13-559', basis: 'drained' },
  'dn-butter-bean-kale-stew::curly kale': { foodId: 'cofid-13-234', basis: 'raw' },
  'dn-butter-bean-kale-stew::canned tomatoes': { foodId: 'cofid-13-530', basis: 'as-served' },
  'dn-butter-bean-kale-stew::carrots': { foodId: 'cofid-13-496', basis: 'raw' },
  'dn-butter-bean-kale-stew::red onion': { foodId: 'cofid-13-499', basis: 'raw' },
  'dn-butter-bean-kale-stew::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  // sn-soya-yoghurt-berry-pot
  'sn-soya-yoghurt-berry-pot::fortified soya yoghurt': { foodId: 'cofid-12-609', basis: 'as-served', status: 'probable' },
  'sn-soya-yoghurt-berry-pot::blueberries': { foodId: 'cofid-14-325', basis: 'raw' },
  'sn-soya-yoghurt-berry-pot::chia seeds': { foodId: 'food-chia-seeds', basis: 'as-served', status: 'probable' },
  // sn-cottage-cheese-oatcakes
  'sn-cottage-cheese-oatcakes::cottage cheese': { foodId: 'cofid-12-539', basis: 'as-served' },
  'sn-cottage-cheese-oatcakes::oatcakes': { foodId: 'cofid-11-823', basis: 'as-served' },
  'sn-cottage-cheese-oatcakes::cucumber': { foodId: 'cofid-13-523', basis: 'raw' },
  'sn-cottage-cheese-oatcakes::black pepper': { foodId: 'cofid-13-880', basis: 'as-served', optional: true },
  // sn-chickpea-tahini-dip
  'sn-chickpea-tahini-dip::chickpeas': { foodId: 'cofid-13-670', basis: 'drained' },
  'sn-chickpea-tahini-dip::tahini paste': { foodId: 'cofid-14-847', basis: 'as-served' },
  'sn-chickpea-tahini-dip::lemon juice': { foodId: 'cofid-14-277', basis: 'as-served' },
  'sn-chickpea-tahini-dip::olive oil': { foodId: 'cofid-17-038', basis: 'as-served' },
  'sn-chickpea-tahini-dip::carrots': { foodId: 'cofid-13-496', basis: 'raw' },
  'sn-chickpea-tahini-dip::cucumber': { foodId: 'cofid-13-523', basis: 'raw' },
  // sn-cheddar-oatcake-apple
  'sn-cheddar-oatcake-apple::reduced-fat cheddar': { foodId: 'cofid-12-548', basis: 'as-served' },
  'sn-cheddar-oatcake-apple::oatcakes': { foodId: 'cofid-11-823', basis: 'as-served' },
  'sn-cheddar-oatcake-apple::apple': { foodId: 'food-apple', basis: 'raw', status: 'probable' },
};

const REVIEWED = '2026-07-12';
const report: string[] = [];
let missing = 0;

const BATCHES = [
  { recipes: pilotRecipes, out: 'src/data/recipes/pilotLinks.ts', exportName: 'PILOT_LINKS' },
  { recipes: batch2Recipes, out: 'src/data/recipes/batch2Links.ts', exportName: 'BATCH2_LINKS' },
];

for (const batch of BATCHES) {
const lines: string[] = [];
for (const recipe of batch.recipes) {
  for (const ing of recipe.ingredients) {
    const key = ingredientLinkKey(recipe.id, ing.name);
    const ov = OVERRIDES[key];
    if (!ov) { report.push(`MISSING override for ${key}`); missing += 1; continue; }
    const res = resolveGrams(ing.name, ing.quantity, ing.unit);
    let grams = Math.round(res.grams * 10) / 10;
    if (grams <= 0) {
      if (ov.optional) grams = 0.5; // negligible aromatic floor
      else { report.push(`ZERO grams for ${key} (${ing.quantity}${ing.unit}) — check householdMeasures`); missing += 1; continue; }
    }
    const noteParts = [res.note, res.assumed ? 'assumed density' : '', ov.note].filter(Boolean);
    lines.push(
      `  { recipeIngredientId: '${key}', canonicalFoodId: '${ov.foodId}', matchStatus: '${ov.status ?? 'verified'}', matchedBy: 'manual', gramWeight: ${grams}, quantityBasis: '${ov.basis}', ${ov.optional ? 'optional: true, ' : ''}notes: ${JSON.stringify(noteParts.join(' · ') || 'reviewed')}, reviewedAt: '${REVIEWED}' },`,
    );
    if (res.warnings.length) report.push(`warn ${key}: ${res.warnings.join('; ')} (→ ${grams} g)`);
  }
}

const out =
  `import type { RecipeIngredientFoodLink } from '../food/types';\n\n` +
  `/**\n * GENERATED by scripts/link-recipes.ts — do not edit by hand.\n` +
  ` * Reviewed ingredient→CoFID links; gram weights resolved via householdMeasures.\n` +
  ` * Regenerate with: npm run link-recipes\n */\n` +
  `export const ${batch.exportName}: RecipeIngredientFoodLink[] = [\n${lines.join('\n')}\n];\n`;

fs.writeFileSync(batch.out, out);
console.log(`Wrote ${lines.length} links → ${batch.out}`);
}

// ------------- NAME-BASED MATCHING (legacy library + batch 3) -------------
/**
 * Generates links from the reviewed NAME_OVERRIDES map (one entry per ingredient
 * NAME, applied to every recipe using it). Only recipes whose every ingredient
 * resolves are reported as fully linked; the rest keep their authored values.
 */
function generateByName(recipes: typeof ALL_RECIPES, out: string, exportName: string, idsExport: string) {
const legacyLines: string[] = [];
const convertible: string[] = [];
const blocked: { id: string; missing: string[] }[] = [];

for (const recipe of recipes) {
  const rows: string[] = [];
  const unmatched: string[] = [];
  for (const ing of recipe.ingredients) {
    const ov = NAME_OVERRIDES[ing.name.trim().toLowerCase()];
    if (!ov) { unmatched.push(ing.name); continue; }
    const res = resolveGrams(ing.name, ing.quantity, ing.unit);
    let grams = Math.round(res.grams * 10) / 10;
    if (grams <= 0) grams = ov.optional ? 0.5 : 0;
    if (grams <= 0) { unmatched.push(`${ing.name} (unresolved grams)`); continue; }
    const key = ingredientLinkKey(recipe.id, ing.name);
    const noteParts = [res.note, res.assumed ? 'assumed density' : '', ov.note].filter(Boolean);
    rows.push(
      `  { recipeIngredientId: '${key}', canonicalFoodId: '${ov.foodId}', matchStatus: '${ov.status ?? 'verified'}', matchedBy: 'automated-score', gramWeight: ${grams}, quantityBasis: '${ov.basis}', ${ov.optional ? 'optional: true, ' : ''}notes: ${JSON.stringify(noteParts.join(' · ') || 'name-matched, reviewed')}, reviewedAt: '${REVIEWED}' },`,
    );
  }
  if (unmatched.length === 0) { convertible.push(recipe.id); legacyLines.push(...rows); }
  else blocked.push({ id: recipe.id, missing: unmatched });
}

const legacyOut =
  `import type { RecipeIngredientFoodLink } from '../food/types';\n\n` +
  `/**\n * GENERATED by scripts/link-recipes.ts — do not edit by hand.\n` +
  ` * Links produced from the reviewed name-based match map (scripts/legacyOverrides.ts).\n` +
  ` * Only recipes whose EVERY ingredient resolves are listed as fully linked; any\n` +
  ` * others keep their authored values.\n */\n` +
  `export const ${exportName}: RecipeIngredientFoodLink[] = [\n${legacyLines.join('\n')}\n];\n\n` +
  `export const ${idsExport}: string[] = [\n${convertible.map((id) => `  '${id}',`).join('\n')}\n];\n`;

fs.writeFileSync(out, legacyOut);
console.log(`Wrote ${legacyLines.length} links (${convertible.length}/${recipes.length} recipes convertible) → ${out}`);
if (blocked.length) {
  console.log('  Not convertible (kept on authored nutrition):');
  for (const b of blocked) console.log(`    ${b.id} — no reviewed match for: ${[...new Set(b.missing)].join(', ')}`);
}
}

const newIds = new Set([...pilotRecipes, ...batch2Recipes, ...batch3Recipes, ...batch4Recipes].map((r) => r.id));
for (const l of INGREDIENT_LINKS) newIds.add(l.recipeIngredientId.split('::')[0]);
generateByName(ALL_RECIPES.filter((r) => !newIds.has(r.id)), 'src/data/recipes/legacyLinks.ts', 'LEGACY_LINKS', 'LEGACY_FULLY_LINKED_IDS');
generateByName(batch3Recipes, 'src/data/recipes/batch3Links.ts', 'BATCH3_LINKS', 'BATCH3_FULLY_LINKED_IDS');
generateByName(batch4Recipes, 'src/data/recipes/batch4Links.ts', 'BATCH4_LINKS', 'BATCH4_FULLY_LINKED_IDS');

if (report.length) { console.log(`\nReview notes: ${report.length} gram-resolution warnings (spoon/pinch estimates).`); }
console.log(`\n${missing} missing/zero.`);
process.exit(missing ? 1 : 0);
