"use client";

import { useActionState, useRef, useState } from "react";

import {
  submitWithdrawal,
  type WithdrawalFormState,
} from "@/app/(localized)/[locale]/withdrawal/actions";
import type { Locale } from "@/config/locales";
import { withdrawalCopy } from "@/lib/legal/policy";

const initialState: WithdrawalFormState = { status: "idle" };

export function WithdrawalForm({ locale }: { locale: Locale }) {
  const copy = withdrawalCopy[locale];
  const [expanded, setExpanded] = useState(false);
  const [state, action, pending] = useActionState(
    submitWithdrawal,
    initialState,
  );
  const requestKeyRef = useRef<HTMLInputElement>(null);

  if (state.status === "success") {
    const submittedAt = state.submittedAt
      ? new Intl.DateTimeFormat(locale, {
          dateStyle: "long",
          timeStyle: "long",
          timeZone: "Europe/Tallinn",
        }).format(new Date(state.submittedAt))
      : null;
    return (
      <section aria-live="polite" className="withdrawal-confirmation">
        <span aria-hidden="true" className="success-check">
          ✓
        </span>
        <h2>{copy.successTitle}</h2>
        <p>{copy.confirmationLead}</p>
        {submittedAt ? (
          <p>
            {copy.submittedAt}: <strong>{submittedAt}</strong>
          </p>
        ) : null}
        <p>
          {copy.reference}: <strong>{state.publicId}</strong>
        </p>
        {state.notificationIssue ? (
          <p className="form-error">{copy.confirmationDeliveryIssue}</p>
        ) : null}
      </section>
    );
  }

  return (
    <section className="withdrawal-function">
      {!expanded ? (
        <button
          className="withdrawal-start-button"
          onClick={() => setExpanded(true)}
          type="button"
        >
          {copy.initialAction}
        </button>
      ) : (
        <form
          action={action}
          className="withdrawal-form"
          onSubmit={() => {
            if (requestKeyRef.current && !requestKeyRef.current.value) {
              requestKeyRef.current.value = crypto.randomUUID();
            }
          }}
        >
          <input name="locale" type="hidden" value={locale} />
          <input name="requestKey" ref={requestKeyRef} type="hidden" />
          <p>{copy.formIntro}</p>
          <label>
            <span>{copy.consumerName}</span>
            <input autoComplete="name" name="consumerName" required />
          </label>
          <label>
            <span>{copy.orderReference}</span>
            <input autoComplete="off" name="orderReference" required />
          </label>
          <label>
            <span>{copy.confirmationEmail}</span>
            <input
              autoComplete="email"
              name="confirmationEmail"
              required
              type="email"
            />
          </label>
          <label className="consent-row withdrawal-statement">
            <input
              name="statementConfirmed"
              required
              type="checkbox"
              value="accepted"
            />
            <span>{copy.statement}</span>
          </label>
          <p className="withdrawal-privacy">{copy.privacy}</p>
          {state.status === "error" ? (
            <p aria-live="polite" className="form-error">
              {copy.error}
            </p>
          ) : null}
          <button disabled={pending} type="submit">
            {copy.confirm}
          </button>
        </form>
      )}
    </section>
  );
}
