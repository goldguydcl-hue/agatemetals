import type { MetalKey, WeightUnit } from './api';

export type MetalMeta = {
  key: MetalKey;
  label: string;
  /** ISO 4217-style code used by gold-api.com and metalpriceapi. */
  code: string;
  /** Yahoo Finance futures symbol. Rhodium has no Yahoo futures symbol. */
  yahooSymbol: string | null;
  /** Short symbol shown in the UI. */
  ticker: string;
};

export const METALS: MetalMeta[] = [
  {
    key: 'silver',
    label: 'Silver',
    code: 'XAG',
    yahooSymbol: 'SI=F',
    ticker: 'Ag',
  },
  {
    key: 'gold',
    label: 'Gold',
    code: 'XAU',
    yahooSymbol: 'GC=F',
    ticker: 'Au',
  },
  {
    key: 'platinum',
    label: 'Platinum',
    code: 'XPT',
    yahooSymbol: 'PL=F',
    ticker: 'Pt',
  },
  {
    key: 'palladium',
    label: 'Palladium',
    code: 'XPD',
    yahooSymbol: 'PA=F',
    ticker: 'Pd',
  },
  {
    key: 'rhodium',
    label: 'Rhodium',
    code: 'XRH',
    yahooSymbol: null,
    ticker: 'Rh',
  },
];

export const METAL_LABELS: Record<MetalKey, string> = {
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
  palladium: 'Palladium',
  rhodium: 'Rhodium',
};

/** Grams in one troy ounce. */
export const TROY_OZ_GRAMS = 31.1034768;

/** Dealer buy-back factor: the dealer price is 95% of the estimated value. */
export const DEALER_PRICE_FACTOR = 0.95;

export const toTroyOz = (weight: number, unit: WeightUnit): number =>
  unit === 'g' ? weight / TROY_OZ_GRAMS : weight;

/**
 * Estimated melt value of a piece of metal.
 * value = spot price per troy oz x weight in troy oz x purity x (1 + dealer premium).
 * Verified against the live app: 1 troy oz gold at 99.9% purity and 0% premium
 * priced at $3,558/oz gives $3,554.44.
 */
export const estimateValue = (
  priceUsdPerTroyOz: number,
  weight: number,
  unit: WeightUnit,
  purityPct: number,
  premiumPct: number
): number =>
  priceUsdPerTroyOz *
  toTroyOz(weight, unit) *
  (purityPct / 100) *
  (1 + premiumPct / 100);

export const dealerPrice = (estimatedValue: number): number =>
  estimatedValue * DEALER_PRICE_FACTOR;

export const formatUsd = (value: number): string =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatPricePerOz = (value: number): string =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
