# Verified customer reviews V1

Base: accepted production `36c56eb30657c7e6c7e3d8347106025182a32a5b`.
Release branch: `codex/verified-customer-reviews`.

## Entitlement and owner workflow

One delivered real order grants one review, either service feedback or a review
of one purchased item selected by the customer. The product association is read
from that order's items on the server. A review cannot be created by a public
product/order ID. Known acceptance orders and explicit test markers are excluded.

The existing order page contains the review status, copy-request action, submitted
review, publish action and collapsed moderation/link controls. The order list has
one compact review column. Only copying/preparing a request sets its actual
`requestedAt`; merely visiting an order does not. No messages are sent.

Delivery through the existing owner order-status action creates an invitation.
For pre-existing delivered orders, `scripts/enable-review-invitations.ts` is an
idempotent, server-only backfill. It creates no reviews, request dates or messages.
At the release baseline there were six real orders and **zero DELIVERED orders**.
Their statuses must not be changed to enable invitations prematurely.

## Credentials and privacy

Review links use a separate random 256-bit token. The database stores a SHA-256
digest for lookup and an AES-256-GCM encrypted copy for authorized owner use.
Encryption is domain-separated from tracking credentials using the existing
server-only encryption secret. No new external service or credential is required.
Regeneration replaces the digest; revocation immediately blocks access. Neither
operation resets a submitted review or permits a second review.

The token page is noindex, excluded from robots/sitemap, and sets no-referrer.
It uses no login/email/phone and does not load storefront analytics. Read and
submission attempts use independent persistent 15-minute address/token limits.
Errors are generic. Inputs are validated server-side; text is rendered as text,
with length and markup limits. Next.js Server Actions supply same-origin CSRF
checks. All owner mutations authenticate server-side before accessing data.

The independent public DTO includes only public review ID, chosen safe display
name, rating, review text, original language/date and optional product context.
It excludes order/customer IDs, contacts, credentials, notes, payments, supplier
and shipment information. Publishing contact information is blocked pending
privacy redaction. Safe names are first name, first name plus initial, or a
localized anonymous label; social handles and contact strings are not defaults.

## Moderation and publication

Submissions always start as SUBMITTED. PUBLISHED is an explicit owner action.
Publish, unpublish, reject and privacy edits are audited with authenticated actor,
timestamp and reason. Privacy edits preserve `originalText` and the previous
public version, and return the review to review status before republication.
Low ratings are accepted normally and included in published aggregates. The UI
states that a low rating alone is not grounds for rejecting a review.

Publication invalidates all localized home/review/product surfaces. The public
reviews index is rendered dynamically to show current publication state. Home and
PDP retain their existing revalidation behavior with explicit invalidation.
Historical product names are retained if a catalog product is removed.

## Public surfaces and SEO

Public pages: `/et/reviews`, `/ru/reviews`, `/en/reviews`, with canonical/hreflang,
localized metadata, provenance copy and a footer discovery link. Review text stays
in its original language, marked with the correct `lang` attribute.

The homepage has a restrained review section below existing content. The approved
hero is untouched. Empty states contain no stars, count or invented average.
Published product reviews appear on the relevant PDP. Product JSON-LD contains
exactly the visible eligible product reviews and their calculated aggregate.
Service reviews do not add a self-serving Organization/LocalBusiness rating.
No rich-result eligibility is promised. Policy reference:
https://developers.google.com/search/docs/appearance/structured-data/review-snippet

Optional review photos are deferred; V1 is text-first, avoiding an unprovisioned
upload/storage surface. No photo upload field or unsafe file endpoint exists.

## Validation and staging fixture

Focused coverage includes eligibility, token security/rotation/revocation,
submission/replay, bounds/XSS, product ownership, moderation/audit, auth, public
DTO privacy, aggregation/schema, localization/copy, empty surfaces and rate limits.
The full suite contains 248 passing tests. Formatting, ESLint, strict TypeScript,
Prisma validation, production build and runtime dependency audit are release gates.

Migration: `20261022120000_verified_customer_reviews`, additive only. It adds
ReviewInvitation, CustomerReview, ReviewModerationHistory and ReviewRateLimit;
existing business tables have no data rewrite. Staging schema comparison reports
older, unrelated Studio tables/enum additions; these are preserved. There is no
reviews-table mismatch and no destructive schema synchronization is performed.

Staging baseline: 0 orders, 0 customers, 0 payments, 0 status-history rows,
1 shipment, 0 tracking events, 2 provider records and 0 logistics evidence.
One explicitly named `TEST-UAT-REVIEWS-V1` order and review exercise the workflow.
The fixture entitlement is allowed only for that exact reference in the existing
isolated staging project's Preview environment. Production always rejects it.
The cleanup script is also bound to the exact existing staging database host.
No fixture or synthetic review is copied to production.

Browser UAT covers ET/RU/EN at 390, 430, 768 and 1440 pixels; invitation, submission,
success, owner request/submission/publication status, visible aggregates, homepage,
PDP, matching JSON-LD, moderation and removal, token invalidation and privacy.
Release identities, final fixture cleanup and pre/post business counts are recorded
in the final release report accompanying this commit.

## Release and rollback

Require green CI on the final branch HEAD, then that exact SHA on isolated staging,
then the additive production migration and production deployment of the same SHA.
Never merge to main or modify DNS/provider/measurement configuration for this task.
Rollback application deployment remains the previous accepted production revision;
the additive reviews tables can remain in place. Do not drop tables during rollback.
