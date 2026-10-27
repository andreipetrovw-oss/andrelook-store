"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  submitWithdrawal,
  type WithdrawalFormState,
} from "@/app/(localized)/[locale]/withdrawal/actions";
import type { Locale } from "@/config/locales";
import { withdrawalCopy } from "@/lib/legal/policy";

const initialState: WithdrawalFormState = { status: "idle" };

export function WithdrawalForm({
  locale,
  requestKey,
}: {
  locale: Locale;
  requestKey: string;
}) {
  const copy = withdrawalCopy[locale];
  const [state, action, pending] = useActionState(
    submitWithdrawal,
    initialState,
  );
  const result = useRef<HTMLHeadingElement>(null);
  // Preserve declaration fields if only acknowledgement delivery needs retrying;
  // React otherwise resets uncontrolled inputs when a form action completes.
  const [values, setValues] = useState({
    consumerName: "",
    orderReference: "",
    confirmationEmail: "",
  });
  const formId = "withdrawal-" + requestKey;
  useEffect(() => {
    if (state.status === "success") {
      result.current?.focus({ preventScroll: true });
      result.current?.scrollIntoView({ block: "start" });
    }
  }, [state]);
  return (
    <section className="withdrawal-function">
      {state.status === "success" ? (
        <div aria-live="polite" className="withdrawal-confirmation">
          <h2 ref={result} tabIndex={-1}>
            {copy.successTitle}
          </h2>
          <p>{copy.confirmationLead}</p>
          <p>{copy.statement}</p>
          {state.submittedAt ? (
            <p>
              {copy.submittedAt}:{" "}
              <strong>
                {new Intl.DateTimeFormat(locale, {
                  dateStyle: "long",
                  timeStyle: "long",
                  timeZone: "Europe/Tallinn",
                }).format(new Date(state.submittedAt))}
              </strong>
            </p>
          ) : null}
          <p>
            {copy.reference}: <strong>{state.publicId}</strong>
          </p>
          {state.notificationIssue ? (
            <>
              <p className="form-error">{copy.confirmationDeliveryIssue}</p>
              <button disabled={pending} form={formId} type="submit">
                {copy.retry}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      <form
        action={action}
        className="withdrawal-form"
        hidden={state.status === "success"}
        id={formId}
      >
        <input name="locale" type="hidden" value={locale} />
        <input name="requestKey" type="hidden" value={requestKey} />
        <input name="statementConfirmed" type="hidden" value="accepted" />
        <label>
          <span>{copy.consumerName}</span>
          <input
            autoComplete="name"
            maxLength={200}
            minLength={2}
            name="consumerName"
            value={values.consumerName}
            onChange={(event) =>
              setValues({ ...values, consumerName: event.currentTarget.value })
            }
            required
          />
        </label>
        <label>
          <span>{copy.orderReference}</span>
          <input
            autoComplete="off"
            maxLength={500}
            minLength={2}
            name="orderReference"
            value={values.orderReference}
            onChange={(event) =>
              setValues({
                ...values,
                orderReference: event.currentTarget.value,
              })
            }
            required
          />
        </label>
        <label>
          <span>{copy.confirmationEmail}</span>
          <input
            autoComplete="email"
            maxLength={320}
            name="confirmationEmail"
            value={values.confirmationEmail}
            onChange={(event) =>
              setValues({
                ...values,
                confirmationEmail: event.currentTarget.value,
              })
            }
            required
            type="email"
          />
        </label>
        <p>{copy.statement}</p>
        <p className="withdrawal-privacy">{copy.privacy}</p>
        {state.status === "error" ? (
          <p className="form-error" role="alert">
            {copy.error}
          </p>
        ) : null}
        <button disabled={pending} type="submit">
          {copy.confirm}
        </button>
      </form>
      <p className="withdrawal-alternative">
        <a href="mailto:info.andrelook@gmail.com">info.andrelook@gmail.com</a>
      </p>
    </section>
  );
}
