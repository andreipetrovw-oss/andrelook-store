# Andrelook G2 UTM standard

Use lowercase ASCII values and underscores. Never place customer names, email addresses, phone numbers, order references, or other personal data in UTMs.

## Required campaign fields

| Field          | Rule                                         | Example                                                           |
| -------------- | -------------------------------------------- | ----------------------------------------------------------------- |
| `utm_source`   | platform/business source                     | `instagram`, `facebook`, `google`, `telegram`, `email`, `partner` |
| `utm_medium`   | distribution method                          | `paid_social`, `cpc`, `organic_social`, `email`, `referral`       |
| `utm_campaign` | durable campaign name                        | `autumn_2026_preorder`                                            |
| `utm_content`  | optional creative/placement label            | `maya_video_01`                                                   |
| `utm_term`     | optional search term/group; no personal data | `moncler_jacket`                                                  |

Optional Andrelook labels `utm_adset` and `utm_ad` may identify business-readable ad set and creative names. Platform click IDs remain technical fields and stay hidden from normal CRM UI.

## Paid-source examples

```text
?utm_source=instagram&utm_medium=paid_social&utm_campaign=autumn_2026_preorder&utm_content=maya_video_01
?utm_source=google&utm_medium=cpc&utm_campaign=brand_search_ee&utm_term=andrelook
```

## Governance

- Reuse a campaign name for the same business campaign; do not create spelling variants.
- Change `utm_content` for creative tests, not `utm_campaign`.
- Do not overwrite first touch with direct/internal navigation.
- Owner-entered spend must use the same source and campaign spelling shown in incoming links.
- Historic orders without evidence remain `UNKNOWN`; no inferred backfill.
