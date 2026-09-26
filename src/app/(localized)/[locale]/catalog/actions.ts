"use server";

import { headers } from "next/headers";

import { RequestRejectedError, createOrderRequest } from "@/lib/orders/service";
import { requestOrderInput } from "@/lib/orders/request-schema";

export type RequestFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  reference?: string;
  status: "idle" | "error" | "success";
};

export async function submitOrderRequest(
  _previousState: RequestFormState,
  formData: FormData,
): Promise<RequestFormState> {
  const parsed = requestOrderInput(formData);
  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      status: "error",
    };
  }

  const requestHeaders = await headers();
  const referrer = requestHeaders.get("referer");
  let landingPath: string | null = null;
  if (referrer) {
    try {
      landingPath = new URL(referrer).pathname.slice(0, 500);
    } catch {
      landingPath = null;
    }
  }

  try {
    const result = await createOrderRequest(parsed.data, {
      initialReferrer: referrer?.slice(0, 1000) ?? null,
      landingPath,
    });
    return { reference: result.reference, status: "success" };
  } catch (error) {
    if (error instanceof RequestRejectedError) {
      return { message: error.reason, status: "error" };
    }
    throw error;
  }
}
