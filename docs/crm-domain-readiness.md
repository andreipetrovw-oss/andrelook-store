# CRM domain readiness

Status: configuration preparation only. Phase 6D.1 does not attach a domain or change DNS.

## Intended hosts

- current intended private CRM host: `crm.andrelook.store`
- future preferred private CRM host: `crm.andrelook.eu`
- current staging owner URL remains `https://andrelook-v1-staging.vercel.app/admin`

`CRM_ORIGIN` is the absolute private CRM origin used by server configuration. `CRM_ALLOWED_ORIGINS` is a comma-separated hostname list used by Next.js Server Actions when the CRM is served through an approved host or proxy. Neither variable changes routing or DNS by itself.

## Authorized cutover procedure — not executed

1. Owner explicitly authorizes the selected CRM hostname and a maintenance window.
2. Confirm the hostname is not used by another service and capture existing authoritative DNS answers.
3. Add `CRM_ORIGIN=https://crm.andrelook.store` and `CRM_ALLOWED_ORIGINS=crm.andrelook.store` only to the isolated CRM/staging Vercel project.
4. In the Clerk instance dedicated to this CRM, add the new origin and allowed redirect URLs for `/sign-in` and `/admin`. Keep the exact owner allowlist unchanged.
5. Attach `crm.andrelook.store` to the intended Vercel project and copy the exact DNS target Vercel presents for that project.
6. Add only the required DNS record at the authoritative provider. Do not alter apex or `www` production records.
7. Wait for Vercel domain verification and TLS to become ready.
8. Verify signed-out redirect, owner sign-in, allowlist rejection, authenticated `/admin`, Server Actions, private image proxy, noindex/robots, and Deployment Protection behaviour on the CRM hostname.
9. Retain the staging Vercel URL as a recovery path until the owner separately approves any later cleanup.

For `crm.andrelook.eu`, repeat the same sequence using a Clerk redirect/origin entry and `CRM_ALLOWED_ORIGINS=crm.andrelook.eu`. Never reuse customer-production database, Blob, Clerk, or environment credentials merely because the hostname shares the Andrelook brand.

## Separation rule

Customer storefront and CRM share application code today but remain separate security surfaces: storefront routes use public DTOs; `/admin` and `/admin/source-images/*` require the exact owner identity server-side. A later domain split can route only the private host to the CRM project without changing customer storefront URLs.
