"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PublicProductDto } from "@/lib/catalog/public-dto";

import { ProductPlaceholder } from "./product-placeholder";

const copy = {
  en: {
    close: "Close image viewer",
    enlarge: "Enlarge image",
    next: "Next image",
    previous: "Previous image",
    zoom: "Zoom image",
    zoomOut: "Reset zoom",
  },
  et: {
    close: "Sulge pildivaatur",
    enlarge: "Suurenda pilti",
    next: "Järgmine pilt",
    previous: "Eelmine pilt",
    zoom: "Suumi pilti",
    zoomOut: "Taasta suurus",
  },
  ru: {
    close: "Закрыть просмотр изображений",
    enlarge: "Увеличить изображение",
    next: "Следующее изображение",
    previous: "Предыдущее изображение",
    zoom: "Увеличить изображение",
    zoomOut: "Вернуть масштаб",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ProductGallery({
  dictionary,
  images,
  locale,
}: {
  dictionary: Dictionary;
  images: PublicProductDto["images"];
  locale: Locale;
}) {
  const labels = copy[locale];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const lastSwipeAt = useRef(0);
  const pointerStart = useRef<number | null>(null);
  const open = activeIndex !== null;
  const activeImage = activeIndex === null ? null : images[activeIndex];

  const previous = useCallback(() => {
    setZoomed(false);
    setActiveIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length,
    );
  }, [images.length]);
  const next = useCallback(() => {
    setZoomed(false);
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % images.length,
    );
  }, [images.length]);
  const close = useCallback(() => {
    setActiveIndex(null);
    setZoomed(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
      if (event.key !== "Tab") return;
      const controls = document.querySelectorAll<HTMLElement>(
        ".product-lightbox button:not([disabled])",
      );
      const first = controls.item(0);
      const last = controls.item(controls.length - 1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      openerRef.current?.focus({ preventScroll: true });
    };
  }, [close, next, open, previous]);

  const viewer =
    open && activeImage
      ? createPortal(
          <div
            aria-label={dictionary.galleryLabel}
            aria-modal="true"
            className="product-lightbox"
            role="dialog"
          >
            <button
              aria-label={labels.close}
              className="lightbox-close"
              onClick={close}
              ref={closeRef}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
            {images.length > 1 ? (
              <>
                <button
                  aria-label={labels.previous}
                  className="lightbox-arrow lightbox-previous"
                  onClick={previous}
                  type="button"
                >
                  <span aria-hidden="true">←</span>
                </button>
                <button
                  aria-label={labels.next}
                  className="lightbox-arrow lightbox-next"
                  onClick={next}
                  type="button"
                >
                  <span aria-hidden="true">→</span>
                </button>
              </>
            ) : null}
            <button
              aria-label={zoomed ? labels.zoomOut : labels.zoom}
              aria-pressed={zoomed}
              className="lightbox-image-button"
              onClick={() => {
                if (performance.now() - lastSwipeAt.current < 500) return;
                setZoomed((current) => !current);
              }}
              onPointerCancel={() => {
                pointerStart.current = null;
              }}
              onPointerDown={(event) => {
                pointerStart.current = event.clientX;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerUp={(event) => {
                if (zoomed || pointerStart.current === null) {
                  pointerStart.current = null;
                  return;
                }
                const distance = event.clientX - pointerStart.current;
                pointerStart.current = null;
                if (Math.abs(distance) < 48) return;
                event.preventDefault();
                lastSwipeAt.current = performance.now();
                if (distance > 0) previous();
                else next();
              }}
              type="button"
            >
              <span className="lightbox-image-stage" data-zoomed={zoomed}>
                <Image
                  alt={activeImage.alt}
                  fill
                  loading="eager"
                  sizes="100vw"
                  src={activeImage.url}
                />
              </span>
            </button>
            <div aria-live="polite" className="lightbox-counter">
              {(activeIndex ?? 0) + 1} / {images.length}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <section aria-label={dictionary.galleryLabel} className="product-gallery">
      {images.length ? (
        <div className="gallery-track">
          {images.map((image, index) => (
            <figure className="gallery-frame" key={`${image.url}-${index}`}>
              <button
                aria-label={`${labels.enlarge}: ${image.alt}`}
                className="gallery-image-button"
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setActiveIndex(index);
                }}
                type="button"
              >
                <Image
                  alt={image.alt}
                  fetchPriority={index === 0 ? "high" : undefined}
                  fill
                  loading={index === 0 ? undefined : "lazy"}
                  preload={index === 0}
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  src={image.url}
                />
                <span aria-hidden="true" className="gallery-enlarge-mark">
                  +
                </span>
              </button>
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
      {viewer}
    </section>
  );
}
