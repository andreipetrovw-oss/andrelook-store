"use client";

import { useState } from "react";

async function copy(value: string) {
  await navigator.clipboard.writeText(value);
}

export function TrackingCustomerControls({
  accessCode,
  message,
  trackingUrl,
}: {
  accessCode: string | null;
  message: string | null;
  trackingUrl: string | null;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  async function copyValue(label: string, value: string) {
    try {
      await copy(value);
      setCopied(label);
    } catch {
      setCopied("error");
    }
  }
  return (
    <div className="admin-inline-actions">
      {accessCode ? (
        <button
          onClick={() => void copyValue("code", accessCode)}
          type="button"
        >
          {copied === "code" ? "Код скопирован" : "Копировать код"}
        </button>
      ) : null}
      {trackingUrl ? (
        <>
          <button
            onClick={() => void copyValue("link", trackingUrl)}
            type="button"
          >
            {copied === "link" ? "Ссылка скопирована" : "Копировать ссылку"}
          </button>
          <a href={trackingUrl} rel="noreferrer" target="_blank">
            Открыть страницу клиента ↗
          </a>
        </>
      ) : null}
      {message ? (
        <button
          onClick={() => void copyValue("message", message)}
          type="button"
        >
          {copied === "message"
            ? "Сообщение скопировано"
            : "Копировать сообщение клиенту"}
        </button>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {copied === "error"
          ? "Не удалось скопировать"
          : copied
            ? "Скопировано"
            : ""}
      </span>
    </div>
  );
}
