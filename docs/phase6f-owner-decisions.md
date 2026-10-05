# Phase 6F.1 consolidated owner decision sheet

Complete this sheet only for facts that require owner authority. Confirmed global Phase 6F rules are already implemented and are intentionally omitted.

## 1. Retail prices

Provide the final customer-facing EUR price for each of the 23 launch products. No supplier cost or inferred margin will be converted into a retail price.

| Legacy ID | Product                                      | Retail price EUR |
| --------: | -------------------------------------------- | ---------------: |
|         1 | Moncler Maya Down Jacket                     |                  |
|         2 | Parajumpers Tyrik Hooded Puffer Jacket       |                  |
|         3 | Moncler Vezere Down Jacket                   |                  |
|         4 | Moncler Bormes Down Vest                     |                  |
|         5 | Parajumpers Jeordie Down Vest                |                  |
|         6 | Moncler Tibb Logo-Patch Padded Gilet         |                  |
|         7 | Moncler Galion Hooded Jacket                 |                  |
|         8 | Moncler Etiache Rain Jacket                  |                  |
|         9 | Moncler Cardigan Wool                        |                  |
|        10 | Moncler Gui Gilet                            |                  |
|        11 | Moncler Detachable Hood Cardigan             |                  |
|        12 | Parajumpers Pharrell Hooded Bomber           |                  |
|        13 | Moncler Après Ski Knit Sleeves Puffer Jacket |                  |
|        14 | Moncler Retro Knit Wool Cardigan             |                  |
|        15 | Parajumpers Jayden Hybrid Cardigan           |                  |
|        16 | Moncler Hooded Wool Cardigan                 |                  |
|        17 | Moncler Basic T-Shirt                        |                  |
|        18 | Moncler Leather Badge T-Shirt                |                  |
|        19 | Moncler Blurred Logo T-Shirt                 |                  |
|        20 | Moncler Stripe Trim Zip Hoodie               |                  |
|        21 | Moncler Hera Logo Patch Sweatshirt           |                  |
|        22 | Moncler Polo Shirt                           |                  |
|        23 | Moncler Logo Patch Swimming Shorts           |                  |

## 2. Six unresolved size-chart identities (optional before cutover)

Confirm the exact source/size chart for legacy IDs 6, 9, 13, 19, 20 and 22, or explicitly approve a launch workflow with personal sizing help and no selectable chart-backed size for the affected product. Phase 6F will not attach similarity-based charts automatically.

The customer storefront now gives these six products a complete personal sizing-help path, so this decision does not block owner UAT.

## 3. Legal and returns facts

Provide the legal business name, registration number, registered/contact address and owner-approved return/exchange policy wording required for public Terms, Privacy and Returns pages. Current staging will not invent them.

## 4. Facebook

Provide the exact approved Facebook page/profile URL if Facebook should be offered as a contact/social channel. No Facebook link will be guessed.

## 5. Production email sender

The isolated staging Resend resource and audited notification path are configured for `info.andrelook@gmail.com`. Resend currently rejects delivery to that address while the resource is in sandbox/onboarding mode: its test sender may deliver only to the Vercel-account address `andrei.petrovw@gmail.com` until a sending domain is verified.

For owner notifications to become operational at `info.andrelook@gmail.com`, approve a sender identity on a domain you control and the exact Resend DNS verification records. This is intentionally deferred because Phase 6F does not modify production DNS. After verification, replace the staging `onboarding@resend.dev` sender with the approved domain sender and rerun the three notification acceptance scenarios.

## 6. Delivery cost

Confirm whether customer delivery is free, quoted per order, or follows another policy. The implemented customer flow confirms the delivery method and cost before payment and does not invent a fixed shipping price.

## 7. Final storefront domain

Confirm the final customer-facing domain only when production cutover is authorized. Phase 6F.1 remains isolated on the Andrelook V1 staging project and does not change either production domain.

## Decision status

- **Storefront ready:** Phase 6F.1 can reach owner UAT without the decisions above.
- **Production cutover ready:** No. Retail prices, legal seller facts and approved policies, delivery-cost policy, final domain and notification sender/domain remain owner-controlled inputs. The optional Facebook URL and six chart decisions may be completed independently.
