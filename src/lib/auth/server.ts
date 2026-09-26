import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { getServerConfig } from "@/lib/env";

import { authorizeOwner, type OwnerAccess, type OwnerIdentity } from "./policy";

export class OwnerAuthorizationError extends Error {
  constructor(
    public readonly status: Exclude<OwnerAccess["status"], "granted">,
  ) {
    super("Owner authorization is required.");
    this.name = "OwnerAuthorizationError";
  }
}

async function getClerkIdentity(): Promise<OwnerIdentity | null> {
  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  if (!user || !email) {
    return null;
  }

  return {
    email,
    provider: "clerk",
    providerSubject: user.id,
  };
}

export async function getOwnerAccess(): Promise<OwnerAccess> {
  const config = getServerConfig();
  if (config.authProvider !== "clerk") {
    return authorizeOwner(null, config.ownerEmails, false);
  }

  return authorizeOwner(await getClerkIdentity(), config.ownerEmails, true);
}

export async function requireOwner(): Promise<OwnerIdentity> {
  const access = await getOwnerAccess();
  if (access.status !== "granted") {
    throw new OwnerAuthorizationError(access.status);
  }
  return access.identity;
}
