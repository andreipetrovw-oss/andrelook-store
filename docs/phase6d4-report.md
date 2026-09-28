# ANDRELOOK Phase 6D.4 — Generative Studio Golden Master report

Status: engineering-complete for private owner fidelity review. Nothing in this report is owner-approved, public or published.

## A. Starting state and scope

- Work continued from the verified Phase 6D.3 HEAD `bc3e473a46b8efc34994dba5882257fdff087c3c` on the normal descendant branch `phase6d4-generative-studio-master`.
- Scope remained locked to Dillon (`AL-SRC-CPREPSCN-218824597`, product ID `cmuijykya0048sbca9yq22r2n`).
- Jeordie, Classical, Saturn and the remaining catalog were not processed.
- The Phase 6D.3 source-pixel cutouts were not treated as Golden Master inputs. They remain private audit artifacts and are now explicitly rejected/superseded.

## B. Owner direction implemented

- The Golden Master direction is controlled multi-reference generative reconstruction: premium e-commerce studio photography, realistic garment volume, warm neutral Andrelook background, consistent lighting/scale and one coherent physical jacket.
- Attractive appearance alone was not an acceptance criterion. Every surviving view was compared against physical evidence for silhouette, proportions, quilting, seams, collar, yellow closure, snaps, zipper/pulls, pockets, cuffs/hem, sleeve patch, material, back construction, interior, labels and orange details.
- No source-pixel cutout was promoted, and no unsupported three-quarter/side view was synthesized.

## C. Complete evidence and invariant map

All 21 private Dillon references remain in the evidence pack. The stored invariant map covers:

- positions 2–4: full front/back silhouette, proportions, quilting and sleeve geometry;
- positions 5–9: open interior, lining, zipper, cuff and pocket construction;
- positions 10–14: collar cord, cuffs/snaps, yellow closure, collar opening and zipper hardware;
- positions 15–21: mesh pocket, story/identity/QR/care/material labels, SHEEN/size label and orange loop;
- position 1: private size-chart context only; it supplies no visual garment geometry or commercial fact.

Each active candidate stores its exact primary/supporting source relationships, full invariant map, generation-input positions, iteration history, fidelity findings, uncertainty notes, unsupported claims, dimensions, SHA-256 and method.

## D. Final private candidate set

All masters are native 1122×1402 PNGs, within 0.03% of 4:5, on a consistent warm-neutral background. They were not artificially upscaled.

| Role     | Version | Exact generation/source evidence     | Iteration result                                                                                       | State          |
| -------- | ------: | ------------------------------------ | ------------------------------------------------------------------------------------------------------ | -------------- |
| PRIMARY  |       2 | primary 2; supporting 3, 4, 12, 14   | Pass 2 corrected proportion, pocket position and baffle geometry; pass 1 superseded                    | `NEEDS_REVIEW` |
| FRONT    |       2 | primary 3; supporting 2, 11, 12, 14  | First controlled front pass survived cross-set review                                                  | `NEEDS_REVIEW` |
| BACK     |       2 | primary 4; supporting 3, 8, 10, 13   | First controlled back pass survived cross-set review                                                   | `NEEDS_REVIEW` |
| INTERIOR |       2 | primary 5; supporting 6, 9, 15, 21   | Passes 1–2 rejected for false secondary microtext; pass 3 tucked unsupported copy out of readable view | `NEEDS_REVIEW` |
| BRANDING |       1 | primary 12; supporting 2, 3, 11, 14  | Signature collar-detail pass survived cross-set review                                                 | `NEEDS_REVIEW` |
| HARDWARE |       1 | primary 14; supporting 3, 10, 11, 12 | Zipper/material-detail pass survived cross-set review                                                  | `NEEDS_REVIEW` |

Method for every active candidate: `CONTROLLED_GENERATIVE_MULTI_REFERENCE_RECONSTRUCTION_V1`.

## E. Exact asset checksums

| Role        |     Bytes | SHA-256                                                            |
| ----------- | --------: | ------------------------------------------------------------------ |
| PRIMARY v2  | 1,995,479 | `6e35e70b2634bc871f4b0ce296c58e75f90eae4175e63eed96f9d8f03404df9d` |
| FRONT v2    | 1,887,633 | `35886ae9fdeb74a81d7dd020274c1824a771bc1c8fd6bd2e1aa7f0ee79fe0d51` |
| BACK v2     | 1,719,312 | `f3030381ba8609f8cb17bfbee0b87f5056a1974eb616b7b9eb3da9d2ace2b04a` |
| INTERIOR v2 | 1,817,953 | `8b07c30ace2e5cfe4c429e546fb210cd15a5fcd997555b52b3554af5bb0638b2` |
| BRANDING v1 | 2,182,818 | `3ee18e39dd9f33767709a751da37f592606acda88a321ebc27529a54a324195a` |
| HARDWARE v1 | 2,744,040 | `0fe275e523af186d29e1a690aa1147a099e995aba924febfb813943aca53a301` |

## F. Generation and rejection history

- PRIMARY pass 1 was preserved as a rejected local engineering artifact after pass 2 improved source proportion, pocket and baffle fidelity.
- INTERIOR pass 1 was rejected because it generated readable secondary label text.
- INTERIOR pass 2 removed the loose center care label but still rendered false story-label microtext and was rejected.
- INTERIOR pass 3 kept the source-backed pocket/label attachment but tucked the secondary woven label so unsupported text is not presented as evidence.
- No rejected pass was uploaded as an active Studio candidate, owner-approved or converted to a public asset.

## G. Final fidelity findings

- PRIMARY/FRONT: short boxy proportions, full sleeves/hem, broad baffles, front pocket placement, high collar, yellow closure, two-way zipper and sleeve-patch placement are supported by the full-product and detail evidence.
- BACK: rear baffle rhythm, shoulder/sleeve seams, collar construction, orange center stitch and straight hem are supported; no rear branding, pocket or hood was added.
- INTERIOR: gray lining, black lower panels, asymmetric pockets, orange tab, mesh/yellow detail, zipper and top label stack are source-supported. Secondary copy is intentionally not shown as readable.
- BRANDING/HARDWARE: yellow webbing, snap, black edging, collar volume, pull tape, two-way zipper sliders and shell texture are supported. Tiny marks remain explicit owner-review points.
- The six views use the same dark navy-black satin relationship, warm background, light direction, puff language and product proportions. No candidate was retained merely because it looked attractive.

## H. Remaining uncertainty requiring owner review

- Compare the small sleeve patch, snap face, pull marks and top interior label typography at 100%.
- Confirm the dark navy/black appearance across the owner’s calibrated display; source white balance varies and no commercial colour name is asserted.
- Reject any candidate if full-resolution inspection reveals a mark, stitch, pull, label or construction detail that differs from the private source.

## I. CRM and candidate handling

- The owner workspace shows only non-rejected candidates in the active generated set.
- Each active card exposes role/version, method, exact source positions, uncertainty, invariant map, iteration history, full-resolution route, 17-point fidelity checklist, note field and the three existing decisions.
- Rejected Phase 6D.3 source-pixel experiments are in a collapsed, clearly labeled audit archive and cannot be selected for the storefront previews.
- The card and product-page previews select the newest non-rejected PRIMARY, currently generative PRIMARY v2.
- Authentication, authorization and same-origin private image proxy boundaries are unchanged.

## J. Database and storage result

- Six Phase 6D.4 candidates were uploaded to the separate private Studio Blob store.
- Four Phase 6D.3 candidates were changed from `NEEDS_REVIEW` to `REJECTED` with an explicit superseded/obsolete engineering note.
- Dillon state: 6 `NEEDS_REVIEW`, 4 `REJECTED`, 0 `OWNER_APPROVED` Studio candidates.
- Dillon public ProductImages: 0. Total staging public ProductImages: 0.
- Dillon remains `READY`, with `publishedAt = null`.
- All Studio candidates in the database belong to Dillon; other Golden products have zero candidates.

## K. Staging data integrity

- Products: 63.
- Dillon private sources: 21.
- Orders: 4; payments: 1; customers: 4; active admin identities: 1.
- Existing isolated test request/order data remained intact.
- No price, stock, availability, colour, authenticity, composition, origin, localized commercial claim or publication approval was created.

## L. Security and public/private boundary

- Private source and Studio bytes remain behind Clerk owner authorization and the same-origin proxy.
- Direct private Blob URLs and supplier URLs are not serialized into public DTOs.
- The import is scope-locked to Dillon, refuses a published Dillon record, refuses to supersede an owner-approved legacy candidate and never creates a ProductImage.
- Indexing remains disabled and Deployment Protection remains required on isolated staging.

## M. Tests, CI and deployment

- The complete local quality, database, build, security and runtime gate is required before branch push.
- GitHub Actions must be green for the exact final remote branch HEAD.
- Deployment is limited to the existing isolated Vercel project `andrelook-v1-staging` (`prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`).
- Exact final CI run, remote HEAD and Ready deployment are recorded in the final owner handoff because a tracked report cannot embed the SHA of the commit that contains itself.

## N. Owner review entry point

- Stable staging owner route: `https://andrelook-v1-staging.vercel.app/admin/catalog/cmuijykya0048sbca9yq22r2n#photos`.
- Review every active candidate against the linked source evidence at full resolution, then inspect the private card and product-page previews on desktop and mobile.
- Do not approve a candidate solely because it is visually attractive. Approval requires exact physical-product fidelity.

## O. Approval and public state

- Owner-approved Studio candidates: 0.
- Public ProductImages: 0.
- Published Dillon pages: 0.
- The six active candidates remain private `NEEDS_REVIEW` records until the owner makes explicit decisions in the CRM.

## P. Production safety and stop condition

- No production repository, Vercel project, environment, domain, DNS, alias or deployment was changed.
- No preserved branch or archive ref was rebased, reset, force-pushed or merged.
- Phase 6D.4 stops after isolated staging verification for explicit owner visual approval. Phase 6E, bulk generation, public promotion and production work remain out of scope.
