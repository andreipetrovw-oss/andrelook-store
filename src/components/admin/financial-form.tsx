"use client";

import { useActionState } from "react";
import { saveFinancialCorrection } from "@/app/(admin)/admin/actions";

export function FinancialForm({
  children,
  operation,
}: {
  children: React.ReactNode;
  operation: "ADD" | "EDIT" | "VOID" | "PRICE";
}) {
  const [state, action, pending] = useActionState(saveFinancialCorrection, {
    error: null,
  });
  return (
    <form action={action} aria-busy={pending}>
      <input type="hidden" name="operation" value={operation} />
      <fieldset
        className="admin-stack-form"
        disabled={pending}
        style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}
      >
        {children}
      </fieldset>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
