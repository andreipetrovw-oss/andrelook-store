import { z } from "zod";

import { locales } from "@/config/locales";

export const requestOrderSchema = z.object({
  comment: z.preprocess((value) => {
    const text = typeof value === "string" ? value.trim() : "";
    return text || undefined;
  }, z.string().max(1000).optional()),
  colour: z.preprocess(
    (value) => (value === null || value === undefined ? "" : value),
    z.string().trim().max(80),
  ),
  consent: z.literal("accepted", {
    error: "Consent is required.",
  }),
  contactMethod: z.enum(["TELEGRAM", "INSTAGRAM", "PHONE", "EMAIL"]),
  contactValue: z.string().trim().min(3).max(200),
  locale: z.enum(locales),
  name: z.string().trim().min(2).max(100),
  productId: z.string().trim().min(1).max(64),
  productVersion: z.iso.datetime(),
  requestKey: z.uuid(),
  size: z.preprocess(
    (value) => (value === null || value === undefined ? "" : value),
    z.string().trim().max(40),
  ),
});

export type RequestOrderInput = z.infer<typeof requestOrderSchema>;

export function requestOrderInput(formData: FormData) {
  return requestOrderSchema.safeParse({
    comment: formData.get("comment"),
    colour: formData.get("colour"),
    consent: formData.get("consent"),
    contactMethod: formData.get("contactMethod"),
    contactValue: formData.get("contactValue"),
    locale: formData.get("locale"),
    name: formData.get("name"),
    productId: formData.get("productId"),
    productVersion: formData.get("productVersion"),
    requestKey: formData.get("requestKey"),
    size: formData.get("size"),
  });
}
