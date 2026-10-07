# Phase 6F.3 — Final Storefront, Content & Localization Perfection Report

Date: 7 October 2026
Status: isolated owner-UAT candidate; production cutover is not authorized

This report covers the final general storefront pass. Only owner-supplied prices,
size-chart evidence, legal/policy facts and a verified notification sender domain
remain. A Git commit cannot contain its own future hash, CI run ID or deployment
ID, so the exact final document-containing SHA, green run and matching deployment
are recorded in the final owner handoff after this report is committed.

## A. Branch, base, commits and final SHA

- Branch: `phase6f3-final-storefront`
- Exact Phase 6F.2 base: `45ae89876ee302245de0e62ec93f18060133ad5e`
- Ancestry: normal descendant; no reset, rebase, force-push or merge to `main`
- Final document-containing SHA: recorded in the final owner handoff for the
  reason above.
- The reviewed commit contains only the Phase 6F.3 storefront, tests, CI branch
  trigger and this report.

## B. CI

The final owner handoff records the exact GitHub Actions run and proves:

`local HEAD = remote branch HEAD = successful CI SHA = deployed gitCommitSha`

The required workflow runs a clean Node 24 install, runtime dependency audit,
Prettier, ESLint, strict TypeScript, all Vitest tests, Prisma validation,
migration generation and the production build.

## C. Isolated staging deployment

- Project: `andrelook-v1-staging`
- Project ID: `prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`
- Owner URL: <https://andrelook-v1-staging.vercel.app>
- Final deployment ID, immutable URL and exact Git SHA: final owner handoff
- Deployment Protection: required and retained
- Custom production domains: none
- Search indexing: disabled; `/robots.txt` disallows crawling and the staging
  sitemap intentionally has no indexable URLs

## D. Storefront outcome

- The owner-approved hero hierarchy is restored: the original image, crop,
  overlay, proportions, serif styling, spacing and CTA composition frame a large
  centered `ANDRELOOK` wordmark. Global-brand positioning remains a supporting
  line, never the dominant headline.
- Homepage order is hero, products, concise trust strip, category discovery,
  ordering process, sizing service, FAQ and final contact CTA. Repeated service
  sections were removed instead of padded with filler.
- `ANDRELOOK EDIT`, the location label and decorative size mark are deliberate
  and consistent.
- Catalog taxonomy is conceptually equivalent across RU/ET/EN. Estonian product
  counts use `1 toode` and `n toodet`.
- Cards remain ready for fixed prices without looking broken while prices are
  owner-pending.
- PDP facts distinguish availability, lead time and sizing. No-chart products
  show a temporary help state without implying that a table exists.
- The order summary is neutral before selection and says sizing assistance only
  when that option is actually selected.
- The request form retains every CRM field and conditional rule while using a
  lighter two-column layout where space permits.

## E. RU localization audit

Passed. Hero, trust/process blocks, catalog grammar, taxonomy, cards, PDP facts,
size guide, no-chart state, request/success experience, 32-country list, nine
information pages, footer and metadata were reviewed as polished retail Russian.
Navigation uses `О нас`, `Как заказать`, `Доставка и оплата`, `Предзаказ`,
`Возврат и обмен`, `Вопросы и ответы`, `Контакты`, `Конфиденциальность`,
`Условия`. No English system copy, internal chart-count language or migration
wording remains in the customer journey.

## F. ET localization audit

Passed. Copy was edited as native Estonian rather than literal Russian. Repeated
`personaalne` wording was reduced, count grammar is correct, country names are
localized and navigation uses `Andrelookist`, `Kuidas tellida`,
`Tarne ja maksmine`, `Eeltellimus`, `Tagastus ja vahetus`,
`Korduma kippuvad küsimused`, `Kontakt`, `Privaatsus`, `Tingimused`. Long labels
wrap cleanly at 320 px. No accidental Russian/English system strings remain.

## G. EN localization audit

Passed. Hero, commerce copy and support content read as native European retail
English rather than translated Russian. Navigation uses `About`, `How to order`,
`Delivery & payment`, `Pre-order`, `Returns & exchanges`, `FAQ`, `Contact`,
`Privacy`, `Terms`. No internal completeness language or unsupported commercial
claim remains.

## H. Product-description audit — all 23 launch products

Each matrix cell means the full description and its metadata-shortened form were
reviewed against approved launch imagery/data: distinct, evidence-grounded, and
free of invented composition, filling, waterproofing, warmth, authenticity,
origin or performance claims.

| ID            | Product                                      |   RU |   ET |   EN | Evidence / duplication result                                           |
| ------------- | -------------------------------------------- | ---: | ---: | ---: | ----------------------------------------------------------------------- |
| AL-LEGACY-001 | Moncler Maya Down Jacket                     | PASS | PASS | PASS | Visible glossy puffer, hood, quilting, sleeve pocket; distinct          |
| AL-LEGACY-002 | Parajumpers Tyrik Hooded Puffer Jacket       | PASS | PASS | PASS | Visible long hooded quilted form and pocket detailing; distinct         |
| AL-LEGACY-003 | Moncler Vezere Down Jacket                   | PASS | PASS | PASS | Visible puffer silhouette, hood and quilting; distinct                  |
| AL-LEGACY-004 | Moncler Bormes Down Vest                     | PASS | PASS | PASS | Visible sleeveless quilted construction and high collar; distinct       |
| AL-LEGACY-005 | Parajumpers Jeordie Down Vest                | PASS | PASS | PASS | Visible gilet construction, quilting and pockets; distinct              |
| AL-LEGACY-006 | Moncler Tibb Logo-Patch Padded Gilet         | PASS | PASS | PASS | Visible padded gilet, stand collar and logo-patch detail; distinct      |
| AL-LEGACY-007 | Moncler Galion Hooded Jacket                 | PASS | PASS | PASS | Visible hooded jacket construction and pocket layout; distinct          |
| AL-LEGACY-008 | Moncler Etiache Rain Jacket                  | PASS | PASS | PASS | Visible lightweight hooded jacket and zip details only; distinct        |
| AL-LEGACY-009 | Moncler Cardigan Wool                        | PASS | PASS | PASS | Visible cardigan silhouette and contrasting front; no composition claim |
| AL-LEGACY-010 | Moncler Gui Gilet                            | PASS | PASS | PASS | Visible slim quilted gilet and high collar; distinct                    |
| AL-LEGACY-011 | Moncler Detachable Hood Cardigan             | PASS | PASS | PASS | Visible mixed-panel cardigan and hood configuration; distinct           |
| AL-LEGACY-012 | Parajumpers Pharrell Hooded Bomber           | PASS | PASS | PASS | Visible bomber proportions, hood and utility details; distinct          |
| AL-LEGACY-013 | Moncler Après Ski Knit Sleeves Puffer Jacket | PASS | PASS | PASS | Visible padded body/contrasting sleeve construction; distinct           |
| AL-LEGACY-014 | Moncler Retro Knit Wool Cardigan             | PASS | PASS | PASS | Visible cardigan shape, front panel and collar; no fibre claim          |
| AL-LEGACY-015 | Parajumpers Jayden Hybrid Cardigan           | PASS | PASS | PASS | Visible hybrid panel construction and hood; distinct                    |
| AL-LEGACY-016 | Moncler Hooded Wool Cardigan                 | PASS | PASS | PASS | Visible hooded cardigan and contrasting front; no fibre claim           |
| AL-LEGACY-017 | Moncler Basic T-Shirt                        | PASS | PASS | PASS | Visible crew-neck short-sleeve form and small branding; distinct        |
| AL-LEGACY-018 | Moncler Leather Badge T-Shirt                | PASS | PASS | PASS | Visible crew-neck form and badge detail; no material composition claim  |
| AL-LEGACY-019 | Moncler Blurred Logo T-Shirt                 | PASS | PASS | PASS | Visible logo treatment and short-sleeve form; distinct                  |
| AL-LEGACY-020 | Moncler Stripe Trim Zip Hoodie               | PASS | PASS | PASS | Visible zip hoodie, contrast trim and pockets; distinct                 |
| AL-LEGACY-021 | Moncler Hera Logo Patch Sweatshirt           | PASS | PASS | PASS | Visible crew-neck sweatshirt and patch detail; distinct                 |
| AL-LEGACY-022 | Moncler Polo Shirt                           | PASS | PASS | PASS | Visible polo collar, placket and short sleeves; distinct                |
| AL-LEGACY-023 | Moncler Logo Patch Swimming Shorts           | PASS | PASS | PASS | Visible shorts silhouette, waistband and patch detail; distinct         |

Automated checks found 23 unique descriptions in every locale and no blocked
unsupported-claim language. Highest pairwise word-set similarity remained below
0.42 (RU 0.382, ET 0.333, EN 0.419), with no duplicated paragraph.

## I. Page and customer-journey QA

- Homepage: final brand-first hero hierarchy, product section immediately after
  hero, concise trust strip, category discovery and non-duplicative support
  content.
- Catalog/category: six customer categories, correct localized counts, search,
  filter and sort behavior retained.
- Product cards: complete linked surface, 53 approved photos, brand/model/category,
  colours, safe owner-price placeholder and pre-order state.
- PDP: accurate title, evidence-backed imagery and copy, commercial facts,
  colour/size configuration, chart/no-chart paths, related products and CTA.
- Size guide: responsive table; `Bust` is translated neutrally, never as body
  circumference; units are not inferred.
- Form: localized 32-country labels, conditional contact/address/payment fields,
  accessible errors, neutral empty selection and accurate success summary.
- Information pages: About, How to order, Delivery & payment, Pre-order, Returns,
  FAQ, Contact, Privacy and Terms were reviewed in all locales. Duplicate source
  numbering was removed from How to order.
- Existing regression order `AL-20261006-C0F902` remains exactly once, `NEW`,
  `0.00 EUR`, with `Must · M/2`, personal handover, ET landing attribution and
  only the initial `NEW` lifecycle event. No new synthetic order was created.

## J. Responsive and browser matrix

Browser automation covered RU, ET and EN at 320, 360, 375, 390, 414, 768, 1024
and 1440 px on homepage, catalog, category, chart-backed PDP, no-chart PDP,
How to order, Delivery & payment, Contact and the expanded order drawer.

- 192 page/viewport checks plus 24 expanded-drawer checks
- After the owner correction, the restored brand-first hero was rechecked in
  all three locales at 320, 390, 768, 1024 and 1440 px (15 additional checks):
  `ANDRELOOK` remained the dominant H1, the approved image/crop/overlay and CTA
  composition were preserved, and no overflow, broken image or console issue
  was found.
- Zero horizontal-overflow failures
- Exactly one H1 on every checked page
- No broken image, clipped control or unstable layout found
- Mobile sticky CTA, gallery, lightbox, long RU/ET labels, selects, footer and
  drawer were visually reviewed
- Fresh final production-mode pages produced zero console warnings/errors

## K. Accessibility

Passed: skip link, one H1, meaningful heading hierarchy, labeled inputs and
fieldsets, visible focus, keyboard-operable colour/size controls, `aria-live`
results, meaningful image alt text, decorative hero handling and contrast.
Gallery and request dialogs trap focus, close with Escape and restore focus to
their opener. Reduced-motion behavior is retained. The size table has horizontal
scroll on narrow viewports without causing page overflow.

## L. SEO and schema

- 120 localized public routes were checked.
- Titles and descriptions are localized and unique within each locale.
- Canonical, RU/ET/EN hreflang and x-default links are present.
- Open Graph and Twitter metadata are localized.
- Organization and breadcrumb schemas remain present.
- All 69 localized PDP responses emit Product schema from the public DTO.
- Zero Offer schemas are emitted because zero owner-approved prices exist.
- Staging remains `noindex, nofollow, nocache`; its sitemap is intentionally
  empty while indexing is disabled.
- Production cutover requirement: set the production environment site URL so
  all canonical/schema URLs resolve to `https://www.andrelook.store` before
  enabling indexing.

## M. Quality, security and privacy

- Clean `npm ci`: passed.
- Prettier, ESLint, strict TypeScript: passed.
- Vitest: 22 files / 65 tests, all passed, including the owner-approved
  brand-first hero regression matrix.
- Prisma schema and migration status: valid; all three migrations applied.
- Migration generation: passed (582-line deterministic from-empty script).
- Optimized Next.js production build: passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- Five high advisories remain only in the existing lint-time `braces` chain;
  npm proposes an unsafe Next/ESLint downgrade, so no forced change was made.
- Tracked-file secret scan: no credential or private-key finding. Only explicit
  local/CI example database URLs were matched by the broad URL pattern.
- Runtime crawl: 120 localized routes, 189 internal paths, six categories and
  all 23 localized product pages; zero route/link/leakage failures.
- Image verification: all 53 unique launch images returned 200 directly and
  through the Next image optimizer (106 checks, zero failures).
- Real missing localized route: 404. Root: 307 to ET. Robots and staging sitemap:
  200 with indexing disabled.
- Public HTML contains no supplier URLs, source-image URLs, supplier/landed
  costs, internal notes, credentials or customer data.
- Owner-only auth, public/private DTO separation, request idempotency, lifecycle
  history and server-only notification data were not weakened.

## N. Remaining owner inputs

These are the only remaining launch blockers. No values were inferred.

### N1. Price completion — all 23 rows

Enter the final owner-approved EUR value in **Protected CRM → Catalog → matching
internal ID → Retail price (EUR)**.

| Internal ID   | Brand       | Model                                        | Category              | Current state | Exact owner-edit location                        |
| ------------- | ----------- | -------------------------------------------- | --------------------- | ------------- | ------------------------------------------------ |
| AL-LEGACY-001 | Moncler     | Moncler Maya Down Jacket                     | Puffer jackets        | MISSING       | CRM Catalog → AL-LEGACY-001 → Retail price (EUR) |
| AL-LEGACY-002 | Parajumpers | Parajumpers Tyrik Hooded Puffer Jacket       | Puffer jackets        | MISSING       | CRM Catalog → AL-LEGACY-002 → Retail price (EUR) |
| AL-LEGACY-003 | Moncler     | Moncler Vezere Down Jacket                   | Puffer jackets        | MISSING       | CRM Catalog → AL-LEGACY-003 → Retail price (EUR) |
| AL-LEGACY-004 | Moncler     | Moncler Bormes Down Vest                     | Gilets                | MISSING       | CRM Catalog → AL-LEGACY-004 → Retail price (EUR) |
| AL-LEGACY-005 | Parajumpers | Parajumpers Jeordie Down Vest                | Gilets                | MISSING       | CRM Catalog → AL-LEGACY-005 → Retail price (EUR) |
| AL-LEGACY-006 | Moncler     | Moncler Tibb Logo-Patch Padded Gilet         | Gilets                | MISSING       | CRM Catalog → AL-LEGACY-006 → Retail price (EUR) |
| AL-LEGACY-007 | Moncler     | Moncler Galion Hooded Jacket                 | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-007 → Retail price (EUR) |
| AL-LEGACY-008 | Moncler     | Moncler Etiache Rain Jacket                  | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-008 → Retail price (EUR) |
| AL-LEGACY-009 | Moncler     | Moncler Cardigan Wool                        | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-009 → Retail price (EUR) |
| AL-LEGACY-010 | Moncler     | Moncler Gui Gilet                            | Gilets                | MISSING       | CRM Catalog → AL-LEGACY-010 → Retail price (EUR) |
| AL-LEGACY-011 | Moncler     | Moncler Detachable Hood Cardigan             | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-011 → Retail price (EUR) |
| AL-LEGACY-012 | Parajumpers | Parajumpers Pharrell Hooded Bomber           | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-012 → Retail price (EUR) |
| AL-LEGACY-013 | Moncler     | Moncler Après Ski Knit Sleeves Puffer Jacket | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-013 → Retail price (EUR) |
| AL-LEGACY-014 | Moncler     | Moncler Retro Knit Wool Cardigan             | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-014 → Retail price (EUR) |
| AL-LEGACY-015 | Parajumpers | Parajumpers Jayden Hybrid Cardigan           | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-015 → Retail price (EUR) |
| AL-LEGACY-016 | Moncler     | Moncler Hooded Wool Cardigan                 | Jackets & cardigans   | MISSING       | CRM Catalog → AL-LEGACY-016 → Retail price (EUR) |
| AL-LEGACY-017 | Moncler     | Moncler Basic T-Shirt                        | T-shirts & polos      | MISSING       | CRM Catalog → AL-LEGACY-017 → Retail price (EUR) |
| AL-LEGACY-018 | Moncler     | Moncler Leather Badge T-Shirt                | T-shirts & polos      | MISSING       | CRM Catalog → AL-LEGACY-018 → Retail price (EUR) |
| AL-LEGACY-019 | Moncler     | Moncler Blurred Logo T-Shirt                 | T-shirts & polos      | MISSING       | CRM Catalog → AL-LEGACY-019 → Retail price (EUR) |
| AL-LEGACY-020 | Moncler     | Moncler Stripe Trim Zip Hoodie               | Sweatshirts & hoodies | MISSING       | CRM Catalog → AL-LEGACY-020 → Retail price (EUR) |
| AL-LEGACY-021 | Moncler     | Moncler Hera Logo Patch Sweatshirt           | Sweatshirts & hoodies | MISSING       | CRM Catalog → AL-LEGACY-021 → Retail price (EUR) |
| AL-LEGACY-022 | Moncler     | Moncler Polo Shirt                           | T-shirts & polos      | MISSING       | CRM Catalog → AL-LEGACY-022 → Retail price (EUR) |
| AL-LEGACY-023 | Moncler     | Moncler Logo Patch Swimming Shorts           | Swim shorts           | MISSING       | CRM Catalog → AL-LEGACY-023 → Retail price (EUR) |

### N2. Size-guide completion — all 23 rows

Album IDs and image positions are evidence identifiers only; no private supplier
URL is published here. `UNVERIFIED` means the source crop does not print a unit
clearly, so the UI correctly does not claim centimetres. The source header
`Bust` remains semantically ambiguous (flat garment width vs another method) for
every chart using it; confirm its intended meaning before relabeling it as chest
width, and never call it circumference without evidence.

| ID            | Brand / exact model                                    | Slug                                           |  Chart | Evidence                                    | Headers                                             | Unit       | Exact owner review                                                                         |
| ------------- | ------------------------------------------------------ | ---------------------------------------------- | -----: | ------------------------------------------- | --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------ |
| AL-LEGACY-001 | Moncler — Moncler Maya Down Jacket                     | `moncler-maya-down-jacket`                     |    YES | Album 209196543, image 1; visually verified | Back Length, Shoulder, Bust, Sleeve                 | UNVERIFIED | Chart prints `MAAY`; confirm Maya association, unit and `Bust` semantics                   |
| AL-LEGACY-002 | Parajumpers — Parajumpers Tyrik Hooded Puffer Jacket   | `parajumpers-tyrik-hooded-puffer-jacket`       |    YES | Album 218168827, image 1; visually verified | Bust, Clothes length, Sleeve, Shoulder              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-003 | Moncler — Moncler Vezere Down Jacket                   | `moncler-vezere-down-jacket`                   |    YES | Album 209196423, image 1; visually verified | Back Length, Shoulder, Bust, Sleeve                 | UNVERIFIED | Title absent in crop; confirm association, unit and `Bust` semantics                       |
| AL-LEGACY-004 | Moncler — Moncler Bormes Down Vest                     | `moncler-bormes-down-vest`                     |    YES | Album 250472868, image 1; visually verified | Clothes Length, Back Length, Shoulder, Bust         | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-005 | Parajumpers — Parajumpers Jeordie Down Vest            | `parajumpers-jeordie-down-vest`                |    YES | Album 200087445, image 1; visually verified | Shoulder, Clothes length, Sleeve, Bust              | UNVERIFIED | Sleeve row is dashes/null; confirm unit and `Bust` semantics                               |
| AL-LEGACY-006 | Moncler — Moncler Tibb Logo-Patch Padded Gilet         | `moncler-tibb-logo-patch-padded-gilet`         | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-007 | Moncler — Moncler Galion Hooded Jacket                 | `moncler-galion-hooded-jacket`                 |    YES | Album 209196317, image 1; visually verified | Bust, Clothes length, Sleeve, Shoulder              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-008 | Moncler — Moncler Etiache Rain Jacket                  | `moncler-etiache-rain-jacket`                  |    YES | Album 209196488, image 1; visually verified | Clothes Length, Shoulder, Bust, Sleeve              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-009 | Moncler — Moncler Cardigan Wool                        | `moncler-cardigan-wool`                        | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-010 | Moncler — Moncler Gui Gilet                            | `moncler-gui-gilet`                            |    YES | Album 209196467, image 1; visually verified | Back Length, Shoulder, Bust                         | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-011 | Moncler — Moncler Detachable Hood Cardigan             | `moncler-detachable-hood-cardigan`             |    YES | Album 209208469, image 1; visually verified | Clothes Length, Shoulder, Bust, Sleeve              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-012 | Parajumpers — Parajumpers Pharrell Hooded Bomber       | `parajumpers-pharrell-hooded-bomber`           |    YES | Album 179204523, image 1; visually verified | Bust, Clothes length, Sleeve, Shoulder              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-013 | Moncler — Moncler Après Ski Knit Sleeves Puffer Jacket | `moncler-apres-ski-knit-sleeves-puffer-jacket` | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-014 | Moncler — Moncler Retro Knit Wool Cardigan             | `moncler-retro-knit-wool-cardigan`             |    YES | Album 209195406, image 2; visually verified | Bust, Clothes length, Sleeve, Shoulder              | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-015 | Parajumpers — Parajumpers Jayden Hybrid Cardigan       | `parajumpers-jayden-hybrid-cardigan`           |    YES | Album 190253977, image 1; visually verified | Bust, Clothes length, Sleeve, Shoulder              | UNVERIFIED | Source prints L length 79 between M 67 and XL 71; confirm value, unit and `Bust` semantics |
| AL-LEGACY-016 | Moncler — Moncler Hooded Wool Cardigan                 | `moncler-hooded-wool-cardigan`                 |    YES | Album 209196612, image 1; visually verified | Back Length, Clothes Length, Shoulder, Bust, Sleeve | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-017 | Moncler — Moncler Basic T-Shirt                        | `moncler-basic-t-shirt`                        |    YES | Album 209196441, image 1; visually verified | Back Length, Shoulder, Bust, Sleeve                 | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-018 | Moncler — Moncler Leather Badge T-Shirt                | `moncler-leather-badge-t-shirt`                |    YES | Album 209196300, image 1; visually verified | Back Length, Shoulder, Bust, Sleeve                 | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-019 | Moncler — Moncler Blurred Logo T-Shirt                 | `moncler-blurred-logo-t-shirt`                 | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-020 | Moncler — Moncler Stripe Trim Zip Hoodie               | `moncler-stripe-trim-zip-hoodie`               | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-021 | Moncler — Moncler Hera Logo Patch Sweatshirt           | `moncler-hera-logo-patch-sweatshirt`           |    YES | Album 209196561, image 1; visually verified | Back Length, Shoulder, Bust, Sleeve                 | UNVERIFIED | Confirm unit and `Bust` semantics                                                          |
| AL-LEGACY-022 | Moncler — Moncler Polo Shirt                           | `moncler-polo-shirt`                           | **NO** | No verified chart mapped                    | —                                                   | —          | Supply exact product chart and evidence                                                    |
| AL-LEGACY-023 | Moncler — Moncler Logo Patch Swimming Shorts           | `moncler-logo-patch-swimming-shorts`           |    YES | Album 209196496, image 1; visually verified | 1/2 Waist, Length, Hip Width                        | UNVERIFIED | Confirm unit; `1/2 Waist` remains source wording                                           |

**Missing exact charts (6):** AL-LEGACY-006, AL-LEGACY-009,
AL-LEGACY-013, AL-LEGACY-019, AL-LEGACY-020 and AL-LEGACY-022. All 17
present charts still require explicit unit confirmation; no unit was inferred.

### N3. Legal identity / terms

Owner must provide and approve these exact fields before production:

1. legal entity/trader name and legal form;
2. registry number and VAT number/status if applicable;
3. registered address and customer-contact/returns address;
4. final order-formation, payment, cancellation, returns, exchange, refund,
   governing-law and dispute-resolution terms, including periods, exceptions,
   return-cost responsibility and refund timing;
5. privacy-controller legal identity/contact, processing purposes and lawful
   bases, retention periods, processor/recipient categories, international
   transfer position, data-subject request contact and policy effective date;
6. effective date/version for approved Terms and Privacy documents.

### N4. Delivery policy

Owner must decide and approve:

1. exact supported destination countries/territories (the staging form currently
   presents 32 European country codes; this is not yet an approved shipping list);
2. carrier(s), service level(s), tracking practice and delivery fee/calculation;
3. dispatch estimate after the separate 2–3-week pre-order period;
4. Tallinn handover location, availability/window and customer instructions;
5. failed-delivery, address-error, loss/damage and risk-transfer rules;
6. final payment methods and timing for delivery versus personal handover.

### N5. Resend sender domain

Current staging has a Resend key and sender configured, but the sender still uses
the restricted `resend.dev` test domain. Exact next step:

1. verify an owner-controlled sending domain in Resend;
2. set `ORDER_NOTIFICATION_FROM` in the isolated Vercel staging project to an
   address on that verified domain;
3. redeploy staging and send one controlled notification test;
4. configure the production environment separately only during an authorized
   production phase.

The existing notification failure does not affect persisted orders.

### N6. Optional social links

Telegram and Instagram are already configured. No social input is required.
Only if desired, the owner may later supply approved Facebook, TikTok or another
network URL; absence is not a launch blocker.

## Production untouched

- Live repository `andreipetrovw-oss/andrelook` remains at
  `2115502fbc104a9de433006831a70c2f09e983c3`.
- `andrelook-store/main` remains at
  `1709a6a89372e9c07f1f2137acc65afc2626fc59`.
- `phase6f1-storefront-perfection` remains at
  `646162d9d9afe422b033b1c54455fd5aba8876f9`.
- `phase6f2-product-interaction` remains at
  `45ae89876ee302245de0e62ec93f18060133ad5e`.
- Archive ref `archive/pre-v1-prototype` remains at
  `1709a6a89372e9c07f1f2137acc65afc2626fc59`.
- No production repository, database, Vercel project, environment, domain, DNS
  or deployment was changed.

PHASE 6F.3 FINAL STOREFRONT:
READY

PRODUCTION CUTOVER:
NOT AUTHORIZED
