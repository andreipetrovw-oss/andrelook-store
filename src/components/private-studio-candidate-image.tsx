"use client";

import { useState } from "react";

export function PrivateStudioCandidateImage({
  alt,
  candidateId,
}: {
  alt: string;
  candidateId: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div className={`private-image-frame is-${state}`}>
      {state === "loading" ? (
        <span className="private-image-state" role="status">
          Загружаем версию Studio…
        </span>
      ) : null}
      {state === "error" ? (
        <span className="private-image-state is-error" role="alert">
          Версия Studio временно недоступна
        </span>
      ) : null}
      {/* Candidate bytes stay behind the owner-authenticated private route. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt={alt}
        loading="lazy"
        onError={() => setState("error")}
        onLoad={() => setState("ready")}
        src={`/admin/studio-candidates/${encodeURIComponent(candidateId)}`}
      />
    </div>
  );
}
