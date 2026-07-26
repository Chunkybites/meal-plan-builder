import { useEffect, useMemo, useState } from 'react';
import type {
  DailyTargets,
  MealSelection,
  MealSlot,
  Recipe,
  SavedMealPlan,
} from './types';
import { MEAL_SLOTS } from './types';
import { ALL_RECIPES, getRecipe } from './data/recipes';
import { scaleMicros, scaleNutrition, sumMicros, sumNutrition } from './utils/nutrition';
import { DEFAULT_TARGETS } from './utils/targets';
import { STORAGE_KEYS, loadJSON, saveJSON } from './utils/storage';
import { buildOptimisationProposals, suggestServingsForTargets, type OptimisationProposal } from './utils/optimise';
import { computeNutritionScore } from './utils/score';
import { getRecipeNutrition } from './utils/recipeCalc';
import { generateRecommendations } from './utils/recommendations';
import { generateConditionRecommendations } from './data/conditions/recommendations';
import { getCondition, isConditionId } from './data/conditions/engine';
import type { SupportMode } from './data/conditions/types';
import { Header } from './components/Header';
import { ProgressTracker, STEPS } from './components/ProgressTracker';
import { NutritionTargetsForm } from './components/NutritionTargetsForm';
import { MealBuilder } from './components/MealBuilder';
import { DailyMealSummary } from './components/DailyMealSummary';
import { MacroDashboard } from './components/MacroDashboard';
import { MicroDashboard } from './components/MicroDashboard';
import { NutritionScore } from './components/NutritionScore';
import { SmartRecommendations } from './components/SmartRecommendations';
import { ShoppingList } from './components/ShoppingList';
import { SavedPlans } from './components/SavedPlans';
import { Disclaimer } from './components/Disclaimer';
import { OptimiseModal } from './components/OptimiseModal';
import { RecipeDetailsModal } from './components/RecipeDetailsModal';
import { ConditionSelector } from './components/conditions/ConditionSelector';
import { ConditionDashboard } from './components/conditions/ConditionDashboard';
import { SupplementEvidenceCentre } from './components/conditions/SupplementEvidenceCentre';
import { ResearchCentre } from './components/conditions/ResearchCentre';
import { ResearchMethodologyModal } from './components/conditions/ResearchMethodologyModal';
import { ConditionSafetyNotice } from './components/conditions/ConditionSafetyNotice';
import { RecipeAuthoring } from './components/dev/RecipeAuthoring';

type Selections = Partial<Record<MealSlot, MealSelection>>;

const NEXT_LABELS: Record<MealSlot, string> = {
  breakfast: 'Continue to Lunch',
  lunch: 'Continue to Dinner',
  dinner: 'Continue to Night-Time Snack',
  snack: 'View Daily Summary',
};

export default function App() {
  const [targets, setTargets] = useState<DailyTargets>(() =>
    loadJSON(STORAGE_KEYS.targets, DEFAULT_TARGETS),
  );
  const [selections, setSelections] = useState<Selections>(() =>
    loadJSON<Selections>(STORAGE_KEYS.selections, {}),
  );
  const [favourites, setFavourites] = useState<string[]>(() =>
    loadJSON<string[]>(STORAGE_KEYS.favourites, []),
  );
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>(() =>
    loadJSON<SavedMealPlan[]>(STORAGE_KEYS.savedPlans, []),
  );
  const [activeCondition, setActiveCondition] = useState<SupportMode>(() => {
    const stored = loadJSON<string>(STORAGE_KEYS.activeCondition, '');
    if (stored && (stored === 'general' || isConditionId(stored))) return stored as SupportMode;
    // Migrate the legacy PCOS boolean flag.
    return loadJSON<boolean>(STORAGE_KEYS.pcosMode, false) ? 'pcos' : 'general';
  });
  const [activeStep, setActiveStep] = useState(0);
  const [storageOk, setStorageOk] = useState(true);
  const [optimising, setOptimising] = useState<OptimisationProposal[] | null>(null);
  const [appliedProposals, setAppliedProposals] = useState<string[]>([]);
  const [summaryViewing, setSummaryViewing] = useState<{ recipe: Recipe; slot: MealSlot } | null>(null);
  const [showMethodology, setShowMethodology] = useState(false);
  const [route, setRoute] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    setStorageOk(saveJSON(STORAGE_KEYS.targets, targets));
  }, [targets]);
  useEffect(() => {
    setStorageOk(saveJSON(STORAGE_KEYS.selections, selections));
  }, [selections]);
  useEffect(() => {
    saveJSON(STORAGE_KEYS.favourites, favourites);
  }, [favourites]);
  useEffect(() => {
    saveJSON(STORAGE_KEYS.savedPlans, savedPlans);
  }, [savedPlans]);
  useEffect(() => {
    saveJSON(STORAGE_KEYS.activeCondition, activeCondition);
  }, [activeCondition]);

  const totals = useMemo(
    () =>
      sumNutrition(
        MEAL_SLOTS.flatMap((slot) => {
          const sel = selections[slot];
          const r = sel ? getRecipe(sel.recipeId) : undefined;
          return sel && r ? [scaleNutrition(getRecipeNutrition(r).nutrition, sel.servings)] : [];
        }),
      ),
    [selections],
  );

  const micros = useMemo(
    () =>
      sumMicros(
        MEAL_SLOTS.flatMap((slot) => {
          const sel = selections[slot];
          const r = sel ? getRecipe(sel.recipeId) : undefined;
          return sel && r ? [scaleMicros(getRecipeNutrition(r).micros, sel.servings)] : [];
        }),
      ),
    [selections],
  );

  const allSelected = MEAL_SLOTS.every((s) => Boolean(selections[s]));
  const anySelected = MEAL_SLOTS.some((s) => Boolean(selections[s]));

  const score = useMemo(
    () => computeNutritionScore(totals, micros, targets, selections, getRecipe),
    [totals, micros, targets, selections],
  );
  const recommendations = useMemo(
    () => generateRecommendations(totals, micros, targets, selections, getRecipe),
    [totals, micros, targets, selections],
  );
  const condition = activeCondition === 'general' ? null : getCondition(activeCondition);
  const conditionRecommendations = useMemo(
    () => (condition ? generateConditionRecommendations(condition, selections, targets, getRecipe) : []),
    [condition, selections, targets],
  );

  const setSelection = (slot: MealSlot, sel: MealSelection | undefined) => {
    setSelections((cur) => {
      const next = { ...cur };
      if (sel) next[slot] = sel;
      else delete next[slot];
      return next;
    });
  };

  const goToStep = (i: number) => {
    setActiveStep(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savePlan = (name: string) => {
    const plan: SavedMealPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      createdAt: new Date().toISOString(),
      selections,
      targets,
      totals,
    };
    setSavedPlans((cur) => [plan, ...cur].slice(0, 20));
  };

  const applyProposal = (p: OptimisationProposal) => {
    setSelections((cur) => {
      const sel = cur[p.slot];
      if (!sel) return cur;
      if (p.kind === 'portion' && p.proposedServings) {
        return { ...cur, [p.slot]: { ...sel, servings: p.proposedServings } };
      }
      if (p.kind === 'swap' && p.proposedRecipeId) {
        return { ...cur, [p.slot]: { recipeId: p.proposedRecipeId, servings: sel.servings } };
      }
      return cur;
    });
    setAppliedProposals((cur) => [...cur, p.id]);
  };

  const currentStep = STEPS[activeStep];
  const isSummary = currentStep.id === 'summary';
  const currentSlot = isSummary ? null : (currentStep.id as MealSlot);

  // Dev-only recipe-authoring route. Disabled in production builds unless
  // VITE_ENABLE_AUTHORING=true is explicitly set (never for the public beta).
  const authoringEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_AUTHORING === 'true';
  if (route === '#authoring' && authoringEnabled) return <RecipeAuthoring />;

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="no-print">
        <Header />
      </div>
      <ProgressTracker activeIndex={activeStep} selections={selections} onNavigate={goToStep} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">
        {!storageOk && (
          <p role="alert" className="no-print rounded-lg border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
            Your browser storage is unavailable, so progress will not persist after a refresh. The planner
            still works normally in this session.
          </p>
        )}

        <NutritionTargetsForm targets={targets} onChange={setTargets} />

        <ConditionSelector
          active={activeCondition}
          onSelect={setActiveCondition}
          onOpenMethodology={() => setShowMethodology(true)}
        />

        {currentSlot && (
          <MealBuilder
            key={currentSlot}
            slot={currentSlot}
            selection={selections[currentSlot]}
            favourites={favourites}
            onSelect={(sel) => setSelection(currentSlot, sel)}
            onRemove={() => setSelection(currentSlot, undefined)}
            onChangeServings={(servings) => {
              const sel = selections[currentSlot];
              if (sel) setSelection(currentSlot, { ...sel, servings });
            }}
            onToggleFavourite={(id) =>
              setFavourites((cur) => (cur.includes(id) ? cur.filter((f) => f !== id) : [...cur, id]))
            }
            onAutoFit={(recipe) =>
              suggestServingsForTargets(recipe, currentSlot, selections, targets, getRecipe)
            }
            nextLabel={NEXT_LABELS[currentSlot]}
            onNext={() => goToStep(activeStep + 1)}
            condition={condition}
          />
        )}

        {isSummary && (
          <div className="space-y-6">
            <DailyMealSummary
              selections={selections}
              recipeById={getRecipe}
              onEditMeal={(slot) => goToStep(MEAL_SLOTS.indexOf(slot))}
              onStartAgain={() => {
                if (window.confirm('Start again? This clears your current meal selections (saved plans are kept).')) {
                  setSelections({});
                  setAppliedProposals([]);
                  goToStep(0);
                }
              }}
              onOptimise={() => {
                setAppliedProposals([]);
                setOptimising(buildOptimisationProposals(totals, targets, selections, ALL_RECIPES, getRecipe));
              }}
              onViewRecipe={(recipe, slot) => setSummaryViewing({ recipe, slot })}
            />

            {anySelected && (
              <>
                <MacroDashboard totals={totals} targets={targets} />
                {allSelected && <NutritionScore result={score} />}
                <SmartRecommendations recommendations={recommendations} />
                <MicroDashboard micros={micros} totals={totals} />
                <ShoppingList selections={selections} recipeById={getRecipe} />
              </>
            )}

            {condition && (
              <>
                <ConditionSafetyNotice condition={condition} />
                {anySelected && <ConditionDashboard condition={condition} selections={selections} targets={targets} recipeById={getRecipe} />}
                {anySelected && conditionRecommendations.length > 0 && (
                  <section aria-label={`${condition.shortName} recommendations`} className="card p-4 sm:p-6">
                    <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-bold text-white">
                      <span aria-hidden="true">{condition.emoji}</span> {condition.shortName} Recommendations
                    </h3>
                    <p className="mb-4 text-xs text-ink-400">
                      Evidence-aware ideas based on your plan. Wording reflects how strong the research is — never a
                      claim to treat, cure or reverse {condition.shortName}.
                    </p>
                    <ul className="space-y-2.5">
                      {conditionRecommendations.map((r) => (
                        <li
                          key={r.id}
                          className={`rounded-xl border p-3 text-sm ${
                            r.tone === 'positive'
                              ? 'border-fuchsia-400/30 bg-fuchsia-400/5 text-ink-100'
                              : 'border-ink-600 bg-ink-800 text-ink-200'
                          }`}
                        >
                          {r.text}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <SupplementEvidenceCentre condition={condition} />
                <ResearchCentre condition={condition} />
              </>
            )}

            <SavedPlans
              plans={savedPlans}
              canSave={anySelected}
              onSave={savePlan}
              onLoad={(plan) => {
                setSelections(plan.selections);
                setTargets(plan.targets);
                goToStep(4);
              }}
              onDuplicate={(plan) =>
                setSavedPlans((cur) => [
                  {
                    ...plan,
                    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                    name: `${plan.name} (copy)`,
                    createdAt: new Date().toISOString(),
                  },
                  ...cur,
                ])
              }
              onDelete={(id) => setSavedPlans((cur) => cur.filter((p) => p.id !== id))}
            />
          </div>
        )}

        <Disclaimer />

        <footer className="no-print pb-16 pt-2 text-center text-xs text-ink-500 sm:pb-4">
          Build Your Own Meal Plan — Beta v{__APP_VERSION__} · educational planning tool, not medical advice
        </footer>
      </main>

      {optimising !== null && (
        <OptimiseModal
          proposals={optimising}
          applied={appliedProposals}
          onApply={applyProposal}
          onClose={() => setOptimising(null)}
        />
      )}

      {summaryViewing && (
        <RecipeDetailsModal
          recipe={summaryViewing.recipe}
          initialServings={selections[summaryViewing.slot]?.servings ?? 1}
          onClose={() => setSummaryViewing(null)}
          onAdd={(servings) => {
            setSelection(summaryViewing.slot, { recipeId: summaryViewing.recipe.id, servings });
            setSummaryViewing(null);
          }}
          addLabel="Update Portion"
          condition={condition}
        />
      )}

      {showMethodology && <ResearchMethodologyModal condition={condition ?? undefined} onClose={() => setShowMethodology(false)} />}
    </div>
  );
}
