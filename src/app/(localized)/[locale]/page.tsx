import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";

export default async function LocalizedHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  return (
    <section className="hero">
      <Image
        alt=""
        className="hero-image"
        fill
        priority
        sizes="100vw"
        src="/brand/hero-bg.jpg"
      />
      <div aria-hidden="true" className="hero-overlay" />
      <div className="container hero-content">
        <span className="eyebrow">{dictionary.preview}</span>
        <h1>ANDRELOOK</h1>
        <p className="hero-tagline">{dictionary.tagline}</p>
        <Link className="primary-button" href={`/${locale}/catalog`}>
          {dictionary.viewCatalog}
        </Link>
      </div>
    </section>
  );
}
