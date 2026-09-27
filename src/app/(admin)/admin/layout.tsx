import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminNavigation } from "@/components/admin-navigation";
import { getOwnerAccess } from "@/lib/auth/server";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false, nocache: true },
  title: "Andrelook CRM — кабинет владельца",
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const access = await getOwnerAccess();
  if (access.status !== "granted") {
    redirect(`/sign-in?reason=${access.status}`);
  }

  return (
    <html lang="ru">
      <body>
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-brand">
              <strong>ANDRELOOK</strong>
              <span>Личный кабинет</span>
            </div>
            <AdminNavigation />
            <small className="admin-identity">
              Владелец · {access.identity.email}
            </small>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
