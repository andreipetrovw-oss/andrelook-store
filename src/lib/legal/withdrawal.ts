import "server-only";

import { Prisma } from "@prisma/client";
import { Resend } from "resend";

import type { Locale } from "@/config/locales";
import { databaseLocale } from "@/config/locales";
import { getPrisma } from "@/lib/db";
import { getServerConfig } from "@/lib/env";
import { hashLookupBucket } from "@/lib/tracking/security";

import { withdrawalCopy } from "./policy";

export type WithdrawalInput = {
  confirmationEmail: string;
  consumerName: string;
  locale: Locale;
  orderReference: string;
  requestKey: string;
};

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );
}

export async function consumeWithdrawalAttempt(address: string) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.valueOf() / 900_000) * 900_000);
  const keyHash = hashLookupBucket(
    `withdrawal:${address}:${windowStart.toISOString()}`,
  );
  const bucket = await getPrisma().reviewRateLimit.upsert({
    create: { attempts: 1, keyHash, windowStart },
    update: { attempts: { increment: 1 } },
    where: { keyHash },
  });
  return bucket.attempts <= 10;
}

export async function createWithdrawalRequest(input: WithdrawalInput) {
  const prisma = getPrisma();
  const reference = input.orderReference.trim();
  const email = input.confirmationEmail.trim().toLowerCase();
  let request;
  try {
    request = await prisma.withdrawalRequest.create({
      data: {
        confirmationEmail: email,
        consumerName: input.consumerName.trim(),
        locale: databaseLocale[input.locale],
        orderReference: reference,
        requestKey: input.requestKey,
        statementText: withdrawalCopy[input.locale].statement,
      },
    });
  } catch (error) {
    if (
      !(error instanceof Prisma.PrismaClientKnownRequestError) ||
      error.code !== "P2002"
    )
      throw error;
    request = await prisma.withdrawalRequest.findUnique({
      where: { requestKey: input.requestKey },
    });
    if (!request) throw error;
  }

  const copy = withdrawalCopy[request.locale.toLowerCase() as Locale];
  const submittedAt = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "long",
    timeZone: "Europe/Tallinn",
  }).format(request.submittedAt);
  const body = [
    copy.confirmationLead,
    "",
    copy.statement,
    `${copy.orderReference}: ${request.orderReference}`,
    `${copy.consumerName}: ${request.consumerName}`,
    `${copy.submittedAt}: ${submittedAt} (Europe/Tallinn)`,
    `${copy.reference}: ${request.publicId}`,
  ].join("\n");
  const config = getServerConfig();
  if (config.resendApiKey && config.orderNotificationFrom) {
    const resend = new Resend(config.resendApiKey);
    for (const recipient of [
      {
        kind: "owner",
        to: config.orderNotificationTo,
        status: request.ownerEmailStatus,
      },
      {
        kind: "customer",
        to: request.confirmationEmail,
        status: request.customerEmailStatus,
      },
    ] as const) {
      if (recipient.status === "SENT") continue;
      try {
        const response = await resend.emails.send(
          {
            from: config.orderNotificationFrom,
            html: `<p>${escapeHtml(copy.confirmationLead)}</p><pre>${escapeHtml(body)}</pre>`,
            subject: `${copy.successTitle} · ${request.publicId}`,
            text: body,
            to: [recipient.to],
          },
          {
            idempotencyKey: `andrelook-withdrawal-${request.publicId}-${recipient.kind}`,
          },
        );
        if (response.error || !response.data?.id) {
          throw new Error("Email delivery failed");
        }
        request = await prisma.withdrawalRequest.update({
          data:
            recipient.kind === "owner"
              ? { ownerEmailStatus: "SENT" }
              : { customerEmailStatus: "SENT" },
          where: { id: request.id },
        });
      } catch {
        request = await prisma.withdrawalRequest.update({
          data:
            recipient.kind === "owner"
              ? { ownerEmailStatus: "FAILED" }
              : { customerEmailStatus: "FAILED" },
          where: { id: request.id },
        });
      }
    }
  } else {
    request = await prisma.withdrawalRequest.update({
      data: { customerEmailStatus: "FAILED", ownerEmailStatus: "FAILED" },
      where: { id: request.id },
    });
  }
  return {
    confirmationStatus: request.customerEmailStatus,
    ownerEmailStatus: request.ownerEmailStatus,
    publicId: request.publicId,
    submittedAt: request.submittedAt,
  };
}
