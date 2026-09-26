import { describe, expect, it } from "vitest";

import { authorizeOwner, type OwnerIdentity } from "./policy";

const owner: OwnerIdentity = {
  email: "Owner@Andrelook.store",
  provider: "clerk",
  providerSubject: "user_owner",
};

describe("owner authorization policy", () => {
  it("fails closed when the provider is not configured", () => {
    expect(authorizeOwner(owner, [owner.email], false)).toEqual({
      status: "not-configured",
    });
  });

  it("rejects missing and non-allowlisted identities", () => {
    expect(authorizeOwner(null, [owner.email], true)).toEqual({
      status: "unauthenticated",
    });
    expect(authorizeOwner(owner, ["someone@example.com"], true)).toEqual({
      status: "forbidden",
    });
  });

  it("grants only an exact case-insensitive allowlist match", () => {
    expect(authorizeOwner(owner, ["owner@andrelook.store"], true)).toEqual({
      status: "granted",
      identity: { ...owner, email: "owner@andrelook.store" },
    });
  });
});
