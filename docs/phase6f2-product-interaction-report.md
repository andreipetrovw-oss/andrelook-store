# Phase 6F.2 — Product Interaction & Language Polish Final Report

Date: 6 October 2026
Status: isolated owner-UAT candidate; production cutover is not authorized

## A. Branch, base and accepted application SHA

- Branch: `phase6f2-product-interaction`
- Exact Phase 6F.1 base: `646162d9d9afe422b033b1c54455fd5aba8876f9`
- Accepted application implementation SHA: `afd183b9801477546ba53cb517edf0a70b568ec8`
- The branch is a normal descendant of the exact Phase 6F.1 base. It was not reset, rebased, force-pushed or merged to `main`.
- The documentation-only final branch HEAD, its green CI run and its exact redeployment are recorded in the final owner handoff. A commit cannot contain its own future hash or deployment ID, so application and final handoff evidence are separated explicitly.

## B. Commits

1. `afd183b` — `feat(storefront): polish product interactions and locale`
2. The final documentation-only commit containing this report is identified in the owner handoff.

The implementation changed 28 files and added the product interaction provider, configurator, gallery viewer, drawer experience, presentation helpers and focused tests. No production repository or production configuration is included.

## C. CI

Accepted application CI:

- GitHub Actions run: `37412132967`
- URL: <https://github.com/andreipetrovw-oss/andrelook-store/actions/runs/37412132967>
- SHA: `afd183b9801477546ba53cb517edf0a70b568ec8`
- Result: `success`
- All clean-install, runtime-audit, formatting, ESLint, strict TypeScript, Vitest, Prisma, migration and production-build steps passed.

The final handoff records the subsequent green run for the documentation-only final branch HEAD.

## D. Deployment

Accepted application deployment:

- Vercel project: `andrelook-v1-staging`
- Project ID: `prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`
- Deployment ID: `dpl_GTXFnJpfUkm4NEBTjA1D8AkxhXQd`
- Immutable URL: <https://andrelook-v1-staging-bqy3wvric-andreys-projects-a106cf89.vercel.app>
- Owner URL: <https://andrelook-v1-staging.vercel.app>
- State: `READY`
- Git metadata SHA: `afd183b9801477546ba53cb517edf0a70b568ec8`
- Git ref: `phase6f2-product-interaction`

The Vercel target named `production` is only the production environment of the isolated `andrelook-v1-staging` project. It is not the live Andrelook project and has no Andrelook custom domain.

Verified pre-closeout-document deployment:

- Branch HEAD / CI SHA / deployed Git SHA: `238d2209c33f97c07ceaee494d23a5d928cf78c6`
- GitHub Actions run: `37412870607` — `success`
- Deployment ID: `dpl_E1XMgMTHH3irgAKyY8Z1bnZZxRvV`
- Immutable URL: <https://andrelook-v1-staging-qab94zxk8-andreys-projects-a106cf89.vercel.app>
- State: `READY`

The exact SHA, CI run and deployment produced after committing this closeout evidence are necessarily recorded in the final owner handoff: a Git commit cannot contain its own future hash or deployment ID.

## E. Local checkpoint diagnosis

- The temporary local zero-product catalog was not a route or database regression.
- Exact cause: the saved `NEXT_PUBLIC_SITE_URL` pointed to staging while `VERCEL_PROJECT_ID` was absent locally, so the fail-closed review-mode guard correctly selected public-only visibility. All 23 launch records intentionally lack owner prices and therefore remain excluded from public scope.
- Starting local review with a localhost site URL restored the intended `local-review` scope and all 23 products.
- No customer URL changed. Existing category and product slugs remain stable.

## F. Gallery interaction

- Clicking or tapping any verified PDP image opens a full-viewport dialog.
- Previous/next controls, Arrow Left/Right, image counter, Escape, close control and zoom/reset all work.
- Horizontal pointer/touch swipes use a 48 px threshold and suppress the synthetic post-swipe zoom click.
- Focus is trapped inside the viewer and returns to the opening image without forcing a scroll jump.
- Body scroll is locked only while open and restored after close.
- Mobile uses safe-area-aware controls and a full-height image stage; reduced-motion preferences remain respected.

## G. Product selection state

- Colour chips show evidence-backed names and swatches, expose `aria-pressed` state and remain keyboard accessible.
- Chart-backed products expose only verified size choices plus explicit sizing help.
- Six products without a verified chart never receive fabricated sizes; sizing assistance is selected automatically.
- The primary and mobile sticky CTAs validate missing size first, then colour, and focus the relevant accessible group.
- Chip state, inline fallback form state, drawer summary and drawer selects share one provider, preventing duplicate or stale selection.

## H. Pre-order drawer and fallback form

- Desktop uses a fixed right-side drawer with backdrop; mobile uses a full-height, safe-area-aware sheet.
- A stacking-context defect found at 320 px was fixed so the sheet and close control correctly overlay the sticky site header.
- Escape, backdrop, close button, focus trap, focus restoration and body-scroll lock were verified.
- Closing and reopening preserves entered fields and product configuration because the established form remains mounted.
- The existing inline form remains available when the drawer is closed.

## I. Form behavior and regression safety

- Product, colour and size/sizing assistance are already populated in the form; customers do not repeat their selection.
- Telegram, Instagram, phone and email fields switch according to the chosen contact method.
- European delivery fields appear only for delivery; the established payment-choice logic remains unchanged.
- The page locale is the default communication language.
- Existing field validation, pending/disabled submission state, server action and request-key idempotency were preserved.
- `verify:phase6f-orders` confirmed the established persistence and lifecycle records without creating local duplicates.

Final isolated-staging E2E acceptance:

- One authorized synthetic request was submitted once; it was not retried or duplicated.
- Reference: `AL-20261006-C0F902`.
- Product selection: `Moncler Maya Down Jacket` / `black` (`Must`) / `M/2` / quantity `1`.
- Fulfilment: `PERSONAL_HANDOVER`, `EE` / `Tallinn`.
- Payment preference: `DEPOSIT_30_BALANCE_ON_HANDOVER`; confirmed total remains pending, no payment rows exist and recorded payment is `0.00 EUR`.
- Persisted status: `NEW`; its complete status history contains only the initial `NEW` event, with no accidental transition.
- Attribution: `REFERRAL`; ET product landing path and initial staging referrer persisted correctly, with no fabricated UTM values.
- Customer-facing success confirmed the selection and reference, stated that no payment was taken and exposed the expected `t.me/andrelookstore` continuation.
- Protected CRM query returned exactly one matching order. Staging totals after acceptance are one admin, ten customers, ten orders and one pre-existing payment.
- The owner-notification attempt failed only because Resend restricts the unverified sender to its own test recipient. This known sender-domain limitation did not affect transaction persistence or the customer success state.

## J. Success experience

- The success state remains inside the same order experience and shows the product selection and generated order reference.
- Copy states that Andrelook will confirm price, sizing and fulfilment and that no payment was taken.
- A Telegram continuation link remains available.
- Closing the success state cannot re-run the server action or initiate automatic payment.
- The final deployed acceptance displayed reference `AL-20261006-C0F902`, selection `Must · M/2` and the explicit no-payment confirmation.

## K. Default locale and language switching

- `/` deterministically redirects to `/et`.
- Estonian is the primary local locale; English and Russian remain complete first-class locales.
- Language switching preserves home, information, catalog, category and product context rather than returning customers to the homepage.
- The selected locale is stored defensively in local storage and a same-site cookie, but the root redirect remains deterministic.

## L. Metadata matrix

| Locale | Homepage title                     | `html lang` | Open Graph locale |
| ------ | ---------------------------------- | ----------- | ----------------- |
| ET     | `Andrelook — mood ettetellimisel`  | `et`        | `et_EE`           |
| EN     | `Andrelook — pre-order fashion`    | `en`        | `en_GB`           |
| RU     | `Andrelook — одежда по предзаказу` | `ru`        | `ru_RU`           |

- Homepage descriptions are natural and localized.
- Home, catalog, category, product and information routes emit localized canonical URLs, RU/ET/EN hreflang links and `x-default` pointing to ET.
- Open Graph and Twitter titles/descriptions are localized and branded consistently.
- Staging metadata remains `noindex, nofollow, nocache`.

## M. Copy and taxonomy

- The process concept is now `От выбора до получения` / `Valikust kättesaamiseni` / `From selection to delivery`.
- Unnatural `Понятные шаги`, `Selged sammud` and `Clear next steps` wording was removed from the public experience.
- Product and support copy avoids AI/developer terminology and does not imply automatic payment.
- Repeated brand prefixes are removed from visible card and PDP model titles while full evidence-backed names remain available to accessibility and metadata.
- Customer-facing categories are:
  - Outerwear / Üleriided / Верхняя одежда — 3
  - Vests / Vestid / Жилеты — 4
  - Jackets & knitwear / Jakid ja kudumid / Куртки и трикотаж — 9
  - Sweatshirts / Dressipluusid / Свитшоты и худи — 2
  - T-shirts & polos / T-särgid ja polod / Футболки и поло — 4
  - Swimwear / Ujumisriided / Пляжная одежда — 1
- Internal category slugs and all public URLs remain unchanged.

## N. Product cards

- The complete card surface is one accessible link.
- Cards retain brand, model, category, colour summary, `PRE_ORDER` state and evidence-safe 2–3 week estimate.
- Products with a second verified image crossfade to it on hover-capable pointers; touch layouts retain the primary image.
- No unverified price, stock, scarcity, authenticity, rating or review content was introduced.

## O. Responsive and visual QA

- Automated browser checks covered 54 page/viewport combinations at 320, 360, 375, 390, 414, 768, 1024, 1280 and 1440 px.
- Pages covered: homepage, catalog, category, chart-backed PDP, personal-sizing PDP and information pages.
- Results: zero horizontal overflow, zero broken images, correct header/footer rendering and correct mobile CTA visibility.
- Visual review covered the approved hero, mobile catalog/cards, desktop PDP, mobile/desktop drawer, mobile lightbox and information pages.
- The Phase 6F.1 hero image, crop, proportions, ANDRELOOK lockup, header, CTA styling, overlay and spacing remain unchanged. Only approved localized supporting copy differs.

## P. Accessibility

- Dialog semantics, accessible labels, `aria-pressed`, live counter/status regions, focus traps, Escape handling and focus restoration were verified.
- Colour is never conveyed by swatch alone; visible localized colour names remain present.
- Selection validation focuses the relevant labeled group and is linked through `aria-describedby`.
- Reduced motion, keyboard navigation, skip link, semantic headings and labeled inputs remain intact.

## Q. Quality, performance and security

- Clean `npm ci`: passed.
- Prettier, ESLint, strict TypeScript, Prisma validation, migration generation and production build: passed.
- Vitest: 19 files, 54 tests, all passed.
- Runtime `npm audit --omit=dev`: zero vulnerabilities after the safe `source-map-js` 1.2.2 lock update.
- Five high advisories remain only in the existing lint-time `braces` chain; npm offers only an unsafe forced downgrade, so no forced update was applied.
- Production-mode crawl: 121 public routes, 121 unique internal links and 55 brand/product assets; zero route, image or leakage failures.
- Representative accepted deployment timings:
  - Home: TTFB 0.333–0.371 s; total 2.876–3.023 s
  - Catalog: TTFB 2.919–3.208 s; total 3.105–3.388 s
  - Product: TTFB 2.850–3.348 s; total 2.995–3.498 s
- Public HTML and the implementation diff contain no supplier URLs, source-image URLs, supplier/landed costs, private notes, credentials or customer data.
- Public DTO boundaries, publication visibility, localization and request behavior remain unchanged except for customer-safe presentation labels.
- Final deployed HTTP checks returned `307` from `/` to `/et`, `200` for home/catalog/product/robots/sitemap and a real `404` for a missing localized route. Security headers and `x-robots-tag: noindex` remained present.
- Final deployed performance samples remained within the accepted range: home TTFB `0.318–0.619 s` / total `2.889–3.331 s`; catalog TTFB `2.878–3.235 s` / total `3.041–3.419 s`; product TTFB `2.782–2.869 s` / total `2.898–3.062 s`.
- Final browser-console checks returned no errors or warnings, all inspected images loaded, and public HTML leakage scans remained clean.

## R. Catalog/data invariants

- 63 researched supplier records remain preserved and private.
- 23 launch products remain visible only in isolated review mode.
- 23/23 remain `PRE_ORDER` and have evidence-backed colours.
- 17/23 retain verified selectable size charts.
- 6/23 remain personal-sizing only: legacy records 6, 9, 13, 19, 20 and 22.
- 53 verified legacy product images remain connected to the correct products.
- 23/23 still require owner retail prices.
- No commercial facts, sizes, colours, prices, stock, legal terms, reviews or delivery promises were invented.

## S. Staging isolation and owner review

- Deployment Protection: `all_except_custom_domains` / Vercel authentication remains active.
- Owner CRM additionally remains protected by Clerk and the exact owner allowlist.
- `/robots.txt` disallows `/`; the staging sitemap contains zero indexable URLs.
- The only attached project domain is `andrelook-v1-staging.vercel.app`.
- Protected CRM owner access was verified for `info.andrelook@gmail.com`.
- The final E2E record `AL-20261006-C0F902` exists exactly once in the protected CRM as `NEW`, with `0.00 EUR` recorded and no accidental lifecycle transition.
- Owner review URL: <https://andrelook-v1-staging.vercel.app>

## T. Production safety

- Live production repository `andreipetrovw-oss/andrelook` remains exactly at `2115502fbc104a9de433006831a70c2f09e983c3`.
- `andrelook-store/main` remains at `1709a6a89372e9c07f1f2137acc65afc2626fc59`.
- `phase6f1-storefront-perfection` remains at `646162d9d9afe422b033b1c54455fd5aba8876f9`.
- Only `phase6f2-product-interaction` was pushed.
- No merge, force-push, production deployment, production database mutation, environment change, Vercel domain attachment, DNS change or archive-ref mutation occurred.

## Owner-review checklist

1. Open the protected owner URL and sign in through Vercel if requested.
2. Review ET as the default homepage, then switch to EN and RU.
3. Open Maya Down Jacket to review the chart-backed size path, full-screen gallery and order drawer.
4. Open Tibb Logo-Patch Padded Gilet to review the personal-sizing-only path.
5. Verify selection persistence, contact/delivery conditional fields and the success/Telegram handoff.
6. Review the protected CRM with the approved Clerk owner account.

PHASE 6F.2 PRODUCT INTERACTION & LANGUAGE POLISH:
READY

PRODUCTION CUTOVER:
NOT AUTHORIZED
