import { ClerkProvider, SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { getServerConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Owner access | Andrelook",
};

export default function SignInPage() {
  const config = getServerConfig();

  if (config.authProvider !== "clerk" || !config.clerkPublishableKey) {
    return (
      <main className="auth-boundary">
        <span className="eyebrow">Owner access</span>
        <h1>Authentication is not configured</h1>
        <p>
          The admin area is fail-closed. Configure the approved Clerk project,
          its environment keys, and OWNER_EMAILS before staging access.
        </p>
      </main>
    );
  }

  return (
    <ClerkProvider publishableKey={config.clerkPublishableKey}>
      <main className="auth-boundary">
        <SignIn forceRedirectUrl="/admin" />
      </main>
    </ClerkProvider>
  );
}
