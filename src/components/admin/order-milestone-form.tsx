"use client";

import { useActionState, useState } from "react";
import { recordOrderTrackingMilestone } from "@/app/(admin)/admin/actions";

export function OrderMilestoneForm({
  orderId,
  kinds,
}: {
  orderId: string;
  kinds: Array<{ value: string; label: string }>;
}) {
  const [state, action, pending] = useActionState(
    recordOrderTrackingMilestone,
    {
      error: null,
    },
  );
  // Retain the actual owner input after validation failures and for safe retries.
  const [values, setValues] = useState({
    kind: kinds[0]?.value ?? "",
    evidenceSource: "OWNER_CONFIRMED",
    occurredAt: "",
    evidenceNote: "",
  });
  return (
    <form action={action} aria-busy={pending} className="admin-stack-form">
      <input name="orderId" type="hidden" value={orderId} />
      <fieldset
        className="admin-stack-form admin-form-grid"
        disabled={pending}
        style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
      >
        <label>
          <span>Событие</span>
          <select
            name="kind"
            value={values.kind}
            onChange={(e) =>
              setValues({ ...values, kind: e.currentTarget.value })
            }
          >
            {kinds.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Источник доказательства</span>
          <select
            name="evidenceSource"
            value={values.evidenceSource}
            onChange={(e) =>
              setValues({ ...values, evidenceSource: e.currentTarget.value })
            }
          >
            <option value="OWNER_CONFIRMED">OWNER_CONFIRMED</option>
            <option value="WAREHOUSE_CONFIRMED">WAREHOUSE_CONFIRMED</option>
            <option value="MANUAL_OVERRIDE">MANUAL_OVERRIDE</option>
          </select>
        </label>
        <label>
          <span>Реальная дата и время (Таллинн)</span>
          <input
            name="occurredAt"
            required
            type="datetime-local"
            value={values.occurredAt}
            onChange={(e) =>
              setValues({ ...values, occurredAt: e.currentTarget.value })
            }
          />
        </label>
        <label>
          <span>Основание / доказательство (3–500 символов)</span>
          <input
            name="evidenceNote"
            required
            minLength={3}
            maxLength={500}
            value={values.evidenceNote}
            onChange={(e) =>
              setValues({ ...values, evidenceNote: e.currentTarget.value })
            }
          />
        </label>
        <button type="submit">Добавить подтверждённое событие</button>
      </fieldset>
      {state.error ? <p role="alert">{state.error}</p> : null}
      {state.message ? <p role="status">{state.message}</p> : null}
    </form>
  );
}
