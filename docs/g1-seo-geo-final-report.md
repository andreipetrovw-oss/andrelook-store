# Andrelook G1 — SEO + GEO / AI discovery foundation

Date: 2026-10-09

Branch: `growth-g1-seo-geo`

Accepted base: `73ccb9c395b661d1cae4d9d3bdc9c41049255bfc`
Implementation commit: `62fa8b83d34f648ddb9f9193385ec0b7b9ada33f`

## 1. Scope and safety

G1 was limited to organic discovery, machine-readable entity signals, two justified brand discovery pages and search-engine submission plumbing. The approved storefront visual system, hero, prices, size guides, product facts, CRM logic, Clerk, Resend, production order data and commercial database content were not changed.

The pre-existing untracked `docs/final-storefront-perfection-report.md` was preserved and excluded from G1 commits.

## 2. Before-state matrix

| Area                  | Verified before G1                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Production identity   | Live production deployment at accepted SHA `73ccb9c395b661d1cae4d9d3bdc9c41049255bfc`                                 |
| Public sitemap        | 117 canonical indexable URLs: 39 ET, 39 RU, 39 EN                                                                     |
| International SEO     | Self-canonical plus reciprocal ET/RU/EN and ET `x-default` on all 117 routes                                          |
| Route health          | All 117 sitemap routes returned HTTP 200; no canonical/lang/indexing defects                                          |
| Product schema        | 66 localized Product schemas (22 products × 3 languages)                                                              |
| Breadcrumb schema     | 66 localized PDP Breadcrumb schemas                                                                                   |
| Organization schema   | Present on localized public pages but without a stable entity `@id` or WebSite entity                                 |
| Public images         | 51 product assets plus relevant brand/hero assets; zero sampled HTTP/MIME failures                                    |
| Product image signals | Product JSON-LD used absolute URLs; primary image aligned with visible/OG/Twitter product image                       |
| Robots                | Production wildcard allowed public routes and disallowed admin; staging denied all                                    |
| Search Console        | No Andrelook property visible; no performance/indexation baseline available                                           |
| Organic presence      | Sampled `site:andrelook.store` returned no domain result; the name “Andrelook” collided with an unrelated eBay seller |
| AI visibility         | Andrelook mentioned 0/32 and linked 0/32 across the fixed ET/RU/EN ChatGPT web-search benchmark                       |
| Merchant eligibility  | No owner-supplied evidence sufficient to establish branded-product eligibility under Google policy                    |

## 3. Technical implementation

### Crawler policy

- Production now has explicit allow groups for `Googlebot`, `Bingbot` and `OAI-SearchBot`.
- `/admin`, `/api/` and `/sign-in` are disallowed for wildcard and named discovery crawlers; authentication/noindex remain the real CRM security controls.
- Staging and non-indexable environments still return a global `Disallow: /`.
- GPTBot policy was not independently changed. It remains governed by the existing wildcard policy: public pages allowed, private paths disallowed.

### Entity and structured data

- Organization now has a stable `/#organization` identifier, canonical name `Andrelook`, absolute logo ImageObject, public email/contact point, three supported languages, factual Tallinn/Estonia/Europe service area and only verified Instagram/Telegram profiles.
- The localized homepages now include WebSite structured data with a stable `/#website` identifier, canonical URL, publisher reference and ET/RU/EN language list.
- No address, telephone, legal name, SearchAction, review, rating, GTIN, MPN or unsupported official relationship was added.
- The visible FAQ page now emits FAQPage data derived directly from its visible localized question/answer sections.
- Existing Product, Offer and PDP Breadcrumb schemas were preserved. Offer values continue to use actual approved EUR price and availability only.

### Sitemap and image discovery

- Sitemap entries now include localized alternates, including `x-default`.
- Product entries include absolute URLs for every approved public product image and the real product update timestamp as `lastmod`.
- Sitemap remains environment-gated and contains only public catalog records; staging returns an empty sitemap.
- Draft/private research records, Tibb, CRM, sign-in, API routes and redirects remain excluded.
- Existing public image URLs were not renamed, recompressed, watermarked or modified.

### Search content and internal linking

- Added localized Moncler and Parajumpers hubs: six useful routes in total.
- Each hub aggregates only currently visible products and gives factual preorder and sizing-help context. It does not imply official partnership or authorization.
- Footer links and PDP brand links connect the hubs to the existing catalog graph.
- Existing six categories, service pages and PDPs were retained as the canonical answers for category, process, delivery, return and exact-model intent.
- No city doorway pages, mass keyword pages, generic “luxury” filler, inferred sizing advice or duplicate model guides were created.

### IndexNow and AI-readable resources

- Generated random 32-character IndexNow key `a883274803f59d872f0d0069f9b708ef` and root key endpoint.
- Added a deterministic utility that reads the production sitemap, accepts only canonical HTTPS URLs on `www.andrelook.store`, rejects query/hash/private/staging URLs, verifies the live key before sending and submits through the official endpoint.
- Dry-run on the pre-G1 production sitemap selected exactly 117/117 canonical public URLs and no private URLs. No live submission occurred before the key endpoint was deployed.
- Added a small factual `/llms.txt` pointing to canonical ET/RU/EN public resources. It is not treated as a ranking mechanism and exposes no hidden content.

## 4. Search-intent and content-gap result

The current-result audit supports distinct Moncler and Parajumpers brand/location intent, so the two brand hubs were warranted. Exact-model searches remain best served by the 22 PDPs. Broad winter/designer jacket, preorder, sizing and support intents are already served by existing category and information pages; creating more pages would increase cannibalization and doorway risk.

The query-by-query map is in [g1-search-intent-map.md](./g1-search-intent-map.md).

## 5. International, image and snippet result

- ET remains canonical `x-default`; ET/RU/EN routes stay separate and reciprocal.
- Brand hubs have natural localized titles, descriptions, H1s and visible body content.
- Product image alt text continues to come only from approved localized image records.
- Product structured-data images remain absolute and match the corresponding visible product/gallery signals.
- Homepage retains the approved Andrelook hero/social asset.
- No product imagery or visible storefront composition changed.

## 6. Search Console

A Domain property for `andrelook.store` was created/prepared in the available signed-in Search Console account. Verification is pending because authoritative DNS is managed at Zone and there was no active Zone session. Vercel DNS was inspected but correctly not modified because it is not authoritative.

Authoritative nameservers:

- `ns.zone.eu`
- `ns2.zone.ee`
- `ns3.zonedata.net`

Exact owner action:

1. In Zone DNS, add a root (`@`) TXT record with value `google-site-verification=APLq0akxmE_PSolX3omeVJB5bZ_b0YwHGH-kB4GJ3tg`.
2. Do not replace the existing root SPF TXT or any MX, Vercel, Clerk, Resend or mail record.
3. Return to the pending Search Console Domain-property dialog and click Verify after propagation.
4. Submit `https://www.andrelook.store/sitemap.xml`.
5. Inspect representative ET/RU/EN homepage, catalog, category, Maya, Parajumpers and information URLs after Google has crawled them. Immediate indexation is not promised.

## 7. Bing Webmaster Tools

Bing Webmaster Tools was reachable but not signed in. The sign-in screen requires the owner to choose which Google/Microsoft identity should own the property; no identity was guessed or transmitted.

Exact owner action:

1. Choose the intended long-term Andrelook owner identity in Bing Webmaster Tools.
2. Add/import `andrelook.store` after Search Console verification.
3. Submit `https://www.andrelook.store/sitemap.xml` and inspect representative localized URLs.

IndexNow technical discovery works independently of completing the Bing account setup.

## 8. Merchant Center policy gate

Google free-listing/Shopping submission remains blocked. Current Google Merchant policy prohibits counterfeit/non-authentic branded goods, and the supplied project record does not contain owner-provided eligibility/authenticity substantiation adequate for a compliant submission.

No Merchant Center account, feed or offer was created. Tibb and private research records were never eligible for any public feed.

Required owner action before this can change: provide documentary product-eligibility/compliance evidence and an explicit instruction to reassess. G1 must not infer authenticity from photos or attempt policy evasion.

## 9. Google Business Profile gate

No Business Profile was created. Google requires in-person customer contact during stated hours and excludes online-only businesses. Andrelook’s public pages support Tallinn handover, but the project record does not establish an eligible staffed storefront or a qualifying service-area operating model. The owner must confirm the real in-person operating model before any claim; no address was invented or exposed.

## 10. Visibility baselines

- ChatGPT web-search benchmark: 0/32 mentioned, 0/32 linked.
- Sampled organic search: no indexed `andrelook.store` result returned.
- Search Console clicks, impressions, positions and indexed-page count: unavailable until DNS verification.
- Bing clicks/indexation: unavailable until owner-selected sign-in and property setup.
- No ranking, citation, indexation or traffic outcome is promised.

The fixed prompts and sources are in [g1-ai-visibility-baseline.md](./g1-ai-visibility-baseline.md).

## 11. Validation

Local quality gate:

- clean `npm ci`: pass
- runtime `npm audit --omit=dev --audit-level=high`: 0 vulnerabilities
- Prettier: pass
- ESLint: pass
- strict TypeScript: pass
- Vitest: 87/87 pass across 28 files
- Prisma validation: pass
- migration script generation: pass
- optimized Next.js build: pass
- focused secret/private-data scan: pass
- new localized brand routes against isolated staging data: HTTP 200
- IndexNow dry-run allowlist: 117 canonical pre-G1 production URLs; zero private/staging/query URLs

The dependency tree still reports five high-severity development-only advisories during `npm ci`; runtime dependencies are clean. No unsafe forced upgrade was applied.

GitHub CI run `37891613778` passed on implementation commit `62fa8b83d34f648ddb9f9193385ec0b7b9ada33f`.

Initial isolated-staging acceptance:

- Vercel project: `andrelook-v1-staging` (`prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m`)
- Deployment: `dpl_37Tf3W1zqp2xm5A6gupH53dznZae`, Ready and protected by Vercel Authentication
- Localized home, all six brand hubs, representative catalog/category/PDP/information routes, `/robots.txt`, `/sitemap.xml`, `/llms.txt` and the IndexNow key endpoint: HTTP 200
- Staging robots: global `Disallow: /`; staging sitemap: empty
- Organization, WebSite, FAQPage, Product and BreadcrumbList JSON-LD: present on their intended sampled routes
- Brand hubs at 390 px and 1440 px: no horizontal overflow; product counts and localized headings rendered correctly
- Focused public-output scan: no supplier URL, source URL, cost, internal note, credential or customer-field leakage

## 12. Release evidence

The exact final branch/CI/deployment identities and production acceptance are recorded in the closing release response after isolated staging and production verification. This report is itself part of the release commit, so the closing response is the non-self-referential authority for the final commit SHA and deployment IDs. Production promotion is permitted only after exact-SHA staging acceptance. The legacy rollback resources and production data must remain intact.

## 13. Remaining owner-only actions

1. Add the one Search Console TXT at authoritative Zone DNS and complete Domain verification/sitemap submission.
2. Choose the long-term Bing Webmaster owner identity, then add/import the property and sitemap.
3. Supply branded-product eligibility/compliance evidence before any Merchant Center reassessment.
4. Confirm a Google Business Profile-eligible in-person operating model before any local profile is created.
5. Decide GPTBot training-crawl policy separately if a change is desired; G1 intentionally changed only OAI-SearchBot discovery treatment.
