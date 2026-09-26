import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getOwnerAccess } from "@/lib/auth/server";
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

  return (
    <html lang="en">
      <body>
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <strong>ANDRELOOK CRM</strong>
            <nav aria-label="Owner navigation">
              <Link href="/admin">Overview</Link>
              <Link href="/admin/orders">Orders</Link>
              <Link href="/admin/catalog">Catalog</Link>
            </nav>
            <small>{access.identity.email}</small>
          </aside>
          <main className="admin-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
