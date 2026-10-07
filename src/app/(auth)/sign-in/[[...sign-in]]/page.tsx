import { ClerkProvider, SignIn } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import type { Metadata } from "next";

import { getServerConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Вход владельца | Andrelook",
};

export default function SignInPage() {
  const config = getServerConfig();

  if (config.authProvider !== "clerk" || !config.clerkPublishableKey) {
    return (
      <main className="auth-boundary">
        <span className="eyebrow">Доступ владельца</span>
        <h1>Авторизация не настроена</h1>
        <p>
          Доступ в CRM закрыт. Необходимо настроить одобренный проект Clerk, его
          ключи окружения и список OWNER_EMAILS.
        </p>
      </main>
    );
  }

  return (
    <ClerkProvider
      localization={ruRU}
      publishableKey={config.clerkPublishableKey}
    >
      <main className="auth-boundary">
        <SignIn forceRedirectUrl="/admin" />
      </main>
    </ClerkProvider>
  );
}
