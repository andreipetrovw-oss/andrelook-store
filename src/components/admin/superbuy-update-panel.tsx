"use client";

import { useActionState } from "react";

import {
  confirmSuperbuyUpdate,
  previewSuperbuyUpdate,
  type SuperbuyPreviewState,
} from "@/app/(admin)/admin/logistics/actions";

const initialState: SuperbuyPreviewState = {
  error: null,
  eta: null,
  etaProposed: false,
  events: [],
  rawText: "",
  unrecognized: [],
};

const date = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Tallinn",
});

export function SuperbuyUpdatePanel({ shipmentId }: { shipmentId: string }) {
  const [state, previewAction, pending] = useActionState(
    previewSuperbuyUpdate,
    initialState,
  );
  const proposedCount = state.events.length + (state.etaProposed ? 1 : 0);

  return (
    <details className="logistics-action-panel">
      <summary>Вставить обновление Superbuy</summary>
      <form action={previewAction} className="admin-stack-form">
        <input name="shipmentId" type="hidden" value={shipmentId} />
        <label>
          <span>Вставьте историю отслеживания Superbuy</span>
          <textarea
            defaultValue={state.rawText}
            name="rawText"
            placeholder="Paste Superbuy tracking history here"
            required
            rows={8}
          />
        </label>
        {state.error ? <p className="form-error">{state.error}</p> : null}
        <button disabled={pending} type="submit">
          {pending ? "Проверяем…" : "Показать предварительный результат"}
        </button>
      </form>

      {state.rawText && !state.error ? (
        <section aria-live="polite" className="logistics-preview">
          <h3>
            {proposedCount
              ? `Найдено новых обновлений: ${proposedCount}`
              : "Новых обновлений нет"}
          </h3>
          {state.events.length ? (
            <ul className="logistics-timeline">
              {state.events.map((event) => (
                <li key={event.canonicalKey}>
                  <time dateTime={event.timestamp}>
                    {date.format(new Date(event.timestamp))}
                  </time>
                  <strong>{event.label}</strong>
                </li>
              ))}
            </ul>
          ) : null}
          {state.etaProposed && state.eta ? (
            <p>
              <strong>Ожидаемое прибытие:</strong>{" "}
              {date.format(new Date(state.eta))}
            </p>
          ) : null}
          {state.unrecognized.length ? (
            <details className="logistics-unrecognized">
              <summary>Не удалось распознать</summary>
              <ul>
                {state.unrecognized.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p>Эти строки не будут импортированы автоматически.</p>
            </details>
          ) : null}
          <div className="admin-inline-actions">
            {proposedCount ? (
              <form action={confirmSuperbuyUpdate}>
                <input name="shipmentId" type="hidden" value={shipmentId} />
                <input name="rawText" type="hidden" value={state.rawText} />
                <button type="submit">Подтвердить обновление</button>
              </form>
            ) : null}
            <a
              className="admin-secondary-link"
              href={`/admin/logistics/${shipmentId}`}
            >
              Отмена
            </a>
          </div>
        </section>
      ) : null}
    </details>
  );
}
