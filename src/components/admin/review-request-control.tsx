"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { copyReviewRequest } from "@/app/(admin)/admin/reviews/actions";
import { copyCurrentReviewRequest } from "@/lib/reviews/clipboard";

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
  const [manualCopy, setManualCopy] = useState(false);
  const current = useRef(true);
  useEffect(() => {
    current.current = true;
    return () => {
      current.current = false;
    };
  }, []);
  return (
    <div className="admin-review-request">
      <button
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              setFeedback("");
              const result = await copyCurrentReviewRequest(
                orderId,
                copyReviewRequest,
                navigator.clipboard,
                () => current.current,
              );
              if (!result) return;
              setUrl(result.url);
              setMessage(result.message);
              setManualCopy(!result.copied);
              setFeedback(
                result.copied
                  ? "Сообщение скопировано. Отправьте его клиенту удобным способом."
                  : "Не удалось подтвердить копирование. Выделите и скопируйте готовое сообщение ниже.",
              );
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
        <details open={manualCopy}>
          <summary>Готовое сообщение</summary>
          <textarea
            aria-label="Сообщение клиенту"
            readOnly
            value={message}
            rows={9}
            onFocus={(event) => event.currentTarget.select()}
          />
        </details>
      ) : null}
    </div>
  );
}
