import { useState } from 'react';
import { Calculator, ChevronDown, ChevronUp, Target } from 'lucide-react';
import type { DailyTargets, Goal } from '../types';
import { Modal, NumberField } from './common';
import {
  ACTIVITY_LEVELS,
  GOALS,
  calculateTargets,
  type ActivityLevel,
} from '../utils/targets';

interface NutritionTargetsFormProps {
  targets: DailyTargets;
  onChange: (targets: DailyTargets) => void;
}

export function NutritionTargetsForm({ targets, onChange }: NutritionTargetsFormProps) {
  const [open, setOpen] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <section aria-label="Daily nutrition targets" className="card no-print p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Target className="h-5 w-5 text-volt-400" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-white">Daily Targets</h2>
          <span className="hidden text-sm text-ink-400 sm:inline">
            {targets.calories} kcal · P {targets.protein}g · C {targets.carbs}g · F {targets.fat}g
          </span>
        </div>
        <button
          type="button"
          className="btn-ghost !py-1.5 text-sm"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {open ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
          {open ? 'Hide' : 'Edit targets'}
        </button>
      </div>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <NumberField id="t-cal" label="Calories" unit="kcal" value={targets.calories} min={800} max={6000} step={10} onChange={(v) => onChange({ ...targets, calories: v })} />
            <NumberField id="t-pro" label="Protein" unit="g" value={targets.protein} min={30} max={400} onChange={(v) => onChange({ ...targets, protein: v })} />
            <NumberField id="t-carb" label="Carbohydrates" unit="g" value={targets.carbs} min={20} max={700} onChange={(v) => onChange({ ...targets, carbs: v })} />
            <NumberField id="t-fat" label="Fat" unit="g" value={targets.fat} min={20} max={250} onChange={(v) => onChange({ ...targets, fat: v })} />
            <NumberField id="t-fib" label="Fibre" unit="g" value={targets.fibre} min={10} max={80} onChange={(v) => onChange({ ...targets, fibre: v })} />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <fieldset>
              <legend className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-300">Goal</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Nutrition goal">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="radio"
                    aria-checked={targets.goal === g.id}
                    className={`chip ${targets.goal === g.id ? 'chip-active' : ''}`}
                    onClick={() => onChange({ ...targets, goal: g.id })}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <button type="button" className="btn-secondary text-sm" onClick={() => setShowCalculator(true)}>
              <Calculator className="h-4 w-4" aria-hidden="true" />
              Calculate My Targets
            </button>
          </div>
        </div>
      )}

      {showCalculator && (
        <TargetCalculatorModal
          initialGoal={targets.goal}
          onApply={(t) => {
            onChange(t);
            setShowCalculator(false);
          }}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </section>
  );
}

function TargetCalculatorModal({
  initialGoal,
  onApply,
  onClose,
}: {
  initialGoal: Goal;
  onApply: (t: DailyTargets) => void;
  onClose: () => void;
}) {
  const [age, setAge] = useState(30);
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(80);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>(initialGoal);
  const [error, setError] = useState<string | null>(null);

  const preview = calculateTargets({ age, sex, heightCm, weightKg, activity, goal });

  const validate = (): boolean => {
    if (age < 16 || age > 100) return setError('Please enter an age between 16 and 100.'), false;
    if (heightCm < 120 || heightCm > 230) return setError('Please enter a height between 120 and 230 cm.'), false;
    if (weightKg < 35 || weightKg > 250) return setError('Please enter a weight between 35 and 250 kg.'), false;
    setError(null);
    return true;
  };

  return (
    <Modal title="Calculate My Targets" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <NumberField id="c-age" label="Age" unit="years" value={age} min={10} max={110} onChange={setAge} />
          <label htmlFor="c-sex" className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Sex</span>
            <select id="c-sex" className="input-field" value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </label>
          <NumberField id="c-height" label="Height" unit="cm" value={heightCm} min={100} max={250} onChange={setHeightCm} />
          <NumberField id="c-weight" label="Weight" unit="kg" value={weightKg} min={30} max={300} onChange={setWeightKg} />
          <label htmlFor="c-activity" className="col-span-2 block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Activity level</span>
            <select id="c-activity" className="input-field" value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
              {ACTIVITY_LEVELS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>
          <label htmlFor="c-goal" className="col-span-2 block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-300">Goal</span>
            <select id="c-goal" className="input-field" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-ink-600 bg-ink-800 p-4">
          <p className="text-sm text-ink-300">Estimated daily targets (Mifflin-St Jeor):</p>
          <p className="mt-1 font-display text-lg font-bold text-white">
            {preview.calories} kcal · {preview.protein}g protein · {preview.carbs}g carbs · {preview.fat}g fat
          </p>
        </div>

        <p className="text-xs text-ink-400">
          This is a general estimate for planning purposes, not medical advice. Individual needs vary —
          consult a registered professional for personalised guidance.
        </p>

        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (validate()) onApply(preview);
            }}
          >
            Use These Targets
          </button>
        </div>
      </div>
    </Modal>
  );
}
