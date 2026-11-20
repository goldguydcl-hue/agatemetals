export type MetalKey = 'silver' | 'gold' | 'platinum' | 'palladium' | 'rhodium';

export type PriceSource =
  'yahoo' | 'gold-api' | 'metalpriceapi' | 'moderator' | 'none';

export type MetalPrice = {
  metal: MetalKey;
  /** Live price in USD per troy ounce, or null when no leg of the chain returned one. */
  priceUsdPerTroyOz: number | null;
  source: PriceSource;
  updatedAt: string | null;
};

export type PricesResponse = {
  type: 'prices';
  prices: MetalPrice[];
  fetchedAt: string;
  cacheHit: boolean;
};

export type ModeratorPrices = {
  [K in MetalKey]?: number | null;
};

export type ShareRequest = {
  metal: MetalKey;
  weight: number;
  unit: WeightUnit;
  purity: number;
  premium: number;
  estimatedValue: number;
  dealerPrice: number;
  /** Optional title override — used when sharing a whole collection total. */
  title?: string;
};

export type ShareResponse = {
  type: 'share';
  postId: string;
  url: string;
};

export type WeightUnit = 'oz' | 'g';

/** Runtime guards for untyped data (fetch bodies, cached JSON). No casts. */
export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isMetalKey = (value: unknown): value is MetalKey =>
  value === 'silver' ||
  value === 'gold' ||
  value === 'platinum' ||
  value === 'palladium' ||
  value === 'rhodium';

export const isPriceSource = (value: unknown): value is PriceSource =>
  value === 'yahoo' ||
  value === 'gold-api' ||
  value === 'metalpriceapi' ||
  value === 'moderator' ||
  value === 'none';

/** Validate a /api/prices body. Returns null when the shape is wrong. */
export const parsePricesResponse = (data: unknown): PricesResponse | null => {
  if (!isRecord(data) || data.type !== 'prices') {
    return null;
  }
  if (
    typeof data.fetchedAt !== 'string' ||
    typeof data.cacheHit !== 'boolean'
  ) {
    return null;
  }
  if (!Array.isArray(data.prices)) {
    return null;
  }
  const prices: MetalPrice[] = [];
  for (const entry of data.prices) {
    if (!isRecord(entry) || !isMetalKey(entry.metal)) {
      return null;
    }
    const price =
      typeof entry.priceUsdPerTroyOz === 'number'
        ? entry.priceUsdPerTroyOz
        : null;
    const source = isPriceSource(entry.source) ? entry.source : 'none';
    const updatedAt =
      typeof entry.updatedAt === 'string' ? entry.updatedAt : null;
    prices.push({
      metal: entry.metal,
      priceUsdPerTroyOz: price,
      source,
      updatedAt,
    });
  }
  return {
    type: 'prices',
    prices,
    fetchedAt: data.fetchedAt,
    cacheHit: data.cacheHit,
  };
};

/** Validate a /api/share body. Returns null when the shape is wrong. */
export const parseShareResponse = (data: unknown): ShareResponse | null => {
  if (!isRecord(data) || data.type !== 'share') {
    return null;
  }
  if (typeof data.postId !== 'string' || typeof data.url !== 'string') {
    return null;
  }
  return { type: 'share', postId: data.postId, url: data.url };
};
