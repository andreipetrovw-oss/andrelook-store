import "server-only";
import { Resend } from "resend";
import { getServerConfig } from "@/lib/env";
import { containsContactData } from "./model";
import { reviewSiteUrl } from "./urls";

export type ReviewNotice = {
  id: string;
  orderId: string;
  orderNumber: string;
  displayName: string;
  rating: number;
  text: string;
  locale: string;
};

export function ownerReviewMessage(review: ReviewNotice, crmUrl: URL) {
  const preview = containsContactData(review.text)
    ? "Review contains contact information. Read it securely in CRM."
    : review.text.slice(0, 300);
  return [
    "New verified review received — Andrelook",
    `Customer: ${review.displayName}`,
    `Order: ${review.orderNumber}`,
    `Rating: ${review.rating}/5`,
    `Language: ${review.locale}`,
    preview,
    new URL(`/admin/orders/${encodeURIComponent(review.orderId)}`, crmUrl).href,
  ].join("\n\n");
}

// Called only after the transaction that creates the unique review commits.
// Replays/moderation never enter this path. No automatic retries.
export async function notifyReviewOwner(review: ReviewNotice) {
  try {
    const config = getServerConfig();
    if (!config.resendApiKey || !config.orderNotificationFrom)
      return "disabled";
    const staging =
      process.env.VERCEL_ENV === "preview" &&
      process.env.VERCEL_PROJECT_ID === "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m";
    if (
      !staging &&
      !(
        process.env.VERCEL_ENV === "production" &&
        config.siteUrl.hostname === "www.andrelook.store"
      )
    )
      return "disabled";
    const crmUrl = staging ? reviewSiteUrl() : config.crmUrl;
    if (!crmUrl) return "disabled";
    const { error } = await new Resend(config.resendApiKey).emails.send(
      {
        from: config.orderNotificationFrom,
        to: [config.orderNotificationTo],
        subject: "New verified review received — Andrelook",
        text: ownerReviewMessage(review, crmUrl),
      },
      { idempotencyKey: `andrelook-review-${review.id}` },
    );
    if (error) throw new Error("Owner review email failed");
    return "sent";
  } catch {
    // Never log provider responses, customer content, credentials or tokens.
    console.warn("Owner review notification failed; review remains submitted.");
    return "failed";
  }
}
