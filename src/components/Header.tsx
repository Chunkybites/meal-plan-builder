import { Dumbbell } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-ink-700/60 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-volt-400 text-ink-950 shadow-glow">
            <Dumbbell className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-volt-400">Fuel Kitchen</p>
            <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
              Build Your Own Meal Plan
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-ink-300 sm:text-base">
          Choose your favourite ingredients, discover matching recipes, and build a nutritionally
          balanced day of eating.
        </p>
      </div>
    </header>
  );
}
