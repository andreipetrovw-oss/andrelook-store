import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";

import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";

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
            loading="eager"
            src="/brand/logo.png"
            width={476}
          />
        </Link>

        <nav aria-label={dictionary.navigation} className="primary-nav">
          <Link href={`/${locale}`}>{dictionary.home}</Link>
          <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
          <Link href={`/${locale}/how-to-order`}>{dictionary.howToOrder}</Link>
          <Link href={`/${locale}/contact`}>{dictionary.contact}</Link>
        </nav>
        <div className="header-actions">
          <Link
            aria-label={dictionary.search}
            className="header-search"
            href={`/${locale}/catalog#catalog-controls`}
          >
            {dictionary.search}
          </Link>
          <LanguageSwitcher
            currentLocale={locale}
            label={dictionary.language}
          />
        </div>
        <MobileMenu dictionary={dictionary} locale={locale} />
      </div>
    </header>
  );
}
