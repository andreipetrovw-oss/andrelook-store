import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/locales";
import type { PublicProductDto } from "@/lib/catalog/public-dto";

export function ProductCard({
  dictionary,
  locale,
  product,
}: {
  dictionary: import("@/i18n/dictionaries").Dictionary;
  locale: Locale;
  product: PublicProductDto;
}) {
  const primaryImage = product.images.find((image) => image.role === "PRIMARY");
  const formattedPrice =
    product.currency && product.retailPriceMinor !== null
      ? new Intl.NumberFormat(locale, {
          currency: product.currency,
          style: "currency",
        }).format(product.retailPriceMinor / 100)
      : dictionary.pricePending;
  const availability = product.availability
    ? {
        IN_STOCK: dictionary.availabilityInStock,
        PRE_ORDER: dictionary.availabilityPreOrder,
        UNAVAILABLE: dictionary.availabilityUnavailable,
      }[product.availability]
    : dictionary.availabilityPending;

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
          <span aria-hidden="true">Andrelook</span>
        )}
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category.name}</span>
        <h2>
          <Link
            href={`/${locale}/catalog/${product.category.slug}/${product.slug}`}
          >
            {product.name}
          </Link>
        </h2>
        {product.brand ? <p>{product.brand.name}</p> : null}
        <div className="product-card-footer">
          <span>{formattedPrice}</span>
          <span>{availability}</span>
        </div>
      </div>
    </article>
  );
}
