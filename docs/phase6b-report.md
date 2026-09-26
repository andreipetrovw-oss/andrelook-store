# Phase 6B final report

Date: 2026-09-26  
Branch: `v1-foundation`  
Audited predecessor: `1709a6a89372e9c07f1f2137acc65afc2626fc59`

## A. Repository preservation

- Remote default branch was `main`; its verified pre-v1 HEAD matched the Phase 6A reference exactly.
- Annotated tag `archive/pre-v1-1709a6a` has tag object `8eb0e98de8d4c9b635c0018baf9a08f110eb1ccd` and peels to the audited commit.
- Archive branch `archive/pre-v1-prototype` points to the audited commit.
- Complete bare mirror: `/Users/mac/Documents/ChatGPT/Andrelook/phase6b-preservation/andrelook-store-pre-v1.git`.
- Complete Git bundle: `/Users/mac/Documents/ChatGPT/Andrelook/phase6b-preservation/andrelook-store-pre-v1.bundle` (133,531 bytes; SHA-256 `63c77f44f9cd8959b7b97ed1f69323b4ac13d88f4c3663e5add4ec76cb499a1b`).
- `git bundle verify` confirms complete history and the expected `main`, archive branch, archive tag, and HEAD refs.
- No history was rewritten, force-pushed, or deleted. `v1-foundation` is a normal descendant branch.

## B. Clean scaffold

The malformed legacy application was replaced in the explicit scaffold commit `db224d5736bbdd9723b1e5507105daaddd1c2906`. The result uses Next.js App Router, one strict-TypeScript `src/` tree, Node.js runtime, ESLint, Prettier, Vitest, environment validation, locked npm dependencies, and GitHub Actions. Legacy duplicate root/source trees, old dependency baggage, demo assets, client-side admin auth, fixtures, and seed credentials were not carried forward.

## C. Dependency and security state

- Locked foundation: Next.js 16.3.6, React/ReactDOM 19.2.8, Clerk 7.9.7, Prisma client/tooling 6.12.0, Zod 4.6.5, TypeScript 5.9.3, and Vitest 5.0.2.
- Prisma 6.12.0 is deliberately pinned because the newer lines evaluated during the build reported high-severity dependency findings; the selected lockfile reports zero vulnerabilities.
- ESLint 9.39.5 is the latest peer-compatible line for the current Next.js ESLint dependency graph. ESLint 10 was evaluated and rejected because three current upstream plugins declare it outside their peer ranges. This compatibility constraint should be revisited when the Next.js lint stack supports ESLint 10.
- `npm audit --audit-level=high`: zero vulnerabilities.
- Security headers disable framing and MIME sniffing, restrict referrers and browser permissions, and remove the framework-powered header.
- A repository secret-pattern scan found no credentials/private keys. The private Phase 5C1 source artifact is not committed.

## D. Database and schema implementation

PostgreSQL/Prisma models cover Category, CategoryTranslation, Brand, Product, ProductTranslation, ProductPrivate, ProductSourceImage, ProductImage, ProductImageTranslation, ProductColor, ProductColorTranslation, SizeChart, SizeChartEvidence, ProductVariant, Customer, Order, OrderItem, Payment, OrderStatusHistory, and AdminUser. Constrained enums implement locales, publication/availability/review states, order status, contact method, acquisition channel, payment kind, and image role. Monetary values use integer minor units plus three-character ISO currency.

The schema validates, the committed initial migration generates cleanly, and it was applied successfully to an isolated local PostgreSQL 16 database.

## E. Authentication boundary

The owner boundary is Clerk-ready but defaults to `AUTH_PROVIDER=disabled`, which fails closed. Server-side identity resolution requires an authenticated provider identity whose normalized primary email exactly matches `OWNER_EMAILS`. The `/admin` layout and private queries authorize on the server; public registration, hardcoded passwords, seed identities, and client-only role checks do not exist. Runtime checks confirmed `/admin`, `/admin/orders`, and `/admin/catalog` redirect to `/sign-in?reason=not-configured` while disabled.

## F. Public/private data boundary

Public queries use an explicit Prisma selection and a deliberately constructed `PublicProductDto`; they never select private provenance, costs, source images, customers, orders, payments, or admin records. Publication completeness requires a published record, stable slug, explicit availability, retail price/currency, requested-locale translation, and localized category. Private catalog access calls `requireOwner()` before obtaining/querying Prisma. Leakage tests inject supplier identity/URLs/costs, landed cost, margin, notes, private source images, and customer information and prove none serialize publicly.

## G. Multilingual routing

The foundation implements `/ru`, `/et`, `/en`, localized catalog/category/product routes, server-rendered dictionaries, locale validation, unsupported-locale 404 behavior, self-canonicals, distinct RU/ET/EN hreflang URLs, and an isolated provisional RU root/`x-default` setting. Runtime checks confirmed correct `html lang`, canonical, and alternate output. Legacy production redirects are deliberately absent.

## H. Phase 5C1 import result

Dry-run validation reconciles SHA-256 `5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21` with 63 products, 1,431 source-image relationships, 60 verified charts, 57 catalog candidates, and 6 review-before-catalog records.

The importer was then run twice against an isolated development PostgreSQL database. Both writes reconciled identically, demonstrating idempotence. Database verification returned 63 products, all 63 `DRAFT`; 1,431 private source images; 60 nonpublic size charts; and zero public images, translations, variants, customers, or orders. It preserves provenance/evidence privately, refuses production as a target, and refuses to overwrite published owner content. It infers no price, availability, stock, size, description, public image, claim, approval, or publication.

## I. Visual-system extraction

`docs/visual-system.md` records the production typography, colors, spacing, header/navigation, catalog grid, product cards, product detail/gallery, buttons, language controls, footer, responsive rules, and accessibility behavior. Reusable tokens/components reproduce that contract without proposing a redesign. The logo and hero asset copies are byte-identical to production; no product/source images were copied or altered.

## J. Andrelook Studio Standard

`docs/andrelook-studio-standard.md` specifies hanging-garment, flat-lay/surface-garment, and product/accessory templates, including aspect, framing, background, scale, margins, camera angle, shadows, lighting, cropping, sequences, minimum quality, provenance, and acceptance/rejection criteria. It explicitly prohibits inventing or changing product facts or visible characteristics. No source image was transformed and no public product image was generated.

## K. CRM foundation

Server-protected structural routes exist at `/admin`, `/admin/orders`, and `/admin/catalog`. The approved order state machine is `NEW`, `CONTACTED`, `CONFIRMED`, `AWAITING_PAYMENT`, `PAID`, `ORDERED`, `IN_TRANSIT`, `READY`, `DELIVERED`, `CANCELLED`. The shell contains no fixture customer/order data and remains intentionally scoped to one owner and early order volume.

## L. Test and build results

- Clean `npm ci`: pass.
- Formatting and ESLint: pass.
- Strict TypeScript: pass.
- Vitest: 5 files / 13 tests pass; 83.75% statements, 72.97% branches, 85.18% functions, 83.54% lines.
- Public/private leakage and owner-policy tests: pass.
- Prisma schema and migration-script generation: pass; real isolated migration application: pass.
- Import checksum/dry run: pass; isolated write/repeat/count verification: pass.
- Production build: pass; all expected App Router routes emitted.
- Runtime smoke test: RU/ET/EN home/catalog 200; unsupported/missing records 404; root 307 to `/ru`; disabled admin routes 307 to sign-in; robots/sitemap 200; staging robots disallow all; security headers present.
- Dependency audit and secret scan: pass.

## M. Staging readiness

The repository has an environment contract, migration/import commands, indexing-off default, CI, and a documented isolated-staging sequence. No external staging project or service was created because database, authentication, and storage providers/credentials require owner decisions. Any future staging project must use a temporary URL, a staging-only database/auth application, `INDEXING_ENABLED=false`, and must not attach either production domain.

## N. Remaining owner decisions

1. Approve/select the staging PostgreSQL provider and supply a staging-only `DATABASE_URL`.
2. Approve Clerk (or choose another supported passwordless/OAuth provider), create a nonproduction tenant, disable public sign-up, and provide staging keys plus exact owner allowlist email(s).
3. Approve a public product-image storage/origin and its retention/access policy.
4. Decide whether RU remains the root/`x-default` locale before cutover.
5. Authorize a separate staging-infrastructure phase; only then connect `andrelook-store` / `v1-foundation` to a new nonproduction project.

## O. Commits, branches, and artifacts

- Development branch: `v1-foundation`.
- Scaffold commit: `db224d5736bbdd9723b1e5507105daaddd1c2906`.
- Foundation implementation commit: `b3aeae3d69a0b9df791cc77022ff01f77439cb8b`.
- This report is committed separately after the implementation so the implementation SHA can be recorded without ambiguity; its exact commit is included in the final Phase 6B handoff.
- Preservation branch, tag, mirror, bundle, and checksums are listed in section A.
- Technical artifacts include the schema/migration, importer/tests, auth/data boundaries, locale routes, visual tokens/components, studio standard, CI, setup and staging documentation.

## P. Production untouched

The production repository remains clean at `2115502fbc104a9de433006831a70c2f09e983c3`, matching its `origin/main`. Phase 6B made no production repository, code, Vercel project, deployment, Git connection, environment-variable, DNS, domain, or alias change. The live production website remains the safety net.

Phase 6B stops here. It does not include deployment/cutover, publication of the 63 products, customer copy/pricing/availability, checkout/payments/advertising, or product-image transformation/generation.
