# Agate Metals Checker

**Find out what your gold, silver, platinum, palladium, and rhodium are worth — live prices, right inside Reddit.**

Agate Metals Checker is a free Reddit app from Agate Precious Metals. Open it from the subreddit header menu, enter a metal, a weight, and a unit, and it returns an estimated value based on live futures references and dealer premiums. It also converts between weight units (troy ounces and grams) and lets you share the result to your community.

## Live app — source of truth (verified Nov 20, 2026)

The original app was built by Joe Agate himself and uploaded as v0.0.51 on September 4, 2026 (Devvit web app, React starter). Its source was lost, so v0.0.52 is a clean rebuild matched to the live app running in r/agatemetals_dev. What the live app actually does:

- **Five metal tabs:** Silver / Gold / Platinum / Palladium / Rhodium. Header reads "AGATE METALS • LIVE REFERENCE" / "Know what your bullion is worth", with a live ticker and an "Updated" timestamp that advances about every 60 seconds.
- **Calculator fields:** a Product dropdown (see preset table below), metal tabs, Weight input, Purity % + purity picker, Unit selector (Troy Oz / Gram), and a **Dealer Premium slider** (0–50%).
- **Three outputs:** "Estimated Value", "Estimated Dealer Price" — the dealer price is **95% of the calculated value** (verified: gold $3,554.44 → $3,376.72; silver $42.01 → $39.91 at 1 troy oz, 99.9% purity, 0% premium) — and the fine weight in troy oz (e.g. 0.9990 fine ozt). Dealer wording in the app: "Reference at 95% of calculated metal value".
- **Value formula:** spot price × weight in troy ounces × purity × (1 + premium). At 1 troy oz, 99.9% purity, 0% premium: Silver $42.01–$42.03, Gold $3,554.44, Platinum $1,305.39.
- **Collection calculator:** add items to a running collection total (Collector Tools).
- **Entry point:** the subreddit header "•••" overflow menu ("Create a new post — agatemetals"), not the post "..." menu or the submit page. The one live post is https://www.reddit.com/r/agatemetals_dev/comments/1w6yae5/agatemetals/ (posted Sep 4, 2026, stickied, locked, archived). r/agatemetals_dev itself is private ("Test subreddit for agatemetals").
- **Theme (corrected Nov 20, 2026, from the browser capture of the live app): the app is WHITE / light, not gold-on-navy.** White background, black/dark-grey text, gold accents. Selected metal tab: BLACK background, white text. Unselected tabs: white bg, dark text, light-grey border. Dropdowns and Weight/Purity fields: white bg, black text, gold focus ring. "Refresh price" button: pale cream/yellow bg, gold text + gold outline. Dealer slider: gold fill, dark-grey track, gold handle. ESTIMATED VALUE panel: PURE BLACK background, white label, gold/yellow amount, light-grey "fine ozt". ESTIMATED DEALER PRICE panel: white bg, black text. Grey circular metal badge top-right (Ag/Au/Pt/Pd/Rh) next to the gold spot price. An earlier "gold-on-navy Devvit" description in this repo was wrong and is superseded — white everywhere, matching the original.
- **Fixes in the 0.0.52 rebuild:** (1) the live header always showed the GOLD price even when another tab was selected — the rebuild makes the header follow the selected metal; (2) on one reload the calculator area flashed blank white before rendering — the rebuild shows a loading skeleton instead.

## Who it is for

Anyone on Reddit who owns, collects, or is curious about precious metals — stackers, coin collectors, sellers clearing out a drawer, or anyone who just found an old ring and wants a ballpark figure before they do anything with it.

## How to use it

1. Open the app from the subreddit header "•••" menu in any community where it is installed ("Create a new post — agatemetals"). It opens full-screen.
2. Pick a product from the dropdown, or pick Custom Item and enter your own metal, weight, unit, and purity.
3. Read your estimated value, the fine weight, and the estimated dealer price (95%). Adjust the dealer premium slider if you want to see what a shop might pay versus full melt value.
4. Tick products in Common Products and add them all to your collection at once, or add the calculator result. Your collection is saved (per-user in Redis on Reddit; localStorage in the standalone) and loads back when you reopen the app.
5. Share the result to Reddit if you like.

No account, sign-up, or payment is needed. The app is free.

## Presets — the 30 live presets + Joe's 7 additions

The dropdown lists 30 products in this exact order (browser capture, Nov 20, 2026), then Joe's 7 additions appended after #30. The table below shows the values the app actually stores when a preset is picked — these ARE the live app's stored values (source: `docs/product-purity-table.json`, all 6 cross-checks vs the live app match exactly). The premium slider stays 0.0% for ALL presets. Custom Item never resets anything — it is manual/default mode. Fresh load default: Custom Item + Silver, 1, Troy Oz, 99.9%, 0.0% premium.

### The 90% silver quirk — read this first

For 90%/40%/35% silver items the live app does NOT store gross weight + alloy purity. It stores the **pure-silver weight with Purity set to 100**. A pre-1965 dime is stored as 0.0723 troy oz @ 100%, NOT 2.5 g @ 90%. The physical spec is shown in the table so the numbers can be audited, but the app stores the pure-weight values. Directly observed in the browser capture: the dime (0.0723 ozt @ 100%) and $1 Face Value (0.715 ozt @ 100%). The other five pure-weight items (quarter, half dollar, 40% Kennedy, war nickel, $10 face) are inferred from the same convention — if the live app stores any of them differently, match the live app.

### The table

| #   | Preset                            | Metal     | Weight | Unit    | Purity | Physical spec / source                                                                                                               |
| --- | --------------------------------- | --------- | ------ | ------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Custom Item                       | —         | —      | —       | —      | Manual mode; never resets. Default Silver 1 Troy Oz 99.9%.                                                                           |
| 2   | 1 oz Silver Eagle                 | Silver    | 1      | Troy Oz | 99.9%  | Numista N#1493: 31.103 g, Silver (.999); 31 USC 5112(e)                                                                              |
| 3   | 1 oz Silver Maple Leaf            | Silver    | 1      | Troy Oz | 99.99% | Royal Canadian Mint: 31.11 g, 99.99% pure silver                                                                                     |
| 4   | 1 oz Silver Britannia             | Silver    | 1      | Troy Oz | 99.9%  | Royal Mint, 2013+ issue, 0.999 fine. Pre-2013 coins are .958 fine — use the .958 picker option for those.                            |
| 5   | 1 oz Silver Round                 | Silver    | 1      | Troy Oz | 99.9%  | Standard bullion convention: generic rounds are .999 fine                                                                            |
| 6   | 10 oz Silver Bar                  | Silver    | 10     | Troy Oz | 99.9%  | Standard bullion convention: generic bars are .999 fine                                                                              |
| 7   | 5 oz Silver Bar                   | Silver    | 5      | Troy Oz | 99.9%  | Standard bullion convention                                                                                                          |
| 8   | 100 oz Silver Bar                 | Silver    | 100    | Troy Oz | 99.9%  | Standard bullion convention                                                                                                          |
| 9   | Pre-1965 Silver Dime              | Silver    | 0.0723 | Troy Oz | 100%   | Physical: 2.5 g @ 90% (Numista N#52). Stored as pure weight.                                                                         |
| 10  | Pre-1965 Silver Quarter           | Silver    | 0.1808 | Troy Oz | 100%   | Physical: 6.25 g @ 90% (Numista N#54). Stored as pure weight (inferred).                                                             |
| 11  | Pre-1965 Silver Half Dollar       | Silver    | 0.3617 | Troy Oz | 100%   | Physical: 12.5 g @ 90% (Numista N#943). Stored as pure weight (inferred).                                                            |
| 12  | $1 Face Value 90% Silver          | Silver    | 0.715  | Troy Oz | 100%   | Dealer convention: $1 face = 0.715 ozt pure (worn basis; as-struck 0.7234 ozt).                                                      |
| 13  | 1 oz Gold Eagle                   | Gold      | 33.931 | Gram    | 91.67% | US Mint: 33.931 g gross, 91.67% Au (22k), 1.0000 ozt fine gold. **Note: stored as grams, not 1 ozt** — the coin is 22k alloy.        |
| 14  | 1 oz Gold Buffalo                 | Gold      | 1      | Troy Oz | 99.99% | Numista N#18451: 31.1035 g, Gold (.9999)                                                                                             |
| 15  | 1 oz .9999 Gold Maple Leaf        | Gold      | 1      | Troy Oz | 99.99% | Royal Canadian Mint: 31.11 g, 99.99% pure gold                                                                                       |
| 16  | 1 oz Gold Bar                     | Gold      | 1      | Troy Oz | 99.99% | Standard bullion convention: generic bars are .9999 fine                                                                             |
| 17  | 1/2 oz Gold Coin                  | Gold      | 16.966 | Gram    | 91.67% | **DECISION — assumed American Gold Eagle fractional** (US Mint). Generic preset; confirm against the live-app capture if it differs. |
| 18  | 1/4 oz Gold Coin                  | Gold      | 8.483  | Gram    | 91.67% | **DECISION — assumed American Gold Eagle fractional** (US Mint).                                                                     |
| 19  | 1/10 oz Gold Coin                 | Gold      | 3.393  | Gram    | 91.67% | **DECISION — assumed American Gold Eagle fractional** (US Mint).                                                                     |
| 20  | 1/2 Gram Gold Bar                 | Gold      | 0.5    | Gram    | 99.99% | Standard bullion convention: gram bars are .9999 fine                                                                                |
| 21  | 1 Gram Gold Bar                   | Gold      | 1      | Gram    | 99.99% | Standard bullion convention                                                                                                          |
| 22  | 2.5 Gram Gold Bar                 | Gold      | 2.5    | Gram    | 99.99% | Standard bullion convention                                                                                                          |
| 23  | 5 Gram Gold Bar                   | Gold      | 5      | Gram    | 99.99% | Standard bullion convention                                                                                                          |
| 24  | 10 Gram Gold Bar                  | Gold      | 10     | Gram    | 99.99% | Standard bullion convention                                                                                                          |
| 25  | 1 oz Platinum Eagle               | Platinum  | 1      | Troy Oz | 99.95% | US Mint: 31.120 g gross, .9995 fine platinum                                                                                         |
| 26  | 1 oz Platinum Bar                 | Platinum  | 1      | Troy Oz | 99.95% | Standard bullion convention: bars are .9995 fine                                                                                     |
| 27  | 1/2 oz Platinum Coin              | Platinum  | 0.5    | Troy Oz | 99.95% | Standard bullion convention (Platinum Eagle fractional standard)                                                                     |
| 28  | 1 oz Palladium Eagle              | Palladium | 1      | Troy Oz | 99.95% | Numista N#173899: 31.12 g, Palladium (.9995)                                                                                         |
| 29  | 1 oz Palladium Bar                | Palladium | 1      | Troy Oz | 99.95% | Standard bullion convention: bars are .9995 fine                                                                                     |
| 30  | 1 oz Rhodium Bar                  | Rhodium   | 1      | Troy Oz | 99.9%  | Standard bullion convention: rhodium bars are .999 fine. See the rhodium warning below.                                              |
| 31  | 10k Gold _(Joe)_                  | Gold      | 1      | Gram    | 41.67% | Karat definition: 10/24 = 41.67%. Default 1 gram.                                                                                    |
| 32  | 14k Gold _(Joe)_                  | Gold      | 1      | Gram    | 58.33% | Karat definition: 14/24 = 58.33% (hallmark 585 reads 58.5% — same standard, rounding). Default 1 gram.                               |
| 33  | 18k Gold _(Joe)_                  | Gold      | 1      | Gram    | 75.0%  | Karat definition: 18/24 = 75%. Default 1 gram.                                                                                       |
| 34  | 24k Gold _(Joe)_                  | Gold      | 1      | Gram    | 99.99% | Karat definition: 24/24 = 99.99% (RCM Maple Leaf standard). Default 1 gram.                                                          |
| 35  | 40% Kennedy Half Dollar _(Joe)_   | Silver    | 0.1479 | Troy Oz | 100%   | Physical: 11.5 g @ 40% (Numista N#10865, 1965–1970). Stored as pure weight (inferred).                                               |
| 36  | 35% War Nickel _(Joe)_            | Silver    | 0.0563 | Troy Oz | 100%   | Physical: 5 g @ 35% (Numista N#45, 1942–1945). Stored as pure weight (inferred).                                                     |
| 37  | $10 Face Value 90% Silver _(Joe)_ | Silver    | 7.15   | Troy Oz | 100%   | Dealer convention: 10 × $1 face = 7.15 ozt pure (worn basis; as-struck 7.234 ozt). Inferred.                                         |

Not in the list (no dead end — see Coverage below): Morgan / Peace Dollar (26.73 g @ 90%) and the 40% Eisenhower Dollar (24.59 g @ 40%, Numista type 15202) have no preset in the live app and were not among Joe's additions, so they are not presets here either. Both are reachable via Custom Item + the purity picker.

### Live-number checks

At the live prices implied by the browser capture, the formula reproduces the app's displayed values exactly: Silver Eagle $41.58 / dealer $39.50 (silver $41.62/ozt), pre-1965 dime $3.01 / $2.86, $1 face $29.76 / $28.27, 1/2 gram gold bar $57.05 / $54.20 (gold $3,549.40/ozt), 1 oz rhodium bar $4,495.50 / $4,270.73 (rhodium $4,500/ozt fallback). Full hand-computed evidence: `BUILD-REPORT.md`.

## ⚠️ Rhodium — stale fallback price (action required)

The live app shows 1 oz Rhodium Bar @ 99.9% = **$4,495.50**, implying a rhodium price of **$4,500/ozt**. That is NOT a live price: no free live rhodium feed exists (gold-api.com returns "Symbol not found"; Yahoo Finance has no rhodium quote), and the actual rhodium market on Nov 20, 2026 is **~$8,200–$9,400/ozt**. $4,500 matches the late-2024 level and is a round number — it is a **stale moderator-set fallback price**, likely set in late 2024 / early 2025 and never updated. **The app currently undervalues rhodium by about half.** The rebuild carries the $4,500 fallback ONLY until a moderator updates it or a metalpriceapi.com key adds a live rhodium leg — and the UI always labels rhodium as a "Reference price" with a plain-language stale-price note, never as live. Fix: a moderator updates the fallback price in the app's settings ("Update fallback prices"), or a metalpriceapi.com key is added.

## Purity picker — "I want all purities" (Joe, Nov 20, 2026)

Next to the Purity % field, a dropdown lists all 24 standard purities, grouped by metal (gold by karat, karat/24; everything else by millesimal fineness, parts per thousand). A "Custom" option keeps the free % entry — any odd purity still works by typing it. Selecting a purity sets the Purity % field; presets set it too, and when the current purity matches a picker option the picker shows that option, otherwise it shows Custom. The picker never hides other metals' purities — it is a convenience, not a constraint. Sources: karat definition k/24 (ISO 8654); Wikipedia "Millesimal fineness"; Royal Canadian Mint; US Mint; Numista; UK hallmarking standards. Full source text per entry: `docs/product-purity-table.json` (`purities`).

| Group       | Options (label — purity %)                                                                                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gold        | 24k — 99.99%, 22k — 91.67%, 18k — 75%, 14k — 58.33%, 10k — 41.67%, 9k — 37.5%                                                                                                |
| Silver      | .9999 — 99.99%, .999 — 99.9%, .958 Britannia — 95.8%, .925 sterling — 92.5%, .900 coin silver — 90%, .835 — 83.5%, .800 — 80%, .500 — 50%, .400 — 40%, .350 war nickel — 35% |
| Platinum    | .9995 — 99.95%, .950 — 95%, .900 — 90%, .850 — 85%                                                                                                                           |
| Palladium   | .9995 — 99.95%, .950 — 95%                                                                                                                                                   |
| Rhodium     | .999 — 99.9%                                                                                                                                                                 |
| Pure weight | 100% — the live app's pure-weight convention for junk silver                                                                                                                 |

Notes: 99.9% (.999 fine) and 99.99% (.9999 fine) are distinct options. 14k is 58.33% by exact karat math; its hallmark reads 585 (58.5%) — same standard, rounding. 24k is 99.99% on bullion (RCM) and 99.9% as a hallmark (999). The karat presets (10k/14k/18k/24k) use the exact karat fractions (41.67 / 58.33), which match picker options exactly.

## Collection — Common Products + saved collections

The **Common Products** section lists all 37 presets grouped by type (Silver bullion, Junk silver, Gold bullion, Karat gold, Platinum, Palladium, Rhodium). Each row has a checkbox, the product name (tap it to fill in the calculator instead), its per-unit value at the live price, and a quantity stepper. One button — **"Add selected to my collection"** — adds all ticked products (each with its quantity) in one tap, then clears the ticks; ticking a product already in the collection adds to its quantity.

**My Collection** shows each line (product name, quantity, metal, pure weight in troy oz, value, dealer value at 95%), a remove button per line, and a Clear all button, plus the running TOTAL value and TOTAL dealer value. Copy collection summary and Share collection as a post work on the total. Adding from the calculator still works as before.

**Persistence:** on Reddit the collection is saved per-user in Redis (key `collection:<user id>`, falling back to the logged-out LOID token) and loads back on open; a "✓ Saved" indicator shows the last write ("Saving…" while writing, "Not saved — sign in to Reddit to save" when there is no identity to save under). In the standalone the collection is saved in localStorage (`agate-metals-checker-collection-v1`) with the same "✓ Saved" indicator. This is the lightweight version of the Stack Value app — preset-picking + save only, no free-form holdings editor.

## Coverage — "matching with what they have whatever it is" (Joe, Nov 20, 2026)

Every common holding reaches the right number via a preset or the picker — no dead ends (walk-through recorded in `BUILD-REPORT.md`): 1 oz Silver Eagle → preset #2; 14k gold chain → preset #32 (1 g default, type the real weight); a roll of 90% quarters → preset #10, quantity 40; 40% Kennedy half → preset #35; 10k class ring → preset #31 (grams); 1 g gold bar → preset #21; platinum coin → presets #25/#27; war nickel → preset #36. Fallback path, verified end-to-end: an item with NO preset — an odd-weight 22k bracelet, or an 80% silver foreign coin — gets the right number via Custom Item + the purity picker (22k / .800) + free weight entry. Sterling flatware (.925), pre-2013 .958 Britannia, and 9k jewelry are picker-only and covered the same way.

## How the prices work

Prices come from live references, with a fallback chain if a source is down: Yahoo Finance first, then gold-api.com, then Metal Price API (only if a key is set in Reddit secrets), then moderator-maintained daily reference prices. Values are cached server-side for 60 seconds so repeated checks stay fast. Moderators can update the reference prices from the subreddit menu ("Update fallback prices") without a new upload.

**Rhodium note:** no free live source covers rhodium — gold-api.com and Yahoo Finance both return nothing for it. Rhodium prices come from Metal Price API (when a key is set) or the moderator reference price; the app says so plainly when no price is available instead of guessing. See the rhodium warning above — the current $4,500 fallback is stale.

**Important:** every figure the app shows is an **estimate**, not a quote. Prices move constantly, and the app's numbers are not an offer to buy or sell at any price. Nothing in the app is financial advice. If you are making a real decision, check a live dealer price first — for example at [agatemetals.com](https://agatemetals.com/).

## Data and privacy

The app uses the metal details you type in to work out your estimate. It does not ask for your name, email, or payment details, and it never sells your information. Your saved collection is stored per-user (Redis on Reddit, localStorage in the standalone) and is only visible to you. Full details: [Privacy Policy](https://agatepreciousmetals.com/privacy.html). Terms of use: [Terms of Service](https://agatepreciousmetals.com/terms.html).

## Standalone version (Bullion Price Check page)

The same calculator is also available as a single self-contained HTML file with no Devvit dependencies, for embedding on a web page (built for bullionpricecheck.com): `standalone/agate-metals-checker-standalone.html`. Same five metals, fields, outputs, 60-second refresh, and disclaimer. Prices come from gold-api.com first, then Yahoo Finance, then built-in reference prices (verified Nov 20, 2026). No API key needed; an optional metalpriceapi.com key can be set inside the file. It is included in the release zip. **Theme (Nov 20, 2026, per the live app): the standalone is LIGHT — white background, dark text, gold accents — with a BLACK selected tab and a PURE BLACK estimated-value panel, matching the original app exactly. The Devvit app is the same white theme.**

## Support

Questions or problems? Contact Agate Precious Metals at [support@agatemetals.com](mailto:support@agatemetals.com) or call/text 716-829-9997. The company site is [agatepreciousmetals.com](https://agatepreciousmetals.com/).

## Changelog

- **0.0.52 presets + purity picker + collection** (November 20, 2026, per Joe) — the full live preset list (30 products in exact order, native dropdown, Custom Item default) + Joe's 7 additions (10k/14k/18k/24k gold at 1 g, 40% Kennedy half, 35% war nickel, $10 face 90% silver); the 90% pure-weight convention (pure weight @ 100% purity); full 24-option purity picker grouped by metal + Custom free entry; Common Products multi-select with quantities and one-tap add; collection with per-line remove, clear-all, total + dealer total, copy/share on the total; per-user Redis persistence (Devvit) / localStorage (standalone) with a "✓ Saved" indicator; white theme throughout matching the live app (black selected tab, pure-black value panel, grey metal badge, Refresh price button, fine-ozt display); rhodium shown as a labelled stale reference price ($4,500/ozt fallback — market ~$8,200–$9,400/ozt, moderator action needed). Preset + purity data live in one table per codebase (`app/src/shared/presets.ts`, standalone `PRESETS` / `PURITY_GROUPS`).
- **0.0.52** (November 20, 2026) — clean rebuild from the live app (original source lost). Five metal tabs (silver, gold, platinum, palladium, rhodium), dealer premium slider, Estimated Dealer Price at 95% of value, collection calculator, loading skeleton instead of a blank flash, header price now follows the selected metal. Price chain: gold-api → Yahoo Finance → metalpriceapi (key only) → moderator reference prices, 60-second server cache. Standalone embeddable HTML version added for the Bullion Price Check page.
- **0.0.52 standalone re-theme** (November 20, 2026, per Joe) — the standalone HTML file is now LIGHT theme (white background, dark text, gold accents only) for embedding on light sites. The Devvit app stays gold-on-navy. No calculator or price-chain changes. _(Superseded the same day: the browser capture showed the live app itself is white — both versions are now white. See the theme note above.)_
- **0.0.51** (September 4, 2026) — current version: live futures references, weight-unit conversion, dealer premiums, 60-second price cache, fallback prices, Reddit sharing.
