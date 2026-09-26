import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, locales } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedAlternates, indexingRobots } from "@/lib/seo";
import "@/styles/globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);
  return {
    alternates: localizedAlternates(locale, ""),
    description: dictionary.tagline,
    robots: indexingRobots(),
    title: {
      default: "Andrelook",
      template: "%s | Andrelook",
    },
  };
}

export default async function LocalizedLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  return (
    <html lang={locale}>
      <body>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <main>{children}</main>
        <SiteFooter dictionary={dictionary} locale={locale} />
      </body>
    </html>
  );
}
