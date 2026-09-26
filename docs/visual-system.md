# Current-production visual system contract

Source: stable production repository at `2115502fbc104a9de433006831a70c2f09e983c3`. This document records the approved presentation to port; it does not propose a redesign.

## Tokens

| Role                      | Current value                        |
| ------------------------- | ------------------------------------ |
| Canvas                    | `#F5F2ED`                            |
| Warm surface              | `#EDE9E2`                            |
| Card                      | `#FFFFFF`                            |
| Primary ink / dark footer | `#1C1C1A`                            |
| Mid ink                   | `#4A4844`                            |
| Muted ink                 | `#625E58`                            |
| Light ink                 | `#706B64`                            |
| Border                    | `#DDD8D0`                            |
| Strong border             | `#C8C2B8`                            |
| Brown-green accent        | `#3D3028`                            |
| Soft accent               | `#F0EBE6`                            |
| Gold accent               | `#806945`                            |
| Editorial type            | Cormorant Garamond, Georgia fallback |
| Interface type            | Outfit, system sans fallback         |
| Maximum content width     | `1360px`                             |
| Header height             | `80px`                               |
| Motion curve              | `cubic-bezier(0.22, 1, 0.36, 1)`     |

These tokens are implemented in `src/styles/tokens.css`. Font hosting/loading is a later asset/privacy decision; the families and fallbacks are already encoded.

## Composition patterns

- Header: slim sticky/fixed editorial header, original Andrelook logo at approximately 48px high, uppercase widely tracked navigation, segmented RU/EN/ET control, bordered/scrolled state.
- Hero: full-bleed approved photography, dark restrained overlay, very large serif/wordmark scale, fine rules and uppercase supporting text, central light CTA.
- Sections: generous clamp-based vertical spacing and container padding.
- Catalog: oversized serif heading, understated uppercase context, sticky/horizontal filters when eventually implemented.
- Grid: three desktop columns, two tablet/mobile columns retained down to 320px, narrow gaps.
- Product cards: 4:5 image surface, editorial italic product name, small gold uppercase category, simple ruled footer, restrained elevation/zoom on hover.
- Product detail: two-column gallery/information composition, collapsing to one column at 1024px.
- Buttons: compact uppercase labels with wide tracking, dark/light fills, restrained transitions.
- Language controls: real links, active state with dark fill, accessible label and focus state.
- Footer: dark three-column composition, inverted logo treatment, compact contact/navigation lists, divided lower bar.

## Responsive and accessibility behavior

- Desktop navigation yields to a native-details mobile menu at 768px.
- Grids use `minmax(0, 1fr)` to prevent content overflow.
- Page padding reduces at 400px while preserving two catalog columns.
- Focus-visible uses a 3px gold outline with offset.
- Semantic headers, navigation labels, headings, links, and real language URLs are required.
- Product images require dimensions, meaningful localized alt text, and `next/image` once the approved storage origin is configured.
- Reduced-motion preference collapses animations/transitions and disables smooth scrolling.

The copied logo and hero files are byte-identical to production assets. No product image or supplier image was copied, edited, transformed, or generated.
