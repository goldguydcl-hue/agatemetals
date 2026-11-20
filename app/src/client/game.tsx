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
import {
  isRecord,
  parsePricesResponse,
  parseShareResponse,
} from '../shared/api';
import {
  METALS,
  METAL_LABELS,
  dealerPrice,
  estimateValue,
  formatPricePerOz,
  formatUsd,
} from '../shared/metals';
import {
  CUSTOM_PRESET_ID,
  PRESETS,
  PRESET_GROUPS,
  PURITY_GROUPS,
  findPreset,
  findPurityOptionForMetal,
  formatFineOz,
  formatPurity,
  lineDealerValue,
  linePureOz,
  lineValue,
  newLineId,
  parseCollectionLines,
  presetUnitValue,
  purityOptionKey,
} from '../shared/presets';
import type { CollectionLine, Preset } from '../shared/presets';

const SOURCE_LABELS: Record<string, string> = {
  yahoo: 'Live',
  'gold-api': 'Live',
  metalpriceapi: 'Live',
  moderator: 'Reference price',
  none: 'Unavailable',
};

type SaveState = 'idle' | 'saving' | 'saved' | 'unsaved';

export const App = () => {
  const [metal, setMetal] = useState<MetalKey>('silver');
  const [weight, setWeight] = useState('1');
  const [unit, setUnit] = useState<WeightUnit>('oz');
  const [purity, setPurity] = useState('99.9');
  const [premium, setPremium] = useState(0);
  const [presetId, setPresetId] = useState(CUSTOM_PRESET_ID);
  const [prices, setPrices] = useState<MetalPrice[] | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [collection, setCollection] = useState<CollectionLine[]>([]);
  const [collectionLoaded, setCollectionLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [sharing, setSharing] = useState(false);
  const [sharingCollection, setSharingCollection] = useState(false);
  const [ticks, setTicks] = useState<string[]>([]);
  const [qtyByPreset, setQtyByPreset] = useState<Record<string, number>>({});

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

  // Load the saved collection once, then persist every change (debounced).
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/collection');
        if (!res.ok) {
          throw new Error('collection request failed');
        }
        const data: unknown = await res.json();
        if (!isRecord(data)) {
          throw new Error('collection response was not the expected shape');
        }
        const items = parseCollectionLines(data.items);
        if (items === null) {
          throw new Error('collection items were not the expected shape');
        }
        if (!cancelled) {
          setCollection(items);
          setSaveState('saved');
        }
      } catch {
        if (!cancelled) {
          setSaveState('unsaved');
        }
      } finally {
        if (!cancelled) {
          setCollectionLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!collectionLoaded) {
      return;
    }
    const timer = setTimeout(() => {
      setSaveState('saving');
      void (async () => {
        try {
          const res = await fetch('/api/collection', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: collection }),
          });
          setSaveState(res.ok ? 'saved' : 'unsaved');
        } catch {
          setSaveState('unsaved');
        }
      })();
    }, 600);
    return () => clearTimeout(timer);
  }, [collection, collectionLoaded]);

  const selectedPrice = useMemo(
    () => prices?.find((entry) => entry.metal === metal) ?? null,
    [prices, metal]
  );

  const priceFor = useCallback(
    (key: MetalKey): number | null => {
      const entry = prices?.find((item) => item.metal === key);
      return entry?.priceUsdPerTroyOz ?? null;
    },
    [prices]
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
  const fineOz =
    validInputs && value !== null
      ? formatFineOz(weightNum, unit, purityNum)
      : null;

  const updatedLabel = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString('en-US', { hour12: false })
    : '—';

  const metalTicker = METALS.find((entry) => entry.key === metal)?.ticker ?? '';

  /** Any manual edit breaks the preset match — the picker shows Custom Item. */
  const markManual = () => setPresetId(CUSTOM_PRESET_ID);

  const applyPreset = (preset: Preset) => {
    setPresetId(preset.id);
    if (preset.id === CUSTOM_PRESET_ID) {
      // Custom Item does NOT reset anything — manual/default mode only.
      return;
    }
    setMetal(preset.metal);
    setWeight(String(preset.weight));
    setUnit(preset.unit);
    setPurity(formatPurity(preset.purity));
    // The premium slider stays 0.0% for ALL presets — never moves.
    setPremium(0);
  };

  const matchingPurityOption =
    Number.isFinite(purityNum) && purityNum > 0 && purityNum <= 100
      ? findPurityOptionForMetal(metal, purityNum)
      : null;
  const purityPickerValue =
    matchingPurityOption === null
      ? 'custom'
      : purityOptionKey(matchingPurityOption);

  const addToCollection = () => {
    if (value === null) {
      showToast('Enter a weight and wait for the live price first');
      return;
    }
    const unitLabel = unit === 'g' ? 'g' : 'troy oz';
    const name =
      presetId === CUSTOM_PRESET_ID
        ? `${weightNum} ${unitLabel} ${METAL_LABELS[metal]} (${formatPurity(purityNum)}%)`
        : (findPreset(presetId)?.name ??
          `${weightNum} ${unitLabel} ${METAL_LABELS[metal]}`);
    setCollection((items) => [
      ...items,
      {
        id: newLineId(),
        presetId: presetId === CUSTOM_PRESET_ID ? null : presetId,
        name,
        metal,
        weight: weightNum,
        unit,
        purity: purityNum,
        premium,
        quantity: 1,
        unitValueSnapshot: value,
      },
    ]);
    showToast('Added to your collection');
  };

  const removeFromCollection = (id: string) => {
    setCollection((items) => items.filter((item) => item.id !== id));
  };

  const clearCollection = () => {
    setCollection([]);
    showToast('Collection cleared');
  };

  const toggleTick = (id: string) => {
    setTicks((current) =>
      current.includes(id)
        ? current.filter((tick) => tick !== id)
        : [...current, id]
    );
  };

  const qtyFor = (id: string): number => qtyByPreset[id] ?? 1;

  const setQty = (id: string, qty: number) => {
    const clamped = Math.min(999, Math.max(1, Math.floor(qty)));
    setQtyByPreset((current) => ({ ...current, [id]: clamped }));
  };

  const addSelectedToCollection = () => {
    if (ticks.length === 0) {
      showToast('Tick one or more products first');
      return;
    }
    const missingPrice = ticks.some(
      (id) => priceFor(findPreset(id)?.metal ?? 'silver') === null
    );
    if (missingPrice) {
      showToast('Wait for the live price first');
      return;
    }
    let added = 0;
    const next: CollectionLine[] = [...collection];
    for (const id of ticks) {
      const preset = findPreset(id);
      if (preset === null) {
        continue;
      }
      const spot = priceFor(preset.metal);
      if (spot === null) {
        continue;
      }
      const qty = qtyFor(id);
      const unitValue = presetUnitValue(preset, spot) ?? 0;
      const existingIndex = next.findIndex(
        (line) => line.presetId === preset.id && line.premium === 0
      );
      if (existingIndex >= 0) {
        const existing = next[existingIndex];
        if (existing !== undefined) {
          next[existingIndex] = {
            ...existing,
            quantity: existing.quantity + qty,
          };
        }
      } else {
        next.push({
          id: newLineId(),
          presetId: preset.id,
          name: preset.name,
          metal: preset.metal,
          weight: preset.weight,
          unit: preset.unit,
          purity: preset.purity,
          premium: 0,
          quantity: qty,
          unitValueSnapshot: unitValue,
        });
      }
      added += qty;
    }
    setCollection(next);
    setTicks([]);
    showToast(
      added === 1
        ? 'Added 1 item to your collection'
        : `Added ${added} items to your collection`
    );
  };

  const collectionTotal = collection.reduce(
    (sum, item) => sum + lineValue(item, priceFor(item.metal)),
    0
  );
  const collectionDealerTotal = dealerPrice(collectionTotal);

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

  const shareCollectionAsPost = async () => {
    if (collection.length === 0 || sharingCollection) {
      return;
    }
    setSharingCollection(true);
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
          estimatedValue: collectionTotal,
          dealerPrice: collectionDealerTotal,
          title: `My collection is worth about ${formatUsd(collectionTotal)} (${formatUsd(collectionDealerTotal)} dealer price) — Agate Metals Checker`,
        } satisfies ShareRequest),
      });
      if (!res.ok) {
        throw new Error('share failed');
      }
      const data = parseShareResponse(await res.json());
      if (data === null) {
        throw new Error('share response was not the expected shape');
      }
      showToast('Collection shared to your community');
      navigateTo(data.url);
    } catch {
      showToast('Sharing failed — please try again');
    } finally {
      setSharingCollection(false);
    }
  };

  const copySummary = async () => {
    if (value === null || dealer === null) {
      return;
    }
    const unitLabel = unit === 'g' ? 'g' : 'troy oz';
    const summary =
      `My ${weightNum} ${unitLabel} of ${METAL_LABELS[metal]} (${formatPurity(purityNum)}% pure) ` +
      `is worth about ${formatUsd(value)} (${formatUsd(dealer)} dealer price). ` +
      `Estimated with Agate Metals Checker — estimates only, not financial advice.`;
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Summary copied — paste it anywhere on Reddit');
    } catch {
      showToast('Copy not available here — use Share as a post instead');
    }
  };

  const copyCollectionSummary = async () => {
    if (collection.length === 0) {
      return;
    }
    const lines = collection.map((item) => {
      const itemValue = lineValue(item, priceFor(item.metal));
      const itemDealer = lineDealerValue(item, priceFor(item.metal));
      return `- ${item.quantity}x ${item.name} — ${METAL_LABELS[item.metal]}, ${linePureOz(item).toFixed(4)} ozt pure, ${formatUsd(itemValue)} (${formatUsd(itemDealer)} dealer)`;
    });
    const summary =
      `My collection — Agate Metals Checker (estimates only, not financial advice):\n` +
      lines.join('\n') +
      `\nTotal: ${formatUsd(collectionTotal)} (${formatUsd(collectionDealerTotal)} dealer price)`;
    try {
      await navigator.clipboard.writeText(summary);
      showToast('Collection summary copied — paste it anywhere on Reddit');
    } catch {
      showToast('Copy not available here — use Share as a post instead');
    }
  };

  const sourcePillClass =
    selectedPrice?.source === 'moderator'
      ? 'bg-slate-200 text-slate-700'
      : selectedPrice?.source === 'none' || selectedPrice === null
        ? 'bg-red-100 text-red-700'
        : 'bg-[#d4af37] text-[#0a1a2e]';

  return (
    <div className="min-h-screen bg-white text-[#0a1a2e]">
      <div className="mx-auto flex min-h-screen w-full max-w-[560px] flex-col px-4 py-4">
        <header className="text-center">
          <p className="text-[0.72rem] font-semibold tracking-[0.25em] text-slate-500">
            AGATE METALS • LIVE REFERENCE
          </p>
          <h1 className="mt-1 text-2xl font-bold leading-tight">
            Know what your bullion is worth
          </h1>
          <div className="mx-auto mt-3 flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-700">
              {loading && prices === null ? '…' : metalTicker}
            </span>
            <span className="text-lg font-bold text-[#a07c1a]">
              {loading && prices === null
                ? 'Loading live prices…'
                : selectedPrice?.priceUsdPerTroyOz !== null &&
                    selectedPrice?.priceUsdPerTroyOz !== undefined
                  ? `${METAL_LABELS[metal]} ${formatPricePerOz(selectedPrice.priceUsdPerTroyOz)} / oz`
                  : `${METAL_LABELS[metal]} — no live price`}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${sourcePillClass}`}
            >
              {selectedPrice ? SOURCE_LABELS[selectedPrice.source] : '—'}
            </span>
          </div>
          <p className="mt-1 text-[0.72rem] text-slate-500">
            Updated {updatedLabel} • Refreshes every 60 seconds
          </p>
          <button
            className="mt-2 cursor-pointer rounded-full border border-[#d4af37] bg-[#fffbeb] px-4 py-1.5 text-sm font-bold text-[#a07c1a] disabled:opacity-50"
            onClick={() => {
              setLoading(true);
              void loadPrices();
            }}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh price'}
          </button>
          {metal === 'rhodium' && selectedPrice?.source === 'moderator' ? (
            <p className="mx-auto mt-3 max-w-[480px] rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.75rem] leading-relaxed text-amber-800">
              Reference price: the rhodium fallback ($4,500/ozt) is stale — the
              market is roughly $8,200–$9,400/ozt — so this value is about half
              the real market. Ask a moderator to update the reference price.
            </p>
          ) : null}
        </header>

        {loadError && prices === null ? (
          <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-4 text-center">
            <p className="font-semibold text-red-900">
              Couldn&apos;t load live prices
            </p>
            <p className="mt-1 text-sm text-red-800/70">
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
            <nav className="mt-5 grid grid-cols-5 gap-1 rounded-full border border-slate-200 bg-white p-1">
              {METALS.map((entry) => (
                <button
                  key={entry.key}
                  className={`cursor-pointer rounded-full px-1 py-2 text-[0.8rem] font-semibold transition-colors ${
                    metal === entry.key
                      ? 'bg-black text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  onClick={() => {
                    setMetal(entry.key);
                    markManual();
                  }}
                >
                  {entry.label}
                </button>
              ))}
            </nav>

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-[#0a1a2e] shadow-lg">
              {loading && prices === null ? (
                <div className="space-y-3">
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-10 animate-pulse rounded-lg bg-slate-200" />
                  <div className="h-16 animate-pulse rounded-lg bg-slate-200" />
                </div>
              ) : (
                <>
                  <label className="block">
                    <span className="text-xs font-semibold tracking-wide text-slate-500">
                      PRODUCT
                    </span>
                    <select
                      className="mt-1 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-black outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40"
                      value={presetId}
                      onChange={(e) => {
                        const preset = findPreset(e.target.value);
                        if (preset !== null) {
                          applyPreset(preset);
                        }
                      }}
                    >
                      {PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        WEIGHT
                      </span>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold text-black outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={weight}
                        onChange={(e) => {
                          setWeight(e.target.value);
                          markManual();
                        }}
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
                              ? 'bg-black text-white'
                              : 'text-slate-600'
                          }`}
                          onClick={() => {
                            setUnit('oz');
                            markManual();
                          }}
                        >
                          Troy Oz
                        </button>
                        <button
                          className={`cursor-pointer rounded-md px-2 py-2 text-sm font-semibold ${
                            unit === 'g'
                              ? 'bg-black text-white'
                              : 'text-slate-600'
                          }`}
                          onClick={() => {
                            setUnit('g');
                            markManual();
                          }}
                        >
                          Gram
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        PURITY %
                      </span>
                      <input
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg font-semibold text-black outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40"
                        type="number"
                        inputMode="decimal"
                        min="0"
                        max="100"
                        step="0.01"
                        value={purity}
                        onChange={(e) => {
                          setPurity(e.target.value);
                          markManual();
                        }}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">
                        PURITY PICKER
                      </span>
                      <select
                        className="mt-1 w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-black outline-none focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/40"
                        value={purityPickerValue}
                        onChange={(e) => {
                          const key = e.target.value;
                          if (key === 'custom') {
                            return;
                          }
                          const [optionMetal, optionPurity] = key.split(':');
                          const parsed = Number.parseFloat(optionPurity ?? '');
                          if (
                            Number.isFinite(parsed) &&
                            optionMetal !== undefined
                          ) {
                            setPurity(formatPurity(parsed));
                            markManual();
                          }
                        }}
                      >
                        <option value="custom">Custom</option>
                        {PURITY_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((option) => (
                              <option
                                key={purityOptionKey(option)}
                                value={purityOptionKey(option)}
                              >
                                {option.label} — {option.name} (
                                {formatPurity(option.purity)}%)
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block">
                    <span className="flex justify-between text-xs font-semibold tracking-wide text-slate-500">
                      <span>DEALER PREMIUM</span>
                      <span className="text-[#0a1a2e]">
                        {premium.toFixed(1)}%
                      </span>
                    </span>
                    <input
                      className="dealer-slider mt-1 w-full"
                      type="range"
                      min="0"
                      max="50"
                      step="0.5"
                      value={premium}
                      onChange={(e) => {
                        setPremium(Number(e.target.value));
                        markManual();
                      }}
                    />
                    <span className="flex justify-between text-[0.7rem] text-slate-400">
                      <span>0% (melt value)</span>
                      <span>50%</span>
                    </span>
                  </label>

                  <div className="mt-4 rounded-xl bg-black p-4 text-center text-white">
                    <p className="text-xs font-semibold tracking-[0.2em] text-white">
                      ESTIMATED VALUE
                    </p>
                    <p className="mt-1 text-3xl font-bold text-[#d4af37]">
                      {value === null ? '—' : formatUsd(value)}
                    </p>
                    <p className="mt-1 text-xs text-white/60">
                      {fineOz === null ? '—' : `${fineOz} fine ozt`}
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

                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-center">
                    <p className="text-xs font-semibold tracking-[0.2em] text-slate-500">
                      ESTIMATED DEALER PRICE (95%)
                    </p>
                    <p className="mt-1 text-xl font-bold text-black">
                      {dealer === null ? '—' : formatUsd(dealer)}
                    </p>
                    <p className="mt-1 text-[0.7rem] text-slate-500">
                      Reference at 95% of calculated metal value
                    </p>
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
                      className="cursor-pointer rounded-full border-2 border-[#0a1a2e] bg-white px-3 py-2.5 text-sm font-bold text-[#0a1a2e] disabled:opacity-50"
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

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-[#0a1a2e] shadow-lg">
              <h2 className="text-sm font-bold tracking-wide">
                COMMON PRODUCTS
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Tick products and add them all at once. Tap a product name to
                fill in the calculator instead.
              </p>
              {PRESET_GROUPS.map((group) => (
                <div key={group.label} className="mt-3">
                  <h3 className="text-xs font-bold tracking-wide text-slate-400">
                    {group.label.toUpperCase()}
                  </h3>
                  <ul className="mt-1 space-y-1">
                    {group.presets.map((preset) => {
                      const spot = priceFor(preset.metal);
                      const unitValue = presetUnitValue(preset, spot);
                      const ticked = ticks.includes(preset.id);
                      return (
                        <li
                          key={preset.id}
                          className="flex items-center gap-2 rounded-lg bg-slate-100 px-2 py-1.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 cursor-pointer accent-[#d4af37]"
                            checked={ticked}
                            onChange={() => toggleTick(preset.id)}
                            aria-label={`Select ${preset.name}`}
                          />
                          <button
                            className="min-w-0 flex-1 cursor-pointer truncate text-left font-semibold text-[#0a1a2e] hover:underline"
                            onClick={() => applyPreset(preset)}
                          >
                            {preset.name}
                          </button>
                          <span className="shrink-0 font-bold">
                            {unitValue === null ? '—' : formatUsd(unitValue)}
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            <button
                              className="cursor-pointer rounded-full bg-slate-300 px-2 py-0.5 text-xs font-bold"
                              onClick={() =>
                                setQty(preset.id, qtyFor(preset.id) - 1)
                              }
                              aria-label={`One fewer ${preset.name}`}
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-bold">
                              {qtyFor(preset.id)}
                            </span>
                            <button
                              className="cursor-pointer rounded-full bg-slate-300 px-2 py-0.5 text-xs font-bold"
                              onClick={() =>
                                setQty(preset.id, qtyFor(preset.id) + 1)
                              }
                              aria-label={`One more ${preset.name}`}
                            >
                              +
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <button
                className="mt-3 w-full cursor-pointer rounded-full bg-[#d4af37] px-3 py-2.5 text-sm font-bold text-[#0a1a2e] disabled:opacity-50"
                onClick={addSelectedToCollection}
                disabled={ticks.length === 0}
              >
                Add selected to my collection
              </button>
            </section>

            <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-[#0a1a2e] shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold tracking-wide">
                  MY COLLECTION
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  {saveState === 'saving'
                    ? 'Saving…'
                    : saveState === 'saved'
                      ? '✓ Saved'
                      : saveState === 'unsaved'
                        ? 'Not saved — sign in to Reddit to save'
                        : ''}
                </span>
              </div>
              {collection.length === 0 ? (
                <p className="mt-2 text-sm text-slate-500">
                  No items yet — tick products in Common Products above, or add
                  the calculator result.
                </p>
              ) : (
                <>
                  <ul className="mt-2 space-y-2">
                    {collection.map((item) => {
                      const itemValue = lineValue(item, priceFor(item.metal));
                      const itemDealer = lineDealerValue(
                        item,
                        priceFor(item.metal)
                      );
                      return (
                        <li
                          key={item.id}
                          className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-semibold">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="flex items-center gap-2">
                              <span className="font-bold">
                                {formatUsd(itemValue)}
                              </span>
                              <button
                                className="cursor-pointer rounded-full bg-slate-300 px-2 py-0.5 text-xs font-bold"
                                onClick={() => removeFromCollection(item.id)}
                                aria-label={`Remove ${item.name} from collection`}
                              >
                                ✕
                              </button>
                            </span>
                          </span>
                          <span className="mt-0.5 flex justify-between gap-2 text-xs text-slate-500">
                            <span>
                              {METAL_LABELS[item.metal]} •{' '}
                              {linePureOz(item).toFixed(4)} ozt pure
                            </span>
                            <span>Dealer {formatUsd(itemDealer)}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="mt-3 flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                    <span>Collection total</span>
                    <span>{formatUsd(collectionTotal)}</span>
                  </p>
                  <p className="mt-1 flex justify-between text-sm font-semibold text-slate-600">
                    <span>Total dealer price (95%)</span>
                    <span>{formatUsd(collectionDealerTotal)}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      className="cursor-pointer rounded-full border-2 border-[#0a1a2e] bg-white px-3 py-2 text-sm font-bold text-[#0a1a2e]"
                      onClick={() => void copyCollectionSummary()}
                    >
                      Copy collection summary
                    </button>
                    <button
                      className="cursor-pointer rounded-full bg-[#d4af37] px-3 py-2 text-sm font-bold text-[#0a1a2e] disabled:opacity-50"
                      onClick={() => void shareCollectionAsPost()}
                      disabled={sharingCollection}
                    >
                      {sharingCollection
                        ? 'Sharing…'
                        : 'Share collection as a post'}
                    </button>
                  </div>
                  <button
                    className="mt-2 w-full cursor-pointer text-center text-sm font-semibold text-slate-500 underline"
                    onClick={clearCollection}
                  >
                    Clear all
                  </button>
                </>
              )}
            </section>
          </>
        )}

        <footer className="mt-5 pb-2 text-center text-[0.72rem] leading-relaxed text-slate-500">
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
