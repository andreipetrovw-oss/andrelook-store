"use client";

import { useActionState } from "react";

import {
  lookupTracking,
  type TrackingLookupState,
} from "@/app/(root)/track/actions";
import { trackingCopy } from "@/lib/tracking/copy";
import type { PublicTrackingLocale } from "@/lib/tracking/types";

const initialState: TrackingLookupState = { status: "idle" };

export function TrackingLookupForm({
  locale,
}: {
  locale: PublicTrackingLocale;
}) {
  const [state, action, pending] = useActionState(lookupTracking, initialState);
  const copy = trackingCopy[locale];
  return (
    <form action={action} className="tracking-lookup-form">
      <input name="locale" type="hidden" value={locale.toLowerCase()} />
      <label>
        <span>{copy.order}</span>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          name="reference"
          placeholder="AL-…"
          required
        />
      </label>
      <label>
        <span>{copy.accessCode}</span>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          maxLength={12}
          name="accessCode"
          placeholder="ABCD-EFGH"
          required
        />
      </label>
      {state.status === "error" ? (
        <p aria-live="polite" className="form-error">
          {state.message}
        </p>
      ) : null}
      <button disabled={pending} type="submit">
        {pending ? copy.checking : copy.check}
      </button>
    </form>
  );
}
