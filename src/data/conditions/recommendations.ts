import type { DailyTargets, MealSelection, MealSlot, Recipe } from '../../types';
import { MEAL_SLOTS } from '../../types';
import { scaleNutrition } from '../../utils/nutrition';
import { getRecipeNutrition } from '../../utils/recipeCalc';
import { buildConditionDashboard } from './scoring';
import type { ConditionDefinition, RecommendationTrigger } from './types';

export interface ConditionRecommendation {
  id: string;
  tone: 'positive' | 'suggestion';
  text: string;
}

/**
 * Config-driven condition recommendations. Each rule in the ConditionDefinition
 * fires when its trigger evaluates true against the day's computed metrics.
 * Wording comes from the rule text (which inherits evidence-strength language);
 * this runner never invents claims stronger than the stored rule.
 */
export function generateConditionRecommendations(
  def: ConditionDefinition,
  selections: Partial<Record<MealSlot, MealSelection>>,
  targets: DailyTargets,
  recipeById: (id: string) => Recipe | undefined,
): ConditionRecommendation[] {
  const anySelected = MEAL_SLOTS.some((s) => selections[s]);
  if (!anySelected) return [];
  const dash = buildConditionDashboard(selections, def.id, recipeById);

  const breakfastSel = selections.breakfast;
  const breakfast = breakfastSel ? recipeById(breakfastSel.recipeId) : undefined;
  const breakfastFibre = breakfast ? scaleNutrition(getRecipeNutrition(breakfast).nutrition, breakfastSel!.servings).fibre : null;

  const mainProteins = dash.proteinDistribution.filter((p) => p.recipeName);
  const proteinGap = mainProteins.length >= 2 ? Math.max(...mainProteins.map((p) => p.protein)) - Math.min(...mainProteins.map((p) => p.protein)) : 0;

  const evaluate = (trigger: RecommendationTrigger): { fires: boolean; value?: string | number } => {
    switch (trigger) {
      case 'fibre-low':
        return { fires: dash.fibre < targets.fibre - 6, value: dash.fibre };
      case 'breakfast-fibre-low':
        return { fires: breakfastFibre !== null && breakfastFibre < 4, value: breakfastFibre ?? 0 };
      case 'no-oily-fish':
        return { fires: dash.oilyFishSources.length === 0 };
      case 'has-oily-fish':
        return { fires: dash.oilyFishSources.length > 0, value: dash.oilyFishSources.map((s) => s.recipeName).join(', ') };
      case 'refined-carbs':
        return { fires: dash.carbQuality.total > 0 && dash.carbQuality.favourableShare < 0.4 };
      case 'low-plant-diversity':
        return { fires: dash.plantDiversity.total > 0 && dash.plantDiversity.total < 5, value: dash.plantDiversity.total };
      case 'low-fruit-veg-diversity':
        return { fires: dash.fruitVegDiversity.total >= 0 && dash.fruitVegDiversity.total < 5, value: dash.fruitVegDiversity.total };
      case 'protein-uneven':
        return { fires: proteinGap > 25, value: dash.proteinDistribution.find((p) => p.slot === 'breakfast')?.protein ?? 0 };
      case 'low-calcium-foods':
        return { fires: dash.calciumFoods.length < 1 };
      case 'no-soy-foods':
        return { fires: dash.soyFoods.length === 0 };
      case 'has-evidence-ingredients':
        return { fires: dash.evidenceLinks.length > 0, value: dash.evidenceLinks.length };
      case 'gi-symptom-note':
        return { fires: true };
      case 'supplement-context':
        return { fires: true };
      default:
        return { fires: false };
    }
  };

  const recs: ConditionRecommendation[] = [];
  for (const rule of def.recommendationRules) {
    const { fires, value } = evaluate(rule.trigger);
    if (!fires) continue;
    const text = rule.text.replace('{value}', String(value ?? '')).replace('{list}', String(value ?? ''));
    recs.push({ id: rule.id, tone: rule.tone, text });
  }
  return recs;
}
