import "server-only";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";

export async function requireActiveAdmin() {
  const identity = await requireOwner();

  return getPrisma().adminUser.upsert({
    create: {
      email: identity.email,
      provider: identity.provider,
      providerSubject: identity.providerSubject,
    },
    update: { email: identity.email, isActive: true },
    where: {
      provider_providerSubject: {
        provider: identity.provider,
        providerSubject: identity.providerSubject,
      },
    },
  });
}
