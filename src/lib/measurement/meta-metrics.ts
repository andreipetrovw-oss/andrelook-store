import { z } from "zod";

export const liveCampaignId = "120254156199110422";
export const liveCampaignKey = "winter_vezere_30d_test01";
type Actions = Array<{ action_type?: string; value?: string }>;
export type DeliveryInsight = {
  spend?: string;
  impressions?: string;
  reach?: string;
  frequency?: string;
  inline_link_clicks?: string;
  outbound_clicks?: Actions;
  actions?: Actions;
  video_play_actions?: Actions;
  video_avg_time_watched_actions?: Actions;
  video_p25_watched_actions?: Actions;
  video_p50_watched_actions?: Actions;
  video_p75_watched_actions?: Actions;
  video_p95_watched_actions?: Actions;
  video_p100_watched_actions?: Actions;
};
export function metricNumber(value: string | undefined) {
  if (!value?.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
export function actionMetric(actions: Actions | undefined, name: string) {
  return metricNumber(actions?.find((a) => a.action_type === name)?.value);
}
export function unitCost(spend: number | null, count: number | null) {
  return spend !== null && count !== null && count > 0 ? spend / count : null;
}
export function metricPercent(n: number | null, d: number | null) {
  return n !== null && d !== null && d > 0 ? (n / d) * 100 : null;
}
export function normalizeDeliveryMetrics(row: DeliveryInsight = {}) {
  const spend = metricNumber(row.spend);
  const impressions = metricNumber(row.impressions);
  const linkClicks = metricNumber(row.inline_link_clicks);
  const lpv = actionMetric(row.actions, "landing_page_view");
  // Do not sum overlapping lead variants returned by Meta.
  const leads =
    actionMetric(row.actions, "lead") ??
    actionMetric(row.actions, "offsite_conversion.fb_pixel_lead");
  const plays = actionMetric(row.video_play_actions, "video_view");
  const completed = actionMetric(row.video_p100_watched_actions, "video_view");
  return {
    spendMinor: spend === null ? null : Math.round(spend * 100),
    impressions,
    reach: metricNumber(row.reach),
    frequency: metricNumber(row.frequency),
    linkClicks,
    outboundClicks: actionMetric(row.outbound_clicks, "outbound_click"),
    ctr: metricPercent(linkClicks, impressions),
    cpcMinor: unitCost(spend === null ? null : spend * 100, linkClicks),
    cpmMinor: unitCost(spend === null ? null : spend * 100000, impressions),
    landingPageViews: lpv,
    costPerLandingPageMinor: unitCost(spend === null ? null : spend * 100, lpv),
    metaLeads: leads,
    costPerMetaLeadMinor: unitCost(spend === null ? null : spend * 100, leads),
    videoPlays: plays,
    video3SecondViews: actionMetric(row.actions, "video_view"),
    averageWatchSeconds: actionMetric(
      row.video_avg_time_watched_actions,
      "video_view",
    ),
    watched25: actionMetric(row.video_p25_watched_actions, "video_view"),
    watched50: actionMetric(row.video_p50_watched_actions, "video_view"),
    watched75: actionMetric(row.video_p75_watched_actions, "video_view"),
    watched95: actionMetric(row.video_p95_watched_actions, "video_view"),
    watched100: completed,
    completionRate: metricPercent(completed, plays),
  };
}
const nullableNumber = z.number().finite().nonnegative().nullable();
const metricsSchema = z.object({
  spendMinor: nullableNumber,
  impressions: nullableNumber,
  reach: nullableNumber,
  frequency: nullableNumber,
  linkClicks: nullableNumber,
  outboundClicks: nullableNumber,
  ctr: nullableNumber,
  cpcMinor: nullableNumber,
  cpmMinor: nullableNumber,
  landingPageViews: nullableNumber,
  costPerLandingPageMinor: nullableNumber,
  metaLeads: nullableNumber,
  costPerMetaLeadMinor: nullableNumber,
  videoPlays: nullableNumber,
  video3SecondViews: nullableNumber,
  averageWatchSeconds: nullableNumber,
  watched25: nullableNumber,
  watched50: nullableNumber,
  watched75: nullableNumber,
  watched95: nullableNumber,
  watched100: nullableNumber,
  completionRate: nullableNumber,
});
export const liveSnapshotSchema = z.object({
  version: z.literal(1),
  accountTimezone: z.string(),
  campaignId: z.literal(liveCampaignId),
  campaignName: z.string(),
  utmCampaign: z.literal(liveCampaignKey),
  status: z.string(),
  lifetimeBudgetMinor: nullableNumber,
  startTime: z
    .string()
    .refine((v) => Number.isFinite(Date.parse(v)))
    .nullable(),
  endTime: z
    .string()
    .refine((v) => Number.isFinite(Date.parse(v)))
    .nullable(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  through: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fetchedAt: z.string().refine((v) => Number.isFinite(Date.parse(v))),
  metrics: metricsSchema,
  ads: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      adSetId: z.string(),
      adSetName: z.string(),
      status: z.string(),
      utmAd: z.string(),
      utmAdSet: z.string(),
      metrics: metricsSchema,
    }),
  ),
});
export type LiveMetaSnapshot = z.infer<typeof liveSnapshotSchema>;
