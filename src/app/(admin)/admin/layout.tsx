import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ruRU } from "@clerk/localizations";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getOwnerAccess } from "@/lib/auth/server";
import { getServerConfig } from "@/lib/env";
import { andrelookFontVariables } from "@/lib/fonts";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Andrelook CRM",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getOwnerAccess();
  if (access.status !== "granted") {
    redirect(`/sign-in?reason=${access.status}`);
  }
  const publishableKey = getServerConfig().clerkPublishableKey;

  return (
    <ClerkProvider
      localization={ruRU}
      publishableKey={publishableKey ?? undefined}
    >
      <html className={andrelookFontVariables} lang="ru">
        <body>
          <div className="admin-shell">
            <aside className="admin-sidebar">
              <strong>ANDRELOOK CRM</strong>
              <nav aria-label="Навигация владельца">
                <Link href="/admin">Обзор</Link>
                <Link href="/admin/orders">Заказы</Link>
                <Link href="/admin/catalog">Каталог</Link>
              </nav>
              <small>{access.identity.email}</small>
            </aside>
            <main className="admin-main">{children}</main>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
