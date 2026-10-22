import Link from "next/link";
import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { reviewSiteUrl } from "@/lib/reviews/urls";
import { reviewEligible } from "@/lib/reviews/model";
import {
  revokeReviewInvitation,
  rotateReviewInvitation,
} from "@/app/(admin)/admin/reviews/actions";
import { ReviewRequestControl } from "./review-request-control";
import { ReviewModerationControls } from "./review-moderation-controls";

export const reviewStatusLabels = {
  SUBMITTED: "Получен",
  PUBLISHED: "Опубликован",
  UNPUBLISHED: "Снят с публикации",
  REJECTED: "Отклонён",
  REQUESTED: "Запрошен",
  NOT_REQUESTED: "Не запрошен",
};

export async function OrderReviewSection({ orderId }: { orderId: string }) {
  await requireOwner();
  const order = await getPrisma().order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      customer: true,
      reviewInvitation: {
        include: {
          review: {
            include: {
              moderationHistory: { orderBy: { createdAt: "desc" }, take: 20 },
            },
          },
        },
      },
    },
  });
  const invitation = order.reviewInvitation;
  const review = invitation?.review;
  const eligible = reviewEligible(order);
  const status =
    review?.status ?? (invitation?.requestedAt ? "REQUESTED" : "NOT_REQUESTED");
  return (
    <section className="admin-panel admin-review-panel">
      <h2>Отзыв</h2>
      <p>
        <strong>{reviewStatusLabels[status]}</strong>
        {invitation?.revokedAt ? " · Ссылка отозвана" : null}
      </p>
      {!eligible ? (
        <p>Приглашение станет доступно после доставки реального заказа.</p>
      ) : !invitation?.revokedAt && !review ? (
        <ReviewRequestControl
          orderId={orderId}
          requested={!!invitation?.requestedAt}
        />
      ) : null}
      {review ? (
        <>
          <div className="admin-review-content">
            <span aria-label={`${review.rating} из 5`}>
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </span>
            <strong>{review.displayName}</strong>
            <p lang={review.locale.toLowerCase()}>{review.publicText}</p>
            {review.productNameSnapshot ? (
              <small>{review.productNameSnapshot}</small>
            ) : null}
          </div>
          {review.status === "PUBLISHED" ? (
            <Link
              href={new URL(
                `/${review.locale.toLowerCase()}/reviews#review-${review.publicId}`,
                reviewSiteUrl(),
              ).toString()}
              target="_blank"
              rel="noreferrer"
            >
              Открыть опубликованный отзыв ↗
            </Link>
          ) : null}
          <ReviewModerationControls
            orderId={orderId}
            text={review.publicText}
            canPublish={eligible && review.status !== "PUBLISHED"}
          />
          <details>
            <summary>Оригинал и история</summary>
            <p>{review.originalText}</p>
            <ul>
              {review.moderationHistory.map((h) => (
                <li key={h.id}>
                  {h.createdAt.toLocaleString("ru-RU", {
                    timeZone: "Europe/Tallinn",
                  })}{" "}
                  · {h.action} · {h.actorEmail}
                  {h.reason ? ` · ${h.reason}` : ""}
                </li>
              ))}
            </ul>
          </details>
        </>
      ) : null}
      {eligible && invitation ? (
        <details>
          <summary>Управление ссылкой</summary>
          <form action={rotateReviewInvitation}>
            <input type="hidden" name="orderId" value={orderId} />
            <p>
              Новая ссылка заменит прежнюю. Уже полученный отзыв сохраняется.
            </p>
            <button type="submit">Создать новую ссылку</button>
          </form>
          {!invitation.revokedAt ? (
            <form action={revokeReviewInvitation}>
              <input type="hidden" name="orderId" value={orderId} />
              <button type="submit">Отозвать ссылку</button>
            </form>
          ) : null}
        </details>
      ) : null}
    </section>
  );
}
