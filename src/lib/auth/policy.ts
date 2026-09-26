export type OwnerIdentity = {
  email: string;
  provider: "clerk";
  providerSubject: string;
};

export type OwnerAccess =
  | { status: "granted"; identity: OwnerIdentity }
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | { status: "not-configured" };

export function authorizeOwner(
  identity: OwnerIdentity | null,
  allowlistedEmails: readonly string[],
  providerConfigured: boolean,
): OwnerAccess {
  if (!providerConfigured) {
    return { status: "not-configured" };
  }

  if (!identity) {
    return { status: "unauthenticated" };
  }

  const email = identity.email.trim().toLowerCase();
  const allowlist = new Set(
    allowlistedEmails.map((entry) => entry.trim().toLowerCase()),
  );

  if (!allowlist.has(email)) {
    return { status: "forbidden" };
  }

  return { status: "granted", identity: { ...identity, email } };
}
