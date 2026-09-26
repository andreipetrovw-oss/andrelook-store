"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { locales, type Locale } from "@/config/locales";

export function LanguageSwitcher({
  currentLocale,
  label,
}: {
  currentLocale: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <nav aria-label={label} className="language-switcher">
      {locales.map((locale) => (
        <Link
          aria-current={locale === currentLocale ? "page" : undefined}
          className="language-link"
          href={`/${locale}${rest ? `/${rest}` : ""}`}
          key={locale}
          lang={locale}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
