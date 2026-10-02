# Phase 6D storefront completion plan

Starting point: `2a42452359e7762e75092f37bb7fe235d2a3d527` on the normal descendant branch `phase6d-storefront-completion`.

## Audit conclusion

The Phase 6C storefront has the correct safety model, public DTO boundary, localized routing, request service, and core Andrelook tokens. Its visible experience is still a foundation: navigation is sparse, catalog browsing has no controls, the product page has limited hierarchy, missing photography reads as a temporary state, and the support/legal information architecture is absent.

The live site's restrained palette, original logo, Outfit/Cormorant typography, editorial scale, warm neutral surfaces, uppercase navigation, full-bleed hero, and calm product presentation remain the visual authority. Unverified statistics, reviews, scarcity, and commercial claims are explicitly excluded.

## Implementation sequence

1. Refine tokens, typography, spacing, controls, states, and responsive rules without changing the brand.
2. Complete header/mobile navigation, footer, home, catalog controls, category context, cards, product gallery, size guide, product content, and request UX.
3. Add localized support/information routes with clearly marked owner/legal approval boundaries.
4. Preserve the existing public query/DTO boundary; extend only safe customer-input handling.
5. Complete localized metadata, structured data, robots, and sitemap behavior while staging stays non-indexable.
6. Validate unit/integration/security boundaries, build/runtime, accessibility, responsive layouts, isolated staging deployment, and production immutability.

Photography is deliberately excluded. Existing approved public images remain supported; missing imagery uses a neutral, non-representational Andrelook placeholder with stable final dimensions.
