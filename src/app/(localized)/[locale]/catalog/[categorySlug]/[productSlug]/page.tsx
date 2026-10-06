import { randomUUID } from "node:crypto";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ProductCard } from "@/components/product-card";
import { ProductConfigurator } from "@/components/product-configurator";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInteractionProvider } from "@/components/product-interaction-context";
import { MobileProductCta } from "@/components/mobile-product-cta";
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
import { getProductDisplayName } from "@/lib/catalog/presentation";
import { getServerConfig } from "@/lib/env";
import {
  brandedTitle,
  indexingRobots,
  localizedAlternates,
  localizedOpenGraph,
  productStructuredData,
} from "@/lib/seo";

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
      ...localizedOpenGraph(resolved.locale),
      title: brandedTitle(product.name),
      type: "website",
    },
    robots: indexingRobots(),
    title: product.name,
    twitter: {
      card: product.images[0] ? "summary_large_image" : "summary",
      description: description ?? undefined,
      images: product.images[0]?.url ? [product.images[0].url] : undefined,
      title: brandedTitle(product.name),
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
  const data = productStructuredData({
    availability: product.availability,
    brand: product.brand?.name ?? null,
    currency: product.currency,
    description: approvedDescription(product.description),
    images: product.images.map((image) => image.url),
    name: product.name,
    priceMinor: product.retailPriceMinor,
    url,
  });
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
      : null;
  const preorderTime = {
    en: "2–3 weeks",
    et: "2–3 nädalat",
    ru: "2–3 недели",
  }[locale];
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
  const displayName = getProductDisplayName(product.name, product.brand?.name);
  const primaryImage =
    product.images.find((image) => image.role === "PRIMARY") ??
    product.images[0] ??
    null;

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

      <ProductInteractionProvider
        colourCodes={product.colors.map((colour) => colour.code)}
        sizes={sizes}
      >
        <article className="container product-detail phase6e-product-detail">
          <nav aria-label={dictionary.breadcrumb} className="breadcrumb">
            <Link href={`/${locale}`}>{dictionary.home}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/catalog`}>{dictionary.catalog}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/catalog/${resolved.categorySlug}`}>
              {product.category.name}
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{displayName}</span>
          </nav>

          <div className="product-detail-grid">
            <ProductGallery
              dictionary={dictionary}
              images={product.images}
              locale={locale}
            />
            <div className="product-summary">
              <div className="product-identity-line">
                <span className="eyebrow">
                  {product.brand?.name ?? product.category.name}
                </span>
                <span className={`status-pill ${statusClass}`}>
                  {availability}
                </span>
              </div>
              <h1>{displayName}</h1>
              {formattedPrice ? (
                <p className="product-price">{formattedPrice}</p>
              ) : (
                <p className="product-price-note">
                  {content.commerce.detailsPending}
                </p>
              )}
              <p className="commercial-intro">
                {content.product.commercialIntro}
              </p>

              <ProductConfigurator
                colours={product.colors}
                dictionary={dictionary}
                locale={locale}
                requestLabel={content.product.requestLabel}
                sizes={sizes}
              />
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
                  <dt>{dictionary.leadTime}</dt>
                  <dd>{preorderTime}</dd>
                </div>
                {formattedPrice ? (
                  <div>
                    <dt>{dictionary.price}</dt>
                    <dd>{formattedPrice}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{content.product.sizingLabel}</dt>
                  <dd>
                    {chart
                      ? content.product.sizeGuideAvailable
                      : content.product.sizeGuideUnavailable}
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
                    <span className="eyebrow">
                      {content.product.sizingLabel}
                    </span>
                    <h2>
                      {chart ? dictionary.sizeGuide : dictionary.personalSizing}
                    </h2>
                  </div>
                  <Link className="text-action" href={`/${locale}/contact`}>
                    {dictionary.contact} →
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
                  <div className="personal-sizing-service">
                    <p>{content.product.assistanceBody}</p>
                    <a className="secondary-button" href="#request">
                      {content.product.requestLabel}
                    </a>
                  </div>
                )}
                {chart ? (
                  <aside className="sizing-help-note">
                    <strong>{content.product.helpLabel}</strong>
                    <p>{content.product.assistanceBody}</p>
                  </aside>
                ) : null}
              </section>

              <section
                className="product-service-grid"
                aria-label={dictionary.productInformation}
              >
                <article>
                  <span>01</span>
                  <h3>{dictionary.deliveryPayment}</h3>
                  <p>{content.product.deliverySummary}</p>
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
                  <p>{content.product.returnsSummary}</p>
                  <Link href={`/${locale}/returns-exchanges`}>
                    {content.product.learnMoreLabel} →
                  </Link>
                </article>
              </section>
            </div>

            <aside className="product-request-column">
              <RequestForm
                availability={product.availability}
                brandName={product.brand?.name ?? product.category.name}
                colours={product.colors}
                dictionary={dictionary}
                locale={locale}
                productId={product.id}
                productImage={
                  primaryImage
                    ? { alt: primaryImage.alt, url: primaryImage.url }
                    : null
                }
                productName={displayName}
                productVersion={product.version}
                preorderTime={preorderTime}
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
                <span className="eyebrow">{content.home.editorialLabel}</span>
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
        <MobileProductCta
          label={content.product.requestLabel}
          productName={displayName}
        />
      </ProductInteractionProvider>
    </>
  );
}
