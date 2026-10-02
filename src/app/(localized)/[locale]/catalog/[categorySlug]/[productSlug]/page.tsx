import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { RequestForm } from "@/components/request-form";
import { SizeGuide } from "@/components/size-guide";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import {
  getPublicCategoryProducts,
  getPublicProduct,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { parseSizeChart } from "@/lib/catalog/size-chart";
import { indexingRobots, localizedAlternates } from "@/lib/seo";
import { getServerConfig } from "@/lib/env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    categorySlug: string;
    locale: string;
    productSlug: string;
  }>;
};

async function resolveProduct(params: Props["params"]) {
  const { categorySlug, locale, productSlug } = await params;
  if (!isLocale(locale)) return null;
  return getPublicProduct(locale, categorySlug, productSlug, storefrontScope());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  if (!isLocale(resolved.locale)) notFound();
  const product = await resolveProduct(Promise.resolve(resolved));
  if (!product) notFound();
  const path = `catalog/${resolved.categorySlug}/${resolved.productSlug}`;
  return {
    alternates: localizedAlternates(resolved.locale, path),
    description: product.shortDescription ?? undefined,
    openGraph: {
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
      title: product.name,
      type: "website",
    },
    robots: indexingRobots(),
    title: product.name,
    twitter: {
      card: product.images[0] ? "summary_large_image" : "summary",
      description: product.shortDescription ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
      title: product.name,
    },
  };
}

function ProductStructuredData({
  product,
  url,
}: {
  product: NonNullable<Awaited<ReturnType<typeof resolveProduct>>>;
  url: string;
}) {
  if (
    storefrontScope() === "local-review" ||
    !product.currency ||
    product.retailPriceMinor === null ||
    !product.availability
  ) {
    return null;
  }
  const availability = {
    IN_STOCK: "https://schema.org/InStock",
    PRE_ORDER: "https://schema.org/PreOrder",
    UNAVAILABLE: "https://schema.org/OutOfStock",
  }[product.availability];
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    description: product.description ?? undefined,
    image: product.images.map((image) => image.url),
    name: product.name,
    offers: {
      "@type": "Offer",
      availability,
      price: (product.retailPriceMinor / 100).toFixed(2),
      priceCurrency: product.currency,
      url,
    },
  };
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
      type="application/ld+json"
    />
  );
}

export default async function ProductPage({ params }: Props) {
  const resolved = await params;
  if (!isLocale(resolved.locale)) notFound();
  const locale = resolved.locale;
  const dictionary = getDictionary(locale);
  const product = await resolveProduct(Promise.resolve(resolved));
  if (!product) notFound();
  const related = (
    await getPublicCategoryProducts(
      locale,
      resolved.categorySlug,
      storefrontScope(),
    )
  )
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const formattedPrice =
    product.currency && product.retailPriceMinor !== null
      ? new Intl.NumberFormat(resolved.locale, {
          currency: product.currency,
          style: "currency",
        }).format(product.retailPriceMinor / 100)
      : dictionary.pricePending;
  const chart = product.sizeChart
    ? parseSizeChart(product.sizeChart.data)
    : null;
  const sizes = chart?.sizes ?? [];
  const path = `/${resolved.locale}/catalog/${resolved.categorySlug}/${resolved.productSlug}`;
  const url = new URL(path, getServerConfig().siteUrl).toString();
  const availability = product.availability
    ? {
        IN_STOCK: dictionary.availabilityInStock,
        PRE_ORDER: dictionary.availabilityPreOrder,
        UNAVAILABLE: dictionary.availabilityUnavailable,
      }[product.availability]
    : dictionary.availabilityPending;

  return (
    <>
      <ProductStructuredData product={product} url={url} />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: new URL(
                  `/${resolved.locale}/catalog`,
                  getServerConfig().siteUrl,
                ).toString(),
                name: dictionary.catalog,
                position: 1,
              },
              {
                "@type": "ListItem",
                item: new URL(
                  `/${resolved.locale}/catalog/${resolved.categorySlug}`,
                  getServerConfig().siteUrl,
                ).toString(),
                name: product.category.name,
                position: 2,
              },
              {
                "@type": "ListItem",
                item: url,
                name: product.name,
                position: 3,
              },
            ],
          }).replaceAll("<", "\\u003c"),
        }}
        type="application/ld+json"
      />
      <article className="container product-detail">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href={`/${resolved.locale}/catalog`}>{dictionary.catalog}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${resolved.locale}/catalog/${resolved.categorySlug}`}>
            {product.category.name}
          </Link>
        </nav>
        <div className="product-detail-grid">
          <ProductGallery dictionary={dictionary} images={product.images} />
          <div className="product-summary">
            <span className="eyebrow">{product.category.name}</span>
            <h1>{product.name}</h1>
            <p className="product-price">{formattedPrice}</p>
            <dl className="product-facts">
              <div>
                <dt>{dictionary.availability}</dt>
                <dd>{availability}</dd>
              </div>
              <div>
                <dt>{dictionary.colour}</dt>
                <dd>
                  {product.colors.length
                    ? product.colors.map((colour) => colour.name).join(", ")
                    : dictionary.colourPending}
                </dd>
              </div>
            </dl>
            <a className="primary-action" href="#request">
              {dictionary.requestAction}
            </a>
            <p className="assistance-note">
              <Link href={`/${resolved.locale}/contact`}>
                {dictionary.personalSizing} →
              </Link>
            </p>
            <div className="product-content">
              <section>
                <h2>{dictionary.overview}</h2>
                <p>
                  {product.description ??
                    product.shortDescription ??
                    dictionary.descriptionPending}
                </p>
              </section>
              {chart && product.sizeChart ? (
                <SizeGuide
                  chart={chart}
                  dictionary={dictionary}
                  locale={resolved.locale}
                  units={product.sizeChart.units}
                />
              ) : (
                <section>
                  <h2>{dictionary.sizeGuide}</h2>
                  <p className="pending-note">{dictionary.sizeGuidePending}</p>
                </section>
              )}
              <details>
                <summary>{dictionary.delivery}</summary>
                <p>{dictionary.requestIntro}</p>
                <Link href={`/${resolved.locale}/delivery-payment`}>
                  {dictionary.deliveryPayment} →
                </Link>
              </details>
              {product.availability === "PRE_ORDER" ? (
                <details>
                  <summary>{dictionary.preorder}</summary>
                  <p>
                    {product.preorderEstimate ?? dictionary.availabilityPending}
                  </p>
                  <Link href={`/${resolved.locale}/pre-order`}>
                    {dictionary.howItWorks} →
                  </Link>
                </details>
              ) : null}
              <details>
                <summary>{dictionary.returnsExchanges}</summary>
                <Link href={`/${resolved.locale}/returns-exchanges`}>
                  {dictionary.returnsExchanges} →
                </Link>
              </details>
            </div>
            <RequestForm
              availability={product.availability}
              colours={product.colors}
              dictionary={dictionary}
              locale={resolved.locale}
              productId={product.id}
              productVersion={product.version}
              requestKey={randomUUID()}
              sizes={sizes}
            />
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="container related-section">
          <header className="section-heading">
            <span className="eyebrow">Andrelook</span>
            <h2>{dictionary.relatedProducts}</h2>
          </header>
          <div className="catalog-grid compact-grid">
            {related.map((item) => (
              <ProductCard
                dictionary={dictionary}
                key={item.id}
                locale={locale}
                product={item}
              />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
