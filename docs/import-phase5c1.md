# Phase 5C1 import contract

The source catalog remains outside this public Git repository because it contains private supplier/source information.

## Fixed validation

- SHA-256: `5cd48ecb73f0480604adb0607fef78590a6b8a50a091001df30584b88c03ce21`
- 63 products
- 1,431 source-image relationships
- 60 verified size charts
- 57 catalog candidates
- 6 review-before-catalog records

Dry run reads, checksums, structurally validates, and reconciles the file without importing or contacting a database.

Write mode requires `--write` plus `--target development` or `--target staging`; production is not an accepted target. It upserts by `internalCode`, refreshes private source-image relationships, preserves provenance and review state, and refuses to overwrite a published product or chart.

## Deliberately not inferred

- public/SEO slug;
- RU/ET/EN customer name or description;
- retail price or margin;
- availability/preorder state;
- variants, actual sizes, or stock;
- public images or colours;
- claims, approval, or publication.

Category/subcategory rows are internal taxonomy scaffolding. Source brand labels remain in private provenance rather than becoming an approved public `Brand` automatically.
