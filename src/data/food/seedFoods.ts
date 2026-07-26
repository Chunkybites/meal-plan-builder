/**
 * Seed canonical food records — MANUAL REVIEWED ESTIMATES.
 *
 * IMPORTANT HONESTY NOTE:
 * These are NOT an official dataset import. Every record here is a manually
 * reviewed per-100g estimate authored to unblock demo recipes. They are
 * deliberately marked source: 'manual-reviewed' and status 'estimated'. The
 * official UK CoFID import will SUPERSEDE these records; none of them carry a
 * CoFID food code and none should be presented as CoFID-sourced.
 *
 * All values are PER 100 g of edible portion. Missing nutrients are OMITTED
 * (undefined), never set to 0 — a missing value is not a measured zero.
 */

import type { CanonicalFood, FoodProvenance } from './types';
import { buildQuality } from './quality';

const RETRIEVED_AT = '2026-07-12';
const CREATED_AT = '2026-07-12';
const UPDATED_AT = '2026-07-12';

function provenance(): FoodProvenance {
  return {
    datasetName: 'Manual reviewed estimates',
    retrievedAt: RETRIEVED_AT,
    transformations: ['Manually estimated per-100g values pending official CoFID import.'],
  };
}

export const SEED_FOODS: CanonicalFood[] = [
  // 1. Rolled oats, dry (raw)
  (() => {
    const n = {
      energyKcal: 379,
      proteinG: 13.2,
      carbohydrateG: 60.0,
      sugarsG: 1.0,
      fibreG: 9.0,
      fatG: 7.5,
      saturatedFatG: 1.3,
      sodiumMg: 4,
      potassiumMg: 360,
      calciumMg: 52,
      ironMg: 4.0,
      magnesiumMg: 140,
      zincMg: 3.2,
    };
    return {
      id: 'food-oats-dry',
      canonicalName: 'rolled oats, dry',
      displayName: 'Rolled oats (dry)',
      aliases: ['oats', 'porridge oats', 'rolled oats', 'oatmeal', 'dry oats'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-oats-dry',
      sourceDescription: 'Rolled/porridge oats, uncooked dry weight.',
      recordType: 'generic',
      foodGroup: 'Cereals & grains',
      preparationState: 'raw',
      nutrientsPer100g: n,
      allergens: ['gluten'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 2. Semi-skimmed milk
  (() => {
    const n = {
      energyKcal: 47,
      proteinG: 3.5,
      carbohydrateG: 4.8,
      sugarsG: 4.8,
      fibreG: 0,
      fatG: 1.7,
      saturatedFatG: 1.1,
      sodiumMg: 43,
      potassiumMg: 150,
      calciumMg: 124,
      magnesiumMg: 11,
      zincMg: 0.4,
      iodineUg: 30,
      vitaminB12Ug: 0.9,
    };
    return {
      id: 'food-milk-semi-skimmed',
      canonicalName: 'semi-skimmed milk',
      displayName: 'Semi-skimmed milk',
      aliases: ['milk', 'semi skimmed milk', 'cow milk', '2% milk'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-milk-semi-skimmed',
      sourceDescription: 'Pasteurised semi-skimmed cow’s milk, ~1.7% fat.',
      recordType: 'generic',
      foodGroup: 'Dairy',
      preparationState: 'raw',
      nutrientsPer100g: n,
      allergens: ['milk'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 3. Whey protein powder, vanilla
  (() => {
    const n = {
      energyKcal: 375,
      proteinG: 80.0,
      carbohydrateG: 8.0,
      sugarsG: 6.0,
      fibreG: 1.0,
      fatG: 6.0,
      saturatedFatG: 3.0,
      sodiumMg: 300,
      potassiumMg: 500,
      calciumMg: 500,
      magnesiumMg: 90,
      zincMg: 3.0,
    };
    return {
      id: 'food-whey-protein',
      canonicalName: 'whey protein powder, vanilla',
      displayName: 'Whey protein powder (vanilla)',
      aliases: ['whey protein', 'protein powder', 'whey', 'vanilla whey'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-whey-protein',
      sourceDescription: 'Vanilla whey protein concentrate/isolate blend powder, ~80% protein.',
      recordType: 'generic',
      foodGroup: 'Supplements',
      preparationState: 'dried',
      nutrientsPer100g: n,
      allergens: ['milk'],
      dataQuality: buildQuality(n, 'estimated', ['High-protein supplement powder; macros are label-typical estimates.']),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 4. Mixed berries, raw
  (() => {
    const n = {
      energyKcal: 43,
      proteinG: 1.0,
      carbohydrateG: 8.0,
      sugarsG: 6.5,
      fibreG: 3.0,
      fatG: 0.4,
      saturatedFatG: 0.0,
      sodiumMg: 1,
      potassiumMg: 150,
      calciumMg: 25,
      ironMg: 0.6,
      magnesiumMg: 18,
      vitaminCMg: 20,
    };
    return {
      id: 'food-mixed-berries',
      canonicalName: 'mixed berries, raw',
      displayName: 'Mixed berries (raw)',
      aliases: ['mixed berries', 'berries', 'summer berries', 'frozen berries'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-mixed-berries',
      sourceDescription: 'Mixed berries (strawberry, raspberry, blackberry, blueberry), raw.',
      recordType: 'generic',
      foodGroup: 'Fruit',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 5. Blueberries, raw
  (() => {
    const n = {
      energyKcal: 57,
      proteinG: 0.7,
      carbohydrateG: 12.1,
      sugarsG: 10.0,
      fibreG: 2.4,
      fatG: 0.3,
      saturatedFatG: 0.0,
      sodiumMg: 1,
      potassiumMg: 77,
      calciumMg: 6,
      ironMg: 0.3,
      magnesiumMg: 6,
      vitaminCMg: 9.7,
      vitaminKUg: 19.3,
    };
    return {
      id: 'food-blueberries',
      canonicalName: 'blueberries, raw',
      displayName: 'Blueberries (raw)',
      aliases: ['blueberries', 'blueberry'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-blueberries',
      sourceDescription: 'Fresh blueberries, raw.',
      recordType: 'generic',
      foodGroup: 'Fruit',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 6. Peanut butter
  (() => {
    const n = {
      energyKcal: 600,
      proteinG: 25.0,
      carbohydrateG: 12.0,
      sugarsG: 6.0,
      fibreG: 6.0,
      fatG: 50.0,
      saturatedFatG: 9.0,
      sodiumMg: 400,
      potassiumMg: 650,
      calciumMg: 45,
      ironMg: 2.0,
      magnesiumMg: 160,
      zincMg: 2.9,
    };
    return {
      id: 'food-peanut-butter',
      canonicalName: 'peanut butter',
      displayName: 'Peanut butter',
      aliases: ['peanut butter', 'pb', 'smooth peanut butter'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-peanut-butter',
      sourceDescription: 'Peanut butter, typical smooth, lightly salted.',
      recordType: 'generic',
      foodGroup: 'Nuts & seeds',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      allergens: ['peanuts'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 7. Honey
  (() => {
    const n = {
      energyKcal: 329,
      proteinG: 0.4,
      carbohydrateG: 82.0,
      sugarsG: 82.0,
      fibreG: 0.2,
      fatG: 0,
      saturatedFatG: 0,
      sodiumMg: 4,
      potassiumMg: 52,
      calciumMg: 5,
    };
    return {
      id: 'food-honey',
      canonicalName: 'honey',
      displayName: 'Honey',
      aliases: ['honey', 'clear honey', 'runny honey'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-honey',
      sourceDescription: 'Honey, clear/runny.',
      recordType: 'generic',
      foodGroup: 'Sugars & preserves',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 8. Table salt
  (() => {
    const n = {
      energyKcal: 0,
      proteinG: 0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 0,
      saturatedFatG: 0,
      sodiumMg: 38758,
      saltG: 98.5,
      potassiumMg: 8,
      calciumMg: 24,
      ironMg: 0.3,
    };
    return {
      id: 'food-salt',
      canonicalName: 'table salt',
      displayName: 'Table salt',
      aliases: ['salt', 'table salt', 'sea salt', 'sodium chloride'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-salt',
      sourceDescription: 'Pure table salt (sodium chloride). Sodium is intentionally very high per 100g.',
      recordType: 'generic',
      foodGroup: 'Seasonings',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated', ['Pure salt: sodium ~38,758 mg/100g by design. Used in pinch quantities.']),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 9. White rice, dry/raw
  (() => {
    const n = {
      energyKcal: 355,
      proteinG: 7.3,
      carbohydrateG: 78.0,
      sugarsG: 0.5,
      fibreG: 1.4,
      fatG: 1.0,
      saturatedFatG: 0.3,
      sodiumMg: 4,
      potassiumMg: 110,
      calciumMg: 18,
      ironMg: 0.8,
      magnesiumMg: 25,
      zincMg: 1.3,
    };
    return {
      id: 'food-white-rice-dry',
      canonicalName: 'white rice, dry',
      displayName: 'White rice (dry)',
      aliases: ['white rice', 'long grain rice', 'dry rice', 'uncooked rice'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-white-rice-dry',
      sourceDescription: 'White long-grain rice, raw uncooked dry weight.',
      recordType: 'generic',
      foodGroup: 'Cereals & grains',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 10. White rice, boiled
  (() => {
    const n = {
      energyKcal: 130,
      proteinG: 2.6,
      carbohydrateG: 28.0,
      sugarsG: 0.1,
      fibreG: 0.4,
      fatG: 0.3,
      saturatedFatG: 0.1,
      sodiumMg: 1,
      potassiumMg: 35,
      calciumMg: 6,
      ironMg: 0.2,
      magnesiumMg: 8,
      zincMg: 0.5,
    };
    return {
      id: 'food-white-rice-boiled',
      canonicalName: 'white rice, boiled',
      displayName: 'White rice (boiled)',
      aliases: ['boiled rice', 'cooked white rice', 'cooked rice', 'steamed rice'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-white-rice-boiled',
      sourceDescription: 'White long-grain rice, boiled/cooked (hydrated weight).',
      recordType: 'generic',
      foodGroup: 'Cereals & grains',
      preparationState: 'boiled',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 11. Basmati rice, dry
  (() => {
    const n = {
      energyKcal: 350,
      proteinG: 8.5,
      carbohydrateG: 77.0,
      sugarsG: 0.4,
      fibreG: 1.5,
      fatG: 0.9,
      saturatedFatG: 0.2,
      sodiumMg: 3,
      potassiumMg: 115,
      calciumMg: 15,
      ironMg: 0.9,
      magnesiumMg: 28,
      zincMg: 1.2,
    };
    return {
      id: 'food-basmati-dry',
      canonicalName: 'basmati rice, dry',
      displayName: 'Basmati rice (dry)',
      aliases: ['basmati', 'basmati rice', 'dry basmati'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-basmati-dry',
      sourceDescription: 'White basmati rice, raw uncooked dry weight.',
      recordType: 'generic',
      foodGroup: 'Cereals & grains',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 12. Basmati rice, boiled
  (() => {
    const n = {
      energyKcal: 128,
      proteinG: 3.1,
      carbohydrateG: 27.5,
      sugarsG: 0.1,
      fibreG: 0.5,
      fatG: 0.4,
      saturatedFatG: 0.1,
      sodiumMg: 1,
      potassiumMg: 38,
      calciumMg: 5,
      ironMg: 0.3,
      magnesiumMg: 9,
      zincMg: 0.4,
    };
    return {
      id: 'food-basmati-boiled',
      canonicalName: 'basmati rice, boiled',
      displayName: 'Basmati rice (boiled)',
      aliases: ['cooked basmati', 'boiled basmati', 'basmati rice cooked'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-basmati-boiled',
      sourceDescription: 'White basmati rice, boiled/cooked (hydrated weight).',
      recordType: 'generic',
      foodGroup: 'Cereals & grains',
      preparationState: 'boiled',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 13. Chickpeas, tinned, drained
  (() => {
    const n = {
      energyKcal: 139,
      proteinG: 7.2,
      carbohydrateG: 18.0,
      sugarsG: 0.9,
      fibreG: 6.0,
      fatG: 2.5,
      saturatedFatG: 0.3,
      sodiumMg: 220,
      potassiumMg: 220,
      calciumMg: 45,
      ironMg: 1.7,
      magnesiumMg: 40,
      zincMg: 1.1,
    };
    return {
      id: 'food-chickpeas-drained',
      canonicalName: 'chickpeas, tinned, drained',
      displayName: 'Chickpeas (tinned, drained)',
      aliases: ['chickpeas', 'garbanzo beans', 'tinned chickpeas', 'canned chickpeas'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-chickpeas-drained',
      sourceDescription: 'Chickpeas, tinned in water, drained.',
      recordType: 'generic',
      foodGroup: 'Pulses & legumes',
      preparationState: 'drained',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 14. Salmon fillet, raw
  (() => {
    const n = {
      energyKcal: 183,
      proteinG: 20.0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 11.0,
      saturatedFatG: 2.2,
      omega3G: 2.3,
      sodiumMg: 50,
      potassiumMg: 380,
      calciumMg: 12,
      ironMg: 0.5,
      magnesiumMg: 26,
      zincMg: 0.4,
      seleniumUg: 24,
      vitaminDMcg: 8.0,
      vitaminB12Ug: 3.0,
    };
    return {
      id: 'food-salmon-raw',
      canonicalName: 'salmon fillet, raw',
      displayName: 'Salmon fillet (raw)',
      aliases: ['salmon', 'salmon fillet', 'raw salmon', 'fresh salmon'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-salmon-raw',
      sourceDescription: 'Atlantic salmon fillet, raw, flesh only.',
      recordType: 'generic',
      foodGroup: 'Fish & seafood',
      preparationState: 'raw',
      nutrientsPer100g: n,
      allergens: ['fish'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 15. Salmon fillet, cooked
  (() => {
    const n = {
      energyKcal: 215,
      proteinG: 24.0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 13.0,
      saturatedFatG: 2.6,
      omega3G: 2.5,
      sodiumMg: 60,
      potassiumMg: 400,
      calciumMg: 15,
      ironMg: 0.6,
      magnesiumMg: 30,
      zincMg: 0.5,
      seleniumUg: 30,
      vitaminDMcg: 9.0,
      vitaminB12Ug: 3.2,
    };
    return {
      id: 'food-salmon-cooked',
      canonicalName: 'salmon fillet, cooked',
      displayName: 'Salmon fillet (cooked)',
      aliases: ['cooked salmon', 'baked salmon', 'grilled salmon', 'salmon fillet cooked'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-salmon-cooked',
      sourceDescription: 'Atlantic salmon fillet, grilled/baked, flesh only.',
      recordType: 'generic',
      foodGroup: 'Fish & seafood',
      preparationState: 'baked',
      nutrientsPer100g: n,
      allergens: ['fish'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 16. Firm tofu, calcium-set
  (() => {
    const n = {
      energyKcal: 120,
      proteinG: 13.0,
      carbohydrateG: 1.5,
      sugarsG: 0.6,
      fibreG: 0.9,
      fatG: 7.0,
      saturatedFatG: 1.0,
      sodiumMg: 12,
      potassiumMg: 150,
      calciumMg: 350,
      ironMg: 2.5,
      magnesiumMg: 60,
      zincMg: 1.6,
    };
    return {
      id: 'food-tofu-calcium-set',
      canonicalName: 'firm tofu, calcium-set',
      displayName: 'Firm tofu (calcium-set)',
      aliases: ['tofu', 'firm tofu', 'bean curd', 'calcium set tofu'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-tofu-calcium-set',
      sourceDescription: 'Firm tofu set with calcium sulphate; calcium is elevated by the setting agent.',
      recordType: 'generic',
      foodGroup: 'Pulses & legumes',
      preparationState: 'raw',
      nutrientsPer100g: n,
      allergens: ['soya'],
      dataQuality: buildQuality(n, 'estimated', ['Calcium-set tofu; calcium (~350 mg/100g) depends on the coagulant used.']),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 17. Egg, chicken, raw whole
  (() => {
    const n = {
      energyKcal: 143,
      proteinG: 12.6,
      carbohydrateG: 0.7,
      sugarsG: 0.4,
      fibreG: 0,
      fatG: 9.5,
      saturatedFatG: 2.9,
      cholesterolMg: 372,
      sodiumMg: 140,
      potassiumMg: 138,
      calciumMg: 56,
      ironMg: 1.8,
      magnesiumMg: 12,
      zincMg: 1.3,
      seleniumUg: 30,
      vitaminDMcg: 2.0,
      vitaminB12Ug: 1.1,
    };
    return {
      id: 'food-egg-raw',
      canonicalName: 'egg, chicken, raw whole',
      displayName: 'Egg, whole (raw)',
      aliases: ['egg', 'eggs', 'whole egg', 'chicken egg', 'raw egg'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-egg-raw',
      sourceDescription: 'Whole chicken egg, raw, edible portion (no shell).',
      recordType: 'generic',
      foodGroup: 'Eggs',
      preparationState: 'raw',
      nutrientsPer100g: n,
      allergens: ['egg'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 18. Chicken breast, skinless, raw
  (() => {
    const n = {
      energyKcal: 106,
      proteinG: 23.0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 1.5,
      saturatedFatG: 0.4,
      cholesterolMg: 70,
      sodiumMg: 60,
      potassiumMg: 350,
      calciumMg: 8,
      ironMg: 0.4,
      magnesiumMg: 27,
      zincMg: 0.8,
      seleniumUg: 22,
    };
    return {
      id: 'food-chicken-breast-raw',
      canonicalName: 'chicken breast, skinless, raw',
      displayName: 'Chicken breast, skinless (raw)',
      aliases: ['chicken breast', 'raw chicken breast', 'chicken fillet', 'skinless chicken breast'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-chicken-breast-raw',
      sourceDescription: 'Chicken breast, skinless, boneless, raw.',
      recordType: 'generic',
      foodGroup: 'Poultry',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 19. Chicken breast, skinless, grilled
  (() => {
    const n = {
      energyKcal: 165,
      proteinG: 31.0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 3.6,
      saturatedFatG: 1.0,
      cholesterolMg: 85,
      sodiumMg: 75,
      potassiumMg: 390,
      calciumMg: 11,
      ironMg: 0.5,
      magnesiumMg: 31,
      zincMg: 1.0,
      seleniumUg: 27,
    };
    return {
      id: 'food-chicken-breast-grilled',
      canonicalName: 'chicken breast, skinless, grilled',
      displayName: 'Chicken breast, skinless (grilled)',
      aliases: ['grilled chicken breast', 'cooked chicken breast', 'grilled chicken', 'chicken breast cooked'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-chicken-breast-grilled',
      sourceDescription: 'Chicken breast, skinless, boneless, grilled; protein denser after water loss.',
      recordType: 'generic',
      foodGroup: 'Poultry',
      preparationState: 'grilled',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 20. Banana, raw
  (() => {
    const n = {
      energyKcal: 95,
      proteinG: 1.2,
      carbohydrateG: 23.0,
      sugarsG: 20.9,
      fibreG: 1.1,
      fatG: 0.3,
      saturatedFatG: 0.1,
      sodiumMg: 1,
      potassiumMg: 358,
      calciumMg: 5,
      ironMg: 0.3,
      magnesiumMg: 27,
      vitaminB6Mg: 0.37,
      vitaminCMg: 8.7,
    };
    return {
      id: 'food-banana',
      canonicalName: 'banana, raw',
      displayName: 'Banana (raw)',
      aliases: ['banana', 'bananas', 'ripe banana'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-banana',
      sourceDescription: 'Banana, raw, flesh only (edible portion).',
      recordType: 'generic',
      foodGroup: 'Fruit',
      preparationState: 'raw',
      ediblePortion: 0.64,
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 21. Apple, raw
  (() => {
    const n = {
      energyKcal: 52,
      proteinG: 0.3,
      carbohydrateG: 11.6,
      sugarsG: 10.4,
      fibreG: 1.8,
      fatG: 0.2,
      saturatedFatG: 0.0,
      sodiumMg: 1,
      potassiumMg: 107,
      calciumMg: 6,
      ironMg: 0.1,
      magnesiumMg: 5,
      vitaminCMg: 4.6,
    };
    return {
      id: 'food-apple',
      canonicalName: 'apple, raw',
      displayName: 'Apple (raw)',
      aliases: ['apple', 'apples', 'eating apple'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-apple',
      sourceDescription: 'Apple, raw, flesh and skin (edible portion, core removed).',
      recordType: 'generic',
      foodGroup: 'Fruit',
      preparationState: 'raw',
      ediblePortion: 0.9,
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 22. Avocado, raw
  (() => {
    const n = {
      energyKcal: 190,
      proteinG: 1.9,
      carbohydrateG: 1.9,
      sugarsG: 0.5,
      fibreG: 6.7,
      fatG: 19.5,
      saturatedFatG: 4.1,
      monounsaturatedFatG: 12.5,
      sodiumMg: 6,
      potassiumMg: 485,
      calciumMg: 12,
      ironMg: 0.6,
      magnesiumMg: 29,
      vitaminCMg: 10,
      vitaminKUg: 21,
      folateUg: 81,
    };
    return {
      id: 'food-avocado',
      canonicalName: 'avocado, raw',
      displayName: 'Avocado (raw)',
      aliases: ['avocado', 'avocados', 'hass avocado'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-avocado',
      sourceDescription: 'Avocado, raw, flesh only (edible portion).',
      recordType: 'generic',
      foodGroup: 'Fruit',
      preparationState: 'raw',
      ediblePortion: 0.71,
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 23. Extra virgin olive oil
  (() => {
    const n = {
      energyKcal: 899,
      proteinG: 0,
      carbohydrateG: 0,
      sugarsG: 0,
      fibreG: 0,
      fatG: 99.9,
      saturatedFatG: 14.0,
      monounsaturatedFatG: 73.0,
      polyunsaturatedFatG: 11.0,
      sodiumMg: 1,
      vitaminEUg: 14000,
      vitaminKUg: 60,
    };
    return {
      id: 'food-olive-oil',
      canonicalName: 'extra virgin olive oil',
      displayName: 'Extra virgin olive oil',
      aliases: ['olive oil', 'evoo', 'extra virgin olive oil'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-olive-oil',
      sourceDescription: 'Extra virgin olive oil; essentially pure fat.',
      recordType: 'generic',
      foodGroup: 'Fats & oils',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 24. Ground cinnamon
  (() => {
    const n = {
      energyKcal: 247,
      proteinG: 4.0,
      carbohydrateG: 55.0,
      sugarsG: 2.2,
      fibreG: 53.0,
      fatG: 1.2,
      saturatedFatG: 0.3,
      sodiumMg: 10,
      potassiumMg: 431,
      calciumMg: 1002,
      ironMg: 8.3,
      magnesiumMg: 60,
    };
    return {
      id: 'food-cinnamon',
      canonicalName: 'ground cinnamon',
      displayName: 'Ground cinnamon',
      aliases: ['cinnamon', 'ground cinnamon', 'cinnamon powder'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-cinnamon',
      sourceDescription: 'Ground cinnamon spice. Used in pinch/teaspoon quantities.',
      recordType: 'generic',
      foodGroup: 'Herbs & spices',
      preparationState: 'dried',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 25. Spinach, raw
  (() => {
    const n = {
      energyKcal: 25,
      proteinG: 2.8,
      carbohydrateG: 1.6,
      sugarsG: 0.4,
      fibreG: 2.1,
      fatG: 0.8,
      saturatedFatG: 0.1,
      sodiumMg: 79,
      potassiumMg: 558,
      calciumMg: 99,
      ironMg: 2.7,
      magnesiumMg: 79,
      zincMg: 0.5,
      vitaminCMg: 26,
      vitaminKUg: 483,
      folateUg: 194,
    };
    return {
      id: 'food-spinach-raw',
      canonicalName: 'spinach, raw',
      displayName: 'Spinach (raw)',
      aliases: ['spinach', 'raw spinach', 'baby spinach', 'fresh spinach'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-spinach-raw',
      sourceDescription: 'Spinach leaves, raw.',
      recordType: 'generic',
      foodGroup: 'Vegetables',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 26. Baby spinach, wilted/cooked
  (() => {
    const n = {
      energyKcal: 23,
      proteinG: 3.0,
      carbohydrateG: 1.5,
      sugarsG: 0.4,
      fibreG: 2.4,
      fatG: 0.7,
      saturatedFatG: 0.1,
      sodiumMg: 70,
      potassiumMg: 466,
      calciumMg: 136,
      ironMg: 3.6,
      magnesiumMg: 87,
      zincMg: 0.8,
      vitaminCMg: 10,
      vitaminKUg: 494,
      folateUg: 146,
    };
    return {
      id: 'food-spinach-cooked',
      canonicalName: 'spinach, cooked',
      displayName: 'Spinach (wilted/cooked)',
      aliases: ['cooked spinach', 'wilted spinach', 'boiled spinach', 'sauteed spinach'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-spinach-cooked',
      sourceDescription: 'Spinach, wilted/cooked, drained. Volume reduces sharply on cooking.',
      recordType: 'generic',
      foodGroup: 'Vegetables',
      preparationState: 'cooked',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 27. Wholemeal bread
  (() => {
    const n = {
      energyKcal: 247,
      proteinG: 9.4,
      carbohydrateG: 42.0,
      sugarsG: 2.8,
      fibreG: 7.0,
      fatG: 2.5,
      saturatedFatG: 0.6,
      sodiumMg: 450,
      saltG: 1.1,
      potassiumMg: 230,
      calciumMg: 90,
      ironMg: 2.5,
      magnesiumMg: 76,
      zincMg: 1.5,
    };
    return {
      id: 'food-wholemeal-bread',
      canonicalName: 'wholemeal bread',
      displayName: 'Wholemeal bread',
      aliases: ['wholemeal bread', 'wholewheat bread', 'brown bread', 'wholegrain bread'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-wholemeal-bread',
      sourceDescription: 'Wholemeal sliced bread, typical UK loaf.',
      recordType: 'generic',
      foodGroup: 'Bread & bakery',
      preparationState: 'baked',
      nutrientsPer100g: n,
      allergens: ['gluten', 'wheat'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 28. Greek yoghurt, 0% fat
  (() => {
    const n = {
      energyKcal: 57,
      proteinG: 10.0,
      carbohydrateG: 4.0,
      sugarsG: 4.0,
      fibreG: 0,
      fatG: 0.2,
      saturatedFatG: 0.1,
      sodiumMg: 44,
      potassiumMg: 141,
      calciumMg: 110,
      magnesiumMg: 11,
      zincMg: 0.5,
      vitaminB12Ug: 0.8,
    };
    return {
      id: 'food-greek-yoghurt-0',
      canonicalName: 'greek yoghurt, 0% fat',
      displayName: 'Greek yoghurt (0% fat)',
      aliases: ['greek yoghurt', 'fat free greek yoghurt', '0% greek yoghurt', 'greek yogurt'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-greek-yoghurt-0',
      sourceDescription: 'Fat-free (0%) strained Greek-style yoghurt.',
      recordType: 'generic',
      foodGroup: 'Dairy',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      allergens: ['milk'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 29. Greek yoghurt, full-fat
  (() => {
    const n = {
      energyKcal: 133,
      proteinG: 6.0,
      carbohydrateG: 4.5,
      sugarsG: 4.5,
      fibreG: 0,
      fatG: 10.0,
      saturatedFatG: 6.5,
      sodiumMg: 40,
      potassiumMg: 130,
      calciumMg: 100,
      magnesiumMg: 10,
      zincMg: 0.5,
      vitaminB12Ug: 0.7,
    };
    return {
      id: 'food-greek-yoghurt-full',
      canonicalName: 'greek yoghurt, full-fat',
      displayName: 'Greek yoghurt (full-fat)',
      aliases: ['full fat greek yoghurt', 'greek yoghurt', 'authentic greek yoghurt', 'greek yogurt'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-greek-yoghurt-full',
      sourceDescription: 'Full-fat strained Greek-style yoghurt.',
      recordType: 'generic',
      foodGroup: 'Dairy',
      preparationState: 'unknown',
      nutrientsPer100g: n,
      allergens: ['milk'],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 30. Cherry tomatoes, raw
  (() => {
    const n = {
      energyKcal: 20,
      proteinG: 0.9,
      carbohydrateG: 3.1,
      sugarsG: 2.9,
      fibreG: 1.1,
      fatG: 0.2,
      saturatedFatG: 0.0,
      sodiumMg: 5,
      potassiumMg: 237,
      calciumMg: 10,
      ironMg: 0.3,
      magnesiumMg: 11,
      vitaminCMg: 14,
    };
    return {
      id: 'food-cherry-tomatoes',
      canonicalName: 'cherry tomatoes, raw',
      displayName: 'Cherry tomatoes (raw)',
      aliases: ['cherry tomatoes', 'tomatoes', 'cherry tomato', 'baby tomatoes'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-cherry-tomatoes',
      sourceDescription: 'Cherry tomatoes, raw.',
      recordType: 'generic',
      foodGroup: 'Vegetables',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 31. Broccoli, boiled
  (() => {
    const n = {
      energyKcal: 35,
      proteinG: 2.4,
      carbohydrateG: 4.0,
      sugarsG: 1.4,
      fibreG: 2.3,
      fatG: 0.4,
      saturatedFatG: 0.1,
      sodiumMg: 8,
      potassiumMg: 220,
      calciumMg: 40,
      ironMg: 0.7,
      magnesiumMg: 13,
      zincMg: 0.4,
      vitaminCMg: 45,
      vitaminKUg: 141,
      folateUg: 65,
    };
    return {
      id: 'food-broccoli-boiled',
      canonicalName: 'broccoli, boiled',
      displayName: 'Broccoli (boiled)',
      aliases: ['broccoli', 'boiled broccoli', 'cooked broccoli', 'steamed broccoli'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-broccoli-boiled',
      sourceDescription: 'Broccoli florets, boiled, drained.',
      recordType: 'generic',
      foodGroup: 'Vegetables',
      preparationState: 'boiled',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 32. Red lentils, dry
  (() => {
    const n = {
      energyKcal: 318,
      proteinG: 24.0,
      carbohydrateG: 50.0,
      sugarsG: 2.0,
      fibreG: 11.0,
      fatG: 1.3,
      saturatedFatG: 0.2,
      sodiumMg: 6,
      potassiumMg: 940,
      calciumMg: 51,
      ironMg: 7.6,
      magnesiumMg: 100,
      zincMg: 3.9,
      folateUg: 200,
    };
    return {
      id: 'food-red-lentils-dry',
      canonicalName: 'red lentils, dry',
      displayName: 'Red lentils (dry)',
      aliases: ['red lentils', 'lentils', 'dry lentils', 'split red lentils'],
      source: 'manual-reviewed',
      sourceRecordId: 'manual-red-lentils-dry',
      sourceDescription: 'Red split lentils, raw uncooked dry weight.',
      recordType: 'generic',
      foodGroup: 'Pulses & legumes',
      preparationState: 'raw',
      nutrientsPer100g: n,
      dataQuality: buildQuality(n, 'estimated'),
      provenance: provenance(),
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),

  // 33. Chia seeds, dried — no CoFID 2021 record exists; values from USDA FoodData
  //     Central "Seeds, chia seeds, dried" (SR Legacy, public domain / CC0).
  (() => {
    const n = {
      energyKcal: 486,
      proteinG: 16.5,
      carbohydrateG: 42.1,
      sugarsG: 0,
      fibreG: 34.4,
      fatG: 30.7,
      saturatedFatG: 3.3,
      omega3G: 17.8,
      sodiumMg: 16,
      potassiumMg: 407,
      calciumMg: 631,
      ironMg: 7.7,
      magnesiumMg: 335,
      zincMg: 4.6,
    };
    return {
      id: 'food-chia-seeds',
      canonicalName: 'chia seeds, dried',
      displayName: 'Chia seeds (dried)',
      aliases: ['chia', 'chia seeds', 'dried chia'],
      source: 'manual-reviewed',
      sourceRecordId: 'usda-fdc-170554',
      sourceDescription: 'Seeds, chia seeds, dried (USDA FoodData Central SR Legacy 170554, public domain).',
      sourceUrl: 'https://fdc.nal.usda.gov/food-details/170554/nutrients',
      recordType: 'generic',
      foodGroup: 'Nuts & seeds',
      preparationState: 'dried',
      nutrientsPer100g: n,
      allergens: [],
      dataQuality: buildQuality(n, 'estimated'),
      provenance: {
        datasetName: 'USDA FoodData Central (SR Legacy)',
        datasetVersion: 'FDC 170554',
        retrievedAt: RETRIEVED_AT,
        transformations: ['Mapped USDA SR Legacy per-100g values onto the canonical model; CoFID 2021 has no chia record.'],
      },
      createdAt: CREATED_AT,
      updatedAt: UPDATED_AT,
    };
  })(),
];
