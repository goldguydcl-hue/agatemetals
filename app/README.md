# Agate Metals Checker

A free Reddit app from Agate Precious Metals. Calculate personalized gold,
silver, platinum, palladium, and rhodium value estimates using live futures
references, weight-unit conversion, dealer premiums, and a 60-second
server-side cache. Includes a collection value calculator and easy Reddit
sharing.

This is a clean rebuild (version 0.0.52) of the original app Joe Agate built
in September 2026 (version 0.0.51). The original source was lost, so this
project was rebuilt from the live app running in r/agatemetals_dev, verified
November 20, 2026.

## How it works

- **Entry point:** subreddit "•••" menu → "Create a new post" (moderators).
  The post opens the calculator full-screen.
- **Calculator:** pick a metal, enter a weight and unit (troy oz / gram), set
  purity % and a dealer premium slider. Outputs: Estimated Value and
  Estimated Dealer Price (95% of the value).
- **Collection:** add pieces to a collection and see the running total.
- **Sharing:** share a result as a new post, or copy a summary to paste
  anywhere on Reddit.

## Price fallback chain (per metal, in order)

1. Yahoo Finance futures (GC=F gold, SI=F silver, PL=F platinum, PA=F
   palladium). Rhodium has no Yahoo futures symbol, so it skips this leg.
2. gold-api.com (gold, silver, platinum, palladium — no rhodium).
3. metalpriceapi.com — only when a `metalpriceapi_key` is set in app
   settings. This is the only live leg that covers rhodium.
4. Moderator-maintained daily reference prices (Redis). Moderators update
   them from the subreddit menu ("Update fallback prices") — no new upload
   needed. Seeded on install with the Nov 20, 2026 reference prices.

Prices are cached server-side for 60 seconds and refreshed on the same
interval in the client.

## Fixes vs the original (0.0.51)

- The header price now follows the selected metal. In the original it always
  showed the gold price, even on the silver/platinum/palladium/rhodium tabs.
- The calculator renders a branded loading skeleton instead of flashing a
  blank white area on first paint.

## Commands

- `npm run dev`: Playtest the app live on Reddit.
- `npm run build`: Builds the client and server.
- `npm run check`: Type-checks, lints, and checks formatting.
- `npm run deploy`: Uploads a new version of your app.
- `npm run launch`: Uploads and submits the app for review.
- `npm run login`: Logs your CLI into Reddit.

## Publish

```sh
npx devvit publish --public
```

## Standalone web version

`../standalone/agate-metals-checker-standalone.html` is the same calculator
as a single self-contained HTML file (no Devvit dependencies) for embedding
on a web page, e.g. bullionpricecheck.com. It uses gold-api.com first, then
Yahoo Finance, then built-in reference prices.

## Disclaimers

Every figure the app shows is an **estimate**, not a quote and not financial
advice. Prices move constantly. Terms:
https://agatepreciousmetals.com/terms.html — Privacy:
https://agatepreciousmetals.com/privacy.html
