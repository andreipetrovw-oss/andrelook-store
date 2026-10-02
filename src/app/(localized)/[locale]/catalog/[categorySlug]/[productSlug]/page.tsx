import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { RequestForm } from "@/components/request-form";
import { SizeGuide } from "@/components/size-guide";
import { isLocale } from "@/config/locales";
import { getDictionary } from "@/i18n/dictionaries";
import { getStorefrontContent } from "@/i18n/storefront-content";
import {
  getPublicCategoryProducts,
  getPublicProduct,
} from "@/lib/catalog/public-query";
import { storefrontScope } from "@/lib/catalog/scope";
import { parseSizeChart } from "@/lib/catalog/size-chart";
import { getServerConfig } from "@/lib/env";
import { indexingRobots, localizedAlternates } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    categorySlug: string;
    locale: string;
    productSlug: string;
  }>;
};

const getCachedProduct = cache(
  (locale: "ru" | "et" | "en", categorySlug: string, productSlug: string) =>
    getPublicProduct(locale, categorySlug, productSlug, storefrontScope()),
);

async function resolveProduct(params: Props["params"]) {
  const { categorySlug, locale, productSlug } = await params;
  if (!isLocale(locale)) return null;
  return getCachedProduct(locale, categorySlug, productSlug);
}

function approvedDescription(value: string | null) {
  if (!value) return null;
  const normalized = value.toLocaleLowerCase();
  return normalized.includes("owner approval") ||
    normalized.includes("owner review") ||
    normalized.includes("omaniku kinnit") ||
    normalized.includes("omaniku ülevaat") ||
    normalized.includes("подтверждения владельца") ||
    normalized.includes("проверке владельцем")
    ? null
    : value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = await params;
  if (!isLocale(resolved.locale)) notFound();
  const product = await resolveProduct(Promise.resolve(resolved));
  if (!product) notFound();
  const path = `catalog/${resolved.categorySlug}/${resolved.productSlug}`;
  const description = approvedDescription(product.shortDescription);
  return {
    alternates: localizedAlternates(resolved.locale, path),
    description: description ?? undefined,
    openGraph: {
      description: description ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
      title: product.name,
      type: "website",
    },
    robots: indexingRobots(),
    title: product.name,
    twitter: {
      card: product.images[0] ? "summary_large_image" : "summary",
      description: description ?? undefined,
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
  )
    return null;
  const availability = {
    IN_STOCK: "https://schema.org/InStock",
    PRE_ORDER: "https://schema.org/PreOrder",
    UNAVAILABLE: "https://schema.org/OutOfStock",
  }[product.availability];
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    description: approvedDescription(product.description) ?? undefined,
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
  const content = getStorefrontContent(locale);
  const [product, categoryProducts] = await Promise.all([
    resolveProduct(Promise.resolve(resolved)),
    getPublicCategoryProducts(locale, resolved.categorySlug, storefrontScope()),
  ]);
  if (!product) notFound();
  const related = categoryProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const formattedPrice =
    product.currency && product.retailPriceMinor !== null
      ? new Intl.NumberFormat(locale, {
          currency: product.currency,
          style: "currency",
        }).format(product.retailPriceMinor / 100)
      : content.commerce.priceOnRequest;
  const chart = product.sizeChart
    ? parseSizeChart(product.sizeChart.data)
    : null;
  const sizes = chart?.sizes ?? [];
  const path = `/${locale}/catalog/${resolved.categorySlug}/${resolved.productSlug}`;
  const url = new URL(path, getServerConfig().siteUrl).toString();
  const availability = product.availability
    ? {
        IN_STOCK: dictionary.availabilityInStock,
        PRE_ORDER: dictionary.availabilityPreOrder,
        UNAVAILABLE: dictionary.availabilityUnavailable,
      }[product.availability]
    : content.commerce.detailsPending;
  const statusClass = product.availability
    ? `status-${product.availability.toLowerCase().replace("_", "-")}`
    : "status-pending";
  const description =
    approvedDescription(product.description) ??
    approvedDescription(product.shortDescription);

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
                  `/${locale}/catalog`,
                  getServerConfig().siteUrl,
                ).toString(),
                name: dictionary.catalog,
                position: 1,
              },
              {
                "@type": "ListItem",
                item: new URL(
                  `/${locale}/catalog/${resolved.categorySlug}`,
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

      <article className="container product-detail phase6e-product-detail">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href={`/${locale}`}>{dictionary.home}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${locale}/catalog/${resolved.categorySlug}`}>
            {product.category.name}
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          <ProductGallery dictionary={dictionary} images={product.images} />
          <div className="product-summary">
            <div className="product-identity-line">
              <span className="eyebrow">
                {product.brand?.name ?? product.category.name}
              </span>
              <span className={`status-pill ${statusClass}`}>
                {availability}
              </span>
            </div>
            <h1>{product.name}</h1>
            <p className="product-price">{formattedPrice}</p>
            <p className="commercial-intro">
              {content.product.commercialIntro}
            </p>

            {product.colors.length ? (
              <section
                className="product-option-preview"
                aria-label={dictionary.colour}
              >
                <h2>{dictionary.colour}</h2>
                <div className="option-chip-row">
                  {product.colors.map((colour) => (
                    <span key={colour.code}>{colour.name}</span>
                  ))}
                </div>
              </section>
            ) : null}
            {sizes.length ? (
              <section
                className="product-option-preview"
                aria-label={dictionary.size}
              >
                <div className="option-heading">
                  <h2>{dictionary.size}</h2>
                  <a href="#size-guide">{dictionary.sizeGuide}</a>
                </div>
                <div className="option-chip-row size-chip-row">
                  {sizes.map((size) => (
                    <span key={size}>{size}</span>
                  ))}
                </div>
              </section>
            ) : null}

            <a className="primary-action" href="#request">
              {content.product.requestLabel}
            </a>
            <div className="product-help-links">
              <Link href={`/${locale}/contact`}>
                {dictionary.personalSizing} ↗
              </Link>
              <Link href={`/${locale}/how-to-order`}>
                {dictionary.howToOrder} ↗
              </Link>
            </div>

            <dl className="product-facts product-commercial-facts">
              <div>
                <dt>{dictionary.availability}</dt>
                <dd>{availability}</dd>
              </div>
              <div>
                <dt>{dictionary.price}</dt>
                <dd>{formattedPrice}</dd>
              </div>
              <div>
                <dt>{dictionary.sizeGuide}</dt>
                <dd>
                  {chart
                    ? content.product.sizeGuideAvailable
                    : dictionary.sizeGuidePending}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="product-information-layout">
          <div className="product-information-main">
            <section className="product-overview-block">
              <span className="eyebrow">{content.product.detailsLabel}</span>
              <h2>{dictionary.overview}</h2>
              {description ? (
                <p>{description}</p>
              ) : (
                <p>{content.commerce.availableExplanation}</p>
              )}
            </section>

            <section className="product-size-block" id="size-guide">
              <div className="product-section-heading">
                <div>
                  <span className="eyebrow">{content.product.sizingLabel}</span>
                  <h2>{dictionary.sizeGuide}</h2>
                </div>
                <Link className="text-action" href={`/${locale}/contact`}>
                  {dictionary.personalSizing} →
                </Link>
              </div>
              {chart && product.sizeChart ? (
                <SizeGuide
                  chart={chart}
                  dictionary={dictionary}
                  locale={locale}
                  units={product.sizeChart.units}
                />
              ) : (
                <p className="pending-note">{dictionary.sizeGuidePending}</p>
              )}
              <aside className="sizing-help-note">
                <strong>{content.product.helpLabel}</strong>
                <p>{content.product.assistanceBody}</p>
              </aside>
            </section>

            <section
              className="product-service-grid"
              aria-label={dictionary.productInformation}
            >
              <article>
                <span>01</span>
                <h3>{dictionary.deliveryPayment}</h3>
                <p>{dictionary.requestIntro}</p>
                <Link href={`/${locale}/delivery-payment`}>
                  {content.product.learnMoreLabel} →
                </Link>
              </article>
              <article>
                <span>02</span>
                <h3>{dictionary.preorder}</h3>
                <p>{content.commerce.preorderExplanation}</p>
                <Link href={`/${locale}/pre-order`}>
                  {content.product.learnMoreLabel} →
                </Link>
              </article>
              <article>
                <span>03</span>
                <h3>{dictionary.returnsExchanges}</h3>
                <p>{content.product.commercialIntro}</p>
                <Link href={`/${locale}/returns-exchanges`}>
                  {content.product.learnMoreLabel} →
                </Link>
              </article>
            </section>
          </div>

          <aside className="product-request-column">
            <RequestForm
              availability={product.availability}
              colours={product.colors}
              dictionary={dictionary}
              locale={locale}
              productId={product.id}
              productVersion={product.version}
              requestKey={randomUUID()}
              sizes={sizes}
            />
          </aside>
        </div>
      </article>

      {related.length ? (
        <section className="container related-section">
          <header className="editorial-heading split-heading">
            <div>
              <span className="eyebrow">Andrelook edit</span>
              <h2>{dictionary.relatedProducts}</h2>
            </div>
            <Link
              className="text-action"
              href={`/${locale}/catalog/${resolved.categorySlug}`}
            >
              {product.category.name} →
            </Link>
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
