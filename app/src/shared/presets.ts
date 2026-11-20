import type { MetalKey, WeightUnit } from './api';
import { isMetalKey, isRecord } from './api';
import { dealerPrice, estimateValue, toTroyOz } from './metals';

/**
 * The preset table is the single source of truth for products.
 * Source: docs/product-purity-table.json (Nov 20, 2026) — 30 live-app presets
 * in exact order, plus Joe's 7 additions appended after #30. The stored
 * values below ARE the live app's stored values (browser capture Nov 20,
 * 02:44 ET), not the physical specs: for 90%/40%/35% silver items the app
 * stores the PURE-silver weight with Purity 100 (e.g. a pre-1965 dime is
 * 0.0723 troy oz @ 100%, not 2.5 g @ 90%). The physical spec is in the
 * `spec` field so the numbers can be audited.
 */

export type PresetGroup =
  | 'Silver bullion'
  | 'Junk silver'
  | 'Gold bullion'
  | 'Karat gold'
  | 'Platinum'
  | 'Palladium'
  | 'Rhodium';

export type Preset = {
  id: string;
  name: string;
  /** Null for Custom Item: it is manual mode, not a product. */
  group: PresetGroup | null;
  metal: MetalKey;
  weight: number;
  unit: WeightUnit;
  purity: number;
  /** Physical spec / audit note behind the stored values. */
  spec: string;
};

export const CUSTOM_PRESET_ID = 'custom-item';

export const PRESETS: Preset[] = [
  {
    id: 'custom-item',
    name: 'Custom Item',
    group: null,
    metal: 'silver',
    weight: 1,
    unit: 'oz',
    purity: 99.9,
    spec: 'Manual/default mode. Does NOT reset anything — the user enters their own metal, weight, unit and purity. Fresh load default: Silver, 1, Troy Oz, 99.9%, 0.0% premium.',
  },
  {
    id: 'silver-eagle',
    name: '1 oz Silver Eagle',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 1,
    unit: 'oz',
    purity: 99.9,
    spec: 'Numista N#1493: 31.103 g, Silver (.999); 31 USC 5112(e).',
  },
  {
    id: 'silver-maple',
    name: '1 oz Silver Maple Leaf',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 1,
    unit: 'oz',
    purity: 99.99,
    spec: 'Royal Canadian Mint: 1 oz (31.11 g), 99.99% pure silver.',
  },
  {
    id: 'silver-britannia',
    name: '1 oz Silver Britannia',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 1,
    unit: 'oz',
    purity: 99.9,
    spec: 'Royal Mint, 2013+ issue: 1 oz, 0.999 fine silver. Pre-2013 Britannias are .958 fine, 32.45 g — use the .958 purity picker option for those.',
  },
  {
    id: 'silver-round',
    name: '1 oz Silver Round',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 1,
    unit: 'oz',
    purity: 99.9,
    spec: 'Standard bullion convention: generic 1 oz silver rounds are .999 fine.',
  },
  {
    id: 'silver-bar-10oz',
    name: '10 oz Silver Bar',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 10,
    unit: 'oz',
    purity: 99.9,
    spec: 'Standard bullion convention: generic silver bars are .999 fine.',
  },
  {
    id: 'silver-bar-5oz',
    name: '5 oz Silver Bar',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 5,
    unit: 'oz',
    purity: 99.9,
    spec: 'Standard bullion convention: generic silver bars are .999 fine.',
  },
  {
    id: 'silver-bar-100oz',
    name: '100 oz Silver Bar',
    group: 'Silver bullion',
    metal: 'silver',
    weight: 100,
    unit: 'oz',
    purity: 99.9,
    spec: 'Standard bullion convention: generic silver bars are .999 fine.',
  },
  {
    id: 'dime-90',
    name: 'Pre-1965 Silver Dime',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.0723,
    unit: 'oz',
    purity: 100,
    spec: 'Physical: 2.5 g @ 90% (Numista N#52). Live app stores the pure weight 0.0723 ozt @ 100% (observed in the browser capture).',
  },
  {
    id: 'quarter-90',
    name: 'Pre-1965 Silver Quarter',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.1808,
    unit: 'oz',
    purity: 100,
    spec: 'Physical: 6.25 g @ 90% (Numista N#54). Live app stores the pure weight 0.1808 ozt @ 100% (inferred from the same convention as the observed dime).',
  },
  {
    id: 'half-90',
    name: 'Pre-1965 Silver Half Dollar',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.3617,
    unit: 'oz',
    purity: 100,
    spec: 'Physical: 12.5 g @ 90% (Numista N#943). Live app stores the pure weight 0.3617 ozt @ 100% (inferred from the same convention as the observed dime).',
  },
  {
    id: 'face-1',
    name: '$1 Face Value 90% Silver',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.715,
    unit: 'oz',
    purity: 100,
    spec: 'Junk-silver dealer convention: $1 face of 90% coins = 0.715 ozt pure silver (worn/circulated basis; as-struck is 0.7234 ozt). Observed in the browser capture.',
  },
  {
    id: 'gold-eagle',
    name: '1 oz Gold Eagle',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 33.931,
    unit: 'g',
    purity: 91.67,
    spec: 'US Mint: 33.931 g gross, 91.67% Au (22k), guaranteed 1.0000 ozt fine gold. 31 USC 5112. Note the stored weight is grams, not 1 ozt — the coin is 22k alloy.',
  },
  {
    id: 'gold-buffalo',
    name: '1 oz Gold Buffalo',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 1,
    unit: 'oz',
    purity: 99.99,
    spec: 'Numista N#18451: 31.1035 g, Gold (.9999).',
  },
  {
    id: 'gold-maple',
    name: '1 oz .9999 Gold Maple Leaf',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 1,
    unit: 'oz',
    purity: 99.99,
    spec: 'Royal Canadian Mint: 1 oz (31.11 g), 99.99% pure gold.',
  },
  {
    id: 'gold-bar-1oz',
    name: '1 oz Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 1,
    unit: 'oz',
    purity: 99.99,
    spec: 'Standard bullion convention: generic 1 oz gold bars are .9999 fine.',
  },
  {
    id: 'gold-coin-half',
    name: '1/2 oz Gold Coin',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 16.966,
    unit: 'g',
    purity: 91.67,
    spec: 'DECISION — assumed American Gold Eagle fractional: 16.966 g gross, 91.67% Au, 0.5000 ozt fine gold (US Mint). Generic preset; confirm against the live-app capture if it differs.',
  },
  {
    id: 'gold-coin-quarter',
    name: '1/4 oz Gold Coin',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 8.483,
    unit: 'g',
    purity: 91.67,
    spec: 'DECISION — assumed American Gold Eagle fractional: 8.483 g gross, 91.67% Au, 0.2500 ozt fine gold (US Mint). Generic preset; confirm against the live-app capture if it differs.',
  },
  {
    id: 'gold-coin-tenth',
    name: '1/10 oz Gold Coin',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 3.393,
    unit: 'g',
    purity: 91.67,
    spec: 'DECISION — assumed American Gold Eagle fractional: 3.393 g gross, 91.67% Au, 0.1000 ozt fine gold (US Mint). Generic preset; confirm against the live-app capture if it differs.',
  },
  {
    id: 'gold-bar-half-gram',
    name: '1/2 Gram Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 0.5,
    unit: 'g',
    purity: 99.99,
    spec: 'Standard bullion convention: gram gold bars are .9999 fine.',
  },
  {
    id: 'gold-bar-1g',
    name: '1 Gram Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 1,
    unit: 'g',
    purity: 99.99,
    spec: 'Standard bullion convention: gram gold bars are .9999 fine.',
  },
  {
    id: 'gold-bar-2-5g',
    name: '2.5 Gram Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 2.5,
    unit: 'g',
    purity: 99.99,
    spec: 'Standard bullion convention: gram gold bars are .9999 fine.',
  },
  {
    id: 'gold-bar-5g',
    name: '5 Gram Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 5,
    unit: 'g',
    purity: 99.99,
    spec: 'Standard bullion convention: gram gold bars are .9999 fine.',
  },
  {
    id: 'gold-bar-10g',
    name: '10 Gram Gold Bar',
    group: 'Gold bullion',
    metal: 'gold',
    weight: 10,
    unit: 'g',
    purity: 99.99,
    spec: 'Standard bullion convention: gram gold bars are .9999 fine.',
  },
  {
    id: 'platinum-eagle',
    name: '1 oz Platinum Eagle',
    group: 'Platinum',
    metal: 'platinum',
    weight: 1,
    unit: 'oz',
    purity: 99.95,
    spec: 'US Mint: 31.120 g gross, .9995 fine platinum, 1.0000 ozt fine.',
  },
  {
    id: 'platinum-bar',
    name: '1 oz Platinum Bar',
    group: 'Platinum',
    metal: 'platinum',
    weight: 1,
    unit: 'oz',
    purity: 99.95,
    spec: 'Standard bullion convention: generic platinum bars are .9995 fine.',
  },
  {
    id: 'platinum-coin-half',
    name: '1/2 oz Platinum Coin',
    group: 'Platinum',
    metal: 'platinum',
    weight: 0.5,
    unit: 'oz',
    purity: 99.95,
    spec: 'Standard bullion convention: platinum bullion coins are .9995 fine (Platinum Eagle fractional standard).',
  },
  {
    id: 'palladium-eagle',
    name: '1 oz Palladium Eagle',
    group: 'Palladium',
    metal: 'palladium',
    weight: 1,
    unit: 'oz',
    purity: 99.95,
    spec: 'Numista N#173899: 31.12 g, Palladium (.9995), 2017-2026.',
  },
  {
    id: 'palladium-bar',
    name: '1 oz Palladium Bar',
    group: 'Palladium',
    metal: 'palladium',
    weight: 1,
    unit: 'oz',
    purity: 99.95,
    spec: 'Standard bullion convention: generic palladium bars are .9995 fine.',
  },
  {
    id: 'rhodium-bar',
    name: '1 oz Rhodium Bar',
    group: 'Rhodium',
    metal: 'rhodium',
    weight: 1,
    unit: 'oz',
    purity: 99.9,
    spec: 'Standard bullion convention: rhodium bars are .999 fine. No free live price exists — the app shows the moderator fallback price ($4,500/ozt, stale; market ~$8,200-$9,400/ozt Nov 20, 2026) labelled as a reference price.',
  },
  // Joe's additions (Nov 20, 2026), appended after #30 in this order.
  {
    id: 'gold-10k',
    name: '10k Gold',
    group: 'Karat gold',
    metal: 'gold',
    weight: 1,
    unit: 'g',
    purity: 41.67,
    spec: 'Karat definition: 10k = 10/24 = 41.67% pure gold. Default weight 1 gram (karat gold is jewelry, weighed in grams).',
  },
  {
    id: 'gold-14k',
    name: '14k Gold',
    group: 'Karat gold',
    metal: 'gold',
    weight: 1,
    unit: 'g',
    purity: 58.33,
    spec: 'Karat definition: 14k = 14/24 = 58.33% pure gold (hallmark 585 reads 58.5% — same standard, rounding). Default weight 1 gram.',
  },
  {
    id: 'gold-18k',
    name: '18k Gold',
    group: 'Karat gold',
    metal: 'gold',
    weight: 1,
    unit: 'g',
    purity: 75,
    spec: 'Karat definition: 18k = 18/24 = 75% pure gold. Default weight 1 gram.',
  },
  {
    id: 'gold-24k',
    name: '24k Gold',
    group: 'Karat gold',
    metal: 'gold',
    weight: 1,
    unit: 'g',
    purity: 99.99,
    spec: 'Karat definition: 24k = 24/24 = 99.99% pure gold (RCM Maple Leaf standard). Default weight 1 gram.',
  },
  {
    id: 'kennedy-40',
    name: '40% Kennedy Half Dollar',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.1479,
    unit: 'oz',
    purity: 100,
    spec: 'Physical: 11.5 g @ 40% (Numista N#10865, 1965-1970). Live app stores the pure weight 0.1479 ozt @ 100% (inferred from the same convention as the observed dime).',
  },
  {
    id: 'war-nickel',
    name: '35% War Nickel',
    group: 'Junk silver',
    metal: 'silver',
    weight: 0.0563,
    unit: 'oz',
    purity: 100,
    spec: 'Physical: 5 g @ 35% (Numista N#45, 1942-1945). Live app stores the pure weight 0.0563 ozt @ 100% (inferred from the same convention as the observed dime).',
  },
  {
    id: 'face-10',
    name: '$10 Face Value 90% Silver',
    group: 'Junk silver',
    metal: 'silver',
    weight: 7.15,
    unit: 'oz',
    purity: 100,
    spec: 'Junk-silver dealer convention: 10 x $1 face = 7.15 ozt pure silver (worn basis; as-struck 7.234 ozt). Inferred from the same convention as the observed $1 face preset.',
  },
];

export const findPreset = (id: string): Preset | null =>
  PRESETS.find((preset) => preset.id === id) ?? null;

/** Presets that are real products (everything except Custom Item). */
export const PRODUCT_PRESETS: Preset[] = PRESETS.filter(
  (preset) => preset.group !== null
);

/** Product presets in display order, grouped for the Common Products list. */
export const PRESET_GROUPS: { label: PresetGroup; presets: Preset[] }[] = (
  [
    'Silver bullion',
    'Junk silver',
    'Gold bullion',
    'Karat gold',
    'Platinum',
    'Palladium',
    'Rhodium',
  ] as PresetGroup[]
).map((label) => ({
  label,
  presets: PRODUCT_PRESETS.filter((preset) => preset.group === label),
}));

/**
 * The full purity picker — 24 standard purities, grouped by metal.
 * Source: docs/product-purity-table.json `purities` (Nov 20, 2026).
 * Gold by karat (karat/24); every other metal by millesimal fineness.
 * 99.9% (.999 fine) and 99.99% (.9999 fine) are distinct options.
 * The 100% option is the live app's pure-weight convention for junk silver.
 */
export type PurityOption = {
  metal: MetalKey | 'any';
  label: string;
  name: string;
  purity: number;
  fineness: number;
};

export const PURITY_GROUPS: { label: string; options: PurityOption[] }[] = [
  {
    label: 'Gold',
    options: [
      {
        metal: 'gold',
        label: '24k',
        name: '24 karat / pure gold',
        purity: 99.99,
        fineness: 999,
      },
      {
        metal: 'gold',
        label: '22k',
        name: '22 karat',
        purity: 91.67,
        fineness: 916,
      },
      {
        metal: 'gold',
        label: '18k',
        name: '18 karat',
        purity: 75,
        fineness: 750,
      },
      {
        metal: 'gold',
        label: '14k',
        name: '14 karat',
        purity: 58.33,
        fineness: 585,
      },
      {
        metal: 'gold',
        label: '10k',
        name: '10 karat',
        purity: 41.67,
        fineness: 417,
      },
      {
        metal: 'gold',
        label: '9k',
        name: '9 karat',
        purity: 37.5,
        fineness: 375,
      },
    ],
  },
  {
    label: 'Silver',
    options: [
      {
        metal: 'silver',
        label: '.9999',
        name: 'Four nines fine',
        purity: 99.99,
        fineness: 999.9,
      },
      {
        metal: 'silver',
        label: '.999',
        name: 'Fine silver / three nines',
        purity: 99.9,
        fineness: 999,
      },
      {
        metal: 'silver',
        label: '.958',
        name: 'Britannia silver',
        purity: 95.8,
        fineness: 958,
      },
      {
        metal: 'silver',
        label: '.925',
        name: 'Sterling silver',
        purity: 92.5,
        fineness: 925,
      },
      {
        metal: 'silver',
        label: '.900',
        name: 'Coin silver / 90% silver',
        purity: 90,
        fineness: 900,
      },
      {
        metal: 'silver',
        label: '.835',
        name: '835 silver',
        purity: 83.5,
        fineness: 835,
      },
      {
        metal: 'silver',
        label: '.800',
        name: '800 silver',
        purity: 80,
        fineness: 800,
      },
      {
        metal: 'silver',
        label: '.500',
        name: '500 silver',
        purity: 50,
        fineness: 500,
      },
      {
        metal: 'silver',
        label: '.400',
        name: '40% silver',
        purity: 40,
        fineness: 400,
      },
      {
        metal: 'silver',
        label: '.350',
        name: '35% silver / war nickel',
        purity: 35,
        fineness: 350,
      },
    ],
  },
  {
    label: 'Platinum',
    options: [
      {
        metal: 'platinum',
        label: '.9995',
        name: 'Platinum bullion',
        purity: 99.95,
        fineness: 999.5,
      },
      {
        metal: 'platinum',
        label: '.950',
        name: '950 platinum',
        purity: 95,
        fineness: 950,
      },
      {
        metal: 'platinum',
        label: '.900',
        name: '900 platinum',
        purity: 90,
        fineness: 900,
      },
      {
        metal: 'platinum',
        label: '.850',
        name: '850 platinum',
        purity: 85,
        fineness: 850,
      },
    ],
  },
  {
    label: 'Palladium',
    options: [
      {
        metal: 'palladium',
        label: '.9995',
        name: 'Palladium bullion',
        purity: 99.95,
        fineness: 999.5,
      },
      {
        metal: 'palladium',
        label: '.950',
        name: '950 palladium',
        purity: 95,
        fineness: 950,
      },
    ],
  },
  {
    label: 'Rhodium',
    options: [
      {
        metal: 'rhodium',
        label: '.999',
        name: 'Rhodium bullion',
        purity: 99.9,
        fineness: 999,
      },
    ],
  },
  {
    label: 'Pure weight',
    options: [
      {
        metal: 'any',
        label: '100%',
        name: 'Pure-weight convention (junk silver)',
        purity: 100,
        fineness: 1000,
      },
    ],
  },
];

export const ALL_PURITY_OPTIONS: PurityOption[] = PURITY_GROUPS.flatMap(
  (group) => group.options
);

/** The picker option matching a purity %, or null (shows as Custom). */
export const findPurityOption = (purity: number): PurityOption | null =>
  ALL_PURITY_OPTIONS.find(
    (option) => Math.abs(option.purity - purity) < 0.0001
  ) ?? null;

/**
 * The picker option matching a purity % for the currently selected metal,
 * or null (shows as Custom). Prefers the current metal's own group because
 * several purities exist for more than one metal (99.9% is both silver .999
 * and rhodium .999; 90% is both silver .900 and platinum .900).
 */
export const findPurityOptionForMetal = (
  metal: MetalKey,
  purity: number
): PurityOption | null =>
  ALL_PURITY_OPTIONS.find(
    (option) =>
      (option.metal === metal || option.metal === 'any') &&
      Math.abs(option.purity - purity) < 0.0001
  ) ?? findPurityOption(purity);

/** Stable select value for a picker option. */
export const purityOptionKey = (option: PurityOption): string =>
  `${option.metal}:${option.purity}`;

/** Purity % as typed in the field: 99.9, 99.99, 58.33, 75, 100 — no trailing zeros. */
export const formatPurity = (purity: number): string =>
  Number.isInteger(purity) ? String(purity) : String(purity);

/** Pure metal content of a weighing, in troy oz. */
export const pureOz = (
  weight: number,
  unit: WeightUnit,
  purity: number
): number => toTroyOz(weight, unit) * (purity / 100);

/** Fine troy oz, 4 decimals, as the live app shows it (e.g. 0.9990). */
export const formatFineOz = (
  weight: number,
  unit: WeightUnit,
  purity: number
): string => pureOz(weight, unit, purity).toFixed(4);

/** Per-unit melt value of a preset at a live spot price (0% premium). */
export const presetUnitValue = (
  preset: Preset,
  priceUsdPerTroyOz: number | null
): number | null =>
  priceUsdPerTroyOz === null
    ? null
    : estimateValue(
        priceUsdPerTroyOz,
        preset.weight,
        preset.unit,
        preset.purity,
        0
      );

/** A line in the user's collection. Values are recomputed from live prices;
 * unitValueSnapshot is the per-unit value when the line was added, used only
 * when no live price is available. */
export type CollectionLine = {
  id: string;
  presetId: string | null;
  name: string;
  metal: MetalKey;
  weight: number;
  unit: WeightUnit;
  purity: number;
  premium: number;
  quantity: number;
  unitValueSnapshot: number;
};

let nextLineCounter = 1;

export const newLineId = (): string =>
  `line-${Date.now().toString(36)}-${nextLineCounter++}-${Math.floor(
    Math.random() * 1_000_000
  ).toString(36)}`;

export const linePureOz = (line: CollectionLine): number =>
  pureOz(line.weight, line.unit, line.purity) * line.quantity;

export const lineValue = (
  line: CollectionLine,
  priceUsdPerTroyOz: number | null
): number =>
  priceUsdPerTroyOz === null
    ? line.unitValueSnapshot * line.quantity
    : estimateValue(
        priceUsdPerTroyOz,
        line.weight,
        line.unit,
        line.purity,
        line.premium
      ) * line.quantity;

export const lineDealerValue = (
  line: CollectionLine,
  priceUsdPerTroyOz: number | null
): number => dealerPrice(lineValue(line, priceUsdPerTroyOz));

/** Validate untyped collection data (fetch bodies, Redis JSON). No casts. */
export const parseCollectionLines = (
  data: unknown
): CollectionLine[] | null => {
  if (!Array.isArray(data)) {
    return null;
  }
  const lines: CollectionLine[] = [];
  for (const entry of data) {
    if (!isRecord(entry)) {
      return null;
    }
    if (typeof entry.id !== 'string' || entry.id.length === 0) {
      return null;
    }
    if (
      entry.presetId !== null &&
      (typeof entry.presetId !== 'string' || entry.presetId.length === 0)
    ) {
      return null;
    }
    if (typeof entry.name !== 'string' || entry.name.length === 0) {
      return null;
    }
    if (!isMetalKey(entry.metal)) {
      return null;
    }
    if (
      typeof entry.weight !== 'number' ||
      !Number.isFinite(entry.weight) ||
      entry.weight <= 0
    ) {
      return null;
    }
    if (entry.unit !== 'oz' && entry.unit !== 'g') {
      return null;
    }
    if (
      typeof entry.purity !== 'number' ||
      !Number.isFinite(entry.purity) ||
      entry.purity <= 0 ||
      entry.purity > 100
    ) {
      return null;
    }
    if (
      typeof entry.premium !== 'number' ||
      !Number.isFinite(entry.premium) ||
      entry.premium < 0
    ) {
      return null;
    }
    if (
      typeof entry.quantity !== 'number' ||
      !Number.isInteger(entry.quantity) ||
      entry.quantity < 1
    ) {
      return null;
    }
    if (
      typeof entry.unitValueSnapshot !== 'number' ||
      !Number.isFinite(entry.unitValueSnapshot) ||
      entry.unitValueSnapshot < 0
    ) {
      return null;
    }
    lines.push({
      id: entry.id,
      presetId: entry.presetId,
      name: entry.name,
      metal: entry.metal,
      weight: entry.weight,
      unit: entry.unit,
      purity: entry.purity,
      premium: entry.premium,
      quantity: entry.quantity,
      unitValueSnapshot: entry.unitValueSnapshot,
    });
  }
  return lines;
};
