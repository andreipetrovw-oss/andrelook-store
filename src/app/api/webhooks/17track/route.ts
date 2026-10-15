import { after, NextResponse } from "next/server";

import { getServerConfig } from "@/lib/env";
import { parseSeventeenTrackWebhook } from "@/lib/tracking/providers/seventeen-track";
import { verifySeventeenTrackSignature } from "@/lib/tracking/security";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = getServerConfig().seventeenTrackToken;
  if (!token) return new NextResponse(null, { status: 503 });
  const rawBody = await request.text();
  if (
    !verifySeventeenTrackSignature(rawBody, request.headers.get("sign"), token)
  ) {
    return new NextResponse(null, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const webhook = parseSeventeenTrackWebhook(payload);
  after(async () => {
    try {
      const [{ notifyLinkedOrders }, { ingestWebhookSnapshot }] =
        await Promise.all([
          import("@/lib/tracking/notifications"),
          import("@/lib/tracking/service"),
        ]);
      for (const record of webhook.records) {
        const result = await ingestWebhookSnapshot({
          provider: "SEVENTEEN_TRACK",
          snapshot: record.snapshot,
          trackingNumber: record.number,
        });
        if (result) {
          await notifyLinkedOrders(result.shipmentId, result.newlyVisible);
        }
      }
    } catch {
      console.error("17TRACK webhook processing failed after acknowledgement.");
    }
  });
  return NextResponse.json({ accepted: true });
}
