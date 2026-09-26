# Andrelook v1 foundation

This repository contains the clean Next.js foundation for the future Andrelook storefront and owner-only CRM. It is being developed separately from the live static production website. Phase 6B does not replace or deploy production.

## Stack

- Next.js 16 App Router and strict TypeScript
- React 19
- PostgreSQL and Prisma
- Clerk-ready, email-allowlisted owner authentication (disabled and fail-closed until configured)
- Vitest, ESLint, Prettier, and GitHub Actions

The application uses one `src/` tree. Server Components read directly through server-only data-access modules. UI mutations will use Server Actions. Route Handlers are reserved for genuine external HTTP boundaries.

## Requirements

- Node.js 24 or newer
- npm
- PostgreSQL for schema migration/import work
- A Clerk project and explicit owner email allowlist before `/admin` can be accessed

## Local setup

1. Copy `.env.example` to `.env.local` and replace placeholders with development values.
2. Install exactly the locked dependencies with `npm ci`.
3. Generate the Prisma client with `npm run db:generate`.
4. Apply migrations to a development database with `npm run db:migrate:deploy`.
5. Start the app with `npm run dev`.

`AUTH_PROVIDER=disabled` is intentional by default. It keeps `/admin` inaccessible until Clerk keys and at least one `OWNER_EMAILS` entry are configured. Public registration must remain disabled in the provider dashboard.

## Verification

```bash
npm ci
npm audit --audit-level=high
npm run format:check
npm run lint
npm run typecheck
npm run test:run
DATABASE_URL='postgresql://schema:validation@127.0.0.1:5432/schema' npm run db:validate
DATABASE_URL='postgresql://schema:validation@127.0.0.1:5432/schema' npm run db:migration:script
npm run build
```

The CI workflow runs the same static gates. Applying the migration itself requires an isolated PostgreSQL instance.

## Phase 5C1 import

The master catalog is intentionally not committed because it contains private supplier/source information. Dry-run validation is the default:

```bash
npm run import:phase5 -- --file /absolute/path/to/final-master-catalog.json
```

A write is accepted only with a development or staging target:

```bash
npm run import:phase5 -- \
  --file /absolute/path/to/final-master-catalog.json \
  --write \
  --target development
```

All imported products remain `DRAFT`; public slugs, translations, public images, availability, stock, retail prices, and claims are not inferred.

## Routes

- `/ru/`, `/et/`, `/en/`
- `/{locale}/catalog/`
- `/{locale}/catalog/{categorySlug}/`
- `/{locale}/catalog/{categorySlug}/{productSlug}/`
- `/admin`, `/admin/orders`, `/admin/catalog` (owner only)
- `/sign-in` (provider configuration/sign-in boundary)

RU is the provisional root and `x-default` locale in `src/config/locales.ts`. Legacy production redirects are deliberately not implemented.

## Documentation

- `docs/architecture.md`
- `docs/authentication.md`
- `docs/import-phase5c1.md`
- `docs/visual-system.md`
- `docs/andrelook-studio-standard.md`
- `docs/staging.md`
- `docs/phase6b-report.md`

## Safety

Do not connect this branch to the current production Vercel project or production domains. Do not place supplier URLs, costs, private source images, customer data, or secrets in public components, props, metadata, logs, or analytics.
