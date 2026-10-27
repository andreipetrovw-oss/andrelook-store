"use server";

import { headers } from "next/headers";
import { withdrawalEnvironment, withdrawalSchema } from "@/lib/legal/model";
import {
  consumeWithdrawalAttempt,
  createWithdrawalRequest,
} from "@/lib/legal/withdrawal";

export type WithdrawalFormState = {
  notificationIssue?: boolean;
  errors?: Record<string, string[]>;
  publicId?: string;
  status: "idle" | "error" | "success";
  submittedAt?: string;
};

export async function submitWithdrawal(
  _previousState: WithdrawalFormState,
  formData: FormData,
): Promise<WithdrawalFormState> {
  // Next.js also enforces its default 1 MB body cap and same-origin POST check.
  // Bound fields before parsing; reject files and excessive/duplicated values.
  const entries = [...formData.entries()];
  const input = entries.filter(([key]) => !key.startsWith("$ACTION_"));
  if (
    input.length !== 6 ||
    new Set(input.map(([key]) => key)).size !== 6 ||
    input.some(([, value]) => typeof value !== "string" || value.length > 1000)
  )
    return { status: "error" };
  const parsed = withdrawalSchema.safeParse(Object.fromEntries(input));
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      status: "error",
    };
  }
  try {
    const requestHeaders = await headers();
    const host =
      requestHeaders.get("x-forwarded-host") ??
      requestHeaders.get("host") ??
      "";
    const origin = requestHeaders.get("origin");
    if (
      !origin ||
      new URL(origin).host !== host ||
      !withdrawalEnvironment(host)
    )
      return { status: "error" };
    const address =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (
      !(await consumeWithdrawalAttempt(address, parsed.data.confirmationEmail))
    )
      return { status: "error" };
    const result = await createWithdrawalRequest(parsed.data);
    return {
      notificationIssue:
        result.confirmationStatus !== "SENT" ||
        result.ownerEmailStatus !== "SENT",
      publicId: result.publicId,
      status: "success",
      submittedAt: result.submittedAt.toISOString(),
    };
  } catch {
    return { status: "error" };
  }
}
