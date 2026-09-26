# Phase 6C image pipeline

## Trust boundary

The storefront image lifecycle is deliberately one-way:

1. `ProductSourceImage` — private supplier/source evidence. It may contain a
   private URL, supplier ordering context, and source sequence. It is available
   only through owner-authorized catalog queries.
2. Reviewed source — the owner has assessed the source evidence, but it is
   still private and is not a storefront asset.
3. `ProductImage` with an approved review state — a separately stored public
   derivative linked to its source evidence by `sourceImageId`.
4. Storefront asset — selected only when the image review state is approved and
   all public fields required by the DTO are present.

The public query never selects `ProductPrivate` or `ProductSourceImage`. It also
filters `ProductImage` before the DTO is built. A supplier URL therefore cannot
become a public image URL merely by changing a product publication state.

## Public asset contract

Each public asset records:

- product association and optional private-source association;
- role (`PRIMARY`, front, back, side, interior, detail, branding, size chart);
- sort order;
- storage URL and storage key;
- intrinsic width and height;
- localized alternative text;
- explicit review state.

The Vercel image configuration accepts only the dedicated Andrelook public Blob
hostname/path. Source hosts are not permitted. The dedicated Blob store is empty
in Phase 6C because no product photograph has received explicit owner approval.

## Studio review procedure

For each future asset, the owner should:

1. open the private source evidence in the protected catalog record;
2. choose only an angle actually supported by that evidence;
3. create the Studio-normalized derivative without changing product
   construction, logos, labels, hardware, stitching, materials, proportions, or
   colour;
4. upload the derivative to the dedicated public Blob store;
5. record role, order, dimensions, source identity, and localized alt content;
6. mark the asset approved only after a side-by-side fidelity review;
7. verify the card crop and full product gallery in staging;
8. publish the product only after content, price, availability, size data, and
   required imagery pass their independent readiness gates.

Missing angles remain missing. Phase 6C does not transform or publish the 1,431
private source-image references.
