# Phase 6F final commercial launch build

Status: isolated staging candidate; production cutover is not authorized.

## A. Repository

- Branch: `phase6f-commercial-launch`
- Base Phase 6E SHA: `17664952381a36b9c87356feda0f3b351ec1b112`
- Final branch SHA, commit list, CI run and deployed SHA are recorded in the final handoff after the report commit, because a commit cannot truthfully contain its own SHA.
- The work is a normal descendant of the verified Phase 6E head. No history rewrite, force push or merge to `main` is part of Phase 6F.

## B. Catalog migration

- Legacy launch products found and migrated: **23 / 23**.
- Legacy product photographs found and migrated: **53 / 53**. Original masters are preserved under `assets/legacy-products/original`; deterministic optimized WebP derivatives are under `public/products/legacy`.
- Image association, ordering, dimensions and hashes are verified by the deterministic manifest and staging verifier. Combined public-image SHA-256: `c8c75f7f333603c323152aef27cd1c6610354889b1ae2142cf4ec2b06f858cf6`.
- Exact evidence-supported size charts associated: **17**.
- Deliberately unresolved size-chart identities: **6** — legacy IDs **6, 9, 13, 19, 20 and 22**. These products use personal sizing assistance in review mode; no similarity-based chart was attached.
- All **63** Phase 5 supplier-research records remain in the isolated database and **0** are visible on the Phase 6F storefront.

## C. Commercial data

- Availability: **23 PRE_ORDER**, 0 IN_STOCK, 0 UNAVAILABLE.
- Customer-facing preorder estimate: **2–3 weeks** on every launch record.
- Retail prices: **0 supplied / 23 missing**. Review mode shows the intentional owner-editable price state; no supplier cost or inferred margin was exposed or converted into a retail price.
- Approved colours: 23 / 23 products have evidence-backed colour options.
- Selectable, chart-backed sizes: 17 / 23 products. Six products use the sizing-help path pending an owner decision.
- Estonia personal handover supports either a 30% advance with the balance at handover or full advance. Other-country delivery requires full advance. Estonia delivery was acceptance-tested with full advance. No online payment is taken by the storefront.
- Delivery is limited to the offered European-country list. A delivery address is required for delivery; personal handover is limited to Tallinn. Delivery cost remains owner-controlled and is not invented.

## D. Design

- Homepage: products are now the first discovery section after the branded hero, with six real launch cards before category navigation and a concise single PRE_ORDER commercial story.
- Catalog: actual legacy photography, clear category navigation, search/filter/sort and consistent commercial badges.
- Product pages: real ordered galleries, identity, colour and chart-backed size options, preorder timing, service information, sizing help, related pieces and a complete request panel.
- Mobile: the request form is grouped into clear fieldsets; the 320 px metadata overflow was removed. Responsive verification covered 320, 360, 375, 390, 414, 768, 1024 and 1440 px.
- Trust: ordering, sizing, payment, delivery, returns and direct-contact paths are visible without making unsupported promises.

## E. Copy

- RU, ET and EN storefront, product, order-form, how-to-order, delivery/payment, preorder, returns, FAQ, contact and about copy were revised for a concise operating-store voice.
- Research/review/system language was removed from customer-facing launch copy where it was not an intentional protected-staging banner.
- Owner-dependent public facts remain explicit gates: retail prices, six chart decisions, legal business identity, approved returns/exchange terms, delivery-cost policy, optional Facebook URL and a verified notification sender domain.

## F. Funnel

- Verified flow: landing/campaign capture → catalog/category → product → exact size or sizing help → colour → fulfilment/payment → contact/consent → request success → CRM.
- Requests store server-resolved product identity and commercial snapshots. UTM/referrer/landing data is private CRM data.
- A professional success state presents the reference, explains that no payment was taken and offers an optional Telegram continuation.
- UUID request keys and the database unique constraint make retries idempotent. The acceptance duplicate returned the original order and created no additional order or notification attempt.

## G. CRM

- The CRM exposes customer identity and contacts, preferred channel/language, product, size or sizing-help request, quantity, colour, measurements, fulfilment, address, payment preference, attribution, notification audit data and timestamps.
- Supported workflow: NEW → CONTACTED → CONFIRMED → AWAITING_PAYMENT → PAID → ORDERED → IN_TRANSIT → READY → DELIVERED; CANCELLED is available separately.
- Every real status change writes an immutable history entry with the authenticated admin identity and optional note. Payment recording remains a separate authenticated action.
- Final deployed transition-chain references and history counts are recorded in the final handoff after authenticated staging acceptance.

## H. Notifications

- A server-only Resend path creates one auditable `OrderNotification` per order with recipient, provider, attempts, provider ID, status, timestamp and redacted failure text.
- New orders commit before notification delivery. All three acceptance orders were retained when delivery failed.
- Duplicate submissions do not resend. Owner retry is a fail-closed authenticated server action.
- Recipient is restricted by server configuration to `info.andrelook@gmail.com`; no API key or unnecessary private field is emitted publicly.
- Actual Gmail delivery is **blocked**, not passed: the isolated Resend resource is in onboarding/sandbox mode and its test sender may deliver only to the Vercel-account address `andrei.petrovw@gmail.com` until a sending domain is verified. The provider rejection is safely persisted as `FAILED`.

## I. Performance

- Database-backed product lookup is request-deduplicated between metadata and page rendering; product and related-category retrieval run in parallel.
- Legacy masters are preserved, while storefront delivery uses optimized WebP derivatives and Next.js image sizing.
- The production build succeeds with Next.js 16.3.6 and Node 24-compatible CI. Final deployed measurements for home, catalog and representative product are recorded in the final handoff.

## J. Accessibility

- Semantic headings, landmarks, labelled navigation, a skip link, labelled fieldsets, required input semantics, visible error/live regions and focus transfer to the success state are present.
- Keyboard-sized controls, mobile navigation, gallery alternatives and 320–1440 px layouts were reviewed. Final deployed browser/accessibility verification is recorded in the final handoff.

## K. Security / privacy

- Public DTOs select only approved customer-safe fields. Runtime crawls found no supplier URLs, source-image URLs, supplier/landed costs, internal notes, credentials or private customer/catalog data in public HTML.
- CRM actions require the configured owner authentication policy; authentication was not weakened or bypassed.
- Staging review visibility is fail-closed to the exact Vercel project ID. Indexing remains disabled; robots disallows all crawling and the staging sitemap is empty.
- Runtime dependency audit: **0 vulnerabilities**. Full audit reports five high-severity development-only findings through the current `eslint-config-next → fast-glob → micromatch → braces` chain; the installed `braces` release has no compatible patched upgrade, so no unsafe framework downgrade or forced dependency change was applied.

## L. SEO

- RU/ET/EN metadata, canonicals, hreflang, Open Graph/Twitter data, breadcrumbs and safe structured-data boundaries remain intact.
- Product offer structured data is emitted only when an actual price, currency and availability exist; missing owner prices are not fabricated.
- The isolated staging project remains `noindex, nofollow, nocache`, with `Disallow: /` and no indexable sitemap URLs.

## M. End-to-end tests

- Estonia/personal handover: `AL-20261004-EFA0D7`, 30% advance/balance preference, CRM NEW, committed despite notification failure.
- Estonia/delivery: `AL-20261004-74F6C8`, complete delivery address and full-advance preference, CRM NEW, committed despite notification failure.
- Finland/delivery: `AL-20261004-F2A6C7`, complete address and full-advance preference, CRM NEW, committed despite notification failure.
- Mobile: complete request journey and responsive form reviewed at representative mobile widths.
- Duplicate: resubmitting the fixed acceptance key returned the original record; total acceptance orders remained three.
- Invalid input: schema and browser validation cover required size/colour/contact/consent, delivery address, Estonia-only handover, full advance outside Estonia and social handle requirements, with customer-safe errors.
- Local runtime crawl: 124 routes, 121 unique internal links, 53 direct legacy images, correct 404, no leakage findings.

## N. Owner decisions

Only genuine owner-authority inputs remain:

1. Final EUR retail price for each of the 23 launch products.
2. Exact chart for legacy IDs 6, 9, 13, 19, 20 and 22, or explicit approval to launch each with sizing help and no chart-backed selectable size.
3. Legal business name, registration number, address, and approved privacy/terms/returns wording.
4. Whether delivery is free, quoted per order or follows another approved policy.
5. A verified Resend sending-domain identity and its DNS authorization so alerts can reach `info.andrelook@gmail.com`.
6. The exact Facebook URL only if Facebook should be offered.

## O. Production

Phase 6F has not modified or authorized modification of the live repository, Vercel production project, `andrelook.store` / `www.andrelook.store`, DNS, production database, production environment variables or production deployment. The Phase 6F branch is not merged to `main` and the isolated staging project has no production domain attached.

## P. Cutover readiness

**PHASE 6F CUTOVER READINESS: NOT READY**

Real blockers only:

1. 23 / 23 owner retail prices are missing, so 0 / 23 products pass the publication gate.
2. Six products need an exact size-chart decision or explicit sizing-help-only launch approval.
3. Required legal identity and owner-approved public terms/privacy/returns facts are missing.
4. The owner-notification path cannot deliver to `info.andrelook@gmail.com` until a sending domain is verified and the sender is changed from Resend onboarding mode.
5. Delivery-cost policy requires owner approval.

No Phase 6G action, production cutover, domain change or merge is authorized by this report.
