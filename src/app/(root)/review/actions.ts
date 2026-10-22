"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  consumeReviewAttempt,
  submitCustomerReview,
} from "@/lib/reviews/service";

export async function submitReview(
  token: string,
  _state: { success: boolean; error: boolean },
  form: FormData,
) {
  const h = await headers();
  const address = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await consumeReviewAttempt(address, token, "submit")))
    return { success: false, error: true };
  try {
    const success = await submitCustomerReview(token, Object.fromEntries(form));
    if (success) revalidatePath("/admin/orders");
    return { success, error: !success };
  } catch {
    return { success: false, error: true };
  }
}
