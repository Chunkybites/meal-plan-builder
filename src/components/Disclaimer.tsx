import { Info } from 'lucide-react';

export function Disclaimer() {
  return (
    <aside
      aria-label="Nutrition data disclaimer"
      className="rounded-xl border border-ink-700 bg-ink-850/60 p-4 text-xs leading-relaxed text-ink-400"
    >
      <p className="flex gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
        <span>
          Nutritional values are estimates calculated from food-composition records and recipe quantities.
          Actual values can vary with product brand, ingredient variety, edible portion, preparation, cooking
          method and serving size. This tool is intended for general planning and educational purposes and does
          not replace advice from a registered healthcare professional or dietitian.
        </span>
      </p>
      <p className="mt-2 flex gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
        <span>
          Generic food data is based on the UK Composition of Foods Integrated Dataset (CoFID; Public Health
          England, © Crown copyright, Open Government Licence v3.0), with USDA FoodData Central used as a
          fallback. Packaged-product information from Open Food Facts may be community contributed and can be
          incomplete or outdated — check the product label where accuracy is important.
        </span>
      </p>
    </aside>
  );
}
