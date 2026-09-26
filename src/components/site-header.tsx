import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";

import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link aria-label="Andrelook" className="brand-link" href={`/${locale}`}>
          <Image
            alt="Andrelook"
            className="brand-logo"
            height={302}
            priority
            src="/brand/logo.png"
            width={476}
          />
        </Link>

        <nav aria-label={dictionary.navigation} className="primary-nav">
          <Link href={`/${locale}`}>{dictionary.home}</Link>
          <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
        </nav>

        <LanguageSwitcher currentLocale={locale} label={dictionary.language} />

        <details className="mobile-navigation">
          <summary aria-label={dictionary.navigation}>Menu</summary>
          <nav aria-label={dictionary.navigation}>
            <Link href={`/${locale}`}>{dictionary.home}</Link>
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
