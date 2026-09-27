"use client";

import { useState } from "react";

export function PrivateSourceImage({
  alt,
  imageId,
}: {
  alt: string;
  imageId: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div className={`private-image-frame is-${state}`}>
      {state === "loading" ? (
        <span className="private-image-state" role="status">
          Загружаем исходник…
        </span>
      ) : null}
      {state === "error" ? (
        <span className="private-image-state is-error" role="alert">
          Исходник временно недоступен
        </span>
      ) : null}
      {/* This opaque, same-origin route is owner-authenticated and never exposes the supplier URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        loading="lazy"
        onError={() => setState("error")}
        onLoad={() => setState("ready")}
        src={`/admin/source-images/${encodeURIComponent(imageId)}`}
      />
    </div>
  );
}
