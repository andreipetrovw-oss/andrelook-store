import "server-only";

import { Prisma, type Locale as DatabaseLocale } from "@prisma/client";
import { Resend } from "resend";

import type { Locale } from "@/config/locales";
import { databaseLocale } from "@/config/locales";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";
import { hashLookupBucket } from "@/lib/tracking/security";

import { LEGAL_POLICY_VERSION, withdrawalCopy } from "./policy";

const withdrawalWindowMs = 15 * 60 * 1000;

export type WithdrawalInput = {
  confirmationEmail: string;
  consumerName: string;
  locale: Locale;
  orderReference: string;
  requestKey: string;
};

function safeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/re_[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .slice(0, 300);
}

function html(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "'": "&#39;",
      '"': "&quot;",
      "<": "&lt;",
      ">": "&gt;",
    };
    return entities[character] ?? character;
  });
}

function tallinnDateTime(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(
    locale === "et" ? "et-EE" : locale === "ru" ? "ru-EE" : "en-EE",
    {
      dateStyle: "long",
      timeStyle: "long",
      timeZone: "Europe/Tallinn",
    },
  ).format(value);
}

async function incrementBucket(key: string, limit: number) {
  const prisma = getPrisma();
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.valueOf() / withdrawalWindowMs) * withdrawalWindowMs,
  );
  const keyHash = hashLookupBucket(`${key}|${windowStart.toISOString()}`);
  const bucket = await prisma.withdrawalRateLimit.upsert({
    create: { attempts: 1, keyHash, windowStart },
    update: { attempts: { increment: 1 } },
    where: { keyHash },
  });
  return bucket.attempts <= limit;
}

export async function consumeWithdrawalAttempt(
  address: string,
  input: Pick<WithdrawalInput, "confirmationEmail" | "orderReference">,
) {
  const [addressAllowed, declarationAllowed] = await Promise.all([
    incrementBucket(`withdrawal-address:${address}`, 20),
    incrementBucket(
      `withdrawal-declaration:${address}:${input.orderReference.toUpperCase()}:${input.confirmationEmail.toLowerCase()}`,
      5,
    ),
  ]);
  return addressAllowed && declarationAllowed;
}

async function deliverConfirmation(requestId: string) {
  const prisma = getPrisma();
  const config = getServerConfig();
  const request = await prisma.withdrawalRequest.findUniqueOrThrow({
    where: { id: requestId },
  });
  const locale = request.locale.toLowerCase() as Locale;
  const copy = withdrawalCopy[locale];
  const submittedAt = tallinnDateTime(request.submittedAt, locale);
  const text = [
    copy.successTitle,
    "",
    copy.confirmationLead,
    "",
    `${copy.orderReference}: ${request.orderReference}`,
    `${copy.consumerName}: ${request.consumerName}`,
    `${copy.submittedAt}: ${submittedAt}`,
    "",
    request.statementText,
    "",
    `${copy.reference}: ${request.publicId}`,
    `${copy.policyVersion}: ${request.policyVersion}`,
  ].join("\n");
  const markup = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717"><h1 style="font-size:22px">${html(copy.successTitle)}</h1><p>${html(copy.confirmationLead)}</p><dl><dt><strong>${html(copy.orderReference)}</strong></dt><dd>${html(request.orderReference)}</dd><dt><strong>${html(copy.consumerName)}</strong></dt><dd>${html(request.consumerName)}</dd><dt><strong>${html(copy.submittedAt)}</strong></dt><dd>${html(submittedAt)}</dd></dl><p>${html(request.statementText)}</p><p><small>${html(copy.reference)}: ${html(request.publicId)}<br>${html(copy.policyVersion)}: ${html(request.policyVersion)}</small></p></body></html>`;

  if (!config.resendApiKey || !config.orderNotificationFrom) {
    return prisma.withdrawalRequest.update({
      data: {
        confirmationLastError:
          "Electronic confirmation provider is not configured.",
        confirmationStatus: "FAILED",
      },
      where: { id: request.id },
    });
  }

  try {
    const resend = new Resend(config.resendApiKey);
    const { data, error } = await resend.emails.send(
      {
        from: config.orderNotificationFrom,
        html: markup,
        subject: copy.successTitle,
        text,
        to: [request.confirmationEmail],
      },
      { idempotencyKey: `andrelook-withdrawal-${request.publicId}` },
    );
    if (error) throw new Error(error.message);
    return prisma.withdrawalRequest.update({
      data: {
        confirmationLastError: null,
        confirmationProviderId: data?.id ?? null,
        confirmationSentAt: new Date(),
        confirmationStatus: "SENT",
      },
      where: { id: request.id },
    });
  } catch (error) {
    return prisma.withdrawalRequest.update({
      data: {
        confirmationLastError: safeError(error),
        confirmationStatus: "FAILED",
      },
      where: { id: request.id },
    });
  }
}

export async function createWithdrawalRequest(input: WithdrawalInput) {
  const prisma = getPrisma();
  const reference = input.orderReference.trim().toUpperCase();
  const statementText = withdrawalCopy[input.locale].statement;
  const order = await prisma.order.findUnique({
    select: { id: true },
    where: { displayNumber: reference },
  });

  try {
    const request = await prisma.withdrawalRequest.create({
      data: {
        confirmationEmail: input.confirmationEmail.trim().toLowerCase(),
        consumerName: input.consumerName.trim(),
        locale: databaseLocale[input.locale] as DatabaseLocale,
        orderId: order?.id ?? null,
        orderReference: reference,
        policyVersion: LEGAL_POLICY_VERSION,
        requestKey: input.requestKey,
        statementText,
      },
    });
    const confirmed = await deliverConfirmation(request.id);
    return {
      confirmationStatus: confirmed.confirmationStatus,
      publicId: confirmed.publicId,
      submittedAt: confirmed.submittedAt,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await prisma.withdrawalRequest.findUnique({
        where: { requestKey: input.requestKey },
      });
      if (existing) {
        return {
          confirmationStatus: existing.confirmationStatus,
          publicId: existing.publicId,
          submittedAt: existing.submittedAt,
        };
      }
    }
    throw error;
  }
}
