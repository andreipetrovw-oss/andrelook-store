import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CategoryNavigation } from "@/components/category-navigation";
import { CatalogExperience } from "@/components/catalog-experience";
import Link from "next/link";
import { isLocale, locales } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCategories,
  getPublicCategoryProducts,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { isDatabaseConfigured } from "@/lib/env";
import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
} from "@/lib/seo";

export const revalidate = 300;

type Props = {
  params: Promise<{ categorySlug: string; locale: string }>;
};

export async function generateStaticParams() {
  if (!isDatabaseConfigured()) return [];
  const scope = storefrontScope();
  const entries = await Promise.all(
    locales.map(async (locale) => {
      const categories = await getPublicCategories(locale, scope);
      return categories.flatMap((category) =>
        category.children.map((child) => ({
          categorySlug: child.slug,
          locale,
        })),
      );
    }),
  );
  return entries.flat();
}

function categoryDescription(locale: "ru" | "et" | "en", name: string) {
  return {
    en: `${name} by Moncler and Parajumpers, selected by Andrelook in Tallinn with pre-order and personal sizing support.`,
    et: `Andrelooki valitud ${name.toLocaleLowerCase()} Monclerilt ja Parajumpersilt, eeltellimisel ning abiga suuruse valikul.`,
    ru: `${name} Moncler и Parajumpers в коллекции Andrelook: предзаказ и помощь с выбором размера из Таллинна.`,
  }[locale];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  if (isDatabaseConfigured()) {
    const categories = await getPublicCategories(locale, storefrontScope());
    const category = categories
      .flatMap((parent) => parent.children)
      .find((item) => item.slug === categorySlug);
    if (!category) notFound();
    const description = categoryDescription(locale, category.name);
    return {
      alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
      description,
      openGraph: {
        description,
        ...localizedOpenGraph(locale),
        title: brandedTitle(category.name),
      },
      robots: indexingRobots(),
      title: category.name,
      twitter: {
        card: "summary_large_image",
        description,
        title: brandedTitle(category.name),
      },
    };
  }
  return {
    alternates: localizedAlternates(locale, `catalog/${categorySlug}`),
    robots: indexingRobots(),
    title: categorySlug.replaceAll("-", " "),
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categorySlug, locale } = await params;
  if (!isLocale(locale)) notFound();
  const dictionary = getDictionary(locale);
  const scope = storefrontScope();
  const [products, categories] = isDatabaseConfigured()
    ? await Promise.all([
        getPublicCategoryProducts(locale, categorySlug, scope),
        getPublicCategories(locale, scope),
      ])
    : [[], []];
  const category = categories
    .flatMap((parent) => parent.children)
    .find((item) => item.slug === categorySlug);
  if (!category && isDatabaseConfigured()) notFound();
  const description = category
    ? categoryDescription(locale, category.name)
    : dictionary.categoryContext;

  return (
    <>
      <header className="catalog-hero compact">
        <div className="container">
          <nav aria-label={dictionary.breadcrumb} className="breadcrumb">
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
            <span aria-hidden="true">/</span>
            <span>{category?.name ?? categorySlug}</span>
          </nav>
          <span className="eyebrow">{dictionary.catalog}</span>
          <h1>{category?.name ?? categorySlug}</h1>
          <p>{description}</p>
        </div>
      </header>
      <div className="container">
        <CategoryNavigation
          activeSlug={categorySlug}
          categories={categories}
          dictionary={dictionary}
          locale={locale}
        />
      </div>
      <Suspense
        fallback={<div aria-busy="true" className="container loading-line" />}
      >
        <CatalogExperience
          basePath={`/${locale}/catalog/${categorySlug}`}
          dictionary={dictionary}
          locale={locale}
          products={products}
        />
      </Suspense>
    </>
  );
}
