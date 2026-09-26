# ANDRELOOK Phase 6D final report

Date: 27 September 2026 (Europe/Tallinn)

## A. Starting state

Phase 6D started from `phase6c-staging-storefront` at the required commit
`2a42452359e7762e75092f37bb7fe235d2a3d527`. The work continued in the normal
descendant branch `phase6d-owner-golden-products`. The Phase 6C storefront,
isolated Neon database, isolated Vercel Blob integration, request flow, CRM,
three locales, four READY review products, and public/private query boundary
were preserved.

## B. Branch/repository safety

- No rebase, force-push, main merge, or production-repository write occurred.
- Deployed implementation commit:
  `3a269f4440e46528ad88112a19d55397ca0af08f`.
- At final implementation verification, local HEAD and
  `origin/phase6d-owner-golden-products` matched that commit and the worktree
  was clean. The final user-facing completion report records the later
  documentation-only commit, if any.
- Preserved refs at final safety verification:
  - `origin/main`: `1709a6a89372e9c07f1f2137acc65afc2626fc59`
  - `origin/v1-foundation`: `8166ced8f3f718c57c35ff1c14f07c926f57597a`
  - `origin/phase6c-staging-storefront`:
    `2a42452359e7762e75092f37bb7fe235d2a3d527`
  - `origin/archive/pre-v1-prototype`:
    `1709a6a89372e9c07f1f2137acc65afc2626fc59`
  - `archive/pre-v1-1709a6a` tag object:
    `8eb0e98de8d4c9b635c0018baf9a08f110eb1ccd`, peeled to
    `1709a6a89372e9c07f1f2137acc65afc2626fc59`.

## C. Owner authentication

The existing Clerk-ready authorization architecture remains fail-closed.
Every `/admin` layout, private catalog query, and CRM/catalog mutation performs
server-side owner authorization. When staging auth is disabled, `/admin`,
`/admin/orders`, and `/admin/catalog` redirect to
`/sign-in?reason=not-configured`; no fallback password, seed owner, client-only
role check, or bypass was introduced.

Clerk activation is intentionally incomplete for two external owner inputs:

1. Vercel still returns `integration_terms_acceptance_required`. The owner must
   review and accept the Clerk Marketplace terms at
   <https://vercel.com/andreys-projects-a106cf89/~/integrations/accept-terms/clerk?source=cli>.
2. The exact owner-controlled email for `OWNER_EMAILS` has not been explicitly
   provided. It must not be inferred from repository, Git, or public contact
   data.

Until both are supplied, no authenticated owner session can or should be
created.

## D. CRM owner review

The CRM retains the Phase 6C overview, order list, order detail, status history,
payment/balance visibility, source/acquisition visibility, next-action display,
catalog readiness list, and protected private supplier evidence. Status and
payment mutations now share the active owner identity helper and remain
audited.

The two existing isolated requests remain NEW and intact. A real authenticated
owner review of `/admin`, `/admin/orders`, `/admin/orders/{id}`,
`/admin/catalog`, and `/admin/catalog/{id}` could not be completed without the
Clerk terms acceptance and exact allowlisted email. No authentication was
weakened to simulate that review.

## E. Golden product fact review

Four and only four golden products have structured review records:

| Product                       | Code                        | Source references | Commercial state                                | Owner state           |
| ----------------------------- | --------------------------- | ----------------: | ----------------------------------------------- | --------------------- |
| Dillon Down Jacket DLON       | `AL-SRC-CPREPSCN-218824597` |                21 | price, currency, availability and options unset | all decisions PENDING |
| Jeordie Down Vest             | `AL-SRC-CPREPSCN-200087445` |                33 | price, currency, availability and options unset | all decisions PENDING |
| Classical Wool Cardigan       | `AL-SRC-KINGCN-209196603`   |                 5 | price, currency, availability and options unset | all decisions PENDING |
| Saturn Light Fleece Shorts CP | `AL-SRC-CPREPSCN-161312256` |                32 | price, currency, availability and options unset | all decisions PENDING |

Identity/category, visual, size, commercial, localized content, options,
imagery, blocking issues, and explicit publication approval are represented as
separate owner decisions. Owner decisions are stored separately from source
facts. Existing verified size evidence remains visible; missing units remain
missing rather than being guessed. Cotton Goggle Beanie CP remains DRAFT.

## F. Golden image/source review

All 91 private source references were reviewed in local ignored contact sheets.
Seventy-two evidence-backed selections were assigned candidate roles and remain
`NEEDS_REVIEW`; none is APPROVED. Supported mappings are documented in
`docs/phase6d-image-review.md`.

- Dillon: size chart, primary, front, back, interior, supported details and
  branding. No supported side view was inferred.
- Jeordie: size chart, primary, front, back, interior, supported details and
  branding. No supported side view was inferred.
- Cardigan: size chart, primary, front, back and alternative worn view only.
- Saturn shorts: size chart, primary, front, back, source-visible alternatives,
  details and branding. Visible colours were not converted into sellable
  options.

Unselected references were not automatically rejected.

## G. Studio asset results

The strongest primary reference for each product was preserved locally as an
exact-pixel review candidate. Each already has a neutral, product-only
presentation. No generative transformation was applied because it could change
construction, logos, fabric, proportions or other product evidence. Local
review artifacts are ignored by Git and were not uploaded.

No Studio candidate is approved. No bulk transformation occurred.

## H. Fidelity review

The CRM now requires a source record that is already owner-approved, an
explicit SOURCE-versus-STUDIO fidelity checkbox, a public role, and RU/ET/EN alt
text before a candidate can enter public storage. It records the approving
admin, timestamp, source linkage, dimensions, storage key, role and localized
alt text in one audited transaction. Invalid/oversized images are rejected;
failed database writes remove the uploaded Blob.

The human fidelity decisions remain pending. All 72 candidates stay
`NEEDS_REVIEW` until the owner reviews silhouette, proportions, colour, logo,
hardware, seams, pockets, labels, material appearance and other visible detail.

## I. Public asset storage

The upload path targets the dedicated staging Blob namespace
`andrelook-v1/phase6d/...`. Public queries still select only `ProductImage`
records with both `reviewStatus=APPROVED` and a non-null `approvedAt`; they never
select supplier URLs or private source records.

Verified staging counts are:

- public `ProductImage` records for the golden set: **0**;
- approved public images: **0**;
- approved private source candidates in the golden set: **0**.

No supplier image was hotlinked into the storefront.

## J. Product card/page results

The real RU/ET/EN catalog and all four product routes render through the
protected READY review mechanism. Cards and pages deliberately retain the
existing `Images are awaiting owner review` and price-pending states. Category,
size guide, request surface and language switching work without exposing
private data. No public-image crop/gallery claim is made because no asset has
passed fidelity approval.

## K. Multilingual content

The owner workspace provides separate RU, ET and EN name/description fields.
Saving any localized content resets content and publication approval and writes
an audit event. The existing Phase 6C pending-review text remains in place; no
new material, performance, origin, authenticity, stock, delivery, warranty or
other unsupported claim was introduced.

## L. Commercial-field workflow

The protected workspace provides auditable inputs for retail price, currency,
availability, concise preorder/delivery text, selectable sizes and localized
colours. Values are validated server-side and every change records before/after
state and resets the relevant approval plus explicit publication approval.

All four products still have null price, currency and availability, zero
variants and zero owner-approved colour options. No commercial fact was
invented.

## M. Publication readiness

The new server-side gate requires all of the following at once:

- approved identity and category;
- complete RU/ET/EN content plus content approval;
- positive retail price, ISO-style three-letter currency, availability and
  commercial approval;
- at least one enabled option and options approval;
- approved, published size evidence plus size approval;
- an approved primary public image plus image approval;
- visual approval;
- no blocking issue;
- explicit owner publication approval.

Attempting the final owner approval before all gates pass aborts and rolls back
the transaction. No Phase 6D control publishes a product to production. All
four products remain `READY` for staging review only and explicitly blocked.

## N. End-to-end request/CRM test

The original two isolated Phase 6C requests remain intact, each with one NEW
status-history entry and exact product/size snapshots. Database totals are two
orders, two customers, zero payments and zero admin identities. No extra test
customer or order was created during Phase 6D.

The final authenticated request-to-owner-status-change replay is pending Clerk
activation. Existing unit/integration coverage verifies request snapshot
integrity and transactional status-history creation; the owner mutation was not
bypassed to manufacture a browser result.

## O. Responsive/accessibility

Local and deployed browser verification covered catalog and golden product
pages at 320, 360, 375, 390, 414, 768, 1024 and 1440 pixels. No horizontal
overflow, console error or page error was found. Automated WCAG A/AA auditing
reported zero violations; two placeholder text nodes were inconclusive because
the auditor could not calculate a gradient background colour.

The protected CRM layout and controls include responsive one-column states,
scrollable tables, native labels, keyboard focus, fieldsets and lazy-loaded
source evidence. Authenticated CRM browser verification at 390/768/1440 remains
pending owner authentication rather than being bypassed.

## P. Security/privacy

- Auth, private reads and all owner mutations fail closed.
- Supplier/source/customer data remains absent from public DTOs.
- Public assets require owner identity, approved source linkage and explicit
  fidelity confirmation.
- Public image uploads validate size, format, dimensions and metadata.
- Staging returns `X-Robots-Tag: noindex`; indexing remains disabled.
- Vercel project protection remains configured as
  `all_except_custom_domains`; exact deployment aliases challenge
  unauthenticated requests.
- No custom production domain is attached to the staging project.
- The secret scan found only documented placeholder/example database and empty
  auth-variable declarations. No credential or private key is tracked.

## Q. Tests/build/CI

The complete local gate passed from a fresh install:

- `npm ci`;
- `npm audit --audit-level=high`: zero vulnerabilities;
- Prettier check;
- ESLint;
- strict TypeScript;
- Vitest: 17 files, 46 tests, all passing;
- Prisma schema validation;
- deployed migration status and migration synthesis;
- Next.js production build;
- runtime route smoke tests;
- browser console/page-error checks;
- secret scan;
- `git diff --check`.

The first remote run identified a macOS/Linux optional-dependency lockfile
omission. The lock was corrected with explicit portable WASM runtime entries,
the clean gate was repeated, and GitHub Actions run `36271375194` completed
green at `3a269f4440e46528ad88112a19d55397ca0af08f`. The final completion message
records the CI run for the documentation-only final HEAD.

## R. Staging deployment

- Project: `andrelook-v1-staging`
- Project ID: `prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`
- Owner URL: <https://andrelook-v1-staging.vercel.app>
- Deployment ID: `dpl_Hpf3RSbFDVDeV3SnYjgwYqCBJDo6`
- Deployment state: `READY`
- Deployment commit metadata:
  `3a269f4440e46528ad88112a19d55397ca0af08f`
- Runtime: Node.js 24 / Next.js
- Aliases: Vercel-owned staging aliases only; custom project alias list is
  empty.

Authenticated-protection-bypass smoke tests returned 200 for RU, ET and EN
home/catalog, category and all four golden product routes; `/not-a-route`
returned 404. Admin routes remain fail-closed with the expected
`not-configured` redirect. `robots.txt` and `sitemap.xml` return 200 while
indexing stays disabled.

## S. Remaining owner decisions

Required before Phase 6D can perform its human-only checks:

1. Accept the Clerk Marketplace terms at the exact URL in section C.
2. Provide the exact owner-controlled email to allowlist; public contact and Git
   emails will not be inferred.
3. Sign in and review the two existing requests in the CRM.
4. Decide identity/category/size/content/commercial/options/visual/image status
   for each golden product.
5. Provide/approve price, currency, availability, preorder text, selectable
   sizes and localized colours.
6. Approve source-supported RU/ET/EN customer copy.
7. Compare each selected source against any Studio candidate and explicitly
   choose APPROVED, REJECTED or NEEDS REVISION.
8. Give explicit publication-readiness approval only after every server gate
   passes.

## T. Commits/artifacts

Implementation commits:

- `864ecb1` — audited owner controls, readiness schema/migration, protected
  mutations, tests and staging data tooling;
- `992e449` — owner review workspace, source-evidence mapping and responsive
  administration UI;
- `3a269f4` — cross-platform clean-install lockfile correction.

Key tracked artifacts:

- `prisma/migrations/20260926214500_phase6d_owner_review/migration.sql`;
- `src/lib/catalog/readiness.ts`;
- `src/lib/catalog/owner-control.ts`;
- `src/app/(admin)/admin/catalog/[id]/page.tsx`;
- `scripts/seed-phase6d-review.ts`;
- `scripts/seed-phase6d-image-candidates.ts`;
- `scripts/create-phase6d-contact-sheets.ts`;
- `docs/phase6d-image-review.md`;
- this report.

Private downloaded evidence/contact sheets remain ignored and untracked.

## U. Production untouched

The production repository `andreipetrovw-oss/andrelook` remains exactly
`2115502fbc104a9de433006831a70c2f09e983c3`; its local production worktree is
clean and matches `origin/main`. Production returned HTTP 200 at
<https://www.andrelook.store/>. The authoritative DNS still resolves the apex
to `76.76.21.21` and `www` to
`fdd5d99bf81c3aa7.vercel-dns-017.com`.

No production Git branch, Vercel project, deployment, environment variable,
DNS record, domain, alias or rollback infrastructure was changed. The isolated
staging project's custom alias list remains empty.

## V. Recommended Phase 6E

Do not begin Phase 6E yet. First complete the owner-only actions in section S
inside Phase 6D: activate exact-email Clerk access, perform the authenticated
CRM review, make explicit commercial/content/option decisions, complete human
fidelity review, upload only approved public assets, and rerun the golden
product request/status flow. Only then should a separately authorized Phase 6E
consider scaling the proven workflow beyond the four golden products. It should
still avoid automatic approval, unsupported claims and production cutover.
