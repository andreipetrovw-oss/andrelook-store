import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";

export function SiteFooter({
  dictionary,
  locale,
}: {
  dictionary: Dictionary;
  locale: Locale;
}) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Image
            alt="Andrelook"
            className="footer-logo"
            height={302}
            src="/brand/logo.png"
            width={476}
          />
          <p>{dictionary.tagline}</p>
        </div>
        <div>
          <h2>{dictionary.navigation}</h2>
          <Link href={`/${locale}`}>{dictionary.home}</Link>
          <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
        </div>
        <div>
          <h2>{dictionary.contact}</h2>
          <a
            href="https://t.me/andrelookstore"
            rel="noreferrer"
            target="_blank"
          >
            Telegram
          </a>
          <a
            href="https://www.instagram.com/andrelook.store/"
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
          <a href="mailto:info.andrelook@gmail.com">info.andrelook@gmail.com</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Andrelook</span>
        <span>{dictionary.footerRegion}</span>
      </div>
    </footer>
  );
}
