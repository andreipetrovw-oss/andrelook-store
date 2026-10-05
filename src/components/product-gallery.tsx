import Image from "next/image";

import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicProductDto } from "@/lib/catalog/public-dto";

import { ProductPlaceholder } from "./product-placeholder";

export function ProductGallery({
  dictionary,
  images,
}: {
  dictionary: Dictionary;
  images: PublicProductDto["images"];
}) {
  return (
    <section aria-label={dictionary.galleryLabel} className="product-gallery">
      {images.length ? (
        <div className="gallery-track">
          {images.map((image, index) => (
            <figure className="gallery-frame" key={`${image.url}-${index}`}>
              <Image
                alt={image.alt}
                fill
                fetchPriority={index === 0 ? "high" : undefined}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 1024px) 100vw, 58vw"
                src={image.url}
              />
              {images.length > 1 ? (
                <figcaption>
                  {index + 1} / {images.length}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : (
        <ProductPlaceholder dictionary={dictionary} />
      )}
    </section>
  );
}
