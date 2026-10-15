"use client";

import { useActionState } from "react";

import {
  lookupTracking,
  type TrackingLookupState,
} from "@/app/(root)/track/actions";

const initialState: TrackingLookupState = { status: "idle" };

export function TrackingLookupForm() {
  const [state, action, pending] = useActionState(lookupTracking, initialState);
  return (
    <form action={action} className="tracking-lookup-form">
      <label>
        <span>Order number</span>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          name="reference"
          placeholder="AL-…"
          required
        />
      </label>
      <label>
        <span>Email</span>
        <input autoComplete="email" name="email" required type="email" />
      </label>
      {state.status === "error" ? (
        <p aria-live="polite" className="form-error">
          {state.message}
        </p>
      ) : null}
      <button disabled={pending} type="submit">
        {pending ? "Checking…" : "Track order"}
      </button>
    </form>
  );
}
