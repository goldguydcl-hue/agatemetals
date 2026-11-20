# Agate Metals Checker

**Find out what your gold, silver, platinum, palladium, and rhodium are worth — live prices, right inside Reddit.**

Agate Metals Checker is a free Reddit app from Agate Precious Metals. Open it from the subreddit header menu, enter a metal, a weight, and a unit, and it returns an estimated value based on live futures references and dealer premiums. It also converts between weight units (troy ounces and grams) and lets you share the result to your community.

## Live app — source of truth (verified Nov 20, 2026)

The original app was built by Joe Agate himself and uploaded as v0.0.51 on September 4, 2026 (Devvit web app, React starter). Its source was lost, so v0.0.52 is a clean rebuild matched to the live app running in r/agatemetals_dev. What the live app actually does:

- **Five metal tabs:** Silver / Gold / Platinum / Palladium / Rhodium. Header reads "AGATE METALS • LIVE REFERENCE" / "Know what your bullion is worth", with a live ticker and an "Updated" timestamp that advances about every 60 seconds.
- **Calculator fields:** metal tabs, Weight input, Purity %, Unit selector (Troy Oz / Gram), and a **Dealer Premium slider** (0–50%).
- **Two outputs:** "Estimated Value" and "Estimated Dealer Price" — the dealer price is **95% of the calculated value** (verified: gold $3,554.44 → $3,376.72; silver $42.01 → $39.91 at 1 troy oz, 99.9% purity, 0% premium).
- **Value formula:** spot price × weight in troy ounces × purity × (1 + premium). At 1 troy oz, 99.9% purity, 0% premium: Silver $42.01–$42.03, Gold $3,554.44, Platinum $1,305.39.
- **Collection calculator:** add items to a running collection total (Collector Tools).
- **Entry point:** the subreddit header "•••" overflow menu ("Create a new post — agatemetals"), not the post "..." menu or the submit page. The one live post is https://www.reddit.com/r/agatemetals_dev/comments/1w6yae5/agatemetals/ (posted Sep 4, 2026, stickied, locked, archived). r/agatemetals_dev itself is private ("Test subreddit for agatemetals").
- **Fixes in the 0.0.52 rebuild:** (1) the live header always showed the GOLD price even when another tab was selected — the rebuild makes the header follow the selected metal; (2) on one reload the calculator area flashed blank white before rendering — the rebuild shows a loading skeleton instead.

## Who it is for

Anyone on Reddit who owns, collects, or is curious about precious metals — stackers, coin collectors, sellers clearing out a drawer, or anyone who just found an old ring and wants a ballpark figure before they do anything with it.

## How to use it

1. Open the app from the subreddit header "•••" menu in any community where it is installed ("Create a new post — agatemetals"). It opens full-screen.
2. Pick a metal: silver, gold, platinum, palladium, or rhodium.
3. Enter the weight, choose the unit (troy ounces or grams), and set the purity.
4. Read your estimated value and the estimated dealer price (95%). Adjust the dealer premium slider if you want to see what a shop might pay versus full melt value.
5. Add items to the collection calculator to value a whole collection, and share the result to Reddit if you like.

No account, sign-up, or payment is needed. The app is free.

## How the prices work

Prices come from live references, with a fallback chain if a source is down: Yahoo Finance first, then gold-api.com, then Metal Price API (only if a key is set in Reddit secrets), then moderator-maintained daily reference prices. Values are cached server-side for 60 seconds so repeated checks stay fast. Moderators can update the reference prices from the subreddit menu ("Update fallback prices") without a new upload.

**Rhodium note:** no free live source covers rhodium — gold-api.com and Yahoo Finance both return nothing for it. Rhodium prices come from Metal Price API (when a key is set) or the moderator reference price; the app says so plainly when no price is available instead of guessing.

**Important:** every figure the app shows is an **estimate**, not a quote. Prices move constantly, and the app's numbers are not an offer to buy or sell at any price. Nothing in the app is financial advice. If you are making a real decision, check a live dealer price first — for example at [agatemetals.com](https://agatemetals.com/).

## Data and privacy

The app uses the metal details you type in to work out your estimate. It does not ask for your name, email, or payment details, and it never sells your information. Full details: [Privacy Policy](https://agatepreciousmetals.com/privacy.html). Terms of use: [Terms of Service](https://agatepreciousmetals.com/terms.html).

## Standalone version (Bullion Price Check page)

The same calculator is also available as a single self-contained HTML file with no Devvit dependencies, for embedding on a web page (built for bullionpricecheck.com): `standalone/agate-metals-checker-standalone.html`. Same five metals, fields, outputs, 60-second refresh, and disclaimer. Prices come from gold-api.com first, then Yahoo Finance, then built-in reference prices (verified Nov 20, 2026). No API key needed; an optional metalpriceapi.com key can be set inside the file. It is included in the release zip.

## Support

Questions or problems? Contact Agate Precious Metals at [support@agatemetals.com](mailto:support@agatemetals.com) or call/text 716-829-9997. The company site is [agatepreciousmetals.com](https://agatepreciousmetals.com/).

## Changelog

- **0.0.52** (November 20, 2026) — clean rebuild from the live app (original source lost). Five metal tabs (silver, gold, platinum, palladium, rhodium), dealer premium slider, Estimated Dealer Price at 95% of value, collection calculator, loading skeleton instead of a blank flash, header price now follows the selected metal. Price chain: gold-api → Yahoo Finance → metalpriceapi (key only) → moderator reference prices, 60-second server cache. Standalone embeddable HTML version added for the Bullion Price Check page.
- **0.0.51** (September 4, 2026) — current version: live futures references, weight-unit conversion, dealer premiums, 60-second price cache, fallback prices, Reddit sharing.
