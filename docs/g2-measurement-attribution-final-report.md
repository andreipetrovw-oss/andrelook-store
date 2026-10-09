# Andrelook G2 — Measurement & Attribution

Status: implementation in progress on `growth-g2-measurement-attribution`.

## Preserved starting point

- Production baseline: `1eea71e200b6f26cb84140ea5941799022bdd5dc`.
- G2 branch is a normal descendant of the accepted live production commit.
- Storefront, G1 SEO/GEO, product data, pricing, size guides, Clerk, Resend, DNS, and historical orders are outside the G2 change boundary.
- The controlled production acceptance order remains excluded from business KPIs.

## Implemented architecture

- Additive PostgreSQL models for order attribution, first/last touches, durable business events, campaigns, and dated advertising spend.
- 30-day, consent-aware first/last-touch browser state with deterministic source classification.
- Immutable, server-validated order attribution snapshot.
- Durable lead, lifecycle, and payment/revenue events with idempotent keys.
- Owner CRM “Реклама” report with source/campaign drilldowns and the business fields: Расход, Лиды, Подтверждено, Оплачено, Выручка, Цена лида, Цена клиента, ROAS.
- Manual EUR spend entry for Meta Ads and Google Ads. No external ad account is created.
- Normal CRM views show business source/campaign language and hide raw click IDs, UTMs, and event IDs.
- Optional GA4/Meta loaders are consent-gated, identifier-gated, explicitly enabled, and production-host-only.

## External integrations — owner input required

No existing GA4 or Meta identifier is configured, and G2 will not create duplicate external identities.

GA4 requires the Measurement ID (`G-...`) from the existing Andrelook production web data stream. If no property exists, the owner must decide whether to create one in the intended Google account and then provide its exact ID. Server-side Measurement Protocol is not enabled; if later authorized it also requires an API secret from that same stream.

Meta requires the exact existing Pixel/Dataset ID from the intended Meta Business portfolio. CAPI remains disabled unless the owner separately supplies an access token for that same dataset and confirms the applicable consent/data-processing settings.

Google Ads readiness uses the UTM standard and `gclid` capture with marketing consent. No Google Ads account, conversion action, or account link is created in G2.

## Privacy

The customer may choose necessary-only, analytics, and marketing measurement without losing catalog or order access. The choice can be reopened from the storefront. Optional scripts do not load before consent. Privacy copy is localized in RU/ET/EN.

## Release evidence

- Clean `npm ci`: passed.
- Runtime dependency audit: zero known vulnerabilities. The five high findings shown by npm's install summary are confined to the existing development/lint tree; no forced breaking upgrade was applied.
- Formatting, ESLint, strict TypeScript: passed.
- Vitest: 33 files / 112 tests passed before release commit.
- Prisma schema validation and migration SQL generation: passed.
- Optimized Next.js production build: passed.
- Secret scan: no credential pattern in the intended diff; `.env.example` contains only its documented placeholder database URL.
- Restored three exact historical Phase 6D migration files (byte-identical to their original commits) so repository migration history matches the isolated database.
- Isolated staging migration: applied successfully. Before/after counts remained 10 orders, 10 customers, 1 payment, 39 status-history events, 86 products. New G2 tables initialized empty: 0 attribution snapshots, 0 business events, 0 spend rows, 0 campaigns. No historical attribution was fabricated.

Exact-SHA CI, protected staging UAT, and production release evidence are recorded in the final owner handoff after those external checks complete.
