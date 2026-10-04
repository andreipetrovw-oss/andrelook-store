import { z } from "zod";

import { locales } from "@/config/locales";

const optionalText = (maximum: number) =>
  z.preprocess((value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || undefined;
  }, z.string().max(maximum).optional());

export const requestOrderSchema = z
  .object({
    addressLine1: optionalText(200),
    addressLine2: optionalText(200),
    city: z.string().trim().min(2).max(120),
    colour: z.preprocess(
      (value) => (value === null || value === undefined ? "" : value),
      z.string().trim().max(80),
    ),
    comment: optionalText(1000),
    consent: z.literal("accepted", { error: "Consent is required." }),
    contactMethod: z.enum(["TELEGRAM", "INSTAGRAM", "PHONE", "EMAIL"]),
    countryCode: z
      .string()
      .trim()
      .length(2)
      .transform((value) => value.toUpperCase()),
    email: z.email().max(200),
    firstName: z.string().trim().min(2).max(80),
    fulfilmentMethod: z.enum(["PERSONAL_HANDOVER", "DELIVERY"]),
    initialReferrer: optionalText(1000),
    landingPath: optionalText(500),
    lastName: z.string().trim().min(2).max(80),
    locale: z.enum(locales),
    measurements: optionalText(500),
    paymentPreference: z.enum([
      "DEPOSIT_30_BALANCE_ON_HANDOVER",
      "FULL_ADVANCE",
    ]),
    phone: z.string().trim().min(5).max(40),
    postalCode: optionalText(30),
    preferredLocale: z.enum(locales),
    productId: z.string().trim().min(1).max(64),
    productVersion: z.iso.datetime(),
    quantity: z.coerce.number().int().min(1).max(5),
    requestKey: z.uuid(),
    size: z.string().trim().min(1).max(40),
    socialHandle: optionalText(200),
    utmCampaign: optionalText(200),
    utmContent: optionalText(200),
    utmMedium: optionalText(100),
    utmSource: optionalText(100),
    utmTerm: optionalText(200),
  })
  .superRefine((input, context) => {
    if (input.fulfilmentMethod === "PERSONAL_HANDOVER") {
      if (input.countryCode !== "EE") {
        context.addIssue({
          code: "custom",
          message: "Personal handover is available in Tallinn, Estonia.",
          path: ["fulfilmentMethod"],
        });
      }
    } else {
      for (const field of ["addressLine1", "postalCode"] as const) {
        if (!input[field]) {
          context.addIssue({
            code: "custom",
            message: "Delivery address is required.",
            path: [field],
          });
        }
      }
    }

    if (
      input.countryCode !== "EE" &&
      input.paymentPreference !== "FULL_ADVANCE"
    ) {
      context.addIssue({
        code: "custom",
        message: "International delivery requires full advance payment.",
        path: ["paymentPreference"],
      });
    }

    if (
      (input.contactMethod === "TELEGRAM" ||
        input.contactMethod === "INSTAGRAM") &&
      !input.socialHandle
    ) {
      context.addIssue({
        code: "custom",
        message: "A social username is required for this contact method.",
        path: ["socialHandle"],
      });
    }
  });

export type RequestOrderInput = z.infer<typeof requestOrderSchema>;

export function requestOrderInput(formData: FormData) {
  return requestOrderSchema.safeParse({
    addressLine1: formData.get("addressLine1"),
    addressLine2: formData.get("addressLine2"),
    city: formData.get("city"),
    colour: formData.get("colour"),
    comment: formData.get("comment"),
    consent: formData.get("consent"),
    contactMethod: formData.get("contactMethod"),
    countryCode: formData.get("countryCode"),
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    fulfilmentMethod: formData.get("fulfilmentMethod"),
    initialReferrer: formData.get("initialReferrer"),
    landingPath: formData.get("landingPath"),
    lastName: formData.get("lastName"),
    locale: formData.get("locale"),
    measurements: formData.get("measurements"),
    paymentPreference: formData.get("paymentPreference"),
    phone: formData.get("phone"),
    postalCode: formData.get("postalCode"),
    preferredLocale: formData.get("preferredLocale"),
    productId: formData.get("productId"),
    productVersion: formData.get("productVersion"),
    quantity: formData.get("quantity"),
    requestKey: formData.get("requestKey"),
    size: formData.get("size"),
    socialHandle: formData.get("socialHandle"),
    utmCampaign: formData.get("utmCampaign"),
    utmContent: formData.get("utmContent"),
    utmMedium: formData.get("utmMedium"),
    utmSource: formData.get("utmSource"),
    utmTerm: formData.get("utmTerm"),
  });
}
