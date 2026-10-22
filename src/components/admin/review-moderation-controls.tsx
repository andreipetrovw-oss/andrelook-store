"use client";

import { useActionState } from "react";
import { moderateReviewWithFeedback } from "@/app/(admin)/admin/reviews/actions";
import { containsContactData } from "@/lib/reviews/model";

export function ReviewModerationControls({
  orderId,
  text,
  canPublish,
}: {
  orderId: string;
  text: string;
  canPublish: boolean;
}) {
  const [state, action, pending] = useActionState(moderateReviewWithFeedback, {
    error: null,
  });
  return (
    <>
      {state.error ? <p role="alert">{state.error}</p> : null}
      {canPublish ? (
        <form action={action}>
          <input type="hidden" name="orderId" value={orderId} />
          <input type="hidden" name="action" value="PUBLISH" />
          <input type="hidden" name="reason" value="" />
          <button type="submit" disabled={pending || containsContactData(text)}>
            Опубликовать
          </button>
          {containsContactData(text) ? (
            <p>
              Перед публикацией уберите контактные данные в разделе проверки.
            </p>
          ) : null}
        </form>
      ) : null}
      <details className="admin-review-details">
        <summary>Проверка и модерация</summary>
        <p>
          Низкая оценка сама по себе не является причиной отказа. Допустимы
          удаление персональных данных, спама, оскорблений и нерелевантного
          содержания. Сохраняйте смысл отзыва.
        </p>
        <form action={action} className="admin-stack-form">
          <input type="hidden" name="orderId" value={orderId} />
          <label>
            <span>Причина / запрос клиента</span>
            <input name="reason" minLength={5} maxLength={1000} required />
          </label>
          <label>
            <span>
              Текст для публикации (только редактирование приватных данных)
            </span>
            <textarea
              name="text"
              defaultValue={text}
              minLength={10}
              maxLength={3000}
              rows={5}
            />
          </label>
          <div className="admin-review-actions">
            <button disabled={pending} name="action" value="REDACT">
              Сохранить редакцию для проверки
            </button>
            <button disabled={pending} name="action" value="UNPUBLISH">
              Снять с публикации
            </button>
            <button disabled={pending} name="action" value="REJECT">
              Отклонить
            </button>
          </div>
        </form>
      </details>
    </>
  );
}
