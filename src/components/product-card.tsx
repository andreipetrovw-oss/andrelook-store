import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import { getStorefrontContent } from "@/i18n/storefront-content";
import type { PublicProductDto } from "@/lib/catalog/public-dto";

import { ProductPlaceholder } from "./product-placeholder";

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
  const formattedPrice =
    product.currency && product.retailPriceMinor !== null
      ? new Intl.NumberFormat(locale, {
          currency: product.currency,
          style: "currency",
        }).format(product.retailPriceMinor / 100)
      : content.commerce.priceOnRequest;
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
        className="product-card-image"
        href={`/${locale}/catalog/${product.category.slug}/${product.slug}`}
      >
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
        <span className={`product-card-status status-pill ${statusClass}`}>
          {availability}
        </span>
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span className="product-card-category">{product.category.name}</span>
          {product.brand ? (
            <span className="product-card-brand">{product.brand.name}</span>
          ) : null}
        </div>
        <h2>
          <Link
            href={`/${locale}/catalog/${product.category.slug}/${product.slug}`}
          >
            {product.name}
          </Link>
        </h2>
        {product.colors.length ? (
          <p className="product-card-options">
            {dictionary.colour}:{" "}
            {product.colors.map((colour) => colour.name).join(", ")}
          </p>
        ) : null}
        {product.availability === "PRE_ORDER" && product.preorderEstimate ? (
          <p className="product-card-options">
            {dictionary.preorder}: {product.preorderEstimate}
          </p>
        ) : null}
        <div className="product-card-footer">
          <span>{formattedPrice}</span>
          <span className="product-card-cta">{dictionary.viewProduct} ↗</span>
        </div>
      </div>
    </article>
  );
}
