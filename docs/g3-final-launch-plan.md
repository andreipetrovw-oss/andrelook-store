# Andrelook G3 final launch plan

Date: 2026-10-11. Baseline production SHA at G3 start: `d92113abddd81d94b4932726e8fda3652c983a41`.

## A. BUSINESS ANALYSIS

The frozen storefront already supports a complete pre-order lead journey and owner CRM. The best near-term commercial entry is autumn/winter outerwear; the main constraints are a €100 monthly media ceiling, low expected conversion volume, branded-product policy evidence, owner creative availability and incomplete landed-cost data. Full fact/inference/hypothesis analysis is in `docs/g3-business-analysis.md`.

## B. CUSTOMER PROFILE

Primary: men 30–49, Estonia nationwide, considering €70–€290 apparel, with strongest initial intent around winter outerwear. Tallinn is a service/trust signal, not a separate ad set. Do not target teenagers. Do not target women as a core audience without gift-purchase evidence.

## C. MARKET / SEASON ANALYSIS

Statistics Estonia records 198,982 men aged 30–49 in 2026. This is a population reference, not an addressable Meta estimate. The launch catalog's strongest seasonal group is puffer jackets (€259–€289), followed by vests (€199–€229). The initial angle is cold-season readiness plus personal sizing help, pre-order and Tallinn/European delivery—without false urgency.

## D. META AUDIENCE

- Geography: Estonia nationwide.
- Gender: men.
- Age: 30–49.
- Structure: one ad set only, `EE_MEN_CORE`.
- Audience method: broad boundaries with Advantage+ audience expansion where Meta allows the owner controls to remain respected.
- Interests: do not stack narrowly. Men's fashion, premium apparel and winter outerwear may be tested only after delivery/economics justify it.
- Prepared, not activated as separate budget pools: site visitors 30d, ViewContent 30d, Instagram engagers 30d, Facebook engagers 30d.
- Retargeting test threshold: consider only after roughly 1,000 addressable 30-day visitors/ViewContent users or sustained 100+ weekly ViewContent events. This is an operating hypothesis, not a Meta rule. If activated, test 10–20% of the same capped budget without raising the cap.

## E. META CAMPAIGN STRUCTURE

- Campaign: `EE_META_CONV_WINTER_2026`.
- Objective: Leads, website conversion location.
- Optimization: actual `Lead` event, not clicks/PageView.
- Ad set: `EE_MEN_CORE`.
- Bid strategy: simplest lowest-cost option; no automated budget escalation or aggressive cost cap.
- Ads: 3 initially, 5 maximum.
- Status: not created. It must remain draft/paused because the correct Andrelook assets are not accessible in the current Meta session, product-policy evidence is incomplete, and creative files are not supplied.

## F. META BUDGET

Hard maximum: **€100/month**. Set **€3.00/day**, which caps nominal daily-budget arithmetic at €93 in a 31-day month. The owner must monitor actual Meta billing against the €100 calendar-month ceiling. No increase, separate retargeting budget or automatic escalation is authorized.

## G. PLACEMENTS

Use Advantage+ placements across Facebook and Instagram, with identities strictly `Andrelook` and `@andrelook.store`; never the owner's personal profile. Reels guidance supports broad Facebook/Instagram placement coverage: [Meta Reels ads guidance](https://www.facebook.com/business/ads/facebook-instagram-reels-ads).

## H. CREATIVE REQUIREMENTS

Owner must supply three strong, policy-eligible files to start:

| Name                        | Format   | Duration/aspect        | Product/hook                                        | Copy need                       |
| --------------------------- | -------- | ---------------------- | --------------------------------------------------- | ------------------------------- |
| `WINTER_COLLECTION_REEL_01` | MP4 Reel | 8–15s, 9:16, 1080×1920 | 2–3 cold-weather models; collection and sizing help | Minimal ET or language-neutral  |
| `MAYA_VIDEO_01`             | MP4 Reel | 8–15s, 9:16, 1080×1920 | Maya model, visible product and €259 price          | ET primary; optional RU variant |
| `TYRIK_VIDEO_01`            | MP4 Reel | 8–15s, 9:16, 1080×1920 | Tyrik model, visible product and €289 price         | ET primary; optional RU variant |

Optional only after the three strong files: `MAYA_STATIC_01` at 1080×1350 (4:5) and one general collection variant. Keep text inside safe zones and avoid unverified authenticity, authorization, scarcity or superiority claims. No media was generated in G3.

Safe copy framework: `[model] · [visible EUR price] · pre-order 2–3 weeks · sizing help · Tallinn / supported delivery · View product`. Final claims and language must match the landing page.

## I. LANDING URL MAP

| Ad                                 | ET destination                                                                               | RU/EN variant rule                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `WINTER_COLLECTION_REEL_01`        | `https://www.andrelook.store/et/catalog/warm-jackets`                                        | Use matching `/ru/` or `/en/` only for that ad's language |
| `MAYA_VIDEO_01` / `MAYA_STATIC_01` | `https://www.andrelook.store/et/catalog/warm-jackets/moncler-maya-down-jacket`               | Same locale rule                                          |
| `TYRIK_VIDEO_01`                   | `https://www.andrelook.store/et/catalog/warm-jackets/parajumpers-tyrik-hooded-puffer-jacket` | Same locale rule                                          |
| Future Moncler collection          | `https://www.andrelook.store/et/brands/moncler`                                              | Same locale rule                                          |
| Future Parajumpers collection      | `https://www.andrelook.store/et/brands/parajumpers`                                          | Same locale rule                                          |

No new landing pages are required. ET is the initial default. RU may be a copy variant within the same ad set; EN is retained for site users and only tested in paid media if data justifies it.

## J. UTM MAP

Use lowercase ASCII G2 values on every URL:

`utm_source=meta&utm_medium=paid_social&utm_campaign=ee_meta_conv_winter_2026&utm_content=<ad_name_lowercase>&utm_adset=ee_men_core&utm_ad=<ad_name_lowercase>`

Examples: `maya_video_01`, `tyrik_video_01`, `winter_collection_reel_01`. Do not use Meta object-name macros unless a preview confirms the rendered values normalize exactly. CRM must resolve Meta → campaign → ad set → ad.

## K. CRM ATTRIBUTION

CRM → Реклама retains Today, 7 days, 30 days, This month and All time. It reports Spend, Leads, Confirmed, Paid, Revenue, CPL, CAC and ROAS. Source → campaign → ad-set/ad drilldown uses immutable G2 order snapshots plus imported or manual spend. Organic sources remain separate: Instagram Organic, Facebook Organic, Telegram, Google Organic, Bing Organic, AI/ChatGPT, Referral and Direct. The known production acceptance test remains excluded.

## L. META SPEND SYNC

G3 adds a daily read-only Meta Insights importer at 04:15 UTC. It stores date, campaign ID/name, normalized UTM campaign, ad set, ad, EUR spend and an idempotent external record ID. It is production-project-only and fail-closed; it never reuses the CAPI token, never exposes a token client-side and rejects non-EUR accounts. Manual entry remains a fallback.

Owner action is required because the declared Andrelook ad account was not available to the current Meta session. In the production Vercel project, configure as secrets/config as appropriate: `META_AD_ACCOUNT_ID`, a separate least-privilege `META_MARKETING_API_ACCESS_TOKEN` with `ads_read` for that exact account, and `CRON_SECRET`. Do not send token values in chat. Meta Insights reference: [Marketing API Insights](https://developers.facebook.com/docs/marketing-api/insights/).

## M. KPI MODEL

Primary: quality leads, confirmed leads and paid customers. Business metrics: CPL = spend/leads; lead-to-confirmed; lead-to-paid; CAC = spend/paid customers; ROAS = paid revenue/spend. Reach, CTR, video views and follower growth are diagnostics only. Low volume may keep the ad set learning-limited; do not manufacture conversions or repeatedly reset learning.

## N. PROFITABILITY / BREAK-EVEN

Retail price is known, margin is not. Required owner inputs per advertised SKU: verified EUR landed cost including supplier/FX/fees/inbound shipping/duty/non-recoverable VAT, payment fee, packaging, owner-paid outbound delivery, and returns/defect allowance. Then compute contribution margin, break-even CAC and break-even ROAS using the formulas in the business analysis. Supplier RMB quotes are not substituted for landed cost.

## O. GOOGLE ADS PLAN

Status: draft plan, not launched, and no part of the €100 Meta budget is allocated.

- Search only; no Display, Performance Max or Shopping.
- Proposed campaigns/ad groups: Moncler Estonia/Tallinn, Parajumpers Estonia/Tallinn, exact published model names, and men's winter-jacket commercial terms.
- Match strategy: exact and phrase first; tightly reviewed search terms and negatives. Final keyword/CPC estimates require owner-run Keyword Planner in the verified account—no CPC range is invented.
- Landing pages: existing matching brand, category and PDP routes only.
- Conversion: G2 Lead; no Purchase until real paid semantics are separately approved.
- Budget: requires a separate owner approval.

## P. META/GOOGLE POLICY STATUS

**Blocked for launch.** Branded-goods eligibility/authenticity/resale evidence has not been supplied. Do not claim official or authorized retailer status. Do not disguise product identity or evade review. Google Shopping/Merchant Center remains blocked; Search eligibility must be reviewed separately after evidence. Meta campaign creation also remains blocked to avoid risking the new business account.

## Q. LAUNCH CHECKLIST

- [ ] Correct `Andrelook | Store` portfolio and `Andrelook Ads` account accessible.
- [ ] Page `Andrelook`, Instagram `@andrelook.store`, and Dataset `3334309000107146` assigned to the ad account/user.
- [ ] Payment method/account setup completed in the correct account.
- [ ] Product eligibility/authenticity/resale evidence reviewed for Meta and Google.
- [ ] Three owner-supplied creatives approved.
- [ ] Destination locale and product availability rechecked.
- [ ] Lead event, Pixel/CAPI dedup and consent behaviour still green.
- [ ] UTM preview maps to Meta → campaign → ad in CRM.
- [ ] €3.00/day and €100 calendar-month hard cap confirmed.
- [ ] Spend importer credentials configured and first EUR row reconciled.
- [ ] Owner explicitly supplies `LAUNCH APPROVAL`.

## R. OWNER ACTIONS

1. Grant the current Meta login appropriate access to the existing `Andrelook | Store` portfolio, `Andrelook Ads`, Page `Andrelook`, Instagram `@andrelook.store` and Dataset—do not create duplicates.
2. Provide/confirm the exact Andrelook Ads account ID and complete payment/Page identity setup in that account.
3. Supply policy/legal evidence establishing that the advertised branded products and claims are eligible.
4. Create a separate least-privilege read credential for that account and configure the three server variables in production Vercel; never paste the token into chat.
5. Supply the three creative files specified above.
6. Supply verified landed-cost and variable fulfilment inputs for Maya, Tyrik and any other advertised SKU.
7. Review the final Ads Manager preview and give explicit `LAUNCH APPROVAL`. No spend starts before that message.

## S. FINAL DRAFT CAMPAIGN STATUS

CAMPAIGN: `EE_META_CONV_WINTER_2026` — specified, **not created**.

AUDIENCE: Estonia, men 30–49, one broad ad set `EE_MEN_CORE`.

BUDGET: €3.00/day; €100/month hard maximum.

PLACEMENTS: Advantage+ Facebook + Instagram; Andrelook identities only.

ADS/CREATIVES: three named slots specified; owner files required.

DESTINATION URLs: exact existing category/PDP routes mapped above.

OPTIMIZATION EVENT: `Lead`.

EXPECTED TRACKING: consented Meta browser+CAPI dedup → G2 attribution snapshot → CRM lifecycle/revenue; daily read-only spend after owner credentials.

POLICY STATUS: blocked pending evidence and correct asset access.

No campaign/ad/ad-set object was created, no creative was uploaded, and no money was spent. Paid traffic remains paused pending owner inputs and explicit launch approval.
