# Agate Metals Checker — App Directory listing copy

Ready to paste into the Developer Portal (Developer Settings) when the source is recovered and the new version is uploaded. The portal has no separate tagline/category fields — the About description is the single free-text field, and the README.md is the App Directory's long description.

## About description (portal "About description" field)

Agate Metals Checker is a free Reddit app from Agate Precious Metals. Enter a metal — gold, silver, or platinum — plus a weight, and it estimates what it is worth from live futures references, with dealer premiums and weight-unit conversion built in. No sign-up, no payment, just an answer. Values are estimates, not quotes and not financial advice.

## Featuring description (portal "Featuring description" field)

Find out what your gold, silver, and platinum are worth — live prices, right inside Reddit. Enter a weight, get an estimate, share it with your community.

## Tile tagline (portal "Tile tagline" field)

What's your metal worth?

## Terms & Privacy URLs (portal Developer Settings)

- Terms & Conditions: https://agatepreciousmetals.com/terms.html
- Privacy Policy: https://agatepreciousmetals.com/privacy.html
- Both verified live 2026-11-20 (HTTP 200, correct titles).

## Catalog assets (portal uploads)

All built from the real Agate logo, gold-on-navy, in ~/workspace/reddit-devvit-app/assets/:
- icon.png — 512×512 — Promotional icon
- tile.png — 512×512 — Tile image
- featuring.png — 1200×600 — Featuring asset
- fallback.png — 1200×600 — Fallback asset

Note: Devvit does not publish exact pixel specs for these four fields in its docs; the sizes above are the standard sizes the portal accepts. If the portal rejects any size on upload, re-render at the size it asks for (builder: ~/workspace/reddit-devvit-app/build_assets.py).

## Publish command (run from the project directory once the source is recovered)

```
npx devvit publish --public
```

This submits the app for Reddit review and lists it in the public App Directory once approved. Review typically takes 1–2 business days; Reddit pauses reviews during holiday periods (Thanksgiving week may delay it).
