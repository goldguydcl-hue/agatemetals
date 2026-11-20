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
- **Calculator:** pick a product from the dropdown (30 live presets in
  exact order + Joe's 7 additions, Custom Item by default), or pick a metal,
  enter a weight and unit (troy oz / gram), set purity % via the field or
  the 24-option purity picker, and a dealer premium slider. Outputs:
  Estimated Value, fine weight in troy oz, and Estimated Dealer Price (95%
  of the value — "Reference at 95% of calculated metal value").
- **Collection:** tick products in Common Products (with quantities) and add
  them all in one tap, or add the calculator result. Per-line remove,
  clear-all, running total + dealer total, copy/share on the total. Saved
  per-user in Redis (`collection:<user id>`, LOID fallback) with a "✓ Saved"
  indicator; loads back on open.
- **Sharing:** share a result — or the whole collection total — as a new
  post, or copy a summary to paste anywhere on Reddit.
- **Theme:** white / light, matching the live app (black selected tab,
  pure-black value panel, grey circular metal badge, Refresh price button).

## Price fallback chain (per metal, in order)

1. Yahoo Finance futures (GC=F gold, SI=F silver, PL=F platinum, PA=F
   palladium). Rhodium has no Yahoo futures symbol, so it skips this leg.
2. gold-api.com (gold, silver, platinum, palladium — no rhodium).
3. metalpriceapi.com — only when a `metalpriceapi_key` is set in app
   settings. This is the only live leg that covers rhodium.
4. Moderator-maintained daily reference prices (Redis). Moderators update
   them from the subreddit menu ("Update fallback prices") — no new upload
   needed. Seeded on install with the Nov 20, 2026 reference prices.

> ⚠️ **Rhodium — stale fallback:** the seeded rhodium reference price is
> $4,500/ozt, a late-2024 level; the Nov 20, 2026 market is roughly
> $8,200–$9,400/ozt, so the app undervalues rhodium by about half until a
> moderator updates it or a metalpriceapi.com key adds a live rhodium leg.
> The UI always labels rhodium a "Reference price" with a stale-price note,
> never as live.

Prices are cached server-side for 60 seconds and refreshed on the same
interval in the client.

## Presets, purity picker, and collection (0.0.52, Nov 20, 2026)

- Preset + purity data live in one table: `src/shared/presets.ts`
  (`PRESETS`, `PURITY_GROUPS`, collection-line helpers). The standalone
  mirrors it with its own `PRESETS` / `PURITY_GROUPS` arrays.
- 90%/40%/35% silver items store the **pure-silver weight at 100% purity**
  (dime 0.0723 ozt @ 100%), not gross weight + alloy purity — that is the
  live app's own convention (docs/product-purity-table.json).
- The premium slider stays 0.0% for ALL presets. Custom Item never resets
  anything. Fresh load: Custom Item + Silver, 1, Troy Oz, 99.9%, 0.0%.
- Collection API: `GET /api/collection`, `PUT /api/collection`,
  `DELETE /api/collection` (server `src/server/collection.ts`, per-user
  Redis key). Share accepts an optional `title` override for collection
  totals.
- Tests: `src/shared/presets.test.ts` — hand-computed live-number,
  table-price, collection-total, and coverage checks. Run bundled (the
  repo's `test:unit` script cannot resolve the codebase's extensionless
  imports under `--experimental-strip-types`):
  `esbuild src/shared/presets.test.ts --bundle --platform=node --format=esm
--outfile=/tmp/checker-presets.test.mjs && node /tmp/checker-presets.test.mjs`
  (also runnable as `node --test` on the bundle).

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
