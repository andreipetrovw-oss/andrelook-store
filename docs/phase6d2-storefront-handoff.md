# Phase 6D.2 storefront handoff contract

Phase 6E may consume only the approved public catalog boundary. It must not query private supplier tables or CRM records.

## Public product contract

The existing `PublicProductDto` is the authoritative server-to-storefront contract. A customer-facing product/card receives only:

- immutable product ID and version;
- locale-selected name, description, and short description;
- approved slug and category name/slug;
- optional approved brand name/slug;
- retail price in minor units and ISO currency;
- approved availability state and optional preorder estimate;
- approved customer colours with localized names;
- approved, localized public images with role, dimensions, URL, and alt text;
- a published size chart when available.

The locale-aware card URL is constructed as:

`/{locale}/catalog/{category.slug}/{product.slug}`

The reusable card can therefore present an approved primary image, customer-facing name, category, price, availability/preorder state, an optional concise UI status label, and a clean localized URL. The status label is presentation derived from the approved availability state; it must not invent stock or delivery promises.

## Publication boundary

Normal public queries require `PUBLISHED`, a non-null approved price/currency/availability, localized content, and approved public assets. The protected local-review scope is a separate engineering tool and is not a publication shortcut.

An owner-approved Studio derivative becomes a public image only after:

1. the exact private source is selected and approved;
2. the derivative is compared side by side to that source;
3. fidelity is explicitly confirmed by the owner;
4. the file is stored in the separate public asset store;
5. the public record is approved with localized alt text.

## Forbidden data

Phase 6E must never receive supplier URLs, supplier albums, source tokens, source-image paths, source payloads, supplier or landed costs, margins, internal notes, owner audit data, customer records, order data, payment data, or admin identities. Serialization tests enforce this deny-list boundary.

## Readiness gates

A product remains unavailable to the public until identity, category, size, commercial data, options, RU/ET/EN content, public imagery, visual fidelity, absence of blocking issues, and explicit owner publication approval all pass. A missing owner decision is a blocker, not a value to infer.
