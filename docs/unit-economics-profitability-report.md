# Andrelook unit economics and profitability

## Scope and semantics

- The 22 owner-supplied rows are private, versioned planning estimates effective 2026-10-11. They are not accounting truth.
- Public catalog prices are not written by the economics seed. The seed fails if an owner retail snapshot differs from the existing catalog price.
- Payment rate is 3% (300 bps) and target advertising rate is 10% (1,000 bps).
- The 10% target is used only for planning. Actual advertising expense comes only from recorded Meta/Google spend.
- “После условного распределения” is not stored or used because no formula was supplied.
- Existing orders are not backfilled. Future orders snapshot the effective economics version, source type, purchase estimate, logistics estimate, landed estimate and payment rate.
- Actual processor fees can be recorded on future payments. If absent, owner reporting clearly falls back to the order’s saved planning rate. Missing historical cost snapshots remain unknown.

## Validation and discrepancy report

All 22 supplied landed costs equal purchase plus logistics. No discrepancy exists in the owner-supplied purchase, logistics or landed values.

One retail discrepancy was found and is preserved rather than silently corrected: **AL-LEGACY-015 / Parajumpers Jayden Hybrid Cardigan has an owner planning retail snapshot of €189.00 while the current public catalog price is €219.00**. The private economics version uses the supplied €189.00 snapshot for its planning calculations. The public price remains €219.00 and is not overwritten. The CRM shows both values and flags the mismatch.

The owner did not supply separate expected values for payment cost, target ad cost, planned profit, planned margin, break-even CAC or break-even ROAS; the values below are fresh formula outputs, not silent corrections to an owner-derived column.

All money values are EUR. Margin is planned profit / retail. ROAS is retail / break-even CAC.

| Code          | Product                                      | Retail | Purchase | Logistics | Landed | Payment 3% | Target ad 10% | Planned profit | Margin | Break-even CAC | Break-even ROAS |
| ------------- | -------------------------------------------- | -----: | -------: | --------: | -----: | ---------: | ------------: | -------------: | -----: | -------------: | --------------: |
| AL-LEGACY-001 | Moncler Maya Down Jacket                     | 259.00 |    99.00 |     30.00 | 129.00 |       7.77 |         25.90 |          96.33 | 37.19% |         122.23 |          2.1190 |
| AL-LEGACY-002 | Parajumpers Tyrik Hooded Puffer Jacket       | 289.00 |   105.00 |     30.00 | 135.00 |       8.67 |         28.90 |         116.43 | 40.29% |         145.33 |          1.9886 |
| AL-LEGACY-003 | Moncler Vezere Down Jacket                   | 279.00 |   100.00 |     30.00 | 130.00 |       8.37 |         27.90 |         112.73 | 40.41% |         140.63 |          1.9839 |
| AL-LEGACY-004 | Moncler Bormes Down Vest                     | 229.00 |    58.00 |     22.00 |  80.00 |       6.87 |         22.90 |         119.23 | 52.07% |         142.13 |          1.6112 |
| AL-LEGACY-005 | Parajumpers Jeordie Down Vest                | 219.00 |    56.00 |     22.00 |  78.00 |       6.57 |         21.90 |         112.53 | 51.38% |         134.43 |          1.6291 |
| AL-LEGACY-007 | Moncler Galion Hooded Jacket                 | 219.00 |    60.00 |     20.00 |  80.00 |       6.57 |         21.90 |         110.53 | 50.47% |         132.43 |          1.6537 |
| AL-LEGACY-008 | Moncler Etiache Rain Jacket                  | 199.00 |    38.00 |     18.00 |  56.00 |       5.97 |         19.90 |         117.13 | 58.86% |         137.03 |          1.4522 |
| AL-LEGACY-009 | Moncler Cardigan Wool                        | 189.00 |    67.00 |     18.00 |  85.00 |       5.67 |         18.90 |          79.43 | 42.03% |          98.33 |          1.9221 |
| AL-LEGACY-010 | Moncler Gui Gilet                            | 199.00 |    38.00 |     18.00 |  56.00 |       5.97 |         19.90 |         117.13 | 58.86% |         137.03 |          1.4522 |
| AL-LEGACY-011 | Moncler Detachable Hood Cardigan             | 209.00 |    67.00 |     18.00 |  85.00 |       6.27 |         20.90 |          96.83 | 46.33% |         117.73 |          1.7752 |
| AL-LEGACY-012 | Parajumpers Pharrell Hooded Bomber           | 249.00 |    91.00 |     25.00 | 116.00 |       7.47 |         24.90 |         100.63 | 40.41% |         125.53 |          1.9836 |
| AL-LEGACY-013 | Moncler Après Ski Knit Sleeves Puffer Jacket | 239.00 |    80.00 |     22.00 | 102.00 |       7.17 |         23.90 |         105.93 | 44.32% |         129.83 |          1.8409 |
| AL-LEGACY-014 | Moncler Retro Knit Wool Cardigan             | 199.00 |    65.00 |     18.00 |  83.00 |       5.97 |         19.90 |          90.13 | 45.29% |         110.03 |          1.8086 |
| AL-LEGACY-015 | Parajumpers Jayden Hybrid Cardigan           | 189.00 |    62.00 |     18.00 |  80.00 |       5.67 |         18.90 |          84.43 | 44.67% |         103.33 |          1.8291 |
| AL-LEGACY-016 | Moncler Hooded Wool Cardigan                 | 219.00 |    78.00 |     20.00 |  98.00 |       6.57 |         21.90 |          92.53 | 42.25% |         114.43 |          1.9138 |
| AL-LEGACY-020 | Moncler Stripe Trim Zip Hoodie               | 149.00 |    28.00 |     15.00 |  43.00 |       4.47 |         14.90 |          86.63 | 58.14% |         101.53 |          1.4675 |
| AL-LEGACY-021 | Moncler Hera Logo Patch Sweatshirt           | 119.00 |    22.00 |     12.00 |  34.00 |       3.57 |         11.90 |          69.53 | 58.43% |          81.43 |          1.4614 |
| AL-LEGACY-017 | Moncler Basic T-Shirt                        |  69.00 |    14.00 |     10.00 |  24.00 |       2.07 |          6.90 |          36.03 | 52.22% |          42.93 |          1.6073 |
| AL-LEGACY-018 | Moncler Leather Badge T-Shirt                |  79.00 |    16.00 |     10.00 |  26.00 |       2.37 |          7.90 |          42.73 | 54.09% |          50.63 |          1.5603 |
| AL-LEGACY-019 | Moncler Blurred Logo T-Shirt                 |  79.00 |    16.00 |     10.00 |  26.00 |       2.37 |          7.90 |          42.73 | 54.09% |          50.63 |          1.5603 |
| AL-LEGACY-022 | Moncler Polo Shirt                           |  79.00 |    16.00 |     10.00 |  26.00 |       2.37 |          7.90 |          42.73 | 54.09% |          50.63 |          1.5603 |
| AL-LEGACY-023 | Moncler Logo Patch Swimming Shorts           |  69.00 |    20.00 |     10.00 |  30.00 |       2.07 |          6.90 |          30.03 | 43.52% |          36.93 |          1.8684 |

## Owner CRM

`/admin/profitability` is Clerk-protected and owner-allowlisted. It reports all requested planning and actual fields per SKU. `/admin/advertising` now distinguishes revenue, contribution before ads, actual ad spend and contribution after ads at source/campaign/ad level. Spend can be assigned to a SKU only when the owner knows it is directly attributable; unassigned spend is never guessed onto products.

The public DTOs and routes do not query or serialize the economics table. No advertising campaign is created or activated by this work.
