"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  authenticateTrackingLookup,
  consumeLookupAttempt,
} from "@/lib/tracking/public";

export type TrackingLookupState = {
  message?: string;
  status: "idle" | "error";
};

const lookupSchema = z.object({
  email: z.email().max(320),
  reference: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^AL-[A-Z0-9-]{6,40}$/),
});

export async function lookupTracking(
  _state: TrackingLookupState,
  formData: FormData,
): Promise<TrackingLookupState> {
  const requestHeaders = await headers();
  const identifier =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  if (!(await consumeLookupAttempt(identifier))) {
    return {
      message: "Too many attempts. Please wait before trying again.",
      status: "error",
    };
  }
  const parsed = lookupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      message: "Check the order number and email address.",
      status: "error",
    };
  }
  const token = await authenticateTrackingLookup(parsed.data);
  if (!token) {
    return {
      message: "We could not match those details. Check them and try again.",
      status: "error",
    };
  }
  redirect(`/track/${token}`);
}
