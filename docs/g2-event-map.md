# Andrelook G2 event map

## Browser events

Browser events contain no customer/contact data. They fire only on the production host, only when measurement is explicitly enabled, and only after the relevant consent.

| Event             | Trigger                      | Business purpose          |
| ----------------- | ---------------------------- | ------------------------- |
| `view_item_list`  | catalog/category view        | catalog discovery         |
| `select_item`     | product-card selection       | product interest          |
| `view_item`       | product detail view          | product interest          |
| `size_help`       | sizing-help selection        | sizing friction           |
| `preorder_open`   | valid request drawer open    | request intent            |
| `preorder_submit` | successful request response  | request conversion funnel |
| `contact_click`   | email/Instagram contact link | assisted contact          |
| `telegram_click`  | Telegram contact link        | assisted contact          |

GA4 uses these lower-case event names. Meta maps the request event to a Lead-compatible event and other events to non-PII content/custom measurement. No external event is sent from staging.

## Server business events

| Event                                            | Durable trigger                        | Amount                                            |
| ------------------------------------------------ | -------------------------------------- | ------------------------------------------------- |
| `LEAD_CREATED`                                   | successful idempotent order creation   | none                                              |
| `LEAD_CONTACTED`                                 | owner changes status to contacted      | none                                              |
| `LEAD_CONFIRMED`                                 | owner confirms order                   | none                                              |
| `AWAITING_PAYMENT`                               | lifecycle status                       | none                                              |
| `PAID`                                           | first authoritative transition to paid | confirmed total or immutable item price snapshots |
| `ORDERED` / `IN_TRANSIT` / `READY` / `DELIVERED` | lifecycle status                       | none                                              |
| `CANCELLED`                                      | lifecycle status                       | none                                              |

Revenue is the sum of unique `PAID` event keys inside the selected period. A status named PAID does not create revenue by itself. Refunds do not create positive revenue events.
