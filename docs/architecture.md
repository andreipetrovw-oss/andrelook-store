# V1 foundation architecture

## Boundaries

- `src/app`: App Router pages, layouts, metadata routes, and the single request proxy.
- `src/components`: reusable storefront/CRM presentation components.
- `src/config`: isolated settings such as supported/default locales.
- `src/i18n`: server-only dictionaries.
- `src/lib/catalog/public-*`: deliberately limited storefront data contract.
- `src/lib/catalog/private-*`: owner-authorized catalog access.
- `src/lib/auth`: provider adapter and pure allowlist policy.
- `src/lib/db.ts`: the only Prisma construction point.
- `prisma`: schema and immutable migrations.
- `scripts`: offline/development administration such as Phase 5C1 import.

Server Components read directly from the data-access layer. UI mutations will use Server Actions that validate input and re-authorize the owner. Route Handlers are reserved for external integrations/webhooks. Node.js is the default runtime.

## Public/private rule

The public selector does not join `ProductPrivate`, `ProductSourceImage`, `SizeChartEvidence`, customers, orders, payments, or administrator records. A pure mapper creates the final customer DTO. Tests inject forbidden fields into a source object and prove none survive serialization.

Private catalog functions call `requireOwner()` before obtaining or querying the Prisma client. Navigation visibility is not treated as authorization.

## Publication completeness

The DTO mapper refuses a product that lacks any of:

- published-query eligibility;
- stable slug;
- explicit availability;
- retail price and currency;
- requested locale translation;
- localized category.

Only owner-approved public images, colours, and published/approved size-chart data are selected. Phase 5C1 imports do not create these public records.
