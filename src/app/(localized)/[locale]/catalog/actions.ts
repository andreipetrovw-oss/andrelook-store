"use server";

import { headers } from "next/headers";

import { sendMetaLeadForOrder } from "@/lib/measurement/meta-capi";
import { sendNewOrderNotification } from "@/lib/notifications/order-notification";
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
      siteHost: requestHeaders.get("host"),
    });
    if (!result.duplicate) {
      try {
        const metaResult = await sendMetaLeadForOrder(result.orderId, referrer);
        if (metaResult.status === "failed") {
          console.error("Meta CAPI delivery failed after order creation.");
        }
      } catch {
        console.error("Meta CAPI delivery failed after order creation.");
      }
      try {
        await sendNewOrderNotification(result.orderId);
      } catch {
        console.error("Order notification audit failed after order creation.");
      }
    }
    return { reference: result.reference, status: "success" };
  } catch (error) {
    if (error instanceof RequestRejectedError) {
      return { message: error.reason, status: "error" };
    }
    throw error;
  }
}
