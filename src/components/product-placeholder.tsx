import type { Dictionary } from "@/i18n/dictionaries";

export function ProductPlaceholder({
  compact = false,
  dictionary,
}: {
  compact?: boolean;
  dictionary: Dictionary;
}) {
  return (
    <div
      aria-label={dictionary.galleryPending}
      className={`product-placeholder${compact ? " compact" : ""}`}
      role="img"
    >
      <span className="placeholder-mark">A</span>
      <span className="placeholder-name">Andrelook</span>
      {!compact ? (
        <span className="placeholder-note">{dictionary.galleryPending}</span>
      ) : null}
    </div>
  );
}
