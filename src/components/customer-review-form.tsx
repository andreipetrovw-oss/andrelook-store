"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Locale } from "@/config/locales";
import { submitReview } from "@/app/(root)/review/actions";
import { reviewCopy } from "@/lib/reviews/copy";

export function CustomerReviewForm({
  token,
  locale,
  names,
  products,
}: {
  token: string;
  locale: Locale;
  names: { first: string | null; initial: string | null };
  products: string[];
}) {
  const c = reviewCopy[locale];
  const [state, action, pending] = useActionState(
    submitReview.bind(null, token),
    { success: false, error: false },
  );
  if (state.success)
    return (
      <section role="status" className="review-success">
        <span className="eyebrow">ANDRELOOK</span>
        <h1>{c.success}</h1>
        <p>{c.successBody}</p>
        <Link className="secondary-button" href={`/${locale}`}>
          {c.home}
        </Link>
      </section>
    );
  return (
    <form action={action} className="customer-review-form">
      <input name="locale" type="hidden" value={locale} />
      <fieldset className="review-rating">
        <legend>{c.rating}</legend>
        <div className="review-stars-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n}>
              <input
                aria-label={`${n} ${c.stars}`}
                name="rating"
                required
                type="radio"
                value={n}
              />
              <span aria-hidden="true">★</span>
              <small>{n}</small>
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        <span>{c.text}</span>
        <textarea
          aria-describedby="review-text-hint"
          name="text"
          required
          minLength={10}
          maxLength={3000}
          rows={5}
        />
        <small id="review-text-hint">{c.textHint}</small>
      </label>
      {products.length ? (
        <label>
          <span>{c.product}</span>
          <select name="productIndex" defaultValue="">
            <option value="">{c.service}</option>
            {products.map((name, index) => (
              <option key={index} value={index}>
                {name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="productIndex" value="" />
      )}
      <details className="review-optional">
        <summary>{c.optional}</summary>
        <div>
          {(
            [
              ["quality", c.quality],
              ["communication", c.communication],
              ["delivery", c.delivery],
            ] as const
          ).map(([name, label]) => (
            <label key={name}>
              <span>{label}</span>
              <select name={name} defaultValue="">
                <option value="">{c.skip}</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </details>
      <label>
        <span>{c.name}</span>
        <select
          name="nameStyle"
          defaultValue={names.initial ? "INITIAL" : "ANONYMOUS"}
        >
          {names.first ? (
            <option value="FIRST">
              {names.first} · {c.first}
            </option>
          ) : null}
          {names.initial ? (
            <option value="INITIAL">
              {names.initial} · {c.initial}
            </option>
          ) : null}
          <option value="ANONYMOUS">{c.anonymous}</option>
        </select>
      </label>
      <label className="review-consent">
        <input name="consent" required type="checkbox" value="yes" />
        <span>{c.consent}</span>
      </label>
      {state.error ? (
        <p className="review-error" role="alert">
          {c.error}
        </p>
      ) : null}
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? c.pending : c.submit}
      </button>
      <Link className="text-action" href={`/${locale}/privacy`}>
        {c.privacy}
      </Link>
    </form>
  );
}
