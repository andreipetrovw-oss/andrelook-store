import { NextResponse } from "next/server";

import { notifyLinkedOrders } from "@/lib/tracking/notifications";
import { reconcileActiveShipments } from "@/lib/tracking/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const result = await reconcileActiveShipments();
    for (const update of result.updates) {
      if (update.newlyVisible.length) {
        await notifyLinkedOrders(update.shipmentId, update.newlyVisible);
      }
    }
    return NextResponse.json({ reconciled: result.reconciled });
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 502 });
  }
}
