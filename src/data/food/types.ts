/**
 * Provider-independent canonical food model.
 *
 * The rest of the application depends on THIS model, never on CoFID / USDA FDC /
 * Open Food Facts response shapes. Adapters map each provider's raw response
 * onto CanonicalFood + CanonicalNutrition.
 *
 * Hard rules encoded here (see docs/FOOD_DATA_ENGINE_AUDIT.md):
 * - Every nutrient field is unit-suffixed. No ambiguous units.
 * - Every nutrient is OPTIONAL. A missing nutrient is `undefined`, never 0.
 *   (A missing value is not a measured value of zero.)
 * - Composition data answers "what nutrients does this food contain?" only —
 *   never a medical claim. Condition relevance lives in src/data/conditions.
 */

export type FoodDataSource = 'cofid' | 'usda-fdc' | 'open-food-facts' | 'manual-reviewed';

export type FoodRecordType = 'generic' | 'branded' | 'recipe' | 'supplement' | 'unknown';

export type PreparationState =
  | 'raw'
  | 'cooked'
  | 'boiled'
  | 'steamed'
  | 'fried'
  | 'baked'
  | 'grilled'
  | 'roasted'
  | 'drained'
  | 'dried'
  | 'reconstituted'
  | 'unknown';

/**
 * Canonical nutrient schema, per 100 g of edible portion. Units are explicit and
 * fixed. Conversions between provider units and these are documented in
 * conversions.ts. Never conflate: µg vs mg; sodium vs salt; folate vs folic acid;
 * vitamin A retinol vs retinol-equivalents; vitamin D µg vs IU; niacin vs niacin
 * equivalents.
 */
export interface CanonicalNutrition {
  energyKcal?: number;
  energyKj?: number;

  proteinG?: number;
  carbohydrateG?: number;
  sugarsG?: number;
  addedSugarsG?: number;
  fibreG?: number;

  fatG?: number;
  saturatedFatG?: number;
  monounsaturatedFatG?: number;
  polyunsaturatedFatG?: number;
  transFatG?: number;

  omega3G?: number;
  omega6G?: number;
  epaMg?: number;
  dhaMg?: number;
  alaMg?: number;

  cholesterolMg?: number;

  sodiumMg?: number;
  saltG?: number;
  potassiumMg?: number;

  calciumMg?: number;
  phosphorusMg?: number;
  magnesiumMg?: number;
  ironMg?: number;
  zincMg?: number;
  copperMg?: number;
  manganeseMg?: number;
  seleniumUg?: number;
  iodineUg?: number;

  vitaminAUg?: number; // retinol equivalents (RE)
  retinolUg?: number;
  betaCaroteneUg?: number;

  vitaminDMcg?: number;
  vitaminEUg?: number; // note: some sources report mg α-tocopherol; converted + documented
  vitaminKUg?: number;

  thiaminMg?: number;
  riboflavinMg?: number;
  niacinMg?: number;
  pantothenicAcidMg?: number;
  vitaminB6Mg?: number;
  biotinUg?: number;
  folateUg?: number;
  vitaminB12Ug?: number;
  vitaminCMg?: number;

  alcoholG?: number;
  waterG?: number;
}

export type FoodDataQualityStatus =
  | 'verified-primary' // CoFID (UK primary)
  | 'verified-secondary' // USDA FDC Foundation / SR Legacy
  | 'label-declared' // Open Food Facts / manufacturer label
  | 'estimated' // manual-reviewed estimate
  | 'incomplete';

export interface FoodDataQuality {
  completenessPercentage: number;
  status: FoodDataQualityStatus;
  warnings: string[];
}

export interface FoodProvenance {
  datasetName: string;
  datasetVersion?: string;
  retrievedAt: string;
  /** Original provider units per source field, for traceability. */
  originalUnits?: Record<string, string>;
  /** Human-readable list of transformations applied (unit conversions, etc.). */
  transformations: string[];
}

export interface CanonicalFood {
  id: string;
  canonicalName: string;
  displayName: string;
  aliases: string[];

  source: FoodDataSource;
  sourceRecordId: string;
  sourceDescription: string;
  sourceUrl?: string;

  recordType: FoodRecordType;

  foodGroup?: string;
  subcategory?: string;

  preparationState?: PreparationState;
  /** Fraction 0–1 of the purchased food that is edible (e.g. after peeling/draining). */
  ediblePortion?: number;

  nutrientsPer100g: CanonicalNutrition;

  allergens?: string[];
  ingredientsText?: string;

  barcode?: string;
  brand?: string;

  dataQuality: FoodDataQuality;
  provenance: FoodProvenance;

  createdAt: string;
  updatedAt: string;
}

// ---- Search / provider contracts ----

export interface FoodSearchQuery {
  text: string;
  /** Restrict to branded/barcode search (enables Open Food Facts). */
  branded?: boolean;
  barcode?: string;
  foodGroup?: string;
  preparationState?: PreparationState;
  limit?: number;
  signal?: AbortSignal;
}

export interface FoodSearchResult {
  food: CanonicalFood;
  /** 0–1 transparent match score; never auto-selected without review. */
  matchScore: number;
  sourceLabel: string; // e.g. "UK CoFID", "USDA FoodData Central", "Open Food Facts", "Manually reviewed"
}

export interface FoodDataProvider {
  readonly source: FoodDataSource;
  readonly sourceLabel: string;
  searchFoods(query: FoodSearchQuery): Promise<FoodSearchResult[]>;
  getFoodById(id: string): Promise<CanonicalFood | null>;
}

// ---- Recipe ingredient linking & quantities ----

export type RecipeUnit = 'g' | 'ml' | 'item' | 'tsp' | 'tbsp' | 'portion' | 'small' | 'medium' | 'large' | 'clove' | 'slice' | 'pinch' | 'scoop' | 'handful';

/** How an ingredient's stated quantity relates to the matched food record. */
export type QuantityBasis = 'raw' | 'cooked' | 'drained' | 'reconstituted' | 'edible-portion' | 'as-served';

export interface StructuredRecipeIngredient {
  id: string;
  displayText: string;
  /** Canonical food id this ingredient resolves to (via ingredientLinks). */
  foodId: string;
  quantity: number;
  unit: RecipeUnit;
  /** Grams the quantity resolves to — ALL nutrition maths uses this. */
  gramWeight: number;
  /** Whether gramWeight represents raw/cooked/drained weight (must match the food record). */
  quantityBasis: QuantityBasis;
  preparationNote?: string;
  optional?: boolean;
}

export type MatchStatus = 'verified' | 'probable' | 'manual-review-required';
export type MatchedBy = 'manual' | 'exact-name' | 'alias' | 'automated-score';

export interface RecipeIngredientFoodLink {
  /** Stable key: `${recipeId}::${ingredientName}` (lower-cased). */
  recipeIngredientId: string;
  canonicalFoodId: string;
  matchStatus: MatchStatus;
  matchedBy: MatchedBy;
  /** Grams that the recipe's stated quantity+unit resolves to (for one serving as authored). */
  gramWeight: number;
  quantityBasis: QuantityBasis;
  /** Negligible aromatics/garnish excluded from the nutrition calculation. */
  optional?: boolean;
  notes?: string;
  reviewedAt?: string;
}

/** Future-ready; retention factors are only applied when sourced. Not applied by default. */
export interface NutrientRetentionProfile {
  cookingMethod: string;
  nutrientFactors: Partial<Record<keyof CanonicalNutrition, number>>;
  sourceReference?: string;
}
