"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { locales } from "@/config/locales";
import {
  consumeWithdrawalAttempt,
  createWithdrawalRequest,
} from "@/lib/legal/withdrawal";

const withdrawalSchema = z.object({
  confirmationEmail: z.email().max(320),
  consumerName: z.string().trim().min(2).max(200),
  locale: z.enum(locales),
  orderReference: z
    .string()
    .trim()
    .min(6)
    .max(40)
    .transform((value) => value.toUpperCase()),
  requestKey: z.uuid(),
  statementConfirmed: z.literal("accepted"),
});

export type WithdrawalFormState = {
  confirmationStatus?: "FAILED" | "PENDING" | "SENT" | "SKIPPED";
  errors?: Record<string, string[]>;
  publicId?: string;
  status: "idle" | "error" | "success";
  submittedAt?: string;
};

export async function submitWithdrawal(
  _previousState: WithdrawalFormState,
  formData: FormData,
): Promise<WithdrawalFormState> {
  const parsed = withdrawalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      status: "error",
    };
  }
  const requestHeaders = await headers();
  const address =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await consumeWithdrawalAttempt(address, parsed.data))) {
    return { status: "error" };
  }
  try {
    const result = await createWithdrawalRequest(parsed.data);
    return {
      confirmationStatus: result.confirmationStatus,
      publicId: result.publicId,
      status: "success",
      submittedAt: result.submittedAt.toISOString(),
    };
  } catch {
    return { status: "error" };
  }
}
