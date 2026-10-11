import { NextResponse } from "next/server";

import { syncMetaSpend } from "@/lib/measurement/meta-spend";

export const dynamic = "force-dynamic";

function yesterdayUtc() {
  const value = new Date();
  value.setUTCDate(value.getUTCDate() - 1);
  return value.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const result = await syncMetaSpend({ date: yesterdayUtc() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 502 });
  }
}
