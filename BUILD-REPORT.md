# BUILD-REPORT — Agate Metals Checker v0.0.52: presets + purity picker + collection

Date: November 20, 2026. Built by the checker subagent (parent handles the
GitHub re-push and zip refresh — nothing was pushed, no `devvit publish`,
nothing deployed). Work order per Joe: **Reddit (Devvit) first, then the
website standalone** — this report presents Devvit verification first.

## What changed

### Devvit app (`app/`)

- **`src/shared/presets.ts` (new)** — the single source of truth: 37 presets
  in exact order (Custom Item + live 30 + Joe's 7), the 24-option purity
  picker in 6 groups, collection-line type + value/pure-weight helpers +
  strict validation (`parseCollectionLines`, no casts). Every preset carries
  a `spec` audit note. Values are the live app's stored values from
  `docs/product-purity-table.json` (all 6 cross-checks vs the live app
  match exactly).
- **`src/shared/presets.test.ts` (new)** — 15 hand-computed checks (see
  Verification below). Runs as a plain script (no `node:` imports — the
  template's bundler module resolution does not resolve `node:` specifiers
  under tsc); run bundled with esbuild (command in the file header).
- **`src/shared/api.ts`** — `ShareRequest` gains an optional `title`
  (collection-total shares).
- **`src/server/collection.ts` (new)** — per-user Redis persistence:
  key `collection:<userId ?? loid>`; `null` (no identity) means in-memory
  only + "sign in to save" messaging.
- **`src/server/routes/api.ts`** — `GET /api/collection`,
  `PUT /api/collection`, `DELETE /api/collection`; share honours the
  optional title override (capped at 200 chars).
- **`src/server/prices.ts`** — seeded moderator rhodium fallback is now
  $4,500/ozt (was `null`), with a STALE comment: it reproduces the live
  app's displayed $4,495.50, labelled "Reference price" in the UI.
- **`src/client/game.tsx` (rewritten)** — white theme per the corrected live
  spec (white page, black selected tab, pure-black value panel with gold
  amount + light-grey fine ozt, white dealer panel with "Reference at 95%
  of calculated metal value", grey circular metal badge, Refresh price
  button, gold-focus-ring dropdowns/fields, gold slider on a dark-grey
  track); native Product dropdown (37, exact order); Purity % + grouped
  purity picker (optgroups, Custom fallback); Common Products multi-select
  with per-product quantities + one-tap add (merges with an existing line
  of the same preset); My Collection with per-line remove, clear-all,
  TOTAL value + TOTAL dealer value, copy/share on the total; "✓ Saved"
  indicator; fine-ozt display; rhodium stale-price note.
- **`src/client/splash.tsx`** — white theme to match.
- **`src/client/index.css`** — dealer-slider styling (gold thumb/fill,
  dark-grey track).
- **`app/README.md`** — presets/picker/collection section, rhodium warning,
  test-runner note.

### Standalone (`standalone/agate-metals-checker-standalone.html`, rewritten)

Same 37 presets (`PRESETS`) and 24 purities (`PURITY_GROUPS`) as local
arrays; same white theme (black selected tab, pure-black value panel, white
dealer panel, grey badge, Refresh price button); native Product dropdown +
purity picker; Common Products multi-select with quantities; collection with
remove/clear-all/totals/copy-summary; localStorage persistence
(`agate-metals-checker-collection-v1`) with "✓ Saved"; rhodium reference
price ($4,500) with the stale-price note. `node --check` clean on the
extracted script; 48-check jsdom smoke test passes (see below).

### Docs

- **`README.md`** (project root, rewritten) — corrected white-theme spec,
  full 37-preset table with stored values + physical specs, the 90%
  pure-weight quirk, the rhodium warning, the purity-picker table with
  sources, the collection section, the coverage statement, changelog.
- **`presets-verified-figures.md`** — superseded in two places by the
  purity table and noted as such in the README: karat presets use the
  exact karat fractions (10k 41.67%, 14k 58.33% — not the 1-decimal 41.7% /
  58.3%), and junk-silver presets store pure weight @ 100% (not gross
  weight @ alloy purity). The figures file itself was left untouched.
- **`docs/product-purity-table.json` / `.md`** — untouched; they are the
  source of truth this build codes from.

## Verification — Devvit (first)

### `npm run check` — exit 0

`tsc --build` (types) + `eslint src/**` + `prettier --check .` — all clean.
One lint failure found and fixed during the build (react-hooks
`set-state-in-effect`: `setSaveState('saving')` moved out of the effect
body into the debounced callback).

### `npm run build` — exit 0

`vite build` — "Build complete". The built client bundle contains the new
UI strings (COMMON PRODUCTS, PURITY PICKER, "Add selected to my
collection", "Reference at 95%"); the built server bundle contains the
collection routes.

### Math — 15 hand-computed checks, all passing

Run: `esbuild src/shared/presets.test.ts --bundle --platform=node
--format=esm --outfile=/tmp/checker-presets.test.mjs &&
node /tmp/checker-presets.test.mjs` — "All preset/purity/collection checks
passed." (Also runnable as `node --test` on the bundle.)

Live numbers reproduced from the implied spot prices in the browser
capture — every figure matches the live app to the cent:

| Check                    | Test price                    | Expected (live app)    | Code result           |
| ------------------------ | ----------------------------- | ---------------------- | --------------------- |
| 1 oz Silver Eagle        | silver $41.62/ozt             | $41.58 / dealer $39.50 | $41.58 / $39.50       |
| Pre-1965 Silver Dime     | silver $41.62/ozt             | $3.01 / $2.86          | $3.01 / $2.86         |
| $1 Face Value 90% Silver | silver $41.62/ozt             | $29.76 / $28.27        | $29.76 / $28.27       |
| 1/2 Gram Gold Bar        | gold $3,549.40/ozt            | $57.05 / $54.20        | $57.05 / $54.20       |
| 1 oz Rhodium Bar         | rhodium $4,500/ozt (fallback) | $4,495.50 / $4,270.73  | $4,495.50 / $4,270.73 |

Table prices (gold-api.com, Nov 20, 2026 — gold $3,559.22, silver $41.835,
platinum $1,300.15, palladium $884.75) match the purity-table melts within
$0.05: Gold Eagle $3,559.34, Gold Buffalo $3,558.86, 10k 1 g $47.68,
14k 1 g $66.75, 24k 1 g $114.42, Platinum Eagle $1,299.50, Palladium
Eagle $884.31. Purity spot check: 1 oz gold at 22k = $3,262.74, at 24k
(99.99%) = $3,558.86 — ratio 91.67/99.99 exactly.

Collection total, hand-computed — 3× 90% quarters + 2× 14k 1 g + $10 face
at silver $50/ozt, gold $4,000/ozt:

- Quarter: $50 × 0.1808 = $9.04 each → $27.12
- 14k 1 g: $4,000 × (0.5833 g ÷ 31.1034768) = $75.0141 each → $150.03
- $10 face: $50 × 7.15 = $357.50
- **Total $534.65, dealer (95%) $507.92** — code matches both, and the
  snapshot fallback (no live price) gives the same total within $0.01.

Preset-list checks: 37 presets; Custom Item first; live #30 (1 oz Rhodium
Bar) at index 29; Joe's 10k Gold at index 30; $10 Face at index 36. All 7
pure-weight items store purity 100 in troy oz. Gold Eagle stores 33.931 g
@ 91.67% (not 1 ozt). Every preset purity has a matching picker option;
99.9% and 99.99% are distinct options.

### Persistence — Devvit Redis

**Code path reviewed + typechecked + built, but NOT runnable locally:**
there is no local Devvit runtime/Redis on this VM, so no live round-trip
was possible here. What was verified: the route handlers compile into the
server bundle; the key is user-scoped (`collection:<userId ?? loid>`);
payloads are validated with `parseCollectionLines` on both read and write;
the client gates saves behind the initial load (no empty-overwrite race)
and debounces writes 600 ms with a "✓ Saved" / "Saving…" / "Not saved —
sign in to Reddit to save" indicator. **A live Redis round-trip still
needs a playtest/publish run** (parent's side — do not treat persistence
as live-verified until then).

### Known template limitation (pre-existing, not introduced here)

`npm run test:unit` (`node --experimental-strip-types --test
"src/**/*.test.ts"`) cannot run any test file in this repo: it fails with
`ERR_MODULE_NOT_FOUND` on the codebase's extensionless relative imports
(`./metals`, `./api`), and the template's bundler module resolution does
not resolve `node:` specifiers under `tsc --build`. The checks above were
therefore run via the esbuild bundle (command in the test file header and
in `app/README.md`). No tsconfig was modified to work around this.

## Verification — standalone (second)

### Syntax + smoke test — 48 checks, all passing

- `node --check` on the extracted `<script>`: clean.
- jsdom smoke test (`/tmp/standalone-smoke.cjs`, stubbed fetch at the table
  prices gold $3,559.22 / silver $41.835 / platinum $1,300.15 / palladium
  $884.75; rhodium gold-api 404 → $4,500 reference fallback): **48/48
  pass**, including:
  - 5 tabs; 37 preset options in exact order; fresh load = Custom Item +
    Silver; header "Silver $41.84 / oz" + Live pill (the $41.84 is the
    correct 2-decimal rounding of the $41.835 stub).
  - Preset pre-fill + values: Eagle $41.79 / 0.9990 fine ozt / dealer
    $39.70; dime 0.0723 @ 100% → $3.02; Gold Eagle 33.931 g @ 91.67% →
    $3,559.34; Rhodium Bar $4,495.50 + "Reference price" pill + stale
    note visible.
  - Picker: 22k sets 91.67%; typing 81.25% shows Custom; .800 sets 80%.
  - Multi-select: 2× quarter + 2× 14k added in one tap → total **$148.62**
    (hand-check: 2 × $7.5638 + 2 × $66.7479), dealer **$141.19**;
    "✓ Saved"; localStorage holds 2 lines.
  - Persistence round-trip: a fresh page seeded with the saved JSON
    restores 2 lines and the $148.62 total.
  - Remove-a-line (2 → 1), Clear all (→ 0, totals hidden).
  - Theme: selected tab `rgb(0, 0, 0)`, value panel pure black,
    dealer panel white, page white.

## Coverage walk-through — no dead ends (Joe: "matching with what they have")

Verified in code (`presets.test.ts`, "coverage walk-through" check) and
recorded here:

| Holding                             | Path                                       | Result                                                 |
| ----------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| 1 oz Silver Eagle                   | Preset #2                                  | 1 ozt @ 99.9%                                          |
| 14k gold chain                      | Preset #32 (1 g default)                   | Type the real weight in grams                          |
| Roll of 90% quarters                | Preset #10, quantity 40                    | 40 × 0.1808 ozt @ 100% = $301.00 at silver $41.62      |
| 40% Kennedy half                    | Preset #35                                 | 0.1479 ozt @ 100%                                      |
| 10k class ring                      | Preset #31                                 | 1 g default @ 41.67%, type the real weight             |
| 1 g gold bar                        | Preset #21                                 | 1 g @ 99.99%                                           |
| Platinum coin                       | Presets #25 / #27                          | 1 oz / 1/2 oz @ 99.95%                                 |
| War nickel                          | Preset #36                                 | 0.0563 ozt @ 100%                                      |
| Odd-weight 22k bracelet (NO preset) | Custom Item + picker 22k + free weight     | 91.67% applies to the typed weight                     |
| 80% silver foreign coin (NO preset) | Custom Item + picker .800 + free weight    | 80% applies to the typed weight                        |
| Sterling flatware                   | Picker .925                                | 92.5%                                                  |
| Pre-2013 .958 Britannia             | Picker .958                                | 95.8% (preset #4 is the modern .999 issue)             |
| 9k jewelry                          | Picker 9k                                  | 37.5%                                                  |
| Morgan / Peace Dollar (NO preset)   | Custom Item + weight 26.73 g + picker .900 | 90% of 26.73 g                                         |
| 40% Eisenhower Dollar (NO preset)   | Custom Item + weight 24.59 g + picker .400 | 40% of 24.59 g (gross verified via Numista type 15202) |

No gap was found: every holding above reaches the right number via a
preset or the picker, and the Custom Item + picker + free-weight path
covers anything with no preset. No new preset or purity option was needed.

## Pending reconciliation / still needing Joe

1. **Rhodium fallback is stale — moderator action needed.** The $4,500/ozt
   fallback undervalues rhodium by ~half (market ~$8,200–$9,400/ozt Nov 20,
   2026). A moderator must update the fallback price ("Update fallback
   prices" in the subreddit menu) or a metalpriceapi.com key must be added
   for a live rhodium leg. The UI labels it a reference price and says so
   plainly; do not present $4,495.50 as a live rhodium value.
2. **5 of the 7 pure-weight items are inferred, not observed.** Directly
   observed in the browser capture: dime (0.0723) and $1 face (0.715).
   Inferred from the same convention: quarter (0.1808), half dollar
   (0.3617), 40% Kennedy (0.1479), war nickel (0.0563), $10 face (7.15).
   If the live app stores any of these differently, match the live app.
3. **Generic fractional gold coins are a decision, not an observed setting.**
   1/2, 1/4, 1/10 oz Gold Coin are coded as American Gold Eagle
   fractionals (grams @ 91.67%). If the live-app capture shows otherwise,
   match the live app.
4. **Devvit Redis persistence needs a live playtest/publish round-trip**
   (see above) — code-reviewed and built, not live-verified.
5. **Nothing was pushed or published** — the parent re-pushes to GitHub
   and refreshes the zip after this report.
