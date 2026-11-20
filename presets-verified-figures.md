# Checker presets — verified figures (ready for implementation)

Prepared Nov 20, 2026 ~02:45 ET. Do NOT implement the presets until the parent
forwards the browser task's spec of the ORIGINAL live preset list
(per-preset settings). These verified figures slot into that spec.

## Karat gold presets — CONFIRMED

Sources (all agree): Money Metals "What Is 24k Gold" chart, Brilliant Earth
"Gold Karat Explained", BullionStar 10K guide, Karatology karat chart,
goldcalculator.co, jewelrycarats.com. Formula: purity % = karat / 24 × 100.

| Preset | Purity % (use this) | Millesimal stamp | Notes |
|--------|---------------------|------------------|-------|
| 10k gold | 41.7 | 417 | 10/24 = 41.67% |
| 14k gold | 58.3 | 585 / 583 | 14/24 = 58.33%; stamp 585 reads 58.5% — use 58.3% |
| 18k gold | 75.0 | 750 | 18/24 = 75% |
| 24k gold | 99.9 | 999 / 9999 | Nominally 100%, investment-grade is 99.9% — matches the checker's existing 99.9% default |

- Preset behavior: metal=gold, purity set as above, weight=1, unit=gram.
- Default weight = 1 GRAM: karat gold is jewelry/scrap, weighed in grams
  everywhere (rings 3–7g, chains 10–30g); gold calculators use grams as the
  standard unit for karat gold. The user types their actual weight from there.

## Junk-silver presets — CONFIRMED

Sources (all agree): Summit Metals constitutional-silver guide, SD Bullion
junk-silver specs (citing U.S. Mint specifications), US Gold & Coin melt
calculator, Vintage Coins US silver guide, MetalMetric, Metalworthy,
BullionStar junk-silver guide, Money Metals $1-face listings.
Figures are mint specifications (as struck); see wear note below.

| Preset | Years | Purity | Pure silver per coin (troy oz) | Face value |
|--------|-------|--------|-------------------------------|------------|
| Pre-1965 Dime (90%) | ≤1964 | 90% | 0.0723 | $0.10 |
| Pre-1965 Quarter (90%) | ≤1964 | 90% | 0.1808 | $0.25 |
| Pre-1965 Half Dollar (90%) | ≤1964 | 90% | 0.3617 | $0.50 |
| Morgan / Peace Dollar (90%) | 1878–1935 | 90% | 0.7734 | $1.00 |
| 40% Kennedy Half | 1965–1970 | 40% | 0.1479 | $0.50 |
| 35% War Nickel | 1942–1945 | 35% | 0.0563 (precise 0.05626) | $0.05 |
| 40% Eisenhower Dollar | 1971–1976 (S-mint) | 40% | 0.3161 | $1.00 |

Face-value presets (90% only):
- $1 Face Value 90% = **0.715 troy oz** pure silver (wear-adjusted dealer standard)
- $10 Face Value 90% = **7.15 troy oz** pure silver

WEAR NOTE (important, put in README): mint-spec silver for $1 face of 90%
is 0.7234 ozt as struck; dealers use **0.715 ozt** to allow for circulation
wear. The $1/$10 face presets use 0.715 / 7.15. The per-coin presets use the
mint-spec figures above (0.0723 / 0.1808 / 0.3617 / 0.7734), matching how the
checker's original presets already work.

## What still blocks implementation

The browser task's spec of the ORIGINAL live preset list (preset names +
per-preset settings as they exist in the live app) — the parent will forward
it. New presets must match that spec's shape (how a preset sets
metal/weight/unit/purity, and whether presets are a list, chips, or a menu).
