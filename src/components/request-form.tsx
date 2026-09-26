"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  submitOrderRequest,
  type RequestFormState,
} from "@/app/(localized)/[locale]/catalog/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";

function FieldError({ errors }: { errors?: string[] }) {
  return errors?.length ? (
    <span className="field-error">{errors[0]}</span>
  ) : null;
}

const initialRequestFormState: RequestFormState = { status: "idle" };

export function RequestForm({
  availability,
  colours,
  dictionary,
  locale,
  productId,
  productVersion,
  requestKey,
  sizes,
}: {
  availability: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE" | null;
  colours: Array<{ code: string; name: string }>;
  dictionary: Dictionary;
  locale: Locale;
  productId: string;
  productVersion: string;
  requestKey: string;
  sizes: string[];
}) {
  const [state, action, pending] = useActionState(
    submitOrderRequest,
    initialRequestFormState,
  );
  const successRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state.status === "success") successRef.current?.focus();
  }, [state.status]);

  if (state.status === "success") {
    return (
      <section
        aria-live="polite"
        className="request-success"
        id="request"
        ref={successRef}
        tabIndex={-1}
      >
        <span className="eyebrow">Andrelook</span>
        <h2>{dictionary.requestSuccess}</h2>
        <p>
          {dictionary.requestTitle}: <strong>{state.reference}</strong>
        </p>
      </section>
    );
  }

  const unavailable = availability === "UNAVAILABLE";
  return (
    <section className="request-panel" id="request">
      <span className="eyebrow">Andrelook</span>
      <h2>{dictionary.requestTitle}</h2>
      <p>{dictionary.requestIntro}</p>
      <form action={action} className="request-form">
        <input name="locale" type="hidden" value={locale} />
        <input name="productId" type="hidden" value={productId} />
        <input name="productVersion" type="hidden" value={productVersion} />
        <input name="requestKey" type="hidden" value={requestKey} />

        {sizes.length ? (
          <label>
            <span>{dictionary.selectSize}</span>
            <select name="size" required>
              <option value="">—</option>
              {sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.size} />
          </label>
        ) : null}

        {colours.length ? (
          <label>
            <span>{dictionary.selectColour}</span>
            <select name="colour" required>
              <option value="">—</option>
              {colours.map((colour) => (
                <option key={colour.code} value={colour.code}>
                  {colour.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.errors?.colour} />
          </label>
        ) : null}

        <label>
          <span>{dictionary.name}</span>
          <input autoComplete="name" name="name" required />
          <FieldError errors={state.errors?.name} />
        </label>

        <label>
          <span>{dictionary.contactMethod}</span>
          <select defaultValue="TELEGRAM" name="contactMethod">
            <option value="TELEGRAM">{dictionary.contactTelegram}</option>
            <option value="INSTAGRAM">{dictionary.contactInstagram}</option>
            <option value="EMAIL">{dictionary.contactEmail}</option>
          </select>
        </label>

        <label>
          <span>{dictionary.contactValue}</span>
          <input autoComplete="email" name="contactValue" required />
          <FieldError errors={state.errors?.contactValue} />
        </label>

        <label className="consent-row">
          <input name="consent" required type="checkbox" value="accepted" />
          <span>{dictionary.consent}</span>
        </label>
        <FieldError errors={state.errors?.consent} />

        {state.status === "error" ? (
          <p aria-live="polite" className="form-error">
            {dictionary.formError}
          </p>
        ) : null}

        <button disabled={pending || unavailable} type="submit">
          {pending ? dictionary.submitting : dictionary.submit}
        </button>
      </form>
      <a
        className="secondary-contact"
        href="https://t.me/andrelookstore"
        rel="noreferrer"
        target="_blank"
      >
        {dictionary.secondaryContact}
      </a>
    </section>
  );
}
