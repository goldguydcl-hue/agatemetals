import { redis, settings } from '@devvit/web/server';
import type {
  MetalKey,
  MetalPrice,
  ModeratorPrices,
  PriceSource,
} from '../shared/api';
import { isMetalKey, isPriceSource, isRecord } from '../shared/api';
import { METALS } from '../shared/metals';

const CACHE_KEY = 'prices:cache';
const MODERATOR_PRICES_KEY = 'moderatorPrices';
const CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 5_000;

/** Fallback reference prices seeded on install (USD per troy oz, Nov 20 2026).
 * Rhodium $4,500 is a STALE moderator fallback carried over from the live
 * app (late-2024 level; the Nov 20, 2026 market is ~$8,200-$9,400/ozt) —
 * it is used ONLY until a moderator updates it or a metalpriceapi.com key
 * adds a live rhodium leg, and the UI always labels it a reference price,
 * never live. */
export const SEED_MODERATOR_PRICES: ModeratorPrices = {
  gold: 3559.17,
  silver: 41.88,
  platinum: 1303.2,
  palladium: 888.25,
  rhodium: 4500,
};

type CachedPrices = {
  fetchedAt: string;
  prices: MetalPrice[];
};

const parseCachedPrices = (raw: string | undefined): CachedPrices | null => {
  if (!raw) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || typeof parsed.fetchedAt !== 'string') {
      return null;
    }
    if (!Array.isArray(parsed.prices)) {
      return null;
    }
    const prices: MetalPrice[] = [];
    for (const entry of parsed.prices) {
      if (!isRecord(entry) || !isMetalKey(entry.metal)) {
        return null;
      }
      const metal = entry.metal;
      const price =
        typeof entry.priceUsdPerTroyOz === 'number'
          ? entry.priceUsdPerTroyOz
          : null;
      const source = isPriceSource(entry.source) ? entry.source : 'none';
      const updatedAt =
        typeof entry.updatedAt === 'string' ? entry.updatedAt : null;
      prices.push({ metal, priceUsdPerTroyOz: price, source, updatedAt });
    }
    return { fetchedAt: parsed.fetchedAt, prices };
  } catch {
    return null;
  }
};

const parseModeratorPrices = (raw: string | undefined): ModeratorPrices => {
  if (!raw) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return {};
    }
    const out: ModeratorPrices = {};
    const keys: MetalKey[] = [
      'silver',
      'gold',
      'platinum',
      'palladium',
      'rhodium',
    ];
    for (const key of keys) {
      const value = parsed[key];
      out[key] =
        typeof value === 'number' && Number.isFinite(value) ? value : null;
    }
    return out;
  } catch {
    return {};
  }
};

const fetchJson = async (url: string): Promise<unknown> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AgateMetalsChecker/1.0' },
      signal: controller.signal,
    });
    if (!res.ok) {
      return null;
    }
    const data: unknown = await res.json();
    return data;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/** Yahoo Finance futures (COMEX). No key needed. */
const fetchYahooPrice = async (symbol: string): Promise<number | null> => {
  const data = await fetchJson(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1m`
  );
  if (!isRecord(data)) {
    return null;
  }
  const chart = data.chart;
  if (
    !isRecord(chart) ||
    !Array.isArray(chart.result) ||
    chart.result.length === 0
  ) {
    return null;
  }
  const first = chart.result[0];
  if (!isRecord(first)) {
    return null;
  }
  const meta = first.meta;
  if (!isRecord(meta)) {
    return null;
  }
  const price = meta.regularMarketPrice;
  return typeof price === 'number' && Number.isFinite(price) ? price : null;
};

/** gold-api.com — free, no key. Covers gold, silver, platinum, palladium. */
const fetchGoldApiPrice = async (code: string): Promise<number | null> => {
  const data = await fetchJson(`https://api.gold-api.com/price/${code}`);
  if (!isRecord(data)) {
    return null;
  }
  const price = data.price;
  return typeof price === 'number' && Number.isFinite(price) ? price : null;
};

/** metalpriceapi.com — only when a key is configured in app settings. */
const fetchMetalPriceApiPrices = async (
  apiKey: string
): Promise<Partial<Record<MetalKey, number>>> => {
  const data = await fetchJson(
    `https://api.metalpriceapi.com/v1/latest?api_key=${encodeURIComponent(apiKey)}&base=USD&currencies=XAU,XAG,XPT,XPD,XRH`
  );
  if (!isRecord(data) || data.success !== true || !isRecord(data.rates)) {
    return {};
  }
  const rates = data.rates;
  const out: Partial<Record<MetalKey, number>> = {};
  const byCode: Record<string, MetalKey> = {
    XAG: 'silver',
    XAU: 'gold',
    XPT: 'platinum',
    XPD: 'palladium',
    XRH: 'rhodium',
  };
  for (const [code, metal] of Object.entries(byCode)) {
    const value = rates[code];
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[metal] = value;
    }
  }
  return out;
};

export const getModeratorPrices = async (): Promise<ModeratorPrices> => {
  const raw = await redis.get(MODERATOR_PRICES_KEY);
  return parseModeratorPrices(raw);
};

export const setModeratorPrices = async (
  prices: ModeratorPrices
): Promise<void> => {
  await redis.set(MODERATOR_PRICES_KEY, JSON.stringify(prices));
};

/**
 * Price fallback chain, per metal:
 * 1. Yahoo Finance futures (gold/silver/platinum/palladium only)
 * 2. gold-api.com (gold/silver/platinum/palladium only)
 * 3. metalpriceapi.com — only when an API key is set in app settings
 * 4. Moderator-maintained daily reference prices (Redis)
 * Results are cached server-side for 60 seconds.
 */
export const getPrices = async (): Promise<{
  prices: MetalPrice[];
  fetchedAt: string;
  cacheHit: boolean;
}> => {
  const cached = parseCachedPrices(await redis.get(CACHE_KEY));
  if (cached && Date.now() - Date.parse(cached.fetchedAt) < CACHE_TTL_MS) {
    return {
      prices: cached.prices,
      fetchedAt: cached.fetchedAt,
      cacheHit: true,
    };
  }

  const [moderator, apiKey] = await Promise.all([
    getModeratorPrices(),
    settings.get<string>('metalpriceapi_key'),
  ]);
  const metalPriceApi =
    typeof apiKey === 'string' && apiKey.length > 0
      ? await fetchMetalPriceApiPrices(apiKey)
      : {};

  const fetchedAt = new Date().toISOString();
  const prices: MetalPrice[] = [];

  for (const meta of METALS) {
    let price: number | null = null;
    let source: PriceSource = 'none';

    if (meta.yahooSymbol) {
      price = await fetchYahooPrice(meta.yahooSymbol);
      if (price !== null) {
        source = 'yahoo';
      }
    }
    if (price === null) {
      price = await fetchGoldApiPrice(meta.code);
      if (price !== null) {
        source = 'gold-api';
      }
    }
    if (price === null && metalPriceApi[meta.key] !== undefined) {
      price = metalPriceApi[meta.key] ?? null;
      if (price !== null) {
        source = 'metalpriceapi';
      }
    }
    if (price === null) {
      const fallback = moderator[meta.key];
      if (typeof fallback === 'number') {
        price = fallback;
        source = 'moderator';
      }
    }

    prices.push({
      metal: meta.key,
      priceUsdPerTroyOz: price,
      source,
      updatedAt: price === null ? null : fetchedAt,
    });
  }

  const payload: CachedPrices = { fetchedAt, prices };
  await redis.set(CACHE_KEY, JSON.stringify(payload));
  await redis.expire(CACHE_KEY, 120);
  return { prices, fetchedAt, cacheHit: false };
};
