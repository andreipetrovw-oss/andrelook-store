"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="admin-route-state" role="alert">
      <span className="eyebrow">Не удалось продолжить</span>
      <h1>Данные временно недоступны</h1>
      <p>
        Попробуйте ещё раз. Если ошибка повторится, не вносите данные повторно.
      </p>
      <button
        className="primary-action fit-content"
        onClick={reset}
        type="button"
      >
        Повторить
      </button>
    </div>
  );
}
