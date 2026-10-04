# Andrelook Phase 6F pre-implementation audit

## Verified starting point

- Branch: `phase6f-commercial-launch`
- Exact Phase 6E base: `17664952381a36b9c87356feda0f3b351ec1b112`
- The branch is a normal descendant of the approved Phase 6E line.
- The live static production repository, deployment, domains, DNS and database are outside the Phase 6F write boundary.
- The only deployment target authorized for Phase 6F is the isolated `andrelook-v1-staging` project (`prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`).

## Legacy launch assortment

The approved current-production source under `phase4-work` contains:

- 23 customer-facing products;
- 53 product photographs;
- 55 referenced image assets in total when the hero and logo are included;
- five active customer categories: warm jackets, vests, light jackets, hoodies, T-shirts and bottoms (six filter values because light/warm jackets are separate);
- current RU/ET/EN titles, descriptions and colour labels;
- no approved retail prices (the live catalog displays “on request”);
- no product-level selectable sizes in the legacy implementation;
- Telegram, Instagram and email links, but no approved Facebook destination.

The legacy assets are the Phase 6F launch-photo authority. They must not be replaced with supplier photography or AI output.

## Phase 5 reconciliation

The canonical Phase 5C1 artifact hash was reverified:

`5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21`

Phase 5A records 17 explicit model-name matches to legacy products. Each of those 17 source records has a verified Phase 5C1 size chart. Six legacy products remain unresolved and must not receive a fuzzy chart:

1. Moncler Tibb Logo-Patch Padded Gilet
2. Moncler Cardigan Wool
3. Moncler Après Ski Knit Sleeves Puffer Jacket
4. Moncler Blurred Logo T-Shirt
5. Moncler Stripe Trim Zip Hoodie
6. Moncler Polo Shirt

Later Phase 5B similarity candidates for Cardigan Wool, Stripe Trim Zip Hoodie and Polo Shirt do not override the explicit Phase 5A caution. They remain owner-review items for launch publication.

## Current v1 storefront

The Phase 6E storefront has a sound technical and visual foundation:

- Next.js 16 App Router, React 19 and strict TypeScript;
- PostgreSQL/Prisma with public/private DTO separation;
- localized RU/ET/EN routes and metadata;
- server-rendered catalog/product pages;
- accessible navigation, loading/error states and responsive layout;
- idempotent order-request key;
- fail-closed Clerk owner access;
- protected staging review mode, disabled indexing and isolated staging database.

Commercial gaps found in the existing customer experience:

- the staging catalog exposes only four Phase 5 review products rather than the 23-product launch assortment;
- no launch product has an approved retail price;
- no legacy photography is connected to v1 products;
- copy is still influenced by internal validation language;
- the request form lacks surname, quantity, fulfilment choice, country/city/address, conditional delivery fields, preferred-language confirmation, contact-specific fields and sizing-help measurements;
- UTM acquisition data is modelled but not captured through the journey;
- successful requests do not send or record an operational email notification;
- the success state is functional but not yet a complete launch confirmation experience.

## CRM audit

The current branch has a secure working CRM with status history, payments and owner-only access. The richer Phase 6D.1 CRM presentation work exists on a separate Phase 6C descendant and was not merged into Phase 6E. Phase 6F will port only the proven order-operations ideas needed for launch while remaining a descendant of Phase 6E.

Missing launch-operational fields include fulfilment method, destination/address, contact-specific identifiers, quantity selection, payment preference, sizing-help data and notification delivery state. The existing status model already matches the required workflow:

`NEW → CONTACTED → CONFIRMED → AWAITING_PAYMENT → PAID → ORDERED → IN_TRANSIT → READY → DELIVERED`, with `CANCELLED` available.

## Notification capability

No mail provider or email notification implementation exists in the Phase 6E branch. Phase 6F will add a server-only Resend integration with deterministic idempotency, an order-notification audit record, and fail-safe behavior: the committed order remains authoritative if the email provider fails. Staging delivery still requires a server-side provider key/from address to be configured in the isolated Vercel project.

## Confirmed commercial facts

- All active launch products: `PRE_ORDER`.
- Expected timeframe: approximately 2–3 weeks.
- Estonia/local: 30% advance with the remaining balance at personal handover, or full advance.
- International/shipped orders: full advance.
- Delivery: across Europe; destination-dependent delivery details/cost are personally confirmed.
- Customer email: `info.andrelook@gmail.com`.
- Known confirmed social destinations: Telegram `@andrelookstore` and Instagram `@andrelook.store`.

## Genuine owner-only blockers

These cannot be inferred safely and do not block the engineering work:

- retail price in EUR for each of the 23 launch products;
- sellable size evidence for the six unresolved legacy products;
- final legal/business identity fields;
- owner-approved returns/exchange terms;
- an approved Facebook URL, if Facebook should be offered;
- the production email-sender/domain decision after staging notification proof.
