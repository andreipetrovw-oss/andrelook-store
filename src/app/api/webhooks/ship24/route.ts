import { NextResponse } from "next/server";

import { getServerConfig } from "@/lib/env";
import { notifyLinkedOrders } from "@/lib/tracking/notifications";
import { parseShip24Webhook } from "@/lib/tracking/providers/ship24";
import { verifyBearerSecret } from "@/lib/tracking/security";
import { ingestWebhookSnapshot } from "@/lib/tracking/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = getServerConfig().ship24WebhookSecret;
  if (!secret) return new NextResponse(null, { status: 503 });
  if (!verifyBearerSecret(request.headers.get("authorization"), secret)) {
    return new NextResponse(null, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  for (const record of parseShip24Webhook(payload)) {
    const result = await ingestWebhookSnapshot({
      provider: "SHIP24",
      snapshot: record.snapshot,
      trackingNumber: record.number,
    });
    if (result)
      await notifyLinkedOrders(result.shipmentId, result.newlyVisible);
  }
  return NextResponse.json({ accepted: true });
}
