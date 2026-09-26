import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cache } from "react";

import { isLocale, type Locale } from "@/config/locales";
import { getPublicProduct } from "@/lib/catalog/public-query";
import { isDatabaseConfigured } from "@/lib/env";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    categorySlug: string;
    locale: string;
    productSlug: string;
  }>;
};

const loadProduct = cache(
  async (locale: Locale, categorySlug: string, productSlug: string) => {
    if (!isDatabaseConfigured()) {
      return null;
    }
    return getPublicProduct(locale, categorySlug, productSlug);
  },
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug, locale, productSlug } = await params;
  if (!isLocale(locale)) {
    return {};
  }

  const product = await loadProduct(locale, categorySlug, productSlug);
  return {
    alternates: localizedAlternates(
      locale,
      `catalog/${categorySlug}/${productSlug}`,
    ),
    description: product?.shortDescription ?? undefined,
    robots: indexingRobots(),
    title: product?.name ?? "Andrelook",
  };
}

export default async function ProductPage({ params }: Props) {
  const { categorySlug, locale, productSlug } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const product = await loadProduct(locale, categorySlug, productSlug);
  if (!product) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat(locale, {
    currency: product.currency,
    style: "currency",
  }).format(product.retailPriceMinor / 100);

  return (
    <article className="container product-detail">
      <div className="product-detail-grid">
        <div className="product-detail-gallery">
          {product.images.map((image) =>
            image.url.startsWith("/") ? (
              <Image
                alt={image.alt}
                height={image.height}
                key={image.url}
                sizes="(max-width: 1024px) 100vw, 55vw"
                src={image.url}
                width={image.width}
              />
            ) : null,
          )}
        </div>
        <div>
          <span className="eyebrow">{product.category.name}</span>
          <h1>{product.name}</h1>
          {product.brand ? <p>{product.brand.name}</p> : null}
          <p>{formattedPrice}</p>
          <p>{product.availability.replaceAll("_", " ")}</p>
          {product.description ? <p>{product.description}</p> : null}
        </div>
      </div>
    </article>
  );
}
