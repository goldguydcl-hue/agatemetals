# Agate Metals Checker — Product Purity & Melt Table

Generated 2026-11-20T07:47:43Z (UTC). Live prices from gold-api.com at calculation time. Melt = pure troy oz x live price (0% premium, dealer price = 95% of melt).

## Live prices used

| Metal | Price USD/ozt | Source | Updated |
|---|---|---|---|
| gold | $3,559.22 | gold-api.com | 2026-11-20T07:47:35Z |
| silver | $41.83 | gold-api.com | 2026-11-20T07:47:34Z |
| platinum | $1,300.15 | gold-api.com | 2026-11-20T07:47:38Z |
| palladium | $884.75 | gold-api.com | 2026-11-20T07:47:37Z |
| rhodium | NO LIVE PRICE | none — no free live source | — |

## Cross-checks vs the live app's own displayed values (Nov 20, 02:01–02:03 ET)

Formula: melt = weight in troy oz x purity x live price. At 1 ozt, 99.9% purity, 0% premium:

| Metal | Live app showed | Formula result | Match |
|---|---|---|---|
| gold | $3,554.44 | $3,554.44 | YES |
| silver | $42.01 | $42.01 | YES |
| platinum | $1,305.39 | $1,305.39 | YES |

## Live-app stored values — the pure-weight + 100% convention (browser capture, Nov 20 02:44–02:45 ET)

For 90% silver items the live app does NOT store gross weight + 90%. It stores the PURE-silver weight and sets Purity to 100%. The builder must code the app-stored values, not the physical spec — the physical spec is shown here so the numbers can be audited.

| Product | Physical spec (verified) | Live app stores | Status |
|---|---|---|---|
| Pre-1965 Silver Dime | 2.5 g @ 90.0% | 0.0723 ozt @ 100.0% | observed-live-app |
| Pre-1965 Silver Quarter | 6.25 g @ 90.0% | 0.1808 ozt @ 100.0% | inferred-same-convention |
| Pre-1965 Silver Half Dollar | 12.5 g @ 90.0% | 0.3617 ozt @ 100.0% | inferred-same-convention |
| $1 Face Value 90% Silver | 25.0 g @ 100.0% | 0.715 ozt @ 100.0% | observed-live-app |
| 40% Kennedy Half Dollar | 11.5 g @ 40.0% | 0.1479 ozt @ 100.0% | inferred-same-convention |
| 35% War Nickel | 5.0 g @ 35.0% | 0.0563 ozt @ 100.0% | inferred-same-convention |
| $10 Face Value 90% Silver | 250.0 g @ 100.0% | 7.15 ozt @ 100.0% | inferred-same-convention |

Fresh-load default: **Custom Item + Silver 1 Troy Oz 99.9%**. Custom Item does NOT reset anything — it is the manual/default mode.

## Rhodium — STALE fallback price (action required)

The live app shows 1 oz Rhodium Bar @ 99.9% = **$4,495.50**, implying a rhodium price of **$4,500/ozt**. That is NOT a live price: no free live rhodium feed exists (gold-api.com returns 'Symbol not found'; Yahoo Finance has no rhodium quote), and the actual rhodium market on Nov 20, 2026 is **~$8,200–$9,400/ozt**. $4,500 matches the late-2024 level ($4,400–$4,750) and is a round number — it is a **stale moderator-set fallback price**, likely set in late 2024 / early 2025 and never updated. The app currently undervalues rhodium by about half. Fix: a moderator updates the fallback price in the app's settings, or a metalpriceapi.com key is added for a live rhodium leg. Until then the rebuild must carry the fallback mechanism and show the price as fallback, never as live.

## Products

| Product | Metal | Preset weight | Purity | Pure metal (ozt) | Melt value | App stores |
|---|---|---|---|---|---|---|
| 1 oz Silver Eagle | silver | 1 ozt | 99.9% | 0.999 | $41.79 | — |
| 1 oz Silver Maple Leaf | silver | 1 ozt | 99.99% | 0.9999 | $41.83 | — |
| 1 oz Silver Britannia | silver | 1 ozt | 99.9% | 0.999 | $41.79 | — |
| 1 oz Silver Round | silver | 1 ozt | 99.9% | 0.999 | $41.79 | — |
| 10 oz Silver Bar | silver | 10 ozt | 99.9% | 9.99 | $417.93 | — |
| 5 oz Silver Bar | silver | 5 ozt | 99.9% | 4.995 | $208.97 | — |
| 100 oz Silver Bar | silver | 100 ozt | 99.9% | 99.9 | $4,179.32 | — |
| Pre-1965 Silver Dime | silver | 2.5 g | 90.0% | 0.07234 | $3.03 | 0.0723 ozt @ 100.0% |
| Pre-1965 Silver Quarter | silver | 6.25 g | 90.0% | 0.18085 | $7.57 | 0.1808 ozt @ 100.0% |
| Pre-1965 Silver Half Dollar | silver | 12.5 g | 90.0% | 0.3617 | $15.13 | 0.3617 ozt @ 100.0% |
| $1 Face Value 90% Silver | silver | 0.715 ozt | 100.0% | 0.715 | $29.91 | 0.715 ozt @ 100.0% |
| 40% Kennedy Half Dollar | silver | 11.5 g | 40.0% | 0.14789 | $6.19 | 0.1479 ozt @ 100.0% |
| 35% War Nickel | silver | 5 g | 35.0% | 0.05626 | $2.35 | 0.0563 ozt @ 100.0% |
| $10 Face Value 90% Silver | silver | 7.15 ozt | 100.0% | 7.15 | $299.12 | 7.15 ozt @ 100.0% |
| 1 oz Gold Eagle | gold | 33.931 g | 91.67% | 1.00003 | $3,559.34 | — |
| 1 oz Gold Buffalo | gold | 1 ozt | 99.99% | 0.9999 | $3,558.86 | — |
| 1 oz .9999 Gold Maple Leaf | gold | 1 ozt | 99.99% | 0.9999 | $3,558.86 | — |
| 1 oz Gold Bar | gold | 1 ozt | 99.99% | 0.9999 | $3,558.86 | — |
| 1/2 oz Gold Coin | gold | 16.966 g | 91.67% | 0.50003 | $1,779.72 | — |
| 1/4 oz Gold Coin | gold | 8.483 g | 91.67% | 0.25002 | $889.86 | — |
| 1/10 oz Gold Coin | gold | 3.393 g | 91.67% | 0.1 | $355.92 | — |
| 1/2 Gram Gold Bar | gold | 0.5 g | 99.99% | 0.01607 | $57.21 | — |
| 1 Gram Gold Bar | gold | 1 g | 99.99% | 0.03215 | $114.42 | — |
| 2.5 Gram Gold Bar | gold | 2.5 g | 99.99% | 0.08037 | $286.05 | — |
| 5 Gram Gold Bar | gold | 5 g | 99.99% | 0.16074 | $572.10 | — |
| 10 Gram Gold Bar | gold | 10 g | 99.99% | 0.32148 | $1,144.20 | — |
| 10k Gold | gold | 1 g | 41.67% | 0.0134 | $47.68 | — |
| 14k Gold | gold | 1 g | 58.33% | 0.01875 | $66.75 | — |
| 18k Gold | gold | 1 g | 75.0% | 0.02411 | $85.82 | — |
| 24k Gold | gold | 1 g | 99.99% | 0.03215 | $114.42 | — |
| 1 oz Platinum Eagle | platinum | 1 ozt | 99.95% | 0.9995 | $1,299.50 | — |
| 1 oz Platinum Bar | platinum | 1 ozt | 99.95% | 0.9995 | $1,299.50 | — |
| 1/2 oz Platinum Coin | platinum | 0.5 ozt | 99.95% | 0.49975 | $649.75 | — |
| 1 oz Palladium Eagle | palladium | 1 ozt | 99.95% | 0.9995 | $884.31 | — |
| 1 oz Palladium Bar | palladium | 1 ozt | 99.95% | 0.9995 | $884.31 | — |
| 1 oz Rhodium Bar | rhodium | 1 ozt | 99.9% | 0.999 | NO LIVE PRICE (fallback $4,495.50) | — |

## Spec sources & decisions (one per product)

- **1 oz Silver Eagle** — gross 31.103 g; preset 1 ozt @ 99.9%; pure 0.999 ozt (31.0724 g). Source: Numista N#1493: 31.103 g, Silver (.999); 31 USC 5112(e)
- **1 oz Silver Maple Leaf** — gross 31.11 g; preset 1 ozt @ 99.99%; pure 0.9999 ozt (31.1004 g). Source: Royal Canadian Mint: 1 oz (31.11 g), 99.99% pure silver
- **1 oz Silver Britannia** — gross 31.1035 g; preset 1 ozt @ 99.9%; pure 0.999 ozt (31.0724 g). Source: Royal Mint, 2013+ issue: 1 oz, 0.999 fine silver, 31.1035 g. NOTE: pre-2013 Britannias are .958 fine, 32.45 g — preset uses the modern .999 issue.
- **1 oz Silver Round** — gross 31.1035 g; preset 1 ozt @ 99.9%; pure 0.999 ozt (31.0724 g). Source: Standard bullion convention: generic 1 oz silver rounds are .999 fine
- **10 oz Silver Bar** — gross 311.035 g; preset 10 ozt @ 99.9%; pure 9.99 ozt (310.7237 g). Source: Standard bullion convention: generic silver bars are .999 fine
- **5 oz Silver Bar** — gross 155.5175 g; preset 5 ozt @ 99.9%; pure 4.995 ozt (155.3619 g). Source: Standard bullion convention: generic silver bars are .999 fine
- **100 oz Silver Bar** — gross 3110.35 g; preset 100 ozt @ 99.9%; pure 99.9 ozt (3107.2373 g). Source: Standard bullion convention: generic silver bars are .999 fine
- **Pre-1965 Silver Dime** — gross 2.5 g; preset 2.5 g @ 90.0%; pure 0.07234 ozt (2.25 g). Source: Numista N#52: 2.5 g, Silver (.900), 1946-1964
- **Pre-1965 Silver Quarter** — gross 6.25 g; preset 6.25 g @ 90.0%; pure 0.18085 ozt (5.625 g). Source: Numista N#54: 6.25 g, Silver (.900), 1932-1964
- **Pre-1965 Silver Half Dollar** — gross 12.5 g; preset 12.5 g @ 90.0%; pure 0.3617 ozt (11.25 g). Source: Numista N#943: 12.5 g, Silver (.900), 1964
- **$1 Face Value 90% Silver** — gross 25.0 g; preset 0.715 ozt @ 100.0%; pure 0.715 ozt (22.239 g). Source: Junk-silver dealer convention: $1 face of 90% coins = 0.715 ozt pure silver (worn/circulated basis). As-struck figure is 0.7234 ozt (25 g gross x 90%). Preset enters the dealer-basis pure weight directly (0.715 ozt @ 100%) so melt matches the trade standard.
- **40% Kennedy Half Dollar** — gross 11.5 g; preset 11.5 g @ 40.0%; pure 0.14789 ozt (4.6 g). Source: Numista N#10865: 11.5 g, Billon (.400 silver), 1965-1970
- **35% War Nickel** — gross 5.0 g; preset 5 g @ 35.0%; pure 0.05626 ozt (1.75 g). Source: Numista N#45: 5 g, Billon (.350 silver; 56% Cu, 35% Ag, 9% Mn), 1942-1945
- **$10 Face Value 90% Silver** — gross 250.0 g; preset 7.15 ozt @ 100.0%; pure 7.15 ozt (222.3899 g). Source: Junk-silver dealer convention: 10 x $1 face = 7.15 ozt pure silver (worn basis). As-struck 7.234 ozt.
- **1 oz Gold Eagle** — gross 33.931 g; preset 33.931 g @ 91.67%; pure 1.00003 ozt (31.1045 g). Source: US Mint: 33.931 g gross, 91.67% Au (22k), guaranteed 1.0000 ozt fine gold. 31 USC 5112.
- **1 oz Gold Buffalo** — gross 31.1035 g; preset 1 ozt @ 99.99%; pure 0.9999 ozt (31.1004 g). Source: Numista N#18451: 31.1035 g, Gold (.9999)
- **1 oz .9999 Gold Maple Leaf** — gross 31.11 g; preset 1 ozt @ 99.99%; pure 0.9999 ozt (31.1004 g). Source: Royal Canadian Mint: 1 oz (31.11 g), 99.99% pure gold
- **1 oz Gold Bar** — gross 31.1035 g; preset 1 ozt @ 99.99%; pure 0.9999 ozt (31.1004 g). Source: Standard bullion convention: generic 1 oz gold bars are .9999 fine
- **1/2 oz Gold Coin** — gross 16.966 g; preset 16.966 g @ 91.67%; pure 0.50003 ozt (15.5527 g). Source: DECISION — assumed American Gold Eagle fractional: 16.966 g gross, 91.67% Au, 0.5000 ozt fine gold (US Mint). Generic preset; confirm against live-app capture if it differs.
- **1/4 oz Gold Coin** — gross 8.483 g; preset 8.483 g @ 91.67%; pure 0.25002 ozt (7.7764 g). Source: DECISION — assumed American Gold Eagle fractional: 8.483 g gross, 91.67% Au, 0.2500 ozt fine gold (US Mint). Generic preset; confirm against live-app capture if it differs.
- **1/10 oz Gold Coin** — gross 3.393 g; preset 3.393 g @ 91.67%; pure 0.1 ozt (3.1104 g). Source: DECISION — assumed American Gold Eagle fractional: 3.393 g gross, 91.67% Au, 0.1000 ozt fine gold (US Mint). Generic preset; confirm against live-app capture if it differs.
- **1/2 Gram Gold Bar** — gross 0.5 g; preset 0.5 g @ 99.99%; pure 0.01607 ozt (0.4999 g). Source: Standard bullion convention: gram gold bars are .9999 fine
- **1 Gram Gold Bar** — gross 1.0 g; preset 1 g @ 99.99%; pure 0.03215 ozt (0.9999 g). Source: Standard bullion convention: gram gold bars are .9999 fine
- **2.5 Gram Gold Bar** — gross 2.5 g; preset 2.5 g @ 99.99%; pure 0.08037 ozt (2.4997 g). Source: Standard bullion convention: gram gold bars are .9999 fine
- **5 Gram Gold Bar** — gross 5.0 g; preset 5 g @ 99.99%; pure 0.16074 ozt (4.9995 g). Source: Standard bullion convention: gram gold bars are .9999 fine
- **10 Gram Gold Bar** — gross 10.0 g; preset 10 g @ 99.99%; pure 0.32148 ozt (9.999 g). Source: Standard bullion convention: gram gold bars are .9999 fine
- **10k Gold** — gross 1.0 g; preset 1 g @ 41.67%; pure 0.0134 ozt (0.4167 g). Source: Karat definition: 10k = 10/24 = 41.67% pure gold. Default weight 1 gram (Joe's decision, Nov 20 2026).
- **14k Gold** — gross 1.0 g; preset 1 g @ 58.33%; pure 0.01875 ozt (0.5833 g). Source: Karat definition: 14k = 14/24 = 58.33% pure gold. Default weight 1 gram.
- **18k Gold** — gross 1.0 g; preset 1 g @ 75.0%; pure 0.02411 ozt (0.75 g). Source: Karat definition: 18k = 18/24 = 75.00% pure gold. Default weight 1 gram.
- **24k Gold** — gross 1.0 g; preset 1 g @ 99.99%; pure 0.03215 ozt (0.9999 g). Source: Karat definition: 24k = 24/24 = 99.99% pure gold (RCM Maple Leaf standard). Default weight 1 gram.
- **1 oz Platinum Eagle** — gross 31.12 g; preset 1 ozt @ 99.95%; pure 0.9995 ozt (31.0879 g). Source: US Mint: 31.120 g gross, .9995 fine platinum, 1.0000 ozt fine
- **1 oz Platinum Bar** — gross 31.1035 g; preset 1 ozt @ 99.95%; pure 0.9995 ozt (31.0879 g). Source: Standard bullion convention: generic platinum bars are .9995 fine
- **1/2 oz Platinum Coin** — gross 15.5517 g; preset 0.5 ozt @ 99.95%; pure 0.49975 ozt (15.544 g). Source: Standard bullion convention: platinum bullion coins are .9995 fine (Platinum Eagle fractional standard)
- **1 oz Palladium Eagle** — gross 31.12 g; preset 1 ozt @ 99.95%; pure 0.9995 ozt (31.0879 g). Source: Numista N#173899: 31.12 g, Palladium (.9995), 2017-2026
- **1 oz Palladium Bar** — gross 31.1035 g; preset 1 ozt @ 99.95%; pure 0.9995 ozt (31.0879 g). Source: Standard bullion convention: generic palladium bars are .9995 fine
- **1 oz Rhodium Bar** — gross 31.1035 g; preset 1 ozt @ 99.9%; pure 0.999 ozt (31.0724 g). Source: Standard bullion convention: rhodium bars are .999 fine. NO FREE LIVE PRICE — melt cannot be computed; app must show 'no live price' and the formula only.

## Complete purity list — every standard purity (Joe: 'I want all purities')

The full distinct purity set for the purity picker. Gold by karat (karat/24), all other metals by millesimal fineness (parts per thousand).

| Metal | Label | Purity % | Fineness | Name | Used in |
|---|---|---|---|---|---|
| gold | 24k | 99.99% | 999 | 24 karat / pure gold | 24k Gold, 1 oz Gold Buffalo, 1 oz .9999 Gold Maple Leaf, 1 oz Gold Bar, Gram Gold Bars |
| gold | 22k | 91.67% | 916 | 22 karat | 1 oz Gold Eagle, 1/2 oz Gold Coin, 1/4 oz Gold Coin, 1/10 oz Gold Coin |
| gold | 18k | 75.0% | 750 | 18 karat | 18k Gold |
| gold | 14k | 58.33% | 585 | 14 karat | 14k Gold |
| gold | 10k | 41.67% | 417 | 10 karat | 10k Gold |
| gold | 9k | 37.5% | 375 | 9 karat | — (picker only) |
| silver | .9999 | 99.99% | 999.9 | Four nines fine | 1 oz Silver Maple Leaf |
| silver | .999 | 99.9% | 999 | Fine silver / three nines | 1 oz Silver Eagle, 1 oz Silver Britannia, 1 oz Silver Round, Silver Bars |
| silver | .958 | 95.8% | 958 | Britannia silver | — (picker only) |
| silver | .925 | 92.5% | 925 | Sterling silver | — (picker only) |
| silver | .900 | 90.0% | 900 | Coin silver / 90% silver | Pre-1965 Silver Dime/Quarter/Half Dollar, $1/$10 Face Value 90% Silver |
| silver | .835 | 83.5% | 835 | 835 silver | — (picker only) |
| silver | .800 | 80.0% | 800 | 800 silver | — (picker only) |
| silver | .500 | 50.0% | 500 | 500 silver | — (picker only) |
| silver | .400 | 40.0% | 400 | 40% silver | 40% Kennedy Half Dollar |
| silver | .350 | 35.0% | 350 | 35% silver / war nickel | 35% War Nickel |
| platinum | .9995 | 99.95% | 999.5 | Platinum bullion | 1 oz Platinum Eagle, 1 oz Platinum Bar, 1/2 oz Platinum Coin |
| platinum | .950 | 95.0% | 950 | 950 platinum | — (picker only) |
| platinum | .900 | 90.0% | 900 | 900 platinum | — (picker only) |
| platinum | .850 | 85.0% | 850 | 850 platinum | — (picker only) |
| palladium | .9995 | 99.95% | 999.5 | Palladium bullion | 1 oz Palladium Eagle, 1 oz Palladium Bar |
| palladium | .950 | 95.0% | 950 | 950 palladium | — (picker only) |
| rhodium | .999 | 99.9% | 999 | Rhodium bullion | 1 oz Rhodium Bar |
| any | 100% | 100.0% | 1000 | Pure-weight convention | Pre-1965 Silver Dime/Quarter/Half Dollar, $1/$10 Face Value 90% Silver, 40% Kennedy Half Dollar, 35% War Nickel |

Sources per entry: karat definition k/24 (ISO 8654); Wikipedia 'Fineness' (millesimal standards); Royal Canadian Mint; US Mint; Numista; UK hallmarking standards. Full source text is in the JSON `purities` array. Note: 14k is 58.33% by exact karat math; its hallmark reads 585 (58.5%) — same standard, rounding. 24k is 99.99% on bullion (RCM) and 99.9% as a hallmark (999).

## Decisions & caveats for the builder

- **Generic fractional gold coins (1/2, 1/4, 1/10 oz Gold Coin)** are coded as American Gold Eagle fractionals (22k / 91.67%). This is a DECISION, not a mint spec — if the live-app browser capture shows different settings, match the live app.
- **Face-value presets ($1 / $10 Face 90%)** enter the junk-silver dealer-basis pure weight directly (0.715 / 7.15 ozt @ 100%). As-struck is 0.7234 / 7.234 ozt — the 0.715 figure is the worn-circulation trade standard.
- **Karat presets (10k/14k/18k/24k)** default to 1 gram. Purity = karat / 24.
- **Britannia preset** uses the modern (2013+) .999 issue. Pre-2013 coins are .958 fine, 32.45 g — same 1 ozt of silver, different gross weight.
- **Rhodium has no free live price** (gold-api returns 'Symbol not found'; Yahoo has no XRH quote). The app must display 'no live price' honestly and show the formula, never a guessed price. A metalpriceapi.com key would unlock the rhodium leg.
- **Custom Item** has no fixed specs — user enters their own weight/unit/purity.
- **Dealer price = 95% of melt** (verified against the live app: gold $3,554.44 melt -> $3,376.72 dealer; silver $42.01 -> $39.91; platinum $1,305.39 -> $1,240.12).

## Unverified / inferred items

- **Live-app stored values for 5 of the 7 pure-weight items are INFERRED, not observed.** Directly observed in the browser capture: Pre-1965 Dime (0.0723 ozt @ 100%) and $1 Face Value 90% Silver (0.715 ozt @ 100%). Inferred from the same convention: Quarter (0.1808), Half Dollar (0.3617), 40% Kennedy (0.1479), War Nickel (0.0563), $10 Face (7.15) — all ozt @ 100%. If the live app stores any of these differently, match the live app.
- **Generic fractional gold coins (1/2, 1/4, 1/10 oz)** are coded as American Gold Eagle fractionals (22k / 91.67%) — a DECISION, not a directly observed live-app setting. Confirm against the live-app capture if it shows otherwise.
- **Rhodium $4,500/ozt** is identified as a stale moderator fallback by elimination (no free live source + round number + ~half the Nov 20 market of $8,200–$9,400/ozt). The exact date it was set and who set it are unknown — a moderator can confirm in the app's settings.
- Everything else is mint/Numista-verified or a stated standard bullion convention.
