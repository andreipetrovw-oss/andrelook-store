# Andrelook G2 attribution model

## Purpose and boundary

G2 measures which business source and campaign creates an enquiry and later revenue. It does not change storefront content, product data, prices, ordering rules, or production identities. Existing orders are not backfilled with invented attribution.

## Attribution window

- Window: 30 days from the first stored touch.
- First touch: created once and never replaced inside the active window.
- Last touch: replaced only by a meaningful new campaign, click ID, or external referrer. Direct/internal navigation never overwrites it.
- Expiry: a visit after expiry starts a new first/last pair.
- Submission: the current pair is validated server-side and copied into the order's one-to-one `OrderAttribution` record. It is immutable after submission.
- No optional consent: the browser stores no attribution. The order receives only a contextual, identifier-free direct/referral snapshot derived at submission.

## Canonical business taxonomy

| Source                                 | Group         | Meaning                                                       |
| -------------------------------------- | ------------- | ------------------------------------------------------------- |
| `META_ADS`                             | paid          | Meta/Facebook/Instagram paid traffic                          |
| `GOOGLE_ADS`                           | paid          | Google paid traffic                                           |
| `INSTAGRAM_ORGANIC`                    | organic       | Unpaid Instagram traffic                                      |
| `FACEBOOK_ORGANIC`                     | organic       | Unpaid Facebook traffic                                       |
| `GOOGLE_ORGANIC`                       | organic       | Unpaid Google search                                          |
| `BING_ORGANIC`                         | organic       | Unpaid Bing search                                            |
| `AI_CHATGPT`                           | organic       | Supported AI-assistant referrers                              |
| `TELEGRAM` / `EMAIL`                   | owned         | Andrelook-owned communication                                 |
| `REFERRAL` / `PARTNER` / `MARKETPLACE` | referral      | External partner/referral traffic                             |
| `DIRECT`                               | direct        | No meaningful external attribution                            |
| `OTHER` / `UNKNOWN`                    | other/unknown | Data present but not safely classifiable, or historic unknown |

## Deterministic priority

1. Explicit paid medium plus known platform source.
2. `gclid` or `fbclid`.
3. Explicit organic/owned source.
4. Known AI/search/social referrer.
5. Other external referrer.
6. Direct.

Technical click IDs and raw UTM/event IDs are stored only where consent permits and are not displayed in the normal CRM interface.

## Durable business events

`LEAD_CREATED` is written in the order transaction. Status changes produce lifecycle events. The first transition to `PAID` writes one idempotent revenue event keyed by order ID, using the confirmed total or the immutable item price snapshots. Later fulfilment states cannot multiply revenue. The controlled production acceptance test order remains excluded by the shared business-order filter.

## Date semantics

- Leads and confirmed leads: order date.
- Paid and revenue: first authoritative PAID business-event date.
- Spend: spend-entry date.
- Currency: G2 owner entry is EUR only; no currency inference or conversion.

## Privacy and isolation

Necessary storage remembers the privacy choice. Attribution persistence, GA4, and Meta are optional and consent-aware. External scripts are fail-closed unless both an identifier and `NEXT_PUBLIC_MEASUREMENT_ENABLED=true` exist, and a hard host gate permits only `andrelook.store` or `www.andrelook.store`. Preview, staging, and localhost cannot emit production analytics.
