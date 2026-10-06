import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import { getStorefrontContent } from "@/i18n/storefront-content";
import type { PublicProductDto } from "@/lib/catalog/public-dto";
import { getProductDisplayName } from "@/lib/catalog/presentation";

import { ProductPlaceholder } from "./product-placeholder";

function formatAdditionalColours(locale: Locale, count: number) {
  if (locale === "et") return count === 1 ? "värv" : "värvi";
  if (locale === "ru") {
    const modulo100 = count % 100;
    const modulo10 = count % 10;
    if (modulo100 >= 11 && modulo100 <= 14) return "цветов";
    if (modulo10 === 1) return "цвет";
    if (modulo10 >= 2 && modulo10 <= 4) return "цвета";
    return "цветов";
  }
  return count === 1 ? "colour" : "colours";
}

export function ProductCard({
  dictionary,
  locale,
  product,
}: {
  dictionary: import("@/i18n/dictionaries").Dictionary;
  locale: Locale;
  product: PublicProductDto;
}) {
  const content = getStorefrontContent(locale);
  const primaryImage = product.images.find((image) => image.role === "PRIMARY");
  const secondaryImage = product.images.find(
    (image) => image.url !== primaryImage?.url,
  );
  const displayName = getProductDisplayName(product.name, product.brand?.name);
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
  const firstColour = product.colors[0]?.name;
  const additionalColours = product.colors.length - 1;
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

  return (
    <article className="product-card">
      <Link
        aria-label={product.name}
        className="product-card-link"
        href={`/${locale}/catalog/${product.category.slug}/${product.slug}`}
      >
        <div className="product-card-image">
          {primaryImage ? (
            <Image
              alt={primaryImage.alt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
              src={primaryImage.url}
            />
          ) : (
            <ProductPlaceholder compact dictionary={dictionary} />
          )}
          {secondaryImage ? (
            <Image
              alt=""
              aria-hidden="true"
              className="product-card-secondary-image"
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
              src={secondaryImage.url}
            />
          ) : null}
          <span className={`product-card-status status-pill ${statusClass}`}>
            {availability}
          </span>
        </div>
        <div className="product-card-body">
          <div className="product-card-meta">
            <span className="product-card-category">
              {product.category.name}
            </span>
            {product.brand ? (
              <span className="product-card-brand">{product.brand.name}</span>
            ) : null}
          </div>
          <h2>{displayName}</h2>
          {product.colors.length ? (
            <p className="product-card-options">
              {firstColour}
              {additionalColours > 0
                ? ` · +${additionalColours} ${formatAdditionalColours(locale, additionalColours)}`
                : ""}
            </p>
          ) : null}
          {product.availability === "PRE_ORDER" && product.preorderEstimate ? (
            <p className="product-card-options">
              {dictionary.availabilityPreOrder} · {preorderTime}
            </p>
          ) : null}
          <div className="product-card-footer">
            {formattedPrice ? <span>{formattedPrice}</span> : <span />}
            <span className="product-card-cta">{dictionary.viewProduct} ↗</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
