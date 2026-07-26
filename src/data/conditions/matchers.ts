import type { Recipe } from '../../types';
import { INGREDIENT_MAP } from '../ingredients';
import { getEvidenceForCondition } from './engine';
import type { ConditionEvidenceItem, ConditionId } from './types';

/**
 * Generic, condition-scoped evidence ↔ recipe/ingredient linking. Word-aware
 * matching (not naive substring) so "veggie" does not match the "egg" keyword;
 * multi-word keywords (e.g. "olive oil") match on the full phrase.
 */

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z]+/).filter(Boolean);
}

function textMatchesKeyword(textLower: string, tokens: string[], keyword: string): boolean {
  const k = keyword.toLowerCase();
  if (k.includes(' ')) return textLower.includes(k);
  return tokens.some((t) => t === k || t.startsWith(k) || (k.length >= 4 && t.includes(k)));
}

function recipeIngredientText(recipe: Recipe): string {
  const baseNames = [recipe.primaryIngredient, ...recipe.additionalIngredients]
    .map((id) => INGREDIENT_MAP[id]?.name ?? id)
    .join(' ');
  const lines = recipe.ingredients.map((i) => i.name).join(' ');
  return `${baseNames} ${lines}`.toLowerCase();
}

function itemMatchesText(item: ConditionEvidenceItem, textLower: string, tokens: string[]): boolean {
  return item.matchKeywords.length > 0 && item.matchKeywords.some((kw) => textMatchesKeyword(textLower, tokens, kw));
}

/** Evidence items relevant to a recipe for the active condition. */
export function getRecipeEvidence(recipe: Recipe, conditionId: ConditionId): ConditionEvidenceItem[] {
  const pool = getEvidenceForCondition(conditionId).filter((i) => i.matchKeywords.length > 0);
  const textLower = recipeIngredientText(recipe);
  const tokens = tokenize(textLower);
  return pool.filter((item) => itemMatchesText(item, textLower, tokens));
}

/** Evidence items relevant to a single base ingredient id for the active condition. */
export function getIngredientEvidence(ingredientId: string, conditionId: ConditionId): ConditionEvidenceItem[] {
  const pool = getEvidenceForCondition(conditionId).filter((i) => i.matchKeywords.length > 0);
  const name = INGREDIENT_MAP[ingredientId]?.name ?? ingredientId;
  const textLower = name.toLowerCase();
  const tokens = tokenize(textLower);
  return pool.filter((item) => itemMatchesText(item, textLower, tokens));
}

export function recipeHasEvidence(recipe: Recipe, conditionId: ConditionId): boolean {
  return getRecipeEvidence(recipe, conditionId).length > 0;
}

export function ingredientHasEvidence(ingredientId: string, conditionId: ConditionId): boolean {
  return getIngredientEvidence(ingredientId, conditionId).length > 0;
}

export interface EvidenceLink {
  item: ConditionEvidenceItem;
  recipeNames: string[];
}

const RANK = { A: 4, B: 3, C: 2, D: 1 } as const;

function bestRank(item: ConditionEvidenceItem, conditionId: ConditionId): number {
  const link = item.conditions.find((c) => c.conditionId === conditionId);
  if (!link) return 0;
  return Math.max(0, ...link.outcomes.map((o) => RANK[o.evidenceLevel]));
}

/** Unique evidence items across a set of recipes, with the recipes that contain each. */
export function getPlanEvidenceLinks(recipes: Recipe[], conditionId: ConditionId): EvidenceLink[] {
  const map = new Map<string, EvidenceLink>();
  for (const recipe of recipes) {
    for (const item of getRecipeEvidence(recipe, conditionId)) {
      const existing = map.get(item.id);
      if (existing) {
        if (!existing.recipeNames.includes(recipe.name)) existing.recipeNames.push(recipe.name);
      } else {
        map.set(item.id, { item, recipeNames: [recipe.name] });
      }
    }
  }
  return [...map.values()].sort((a, b) => bestRank(b.item, conditionId) - bestRank(a.item, conditionId));
}
