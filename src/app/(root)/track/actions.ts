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
  accessCode: z
    .string()
    .trim()
    .max(20)
    .regex(/^[2-9A-HJ-NP-Z -]{8,12}$/i),
  locale: z.enum(["et", "ru", "en"]),
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
  const raw = Object.fromEntries(formData);
  const reference = typeof raw.reference === "string" ? raw.reference : "";
  const identifier =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  const allowed = await consumeLookupAttempt(identifier, reference);
  const parsed = lookupSchema.safeParse(raw);
  const locale = raw.locale === "ru" || raw.locale === "en" ? raw.locale : "et";
  const messages = {
    en: "We could not verify those details. Check them or wait before trying again.",
    et: "Andmeid ei õnnestunud kinnitada. Kontrolli neid või proovi veidi hiljem uuesti.",
    ru: "Не удалось проверить данные. Проверьте их или повторите попытку позже.",
  };
  if (!allowed || !parsed.success) {
    return {
      message: messages[locale],
      status: "error",
    };
  }
  const token = await authenticateTrackingLookup(parsed.data);
  if (!token) {
    return {
      message: messages[locale],
      status: "error",
    };
  }
  redirect(`/track/${token}?lang=${parsed.data.locale}`);
}
