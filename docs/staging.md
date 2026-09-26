# Staging readiness and configuration boundary

No Vercel project, database, storage service, Git connection, domain, DNS record, alias, or production environment variable is created or changed in Phase 6B.

## Required before an isolated staging deployment

1. Owner selects/approves a PostgreSQL provider and supplies a staging-only `DATABASE_URL`.
2. Owner selects/approves Clerk and provides staging publishable/secret keys plus `OWNER_EMAILS`.
3. Create a new Vercel project connected only to `andrelook-store` / `v1-foundation`.
4. Use a temporary `*.vercel.app` URL as `NEXT_PUBLIC_SITE_URL`.
5. Keep `INDEXING_ENABLED=false`.
6. Apply committed migrations with `npm run db:migrate:deploy`.
7. Run the Phase 5C1 import only with `--write --target staging` against the staging database.
8. Verify all imported products are `DRAFT`, no source/private fields are public, and `/admin` rejects non-allowlisted users.
9. Do not attach `andrelook.store` or `www.andrelook.store`.

The approved public image-storage provider/origin remains an owner decision. Until configured, the foundation publishes no supplier images.
