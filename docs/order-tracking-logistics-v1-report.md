# Andrelook Order Tracking & Logistics System v1

## Release identity

- Branch: `codex/order-tracking-logistics-v1`
- Base production commit: `e895f39f5cfc1041f07268c6710f220cf027275d`
- Final commit, CI, staging deployment and production deployment: pending release closeout

## Implemented system

- Additive `Shipment`, `OrderShipment`, `TrackingEvent`, provider-record,
  override, notification and public-lookup rate-limit models.
- One physical shipment can link to many orders. One order can link to ordered
  inbound and outbound shipment legs.
- Website and owner-created orders receive the same Andrelook order number,
  high-entropy public tracking token, shipment links and milestone notification
  infrastructure.
- Owner-only Logistics CRM supports creating one master shipment, attaching
  existing orders, recording evidence-backed operational milestones, auditing
  manual overrides, configuring an owner-confirmed ETA and creating a local
  outbound leg.
- Public `/track` lookup requires order number plus matching customer email.
  Direct `/track/<token>` links use a 256-bit opaque token. Both surfaces are
  `noindex`, excluded by robots and absent from the sitemap.

## Tracking evidence and provider design

- 17TRACK API v2.4 is the primary adapter. It supports registration,
  `gettrackinfo`, `gettracklist` fallback, Standard real-time reconciliation and
  authenticated webhook ingestion.
- Ship24 is an independent fallback adapter with tracker registration/query and
  bearer-authenticated webhook ingestion.
- Primary and fallback health, carrier identity, raw status and sync timestamps
  are stored separately. Complete immutable provider responses remain private.
- Provider events are idempotent. Newer strongly supported physical events can
  advance status; automatic backward movement is rejected; contradictions set a
  persistent owner-review flag.
- `Not Found` is not treated as shipment failure or physical movement.
- Staleness is derived from the last confirmed movement (or shipment
  registration when no movement exists), is shown only in CRM and never creates
  a customer-facing event.
- ETA is displayed only when supplied by a provider or entered by the owner with
  an evidence note. No historical or predictive ETA is fabricated.
- Operational events record one of the internal evidence sources
  `OWNER_CONFIRMED`, `WAREHOUSE_CONFIRMED` or `MANUAL_OVERRIDE`. Provider and
  local-carrier events retain their own evidence types.

## Privacy and customer isolation

- Public queries do not select master tracking numbers, raw locations, provider
  payloads, provider credentials, linked customers or linked orders.
- Only an owner-approved local outbound carrier name/number can be exposed.
- Shared inbound progress can appear on each linked order, while the active
  customer status follows that order's highest-sequence shipment leg.
- Tracking pages do not load the storefront measurement components, so secure
  tracking tokens and logistics paths are not sent to GA4, Meta or first-party
  analytics.
- Provider errors are sanitized before storage. Provider secrets are server-only
  and never included in logs, public responses or client bundles.

## Notifications

- Meaningful milestones only: logistics handoff, arrival at Andrelook, ready for
  handover, local-carrier dispatch, delivered and genuine exception.
- Notifications use the existing Resend setup and link only to the secure
  Andrelook tracking page.
- Database uniqueness plus Resend idempotency keys prevent duplicate milestone
  email delivery across webhook retries and scheduled reconciliation.
- Provider failure cannot roll back order persistence or customer status.

## Validation completed locally

- Formatting: passed
- ESLint: passed
- Strict TypeScript: passed
- Tests: 161 passed across 45 files
- Prisma schema validation: passed
- Optimized production build: passed
- Runtime dependency audit: zero vulnerabilities
- Secret scan: no new credential value detected
- Pilot tracking number: absent from source and client output
- `/track` visual QA: 390, 430, 768 and 1440 px; no horizontal overflow,
  readable controls, correct focusable labels and no console warnings/errors
- React review: server components retained for data pages; the only new client
  component is the small `useActionState` lookup form; no new client data
  waterfalls or global state were introduced

## External release gate

Provider credentials are not currently configured in either the existing
staging or production Vercel project. Therefore the provider adapters fail
closed and the owner-supplied pilot shipment has not been registered, queried or
linked. No customer/order/provider data has been invented.

Owner-only setup still required:

1. Add `SEVENTEEN_TRACK_API_TOKEN` as a server-only secret to the existing
   staging Preview environment and, after staging acceptance, to Production.
2. Configure the 17TRACK webhook URL as `/api/webhooks/17track` on the applicable
   Andrelook host. The endpoint verifies the provider's `sign` header.
3. For fallback validation, add `SHIP24_API_KEY` and
   `SHIP24_WEBHOOK_SECRET` server-side and configure `/api/webhooks/ship24`.
4. Enter the three real orders/customers in CRM only where they do not already
   exist, then create the master shipment once and attach those orders. No
   customer facts should be supplied in source code or chat.

Until those owner actions are complete, pilot/provider verification and the
production release remain intentionally blocked.
