import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CampaignCapture } from "@/components/campaign-capture";
import { isLocale, locales } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { localizedAlternates, indexingRobots } from "@/lib/seo";
import { getServerConfig } from "@/lib/env";
import { andrelookFontVariables } from "@/lib/fonts";
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
    metadataBase: getServerConfig().siteUrl,
    openGraph: {
      description: dictionary.tagline,
      images: [
        {
          alt: "Andrelook",
          height: 1080,
          url: "/brand/hero-bg.jpg",
          width: 1920,
        },
      ],
      siteName: "Andrelook",
      title: "Andrelook",
      type: "website",
    },
    robots: indexingRobots(),
    title: {
      default: "Andrelook",
      template: "%s | Andrelook",
    },
    twitter: {
      card: "summary_large_image",
      description: dictionary.tagline,
      images: ["/brand/hero-bg.jpg"],
      title: "Andrelook",
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
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    email: "info.andrelook@gmail.com",
    name: "Andrelook",
    sameAs: [
      "https://t.me/andrelookstore",
      "https://www.instagram.com/andrelook.store/",
    ],
    url: new URL(`/${locale}`, getServerConfig().siteUrl).toString(),
  };
  return (
    <html className={andrelookFontVariables} lang={locale}>
      <body>
        <CampaignCapture />
        <a className="skip-link" href="#main-content">
          {dictionary.skipToContent}
        </a>
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organization).replaceAll("<", "\\u003c"),
          }}
          type="application/ld+json"
        />
        <SiteHeader dictionary={dictionary} locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter dictionary={dictionary} locale={locale} />
      </body>
    </html>
  );
}
