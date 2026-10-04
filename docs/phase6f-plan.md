# Phase 6F implementation plan

1. Preserve every legacy source photo, create reproducible optimized derivatives, and verify hashes/dimensions and product association.
2. Add a versioned 23-product launch manifest and a canonical extractor for the 17 mapped Phase 5C1 charts.
3. Extend the Prisma model for fulfilment, addresses, payment preference, sizing help, notification delivery and customer contact detail without weakening private/public boundaries.
4. Import the 23 legacy products into isolated staging as protected review records, keep all 63 supplier records intact, and remove the four supplier review records from the customer launch surface by returning them to `DRAFT`.
5. Rework the homepage, catalog, cards and product pages around the real photographed launch assortment and confirmed preorder/service model.
6. Rebuild the request form with progressive delivery/contact fields, quantity, preferred language, measurement help and UTM capture while preserving idempotency.
7. Add server-only Resend notification delivery and CRM notification state; email failure must never roll back a stored order.
8. Port the useful Phase 6D.1 order-operations presentation into the Phase 6E descendant and expose all launch fields/history in the owner CRM.
9. Rewrite RU/ET/EN support/payment/delivery/order copy from confirmed facts only and preserve legal owner blockers in one decision sheet.
10. Run clean quality, migration, privacy, visual, responsive, performance and end-to-end staging gates; push only `phase6f-commercial-launch`; require branch HEAD = green CI SHA = isolated staging SHA.

The publication gate remains fail-closed. Missing owner prices, legal terms or unresolved size evidence will never be invented to make a product appear launch-ready.
