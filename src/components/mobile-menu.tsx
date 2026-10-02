"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";

import { LanguageSwitcher } from "./language-switcher";

export function MobileMenu({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenPath(null);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div className="mobile-navigation">
      <button
        aria-controls="mobile-menu-panel"
        aria-expanded={open}
        className="menu-toggle"
        onClick={() => setOpenPath(open ? null : pathname)}
        ref={buttonRef}
        type="button"
      >
        <span>{open ? dictionary.mobileMenuClose : dictionary.mobileMenu}</span>
        <span aria-hidden="true" className="menu-icon">
          <i />
          <i />
        </span>
      </button>
      {open ? (
        <div className="mobile-menu-panel" id="mobile-menu-panel">
          <nav aria-label={dictionary.navigation}>
            <Link href={`/${locale}`}>{dictionary.home}</Link>
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
            <Link href={`/${locale}/how-to-order`}>
              {dictionary.howToOrder}
            </Link>
            <Link href={`/${locale}/contact`}>{dictionary.contact}</Link>
          </nav>
          <LanguageSwitcher
            currentLocale={locale}
            label={dictionary.language}
          />
        </div>
      ) : null}
    </div>
  );
}
