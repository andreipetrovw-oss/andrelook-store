import { ZodError } from "zod";

import {
  firstPartyAnalyticsAllowedForRuntime,
  recordFirstPartyAnalyticsEvent,
} from "@/lib/measurement/first-party";

export async function POST(request: Request) {
  if (!firstPartyAnalyticsAllowedForRuntime(request)) {
    return new Response(null, { status: 404 });
  }
  try {
    await recordFirstPartyAnalyticsEvent(await request.json());
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Invalid analytics event." },
        { status: 400 },
      );
    }
    return Response.json(
      { error: "Analytics event was not recorded." },
      { status: 500 },
    );
  }
}
