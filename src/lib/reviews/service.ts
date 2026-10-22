import "server-only";

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { isDatabaseConfigured } from "@/lib/env";
import { reviewCopy } from "./copy";
import {
  containsContactData,
  publicReviewDTO,
  reviewEligible,
  reviewSubmissionSchema,
  safeCustomerNames,
} from "./model";
import { newReviewCredentials, reviewHash, validReviewToken } from "./security";

export async function ensureReviewInvitation(orderId: string) {
  const prisma = getPrisma();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });
  if (!order || !reviewEligible(order)) return null;
  const existing = await prisma.reviewInvitation.findUnique({
    where: { orderId },
  });
  if (existing) return existing;
  return prisma.reviewInvitation.upsert({
    where: { orderId },
    update: {},
    create: { orderId, ...newReviewCredentials() },
  });
}

export async function consumeReviewAttempt(
  address: string,
  token: string,
  purpose: "read" | "submit",
) {
  const prisma = getPrisma();
  const now = new Date();
  const windowStart = new Date(Math.floor(now.valueOf() / 900_000) * 900_000);
  const specs = [
    {
      key: `${purpose}:address:${address}`,
      limit: purpose === "read" ? 60 : 10,
    },
    { key: `${purpose}:token:${token}`, limit: purpose === "read" ? 60 : 5 },
  ];
  const allowed = await Promise.all(
    specs.map(async ({ key, limit }) => {
      const keyHash = reviewHash(`${key}:${windowStart.toISOString()}`);
      const bucket = await prisma.reviewRateLimit.upsert({
        where: { keyHash },
        create: { keyHash, windowStart },
        update: { attempts: { increment: 1 } },
      });
      return bucket.attempts <= limit;
    }),
  );
  return allowed.every(Boolean);
}

export async function resolveReviewInvitation(token: string) {
  if (!validReviewToken(token)) return null;
  const invitation = await getPrisma().reviewInvitation.findUnique({
    where: { tokenHash: reviewHash(token) },
    include: {
      review: { select: { id: true } },
      order: { include: { customer: true, items: { orderBy: { id: "asc" } } } },
    },
  });
  return invitation && !invitation.revokedAt && reviewEligible(invitation.order)
    ? invitation
    : null;
}

export async function submitCustomerReview(token: string, input: unknown) {
  const parsed = reviewSubmissionSchema.safeParse(input);
  if (!validReviewToken(token) || !parsed.success) return false;
  const prisma = getPrisma();
  try {
    return await prisma.$transaction(
      async (tx) => {
        const invitation = await tx.reviewInvitation.findUnique({
          where: { tokenHash: reviewHash(token) },
          include: {
            review: true,
            order: {
              include: { customer: true, items: { orderBy: { id: "asc" } } },
            },
          },
        });
        if (
          !invitation ||
          invitation.revokedAt ||
          !reviewEligible(invitation.order)
        )
          return false;
        if (invitation.review) return true;
        const data = parsed.data;
        const item =
          data.productIndex === ""
            ? null
            : invitation.order.items[Number(data.productIndex)];
        if (data.productIndex !== "" && !item) return false;
        const locale = data.locale;
        const names = safeCustomerNames(invitation.order.customer.name);
        const displayName =
          (data.nameStyle === "FIRST"
            ? names.first
            : data.nameStyle === "INITIAL"
              ? names.initial
              : null) ?? reviewCopy[locale].anonymous;
        await tx.customerReview.create({
          data: {
            invitationId: invitation.id,
            kind: item ? "PRODUCT" : "SERVICE",
            productId: item?.productId,
            orderItemId: item?.id,
            productNameSnapshot: item?.productNameSnapshot,
            locale: locale.toUpperCase() as "ET" | "RU" | "EN",
            rating: data.rating,
            originalText: data.text,
            publicText: data.text,
            displayName,
            qualityRating: data.quality,
            communicationRating: data.communication,
            deliveryRating: data.delivery,
            publicationConsentAt: new Date(),
            status: "SUBMITTED",
          },
        });
        return true;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    )
      return true;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    )
      return false;
    throw error;
  }
}

export async function moderateReview(input: {
  orderId: string;
  action: "PUBLISH" | "UNPUBLISH" | "REJECT" | "REDACT";
  reason: string;
  text?: string;
  actorEmail: string;
}) {
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const invitation = await tx.reviewInvitation.findUniqueOrThrow({
      where: { orderId: input.orderId },
      include: { order: { include: { customer: true } }, review: true },
    });
    const review = invitation.review;
    if (!review) throw new Error("Отзыв ещё не получен.");
    if (
      input.action === "PUBLISH" &&
      (!reviewEligible(invitation.order) ||
        containsContactData(review.publicText))
    )
      throw new Error(
        "Проверьте право на отзыв и удалите контактные данные перед публикацией.",
      );
    if (input.action !== "PUBLISH" && input.reason.trim().length < 5)
      throw new Error("Укажите причину (не менее 5 символов).");
    const publicText =
      input.action === "REDACT" ? input.text?.trim() : review.publicText;
    if (
      !publicText ||
      publicText.length < 10 ||
      publicText.length > 3000 ||
      (input.action === "REDACT" &&
        (/[<>]/.test(publicText) || containsContactData(publicText)))
    )
      throw new Error("Проверьте текст и отсутствие контактных данных.");
    const status =
      input.action === "PUBLISH"
        ? "PUBLISHED"
        : input.action === "REJECT"
          ? "REJECTED"
          : input.action === "REDACT"
            ? "SUBMITTED"
            : "UNPUBLISHED";
    await tx.customerReview.update({
      where: { id: review.id },
      data: {
        status,
        publicText,
        ...(input.action === "PUBLISH"
          ? { publishedAt: review.publishedAt ?? new Date() }
          : {}),
      },
    });
    await tx.reviewModerationHistory.create({
      data: {
        invitationId: invitation.id,
        reviewId: review.id,
        actorEmail: input.actorEmail,
        action: input.action,
        reason: input.reason.trim() || null,
        previousText: input.action === "REDACT" ? review.publicText : null,
      },
    });
  });
}

export async function getPublishedReviews(productId?: string) {
  if (!isDatabaseConfigured()) return [];
  const rows = await getPrisma().customerReview.findMany({
    where: {
      status: "PUBLISHED",
      ...(productId ? { productId, kind: "PRODUCT" } : {}),
      invitation: { order: { status: "DELIVERED" } },
    },
    include: {
      invitation: {
        include: {
          order: {
            select: {
              status: true,
              displayNumber: true,
              customer: {
                select: {
                  name: true,
                  email: true,
                  preferredContactValue: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: [{ submittedAt: "desc" }, { id: "desc" }],
  });
  return rows
    .filter(
      (row) =>
        reviewEligible(row.invitation.order) &&
        !containsContactData(row.publicText),
    )
    .map(publicReviewDTO);
}
