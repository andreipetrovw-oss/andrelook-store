"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Главная" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/catalog", label: "Каталог" },
] as const;

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Основная навигация CRM">
      {links.map((link) => {
        const active =
          link.href === "/admin"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={active ? "active" : undefined}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
