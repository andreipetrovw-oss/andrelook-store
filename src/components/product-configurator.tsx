"use client";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import { SIZE_HELP_VALUE } from "@/lib/orders/request-constants";
import { trackPublicEvent } from "@/lib/measurement/client";

import { useProductInteraction } from "./product-interaction-context";

const copy = {
  en: {
    help: "Help me choose a size",
  },
  et: {
    help: "Aita mul suurust valida",
  },
  ru: {
    help: "Помогите выбрать размер",
  },
} satisfies Record<Locale, Record<string, string>>;

export function ProductConfigurator({
  colours,
  dictionary,
  locale,
  requestLabel,
  sizes,
}: {
  colours: Array<{ code: string; name: string; swatchHex: string | null }>;
  dictionary: Dictionary;
  locale: Locale;
  requestLabel: string;
  sizes: string[];
}) {
  const labels = copy[locale];
  const { colour, openOrder, setColour, setSize, size } =
    useProductInteraction();

  return (
    <>
      {colours.length ? (
        <section
          aria-label={dictionary.colour}
          className="product-option-preview"
        >
          <h2>{dictionary.colour}</h2>
          <div className="option-chip-row colour-chip-row" role="group">
            {colours.map((item) => (
              <button
                aria-label={`${dictionary.colour}: ${item.name}`}
                aria-pressed={colour === item.code}
                className="option-chip colour-chip"
                key={item.code}
                onClick={() => setColour(item.code)}
                type="button"
              >
                <i
                  aria-hidden="true"
                  style={{ backgroundColor: item.swatchHex ?? undefined }}
                />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label={dictionary.size} className="product-option-preview">
        <div className="option-heading">
          <h2>{dictionary.size}</h2>
          {sizes.length ? (
            <a href="#size-guide">{dictionary.sizeGuide}</a>
          ) : null}
        </div>
        <div className="option-chip-row size-chip-row" role="group">
          {sizes.map((item) => (
            <button
              aria-label={`${dictionary.size}: ${item}`}
              aria-pressed={size === item}
              className="option-chip"
              key={item}
              onClick={() => setSize(item)}
              type="button"
            >
              {item}
            </button>
          ))}
          <button
            aria-pressed={size === SIZE_HELP_VALUE}
            className="option-chip sizing-help-chip"
            onClick={() => {
              setSize(SIZE_HELP_VALUE);
              trackPublicEvent("size_help");
            }}
            type="button"
          >
            {labels.help}
          </button>
        </div>
      </section>

      <button
        className="primary-action"
        onClick={(event) => openOrder(event.currentTarget)}
        type="button"
      >
        {requestLabel}
      </button>
    </>
  );
}
