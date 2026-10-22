"use client";

import { useState, useTransition } from "react";
import { copyReviewRequest } from "@/app/(admin)/admin/reviews/actions";

export function ReviewRequestControl({
  orderId,
  requested,
}: {
  orderId: string;
  requested: boolean;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  return (
    <div className="admin-review-request">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await copyReviewRequest(orderId);
              setUrl(result.url);
              setMessage(result.message);
              try {
                await navigator.clipboard.writeText(result.message);
                setFeedback(
                  "Сообщение скопировано. Отправьте его клиенту удобным способом.",
                );
              } catch {
                setFeedback("Выделите и скопируйте готовое сообщение ниже.");
              }
            } catch {
              setFeedback(
                "Не удалось подготовить приглашение. Проверьте, что заказ доставлен, и обновите страницу.",
              );
            }
          })
        }
        type="button"
      >
        {pending
          ? "Готовим…"
          : requested
            ? "Скопировать запрос отзыва ещё раз"
            : "Скопировать запрос отзыва"}
      </button>
      {feedback ? <p role="status">{feedback}</p> : null}
      {url ? (
        <a href={url} target="_blank" rel="noreferrer">
          Открыть ссылку для отзыва ↗
        </a>
      ) : null}
      {message ? (
        <details>
          <summary>Готовое сообщение</summary>
          <textarea
            aria-label="Сообщение клиенту"
            readOnly
            value={message}
            rows={9}
          />
        </details>
      ) : null}
    </div>
  );
}
