import { z } from "zod";
import { locales } from "@/config/locales";

const text = (max: number) =>
  z
    .string()
    .trim()
    .min(2)
    .max(max)
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v));

export const withdrawalSchema = z.object({
  confirmationEmail: z
    .email()
    .max(320)
    .transform((v) => v.trim().toLowerCase()),
  consumerName: text(200),
  locale: z.enum(locales),
  orderReference: text(500),
  requestKey: z.uuid(),
  statementConfirmed: z.literal("accepted"),
});

export function withdrawalEnvironment(host: string) {
  const name = host.toLowerCase();
  return (
    (process.env.VERCEL_ENV === "production" &&
      process.env.VERCEL_PROJECT_ID === "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH" &&
      name === "www.andrelook.store") ||
    (process.env.VERCEL_ENV === "preview" &&
      process.env.VERCEL_PROJECT_ID === "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m" &&
      name.endsWith(".vercel.app")) ||
    (process.env.NODE_ENV !== "production" &&
      !process.env.VERCEL_ENV &&
      /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(name))
  );
}
