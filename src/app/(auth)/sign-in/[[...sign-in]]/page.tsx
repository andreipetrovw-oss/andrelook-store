import { ClerkProvider, SignIn } from "@clerk/nextjs";
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
        <h1>Вход пока не настроен</h1>
        <p>
          Кабинет закрыт по умолчанию. Для доступа нужно настроить одобренный
          проект Clerk и точный список адресов владельца.
        </p>
      </main>
    );
  }

  return (
    <ClerkProvider publishableKey={config.clerkPublishableKey}>
      <main className="auth-boundary">
        <div className="auth-heading">
          <span className="eyebrow">Закрытый кабинет</span>
          <h1>Войти в Andrelook CRM</h1>
          <p>Доступ разрешён только владельцу Andrelook.</p>
        </div>
        <SignIn forceRedirectUrl="/admin" />
      </main>
    </ClerkProvider>
  );
}
