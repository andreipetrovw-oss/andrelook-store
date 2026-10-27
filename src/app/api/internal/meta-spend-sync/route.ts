import { NextResponse } from "next/server";
import { syncAuthorized } from "@/lib/measurement/meta-sync-auth";

import { syncMetaSpend } from "@/lib/measurement/meta-spend";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!syncAuthorized(request.headers.get("authorization"))) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const result = await syncMetaSpend();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ status: "failed" }, { status: 502 });
  }
}
