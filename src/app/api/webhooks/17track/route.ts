import { NextResponse } from "next/server";

import { getServerConfig } from "@/lib/env";
import { notifyLinkedOrders } from "@/lib/tracking/notifications";
import { parseSeventeenTrackWebhook } from "@/lib/tracking/providers/seventeen-track";
import { verifySeventeenTrackSignature } from "@/lib/tracking/security";
import { ingestWebhookSnapshot } from "@/lib/tracking/service";

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
  for (const record of webhook.records) {
    const result = await ingestWebhookSnapshot({
      provider: "SEVENTEEN_TRACK",
      snapshot: record.snapshot,
      trackingNumber: record.number,
    });
    if (result)
      await notifyLinkedOrders(result.shipmentId, result.newlyVisible);
  }
  return NextResponse.json({ accepted: true });
}
