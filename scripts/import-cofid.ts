/**
 * Reproducible CoFID import pipeline.
 *
 * Reads the OFFICIAL UK CoFID spreadsheet (McCance & Widdowson's Composition of
 * Foods Integrated Dataset, © Crown copyright, Open Government Licence v3.0) and
 * emits normalised canonical food records + a search index + import metadata +
 * a validation report.
 *
 * Usage: place the official file at data-sources/cofid/CoFID.xlsx (download from
 *   https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid )
 * then run:  npm run import-cofid
 *
 * NOTE: the dataset ships as a binary .xlsx and is not redistributed in this repo;
 * this script is delivered ready to run against the file you provide. Until then,
 * the app uses reviewed manual seed foods (src/data/food/seedFoods.ts).
 *
 * CoFID missing-value markers are handled correctly: 'N' (present but not measured)
 * and blank → undefined; 'Tr' (trace) → a small trace value; never coerced to 0.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as XLSX from 'xlsx';
import type { CanonicalFood, CanonicalNutrition } from '../src/data/food/types';
import { buildQuality } from '../src/data/food/quality';
import { backfillDerivedNutrients } from '../src/data/food/conversions';

const SRC_DIR = path.resolve('data-sources/cofid');
const OUT_DIR = path.resolve('src/data/generated/cofid');
const DATASET_VERSION = 'CoFID 2021 (19 March 2021)';
const TRACE_VALUE = 0.01;

/**
 * Map CoFID column ACRONYM codes → canonical nutrient (+ unit factor). Codes and
 * units are from the CoFID 2021 User Guide, Appendix C. Descriptive-name
 * fallbacks are included because some CoFID sheets label columns with full names.
 * Column keys are normalised (upper-cased, punctuation stripped) before lookup.
 *
 * CoFID data is spread across worksheets (Proximates / Inorganics / Vitamins /
 * Fatty acid …), all keyed by food code; the importer merges them by code.
 * Fibre: CoFID gives both Englyst (ENGFIB / NSP) and AOAC (AOACFIB). CoFID 2021
 * headline fibre is AOAC, so AOAC is preferred when both are present.
 * Energy: CoFID KCALS uses protein 4, fat 9, available-carb 3.75, alcohol 7.
 */
const COLUMN_MAP: Record<string, { key: keyof CanonicalNutrition; factor?: number }> = {
  // Proximates
  KCALS: { key: 'energyKcal' },
  KJ: { key: 'energyKj' },
  PROT: { key: 'proteinG' },
  FAT: { key: 'fatG' },
  CHO: { key: 'carbohydrateG' },
  TOTSUG: { key: 'sugarsG' },
  ENGFIB: { key: 'fibreG' }, // NSP; superseded by AOACFIB when present (handled below)
  SATFOD: { key: 'saturatedFatG' },
  MONOFOD: { key: 'monounsaturatedFatG' },
  POLYFOD: { key: 'polyunsaturatedFatG' },
  FODTRANS: { key: 'transFatG' },
  CHOL: { key: 'cholesterolMg' },
  ALCO: { key: 'alcoholG' },
  WATER: { key: 'waterG' },
  // Long-chain omega-3 from the fatty-acid worksheet (g/100g food → mg)
  'FOD20:5': { key: 'epaMg', factor: 1000 }, // EPA
  'FOD22:6': { key: 'dhaMg', factor: 1000 }, // DHA
  'FOD18:3CN3': { key: 'alaMg', factor: 1000 }, // ALA (cis n-3 octadecatrienoic)
  // Inorganics
  NA: { key: 'sodiumMg' },
  K: { key: 'potassiumMg' },
  CA: { key: 'calciumMg' },
  MG: { key: 'magnesiumMg' },
  P: { key: 'phosphorusMg' },
  FE: { key: 'ironMg' },
  CU: { key: 'copperMg' },
  ZN: { key: 'zincMg' },
  MN: { key: 'manganeseMg' },
  SE: { key: 'seleniumUg' },
  I: { key: 'iodineUg' },
  // Vitamins
  RETEQU: { key: 'vitaminAUg' }, // total retinol equivalent (µg)
  RET: { key: 'retinolUg' },
  CAREQU: { key: 'betaCaroteneUg' },
  VITD: { key: 'vitaminDMcg' },
  VITE: { key: 'vitaminEUg', factor: 1000 }, // mg α-TE → µg
  VITK1: { key: 'vitaminKUg' },
  THIA: { key: 'thiaminMg' },
  RIBO: { key: 'riboflavinMg' },
  NIAC: { key: 'niacinMg' },
  VITB6: { key: 'vitaminB6Mg' },
  VITB12: { key: 'vitaminB12Ug' },
  FOLT: { key: 'folateUg' },
  PANTO: { key: 'pantothenicAcidMg' },
  BIOT: { key: 'biotinUg' },
  VITC: { key: 'vitaminCMg' },
};

/** Normalise a header cell to match COLUMN_MAP keys (strip units/punctuation, upper-case). */
function normHeader(raw: string): string {
  return String(raw).toUpperCase().replace(/\(.*?\)/g, '').replace(/[^A-Z0-9:]/g, '').trim();
}
const AOAC_FIBRE_CODE = 'AOACFIB';
const EDIBLE_CODE = 'EDPOR';
const CODE_KEYS = ['FOODCODE', 'NUMB', 'CODE'];
const NAME_KEYS = ['FOODNAME', 'NAME', 'DESC', 'DESCRIPTION'];
const GROUP_KEYS = ['GROUP', 'FOODGROUP'];

function parseValue(raw: unknown): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const s = String(raw).trim();
  if (s === 'N' || s === '' || s.toUpperCase() === 'N') return undefined; // present but not measured
  if (s === 'Tr' || s.toLowerCase() === 'trace') return TRACE_VALUE;
  const num = Number(s.replace(/[^0-9.\-]/g, ''));
  return Number.isFinite(num) ? num : undefined;
}

function detectPrep(name: string): CanonicalFood['preparationState'] {
  const n = name.toLowerCase();
  if (/\braw\b/.test(n)) return 'raw';
  if (/\bboiled\b/.test(n)) return 'boiled';
  if (/\bfried\b/.test(n)) return 'fried';
  if (/\bgrilled\b/.test(n)) return 'grilled';
  if (/\bbaked\b/.test(n)) return 'baked';
  if (/\broasted\b/.test(n)) return 'roasted';
  if (/\bsteamed\b/.test(n)) return 'steamed';
  if (/\bdried\b/.test(n)) return 'dried';
  if (/\bcanned|drained\b/.test(n)) return 'drained';
  return 'unknown';
}

function main() {
  const file = fs.existsSync(SRC_DIR) ? fs.readdirSync(SRC_DIR).find((f) => /\.xlsx?$/i.test(f)) : undefined;
  if (!file) {
    console.error(`No CoFID spreadsheet found in ${SRC_DIR}.`);
    console.error('Download the official file and place it there, then re-run. See docs/food-data-sources.md.');
    process.exit(2);
  }
  const wb = XLSX.read(fs.readFileSync(path.join(SRC_DIR, file)));
  const foods = new Map<string, CanonicalFood>();
  const validation: string[] = [];
  const now = new Date().toISOString().slice(0, 10);

  for (const sheetName of wb.SheetNames) {
    // Read as arrays. CoFID layout: row0 = descriptive headers (Food Code, Protein (g)…),
    // row1 = acronym codes (PROT, NA…), row2 = short names, data from row3.
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[sheetName], { header: 1, defval: '' });
    // A data sheet's header row names Food Code and/or Food Name.
    const headerRowIdx = matrix.findIndex((r) => r.some((c) => [...CODE_KEYS, ...NAME_KEYS].includes(normHeader(String(c)))));
    if (headerRowIdx < 0) continue; // not a food-data sheet (List of tables / Notes)

    const descHeader = matrix[headerRowIdx].map((c) => normHeader(String(c))); // identity columns
    const codeHeader = (matrix[headerRowIdx + 1] ?? []).map((c) => normHeader(String(c))); // nutrient acronyms
    const colIndex = (keys: string[]) => descHeader.findIndex((h) => keys.includes(h));
    // Food code is column 0 and name column 1 across all CoFID sheets (some sheets
    // leave the code header cell blank), so fall back to those positions.
    const codeCol = colIndex(CODE_KEYS) >= 0 ? colIndex(CODE_KEYS) : 0;
    const nameCol = colIndex(NAME_KEYS) >= 0 ? colIndex(NAME_KEYS) : 1;
    const groupCol = colIndex(GROUP_KEYS) >= 0 ? colIndex(GROUP_KEYS) : 3;
    // Edible proportion may be labelled by acronym (row1) or descriptive name (row0).
    const edibleCol = codeHeader.indexOf(EDIBLE_CODE) >= 0 ? codeHeader.indexOf(EDIBLE_CODE) : descHeader.indexOf('EDIBLEPROPORTION');
    const aoacCol = codeHeader.indexOf(AOAC_FIBRE_CODE);
    // Nutrient columns keyed by the acronym row.
    const nutrientCols: { ci: number; map: { key: keyof CanonicalNutrition; factor?: number }; code: string }[] = [];
    codeHeader.forEach((h, ci) => {
      const map = COLUMN_MAP[h];
      if (map) nutrientCols.push({ ci, map, code: h });
    });

    for (let r = headerRowIdx + 1; r < matrix.length; r++) {
      const row = matrix[r];
      const code = String(row[codeCol] ?? '').trim();
      if (!/\d/.test(code)) continue; // skip acronym/short-name header rows (blank code cell)
      const name = nameCol >= 0 ? String(row[nameCol] ?? '').trim() : '';
      if (!code) continue;

      const existing = foods.get(code);
      const nutrients: CanonicalNutrition = existing ? { ...existing.nutrientsPer100g } : {};
      const originalUnits: Record<string, string> = existing?.provenance.originalUnits ? { ...existing.provenance.originalUnits } : {};

      for (const { ci, map, code: acr } of nutrientCols) {
        const val = parseValue(row[ci]);
        if (val === undefined) continue;
        nutrients[map.key] = map.factor ? val * map.factor : val;
        originalUnits[map.key] = acr;
      }
      // Prefer AOAC fibre over Englyst when present.
      if (aoacCol >= 0) {
        const aoac = parseValue(row[aoacCol]);
        if (aoac !== undefined) {
          nutrients.fibreG = aoac;
          originalUnits.fibreG = AOAC_FIBRE_CODE;
        }
      }
      const edible = edibleCol >= 0 ? parseValue(row[edibleCol]) : undefined;

      if (existing) {
        existing.nutrientsPer100g = backfillDerivedNutrients(nutrients);
        existing.dataQuality = buildQuality(existing.nutrientsPer100g, 'verified-primary');
        existing.provenance.originalUnits = originalUnits;
        if (edible !== undefined && existing.ediblePortion === undefined) existing.ediblePortion = edible > 1 ? edible / 100 : edible;
        continue;
      }
      if (!name) continue; // first sheet for this code must supply the name
      const withDerived = backfillDerivedNutrients(nutrients);
      foods.set(code, {
        id: `cofid-${code}`,
        canonicalName: name.toLowerCase(),
        displayName: name,
        aliases: [],
        source: 'cofid',
        sourceRecordId: code,
        sourceDescription: name,
        sourceUrl: 'https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid',
        recordType: 'generic',
        foodGroup: groupCol >= 0 ? String(row[groupCol] ?? '').trim() || undefined : undefined,
        preparationState: detectPrep(name),
        ediblePortion: edible !== undefined ? (edible > 1 ? edible / 100 : edible) : undefined,
        nutrientsPer100g: withDerived,
        dataQuality: buildQuality(withDerived, 'verified-primary'),
        provenance: {
          datasetName: 'McCance & Widdowson CoFID',
          datasetVersion: DATASET_VERSION,
          retrievedAt: now,
          originalUnits,
          transformations: ['Mapped CoFID acronym columns to canonical units; AOAC fibre preferred; Vitamin E mg α-TE → µg; EPA/DHA/ALA g → mg; N/blank → undefined; Tr → trace.'],
        },
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const list = [...foods.values()];
  fs.writeFileSync(path.join(OUT_DIR, 'foods.json'), JSON.stringify(list, null, 0));
  const index = list.map((f) => ({ id: f.id, name: f.canonicalName, group: f.foodGroup }));
  fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 0));
  fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify({ datasetVersion: DATASET_VERSION, importedAt: now, recordCount: list.length, licence: 'OGL v3.0', attribution: 'Contains public sector information licensed under the Open Government Licence v3.0. Source: CoFID, Public Health England, © Crown copyright 2021.' }, null, 2));
  validation.push(`Imported ${list.length} CoFID records from ${file}.`);
  fs.writeFileSync(path.join(OUT_DIR, 'validation-report.txt'), validation.join('\n'));
  console.log(`Imported ${list.length} CoFID records → ${OUT_DIR}`);
}

main();
