import './index.css';

import { StrictMode, useCallback, useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { navigateTo, showToast } from '@devvit/web/client';
import type {
  MetalKey,
  MetalPrice,
  ShareRequest,
  WeightUnit,
} from '../shared/api';
import { parsePricesResponse, parseShareResponse } from '../shared/api';
import {
  METALS,
  METAL_LABELS,
  dealerPrice,
  estimateValue,
  formatPricePerOz,
  formatUsd,
} from '../shared/metals';

type CollectionItem = {
  id: number;
  metal: MetalKey;
  weight: number;
  unit: WeightUnit;
  purity: number;
  premium: number;
  value: number;
};

const SOURCE_LABELS: Record<string, string> = {
  yahoo: 'Live',
  'gold-api': 'Live',
  metalpriceapi: 'Live',
  moderator: 'Reference price',
  none: 'Unavailable',
};

let nextItemId = 1;

export const App = () => {
  const [metal, setMetal] = useState<MetalKey>('gold');
  const [weight, setWeight] = useState('1');
  const [unit, setUnit] = useState<WeightUnit>('oz');
  const [purity, setPurity] = useState('99.9');
  const [premium, setPremium] = useState(0);
  const [prices, setPrices] = useState<MetalPrice[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  const [sharing, setSharing] = useState(false);

  const loadPrices = useCallback(async () => {
    try {
      const res = await fetch('/api/prices');
      if (!res.ok) {
        throw new Error('prices request failed');
      }
      const data = parsePricesResponse(await res.json());
      if (data === null) {
        throw new Error('prices response was not the expected shape');
      }
      setPrices(data.prices);
      setFetchedAt(data.fetchedAt);
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => void loadPrices(), 60_000);
    // First load on a timer so the effect only subscribes; the fetch itself
    // runs outside the effect body.
    const initial = setTimeout(() => void loadPrices(), 0);
    return () => {
      clearInterval(timer);
      clearTimeout(initial);
    };
  }, [loadPrices]);

  const selectedPrice = useMemo(
    () => prices?.find((entry) => entry.metal === metal) ?? null,
    [prices, metal]
  );

  const weightNum = Number.parseFloat(weight);
  const purityNum = Number.parseFloat(purity);
  const validInputs =
    Number.isFinite(weightNum) &&
    weightNum > 0 &&
    Number.isFinite(purityNum) &&
    purityNum > 0 &&
    purityNum <= 100;

  const value =
    selectedPrice?.priceUsdPerTroyOz !== null &&
    selectedPrice?.priceUsdPerTroyOz !== undefined &&
    validInputs
      ? estimateValue(
          selectedPrice.priceUsdPerTroyOz,
          weightNum,
          unit,
          purityNum,
          premium
        )
      : null;
  const dealer = value === null ? null : dealerPrice(value);

  const updatedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour12: false })
    : '—';

  const addToCollection = () => {
    if (value === null) {
      showToast('Enter a weight and wait for the live price first');
      return;
    }
    setCollection((items) => [
      ...items,
      {
        id: nextItemId++,
        metal,
        weight: weightNum,
        unit,
        purity: purityNum,
        premium,
        value,
      },
    ]);
    showToast('Added to your collection');
  };

  const removeFromCollection = (id: number) => {
    setCollection((items) => items.filter((item) => item.id !== id));
  };

  const collectionTotal = collection.reduce((sum, item) => sum + item.value, 0);

  const shareAsPost = async () => {
    if (value === null || dealer === null || sharing) {
      return;
    }
    setSharing(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metal,
          weight: weightNum,
          unit,
          purity: purityNum,
          premium,
          estimatedValue: value,
          dealerPrice: dealer,
        } satisfies ShareRequest),
      });
      if (!res.ok) {
        throw new Error('share failed');
      }
      const data = parseShareResponse(await res.json());
      if (data === null) {
        throw new Error('share response was not the expected shape');
      }
      showToast('Shared to your community');
      navigateTo(data.url);
    } catch {
      showToast('Sharing failed — please try again');
    } finally {
      setSharing(false);
    }
  };

  const copySummary = async () => {
    if (value === null || dealer === null) {
      return;
    }
    const unitLabel = unit === 'g' ? 'g' : 'troy oz';
    const summary =
      `My ${weightNum} ${unitLabel} of ${METAL_LABELS[metal]} (${purityNum}% pure) ` +
      `is worth about ${formatUsd(value)} (${formatUsd(dealer)} dealer price). ` +
      `Estimated with Agate Metals Checker — estimates only, not financial advice.`;
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Summary copied — paste it anywhere on Reddit');
    } catch {
      showToast('Copy not available here — use Share as a post instead');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1a2e] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-4 py-4">
        <header className="text-center">
          <p className="text-[0.72rem] font-semibold tracking-[0.25em] text-[#d4af37]">
            AGATE METALS • LIVE REFERENCE
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">
            Know what your bullion is worth
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2 rounded-full border border-[#d4af37]/40 bg-white/5 px-4 py-2">
            {loading && prices === null ? (
              <span className="inline-block h-4 w-40 animate-pulse rounded bg-white/20" />
            ) : (
              <>
                <span className="text-lg font-bold text-[#d4af37]">
                  {selectedPrice?.priceUsdPerTroyOz !== null &&
                  selectedPrice?.priceUsdPerTroyOz !== undefined
                    ? `${METAL_LABELS[metal]} ${formatPricePerOz(selectedPrice.priceUsdPerTroyOz)} / oz`
                    : `${METAL_LABELS[metal]} — no live price`}
                </span>
                <span className="rounded-full bg-[#d4af37] px-2 py-0.5 text-[0.65rem] font-bold text-[#0a1a2e]">
                  {selectedPrice ? SOURCE_LABELS[selectedPrice.source] : '—'}
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-[0.72rem] text-white/60">
            Updated {updatedLabel} • Refreshes every 60 seconds
          </p>
        </header>

        {loadError && prices === null ? (
          <div className="mt-6 rounded-xl border border-red-400/50 bg-red-500/10 p-4 text-center">
            <p className="font-semibold">Couldn&apos;t load live prices</p>
            <p className="mt-1 text-sm text-white/70">
              Check your connection and try again. Reference prices may still be
              available once the app reconnects.
            </p>
            <button
              className="mt-3 cursor-pointer rounded-full bg-[#d4af37] px-4 py-2 text-sm font-bold text-[#0a1a2e]"
              onClick={() => {
                setLoading(true);
                setLoadError(false);
                void loadPrices();
              }}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <nav className="mt-5 grid grid-cols-5 gap-1 rounded-full bg-white/10 p-1">
              {METALS.map((entry) => (
                <button
                  key={entry.key}
                  className={`cursor-pointer rounded-full px-1 py-2 text-[0.8rem] font-semibold transition-colors ${
                    metal === entry.key
                      ? 'bg-[#d4af37] text-[#0a1a2e]'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  onClick={() => setMetal(entry.key)}
                >
                  {entry.label}
                </button>
              ))}
            </nav>

            <section className="mt-4 rounded-2xl bg-white p-4 text-[#0a1a2e] shadow-lg">
              {loading && prices === null ? (
                <div className="space-y-3">
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        WEIGHT
                      </span>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold outline-none focus:border-[#d4af37]"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                      />
                    </label>
                    <div>
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        UNIT
                      </span>
                      <div className="mt-1 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                        <button
                          className={`cursor-pointer rounded-md px-2 py-2 text-sm font-semibold ${
                            unit === 'oz'
                              ? 'bg-[#0a1a2e] text-white'
                              : 'text-slate-600'
                          }`}
                          onClick={() => setUnit('oz')}
                        >
                          Troy Oz
                        </button>
                        <button
                          className={`cursor-pointer rounded-md px-2 py-2 text-sm font-semibold ${
                            unit === 'g'
                              ? 'bg-[#0a1a2e] text-white'
                              : 'text-slate-600'
                          }`}
                          onClick={() => setUnit('g')}
                        >
                          Gram
                        </button>
                      </div>
                    </div>
                  </div>

                  <label className="mt-3 block">
                    <span className="text-xs font-semibold tracking-wide text-slate-500">
                      PURITY %
                    </span>
                    <input
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold outline-none focus:border-[#d4af37]"
                      type="number"
                      inputMode="decimal"
                      min="0"
                      max="100"
                      step="0.1"
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="flex justify-between text-xs font-semibold tracking-wide text-slate-500">
                      <span>DEALER PREMIUM</span>
                      <span className="text-[#0a1a2e]">
                        {premium.toFixed(1)}%
                      </span>
                    </span>
                    <input
                      className="mt-1 w-full accent-[#d4af37]"
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={premium}
                      onChange={(e) => setPremium(Number(e.target.value))}
                    />
                    <span className="flex justify-between text-[0.7rem] text-slate-400">
                      <span>0% (melt value)</span>
                      <span>50%</span>
                    </span>
                  </label>

                  <div className="mt-4 rounded-xl bg-[#0a1a2e] p-4 text-center text-white">
                    <p className="text-xs font-semibold tracking-[0.2em] text-[#d4af37]">
                      ESTIMATED VALUE
                    </p>
                    <p className="mt-1 text-3xl font-bold">
                      {value === null ? '—' : formatUsd(value)}
                    </p>
                    <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-white/60">
                      ESTIMATED DEALER PRICE (95%)
                    </p>
                    <p className="text-xl font-semibold text-[#d4af37]">
                      {dealer === null ? '—' : formatUsd(dealer)}
                    </p>
                    {selectedPrice?.source === 'moderator' ? (
                      <p className="mt-2 text-[0.7rem] text-white/60">
                        Showing a moderator reference price — live sources are
                        unavailable right now.
                      </p>
                    ) : null}
                    {selectedPrice?.priceUsdPerTroyOz === null ? (
                      <p className="mt-2 text-[0.7rem] text-white/60">
                        No live price for {METAL_LABELS[metal]} right now — ask
                        a moderator to set a daily reference price.
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      className="cursor-pointer rounded-full bg-[#d4af37] px-3 py-2.5 text-sm font-bold text-[#0a1a2e] disabled:opacity-50"
                      onClick={addToCollection}
                      disabled={value === null}
                    >
                      + Add to collection
                    </button>
                    <button
                      className="cursor-pointer rounded-full border-2 border-[#0a1a2e] px-3 py-2.5 text-sm font-bold text-[#0a1a2e] disabled:opacity-50"
                      onClick={() => void shareAsPost()}
                      disabled={value === null || sharing}
                    >
                      {sharing ? 'Sharing…' : 'Share as a post'}
                    </button>
                  </div>
                  <button
                    className="mt-2 w-full cursor-pointer text-center text-sm font-semibold text-slate-500 underline disabled:opacity-50"
                    onClick={() => void copySummary()}
                    disabled={value === null}
                  >
                    Copy summary to share anywhere
                  </button>
                </>
              )}
            </section>

            {collection.length > 0 ? (
              <section className="mt-4 rounded-2xl bg-white p-4 text-[#0a1a2e] shadow-lg">
                <h2 className="text-sm font-bold tracking-wide">
                  MY COLLECTION
                </h2>
                <ul className="mt-2 space-y-2">
                  {collection.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm"
                    >
                      <span>
                        {item.weight} {item.unit === 'g' ? 'g' : 'troy oz'}{' '}
                        {METAL_LABELS[item.metal]} ({item.purity}%)
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="font-bold">
                          {formatUsd(item.value)}
                        </span>
                        <button
                          className="cursor-pointer rounded-full bg-slate-300 px-2 py-0.5 text-xs font-bold"
                          onClick={() => removeFromCollection(item.id)}
                          aria-label="Remove from collection"
                        >
                          ✕
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                  <span>Collection total</span>
                  <span>{formatUsd(collectionTotal)}</span>
                </p>
              </section>
            ) : null}
          </>
        )}

        <footer className="mt-5 pb-2 text-center text-[0.72rem] leading-relaxed text-white/60">
          <p>
            All figures are estimates based on live reference prices — not
            quotes, and not financial advice.
          </p>
          <p className="mt-2 flex justify-center gap-3">
            <button
              className="cursor-pointer underline"
              onClick={() =>
                navigateTo('https://agatepreciousmetals.com/terms.html')
              }
            >
              Terms
            </button>
            <span>•</span>
            <button
              className="cursor-pointer underline"
              onClick={() =>
                navigateTo('https://agatepreciousmetals.com/privacy.html')
              }
            >
              Privacy
            </button>
            <span>•</span>
            <button
              className="cursor-pointer underline"
              onClick={() => navigateTo('https://agatemetals.com/')}
            >
              agatemetals.com
            </button>
          </p>
        </footer>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
