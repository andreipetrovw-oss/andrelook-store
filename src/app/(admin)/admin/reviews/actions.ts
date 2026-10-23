"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { reviewSiteUrl } from "@/lib/reviews/urls";
import { reviewRequestMessage } from "@/lib/reviews/copy";
import { ensureReviewInvitation, moderateReview } from "@/lib/reviews/service";
import { invitationToken, newReviewCredentials } from "@/lib/reviews/security";

function refreshReviews(orderId: string, publicChanged = false) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  if (!publicChanged) return;
  revalidatePath("/(localized)/[locale]", "layout");
  revalidatePath(
    "/(localized)/[locale]/catalog/[categorySlug]/[productSlug]",
    "page",
  );
  for (const locale of ["et", "ru", "en"]) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/reviews`);
  }
}

export async function copyReviewRequest(orderId: string) {
  const owner = await requireOwner();
  const invitation = await ensureReviewInvitation(orderId);
  if (!invitation || invitation.revokedAt)
    throw new Error(
      "Приглашение доступно только для реального доставленного заказа. При необходимости восстановите ссылку.",
    );
  const prisma = getPrisma();
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    select: { requestedLocale: true },
  });
  if (!invitation.requestedAt) {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.reviewInvitation.updateMany({
        where: { id: invitation.id, requestedAt: null, revokedAt: null },
        data: { requestedAt: new Date() },
      });
      if (updated.count)
        await tx.reviewModerationHistory.create({
          data: {
            invitationId: invitation.id,
            actorEmail: owner.email,
            action: "REQUEST_PREPARED",
          },
        });
    });
  }
  refreshReviews(orderId);
  const locale = order.requestedLocale.toLowerCase() as "et" | "ru" | "en";
  const url = new URL(
    `/review/${invitationToken(invitation.tokenEncrypted)}?lang=${locale}`,
    reviewSiteUrl(),
  ).toString();
  return { url, message: reviewRequestMessage(locale, url) };
}

export async function rotateReviewInvitation(form: FormData) {
  const owner = await requireOwner();
  const orderId = z.string().min(1).max(128).parse(form.get("orderId"));
  const invitation = await ensureReviewInvitation(orderId);
  if (!invitation) throw new Error("Заказ ещё не доставлен.");
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    await tx.reviewInvitation.update({
      where: { id: invitation.id },
      data: {
        ...newReviewCredentials(),
        revokedAt: null,
        rotatedAt: new Date(),
      },
    });
    await tx.reviewModerationHistory.create({
      data: {
        invitationId: invitation.id,
        actorEmail: owner.email,
        action: "INVITATION_REGENERATED",
      },
    });
  });
  refreshReviews(orderId);
}

export async function revokeReviewInvitation(form: FormData) {
  const owner = await requireOwner();
  const orderId = z.string().min(1).max(128).parse(form.get("orderId"));
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const invitation = await tx.reviewInvitation.update({
      where: { orderId },
      data: { revokedAt: new Date() },
    });
    await tx.reviewModerationHistory.create({
      data: {
        invitationId: invitation.id,
        actorEmail: owner.email,
        action: "INVITATION_REVOKED",
      },
    });
  });
  refreshReviews(orderId);
}

export async function moderateOrderReview(form: FormData) {
  const owner = await requireOwner();
  const input = z
    .object({
      orderId: z.string().min(1).max(128),
      action: z.enum(["PUBLISH", "UNPUBLISH", "REJECT", "REDACT"]),
      reason: z.string().max(1000).default(""),
      text: z.string().max(3000).optional(),
    })
    .parse(Object.fromEntries(form));
  await moderateReview({ ...input, actorEmail: owner.email });
  refreshReviews(input.orderId, true);
}

export async function moderateReviewWithFeedback(
  _state: { error: string | null },
  form: FormData,
) {
  try {
    await moderateOrderReview(form);
    return { error: null };
  } catch {
    return {
      error:
        "Не удалось сохранить. Проверьте право на отзыв, причину и отсутствие персональных данных в тексте для публикации.",
    };
  }
}
