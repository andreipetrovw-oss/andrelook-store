# ANDRELOOK Phase 6D.1 final report

Date: 27 September 2026 (Europe/Tallinn)

## A. Starting state

Phase 6D.1 started from the completed Phase 6D commit
`28d4a7d3e7adf5fc27bd3dc22011dbdfc2b77e14` and continued on the dedicated
branch `phase6d1-crm-completion`. The isolated Neon staging database, Vercel
Blob resource, Clerk owner authentication, `andrelook-v1-staging` project,
four golden review products, two Phase 6C test requests, and existing
public/private data boundaries were preserved.

The goal was to finish the owner CRM and Studio foundation without publishing
products, approving source images, inventing commercial facts, attaching a CRM
domain, changing DNS, or touching customer production.

## B. Branch/repository safety

- The required Phase 6D commit remains an ancestor of the Phase 6D.1 branch.
- No reset, rebase, force-push, merge to `main`, or history rewrite occurred.
- Application code verified in staging:
  `c5ae2d47b626d02af3c2bf6afb5c7e0a67279b38`.
- The final completion record identifies the later documentation-only commit,
  its exact remote SHA, and its exact green CI run.
- Only `phase6d1-crm-completion` was pushed. Preserved branch and archive refs
  were not modified.

## C. Russian localization

The normal owner workflow is Russian-first: authentication, navigation,
dashboard, orders, order details, catalog, product editor, validation guidance,
loading states, and error states all use concise owner-facing Russian. Technical
enum values and internal codes are translated or visually secondary rather
than presented as the main operating language.

Browser review corrected the remaining legacy English publication blockers and
the duplicated Russian photo-role label. Unknown owner-authored text remains
unchanged instead of being silently translated or reinterpreted.

## D. CRM navigation

The private workspace has a compact responsive navigation for `Главная`,
`Заказы`, and `Каталог`, with a clear active state and the authenticated owner
identity. Navigation is keyboard reachable, works at desktop and mobile widths,
and does not expose administration links in the public storefront.

## E. Owner dashboard

The dashboard is organized around `Что требует внимания`, recent requests, and
catalog readiness rather than developer metrics. It distinguishes operational
request work from incomplete product decisions and links directly to the
relevant records. Counts are derived from the private staging data and do not
claim sales or inventory that do not exist.

## F. Orders list

The order workspace presents the two preserved test requests with human-readable
status, customer, product snapshot, contact method, date, and the next useful
action. Desktop uses a contained table; smaller viewports use readable cards.
The 320–414 px layouts do not overflow, and long values wrap or truncate without
hiding the record link.

## G. Order detail

Each order detail shows the request snapshot, customer contact information,
size/colour/price state, acquisition context, operational status, payment
summary, internal notes, next action, and an auditable timeline. Controls use
Russian operational wording. No payment was recorded and no order state was
changed during Phase 6D.1.

## H. Catalog workspace

The catalog is a visual product workspace rather than a raw database table. It
supports search and readiness filters, shows product identity and review state,
surfaces actionable blockers, and keeps the `AL-SRC-*` code secondary. Cards
remain usable from 320 through 1440 px; the final narrow-width fix contains
long internal identifiers without page-level overflow.

## I. Product editor

The owner editor is grouped into six understandable sections:

1. product identity and review state;
2. commercial details;
3. sizes and colours;
4. multilingual content;
5. private source photos and Studio review;
6. publication readiness.

The structure separates evidence, owner decisions, and publication state. It
does not imply that merely saving a field approves or publishes a product.

## J. Content workflow

RU, ET, and EN content remains independently editable. Missing translations and
unsupported claims remain explicit blockers. Existing review values are
preserved, and saving changed content invalidates the corresponding approval
and final publication readiness as designed. Phase 6D.1 generated no product
copy and approved no localized claim.

## K. Commercial workflow

Price, currency, availability, preorder/delivery wording, sizes, and localized
colours are owner-controlled fields with server validation and auditable
changes. Commercial, option, and publication approvals remain separate. The
four golden products still have no invented price, availability, stock,
sellable colour, or unsupported size decision.

## L. Private source-image root cause

The source records and supplier image URLs were stored correctly. Direct
browser hotlinking to `photo.yupoo.com` failed because the upstream service
returned HTML error 567 without the supplier album referrer. The same resource
returned valid image bytes when requested with its stored album referrer and
appropriate image headers. The failure was therefore an upstream delivery
requirement, not missing database data.

## M. Private source-image fix

An authenticated same-origin server route now resolves a source image from an
opaque database ID, performs owner authorization, reads the private URL and
album referrer server-side, applies the required upstream headers, and accepts
only a bounded valid image response. Supplier URLs and referrer details never
enter browser markup. Signed-out requests fail closed before retrieval.

Automated tests cover authentication, missing records, upstream failures,
invalid content types, size limits, and successful image streaming. The proxy
is deliberately private and is not a public storefront image service.

## N. Source-image review UX

Source evidence is now genuinely visual: responsive thumbnail cards load
through the private proxy and show understandable Russian role/status controls.
The owner can compare images in context without copying supplier links. Lazy
loading keeps large evidence sets manageable, and a failed image remains an
explicit review problem rather than being treated as approved.

All five Cardigan references loaded in the final visual check with zero broken
images. The other golden sets were sampled across their lazy-loaded grids with
no browser image or runtime error. No source reference was mass-approved.

## O. Andrelook Studio standard

`docs/andrelook-studio-standard.md` defines a faithful 4:5 premium image system
for hanging garments, flat-lay garments, and accessories. It specifies canvas,
scale, margins, background, lighting, shadow, supported angles, deterministic
naming/versioning, derivative sizes, rejection criteria, and traceability to
the exact private source.

The standard explicitly forbids inventing or altering construction, logos,
labels, stitching, materials, hardware, colours, proportions, condition, or
unsupported views. Existing Andrelook production quality is the minimum future
baseline, not the intended ceiling.

## P. Studio review workflow

The prepared workflow is:

`PRIVATE SOURCE → SOURCE SELECTED → STUDIO CANDIDATE → SIDE-BY-SIDE FIDELITY REVIEW → OWNER APPROVED → PUBLIC PRODUCT IMAGE`

A future candidate must remain linked to its exact source and cannot become a
public `ProductImage` without explicit owner fidelity approval. Rejection or
revision creates no public asset. Phase 6D.1 created no bulk Studio output and
approved no public product image.

## Q. Product-copy foundation

`docs/product-copy-standard.md` defines concise premium RU/ET/EN content based
only on confirmed identity, category, visible evidence, verified materials or
construction, owner-approved options, and owner-approved commercial wording.
It prohibits inferred authenticity, material, origin, performance, stock,
warranty, delivery, review, rating, or other unsupported claims. Future assisted
translation must produce reviewable suggestions, never direct approval.

## R. CRM domain readiness

The application is prepared for an environment-driven private CRM origin using
`CRM_ORIGIN` and `CRM_ALLOWED_ORIGINS`. The documented future target is
`crm.andrelook.store`; `crm.andrelook.eu` is the later migration target.

Activation still requires separate owner authorization: validate the unused
host, add only the CRM origin variables to the isolated project, configure
Clerk origin/redirect allowlists, attach the hostname, apply only Vercel's exact
DNS target, wait for TLS, and retest signed-out, signed-in, mutation, proxy,
robots, and recovery behavior. Neither hostname was attached and DNS was not
changed in this phase.

## S. Responsive/accessibility

Authenticated browser verification covered dashboard, orders, catalog, and
product-editor surfaces at 320, 360, 375, 390, 414, 768, 1024, and 1440 px.
Every checked viewport reported zero document or main-content horizontal
overflow. Mobile orders switch to cards; catalog density grows from two to
three to four columns where space allows; source evidence progresses from one
to two to four columns.

The final QA fixes contained long catalog codes and long product identity text
at 320–390 px. Forms use native labels/fieldsets, controls retain visible focus,
and the layout remains usable with keyboard navigation and long Russian text.
No browser console warning or error remained.

## T. Security/privacy

- `/admin`, private queries, mutations, and the source-image proxy require the
  exact Clerk-authenticated owner and fail closed.
- `OWNER_EMAILS` remains the exact owner allowlist; authentication was not
  weakened or bypassed.
- Supplier URLs, source tokens, customer records, and private review data are
  absent from public DTOs and public page output.
- Image responses validate upstream status, type, and size.
- Staging remains `noindex, nofollow, nocache`; `robots.txt` disallows all
  crawlers and the staging sitemap is empty.
- Security headers remain active, and the secret scan found no tracked
  credential or private key.
- No custom domain is attached to the isolated staging project.

## U. Data integrity

Final staging data verification records:

- 63 products in the imported staging catalog;
- four and only four golden READY review products;
- 91 golden-product source references: 72 `NEEDS_REVIEW` and 19 `CANDIDATE`;
- 0 approved source references;
- 0 public `ProductImage` records;
- explicit publication approval false for all four golden products;
- 2 preserved NEW test requests and 2 customers;
- 0 payments;
- 1 expected active admin: `info.andrelook@gmail.com`.

Across the complete private catalog there are 1,431 source references: 173
`NEEDS_REVIEW` and 1,258 `CANDIDATE`. Phase 6D.1 performed no schema migration,
bulk catalog mutation, order mutation, product publication, or image approval.

## V. Tests/build/CI

The final clean reproducibility gate covers:

- fresh `npm ci`;
- `npm audit --audit-level=high`;
- Prettier;
- ESLint;
- strict TypeScript;
- the complete Vitest suite (20 files / 54 tests);
- Prisma schema validation;
- deployed migration status and migration synthesis;
- Next.js production build;
- local runtime route smoke tests;
- secret scan;
- `git diff --check`.

Earlier application-head GitHub Actions run `36306741045` completed successfully
at `c5ae2d47b626d02af3c2bf6afb5c7e0a67279b38`. The final completion record
identifies the required fully green run for the exact final documentation HEAD.

## W. Staging deployment

- Project: `andrelook-v1-staging`
- Project ID: `prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`
- Owner URL: <https://andrelook-v1-staging.vercel.app>
- Verified runtime deployment ID: `dpl_6GawSkpvynwbvJ9z64Y9JPbbmTaj`
- State: `READY`
- Runtime application commit:
  `c5ae2d47b626d02af3c2bf6afb5c7e0a67279b38`
- Runtime: Node.js 24 / Next.js 16.3.6

The final branch HEAD may be a later report-only commit. That distinction does
not make the deployed application stale: no runtime, dependency, schema, test,
CI, or environment file changes after the application commit. Only Vercel-owned
staging aliases are attached; there is no Andrelook production or CRM domain.

## X. Owner browser QA

Authenticated visual QA used the real allowlisted staging owner and covered:

- `Главная`, `Заказы`, both preserved order details, and `Каталог`;
- one unresolved catalog record;
- Dillon Down Jacket DLON, Jeordie Down Vest, Classical Wool Cardigan, and
  Saturn Light Fleece Shorts CP;
- content, commercial, sizes/colours, private source review, Studio readiness,
  and publication sections;
- the complete responsive matrix listed in section S.

The owner workflow was understandable in Russian, internal IDs remained
secondary, images loaded visually, image controls were clear, and no broken
placeholder, page error, console error, supplier URL leakage, accidental mass
approval, invented fact, or publication was found.

The final owner-session check also removed a legacy direct supplier-album link
from the private page and narrowed the product query to the non-URL supplier
fields the interface actually needs. Supplier URLs now remain server-only for
the authenticated image proxy rather than being serialized into owner-page
markup.

## Y. Remaining owner decisions

### Decisions that genuinely require the owner

1. Confirm identity/category and verified size evidence for each golden product.
2. Supply or approve price, currency, availability, delivery/preorder wording,
   sellable sizes, and localized colours.
3. Approve evidence-backed RU, ET, and EN customer copy.
4. Select source images and judge each Studio candidate side by side for exact
   product fidelity.
5. Give explicit publication approval only when every readiness gate passes.
6. Later authorize the CRM hostname and DNS cutover window separately.

### Implementation work that must not be pushed onto the owner

Engineering remains responsible for generating/uploading Studio candidates,
validating asset metadata and traceability, implementing the later premium
storefront, executing any authorized CRM-domain configuration, running tests,
and scaling an approved standard in controlled batches. The owner supplies
business and fidelity decisions, not technical deployment work.

## Z. Commits/artifacts

Phase 6D.1 commits before the final report-only commit:

- `e098451` — complete the Russian owner CRM workspace, private image proxy,
  Studio/copy/domain foundations, tests, loading/error states, and responsive
  system;
- `83df90c` — validate the Phase 6D.1 branch in CI;
- `fe99111` — finish Russian review copy and distinct photo-role labels;
- `c85b2f9` — contain mobile catalog cards;
- `c5ae2d4` — protect narrow CRM product layouts.

The final completion record identifies the later privacy-hardening and report
commits added after the owner-session leak check.

Key artifacts include:

- `src/app/(admin)/admin/**` owner workflows;
- `src/app/(admin)/admin/source-images/[id]/route.ts` and its tests;
- `src/components/admin-navigation.tsx`;
- `src/components/private-source-image.tsx`;
- `src/lib/admin/presentation.ts` and tests;
- `docs/andrelook-studio-standard.md`;
- `docs/product-copy-standard.md`;
- `docs/crm-domain-readiness.md`;
- this report.

## AA. Production untouched

Customer production remains the safety net at commit
`2115502fbc104a9de433006831a70c2f09e983c3`. The production worktree and remote
`andreipetrovw-oss/andrelook` main remained unchanged, and
<https://www.andrelook.store/> continued to respond normally. The apex and
`www` DNS answers remained on the recorded production Vercel targets.

No customer-production repository, branch, Vercel project, deployment,
environment variable, domain, alias, DNS record, or rollback infrastructure
was modified. `crm.andrelook.store` and `crm.andrelook.eu` remain unattached.

## AB. Recommended next step

Do not start the next phase automatically. The next logical authorized phase is
to close the remaining four-product owner decisions and finish the CRM workflow
on real approved evidence. After the CRM is complete, separately design and
implement the customer-facing Andrelook storefront so it materially exceeds
the current production site's visual and technical quality while preserving
the approved Andrelook identity. Then establish the final premium Studio
product-card standard against that storefront and scale only the proven,
owner-approved process across the catalog in controlled batches.
