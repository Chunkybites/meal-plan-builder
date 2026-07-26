import type { CanonicalNutrition } from './types';

/**
 * Documented unit conversions. Every conversion here is explicit and tested
 * (see __tests__/conversions.test.ts). Missing values propagate as `undefined`
 * — never coerced to 0.
 *
 * Conventions that MUST NOT be confused:
 * - Sodium (mg) vs salt (g): salt = sodium × 2.5 / 1000; sodium = salt × 1000 / 2.5.
 * - Micrograms (µg) vs milligrams (mg): 1 mg = 1000 µg.
 * - Vitamin D µg vs IU: 1 µg = 40 IU.
 * - Vitamin E: some sources report mg α-tocopherol; we store µg (×1000). Documented per record.
 * - Energy kcal vs kJ: 1 kcal = 4.184 kJ.
 * - Folate vs folic acid, vitamin A retinol vs RE, niacin vs niacin-equivalents are
 *   DIFFERENT quantities and are never silently interconverted; they map to distinct fields.
 */

export const SALT_PER_SODIUM = 2.5; // grams of salt per gram of sodium
export const UG_PER_MG = 1000;
export const IU_PER_UG_VITAMIN_D = 40;
export const KJ_PER_KCAL = 4.184;

/** Multiply a possibly-undefined value by a factor, preserving undefined. */
export function scaleMaybe(value: number | undefined, factor: number): number | undefined {
  return value === undefined || value === null ? undefined : value * factor;
}

export function mgToUg(mg: number | undefined): number | undefined {
  return scaleMaybe(mg, UG_PER_MG);
}
export function ugToMg(ug: number | undefined): number | undefined {
  return scaleMaybe(ug, 1 / UG_PER_MG);
}

/** Salt (g) from sodium (mg). */
export function sodiumMgToSaltG(sodiumMg: number | undefined): number | undefined {
  return scaleMaybe(sodiumMg, SALT_PER_SODIUM / 1000);
}
/** Sodium (mg) from salt (g). */
export function saltGToSodiumMg(saltG: number | undefined): number | undefined {
  return scaleMaybe(saltG, 1000 / SALT_PER_SODIUM);
}

export function vitaminDUgToIu(ug: number | undefined): number | undefined {
  return scaleMaybe(ug, IU_PER_UG_VITAMIN_D);
}
export function vitaminDIuToUg(iu: number | undefined): number | undefined {
  return scaleMaybe(iu, 1 / IU_PER_UG_VITAMIN_D);
}

export function kcalToKj(kcal: number | undefined): number | undefined {
  return scaleMaybe(kcal, KJ_PER_KCAL);
}
export function kjToKcal(kj: number | undefined): number | undefined {
  return scaleMaybe(kj, 1 / KJ_PER_KCAL);
}

/**
 * Derive the complementary sodium/salt and kcal/kJ values when only one is
 * present, so records are internally consistent without inventing data.
 */
export function backfillDerivedNutrients(n: CanonicalNutrition): CanonicalNutrition {
  const out: CanonicalNutrition = { ...n };
  if (out.saltG === undefined && out.sodiumMg !== undefined) out.saltG = round3(sodiumMgToSaltG(out.sodiumMg));
  if (out.sodiumMg === undefined && out.saltG !== undefined) out.sodiumMg = round3(saltGToSodiumMg(out.saltG));
  if (out.energyKj === undefined && out.energyKcal !== undefined) out.energyKj = round3(kcalToKj(out.energyKcal));
  if (out.energyKcal === undefined && out.energyKj !== undefined) out.energyKcal = round3(kjToKcal(out.energyKj));
  return out;
}

function round3(v: number | undefined): number | undefined {
  return v === undefined ? undefined : Math.round(v * 1000) / 1000;
}

/**
 * Sanity relationship for validation only (not enforced on data): Atwater energy
 * estimate from macros. Used by the validator to flag records whose declared
 * energy is implausible versus their macronutrients.
 */
export function atwaterKcal(n: CanonicalNutrition): number | undefined {
  if (n.proteinG === undefined && n.carbohydrateG === undefined && n.fatG === undefined) return undefined;
  const p = n.proteinG ?? 0;
  const c = n.carbohydrateG ?? 0;
  const f = n.fatG ?? 0;
  const fibre = n.fibreG ?? 0;
  const alcohol = n.alcoholG ?? 0;
  // 4/4/9 with fibre at 2 kcal/g and alcohol 7 kcal/g.
  return p * 4 + (c - fibre) * 4 + fibre * 2 + f * 9 + alcohol * 7;
}
