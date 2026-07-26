import type { MicroKey } from '../types';

export interface MicroDef {
  key: MicroKey;
  label: string;
  unit: 'mg' | 'µg';
  /** Estimated adult reference intake (general estimate, varies by individual) */
  rda: number;
  group: 'Vitamins' | 'Minerals';
  /** For sodium the reference is a suggested maximum, not a goal to reach */
  isUpperLimit?: boolean;
}

/**
 * Reference values are general adult estimates based on UK/EU nutrient
 * reference values. They are for planning purposes only — individual
 * requirements vary with age, sex, health, medication, pregnancy and
 * activity level.
 */
export const MICRO_DEFS: MicroDef[] = [
  { key: 'vitaminA', label: 'Vitamin A', unit: 'µg', rda: 800, group: 'Vitamins' },
  { key: 'vitaminB1', label: 'Vitamin B1 (thiamin)', unit: 'mg', rda: 1.1, group: 'Vitamins' },
  { key: 'vitaminB2', label: 'Vitamin B2 (riboflavin)', unit: 'mg', rda: 1.4, group: 'Vitamins' },
  { key: 'vitaminB3', label: 'Vitamin B3 (niacin)', unit: 'mg', rda: 16, group: 'Vitamins' },
  { key: 'vitaminB5', label: 'Vitamin B5 (pantothenic acid)', unit: 'mg', rda: 6, group: 'Vitamins' },
  { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg', rda: 1.4, group: 'Vitamins' },
  { key: 'vitaminB7', label: 'Vitamin B7 (biotin)', unit: 'µg', rda: 50, group: 'Vitamins' },
  { key: 'vitaminB9', label: 'Vitamin B9 (folate)', unit: 'µg', rda: 200, group: 'Vitamins' },
  { key: 'vitaminB12', label: 'Vitamin B12', unit: 'µg', rda: 2.5, group: 'Vitamins' },
  { key: 'vitaminC', label: 'Vitamin C', unit: 'mg', rda: 80, group: 'Vitamins' },
  { key: 'vitaminD', label: 'Vitamin D', unit: 'µg', rda: 10, group: 'Vitamins' },
  { key: 'vitaminE', label: 'Vitamin E', unit: 'mg', rda: 12, group: 'Vitamins' },
  { key: 'vitaminK', label: 'Vitamin K', unit: 'µg', rda: 75, group: 'Vitamins' },
  { key: 'calcium', label: 'Calcium', unit: 'mg', rda: 800, group: 'Minerals' },
  { key: 'iron', label: 'Iron', unit: 'mg', rda: 14, group: 'Minerals' },
  { key: 'magnesium', label: 'Magnesium', unit: 'mg', rda: 375, group: 'Minerals' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg', rda: 700, group: 'Minerals' },
  { key: 'potassium', label: 'Potassium', unit: 'mg', rda: 3500, group: 'Minerals' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', rda: 2400, group: 'Minerals', isUpperLimit: true },
  { key: 'zinc', label: 'Zinc', unit: 'mg', rda: 10, group: 'Minerals' },
  { key: 'copper', label: 'Copper', unit: 'mg', rda: 1, group: 'Minerals' },
  { key: 'manganese', label: 'Manganese', unit: 'mg', rda: 2, group: 'Minerals' },
  { key: 'selenium', label: 'Selenium', unit: 'µg', rda: 55, group: 'Minerals' },
  { key: 'iodine', label: 'Iodine', unit: 'µg', rda: 150, group: 'Minerals' },
];
