"use client";

import { useEffect, useRef } from "react";

import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import { SIZE_HELP_VALUE } from "@/lib/orders/request-constants";

import { useProductInteraction } from "./product-interaction-context";

const copy = {
  en: {
    colourPrompt: "Choose a colour before continuing.",
    help: "Help me choose a size",
    sizePrompt: "Choose a size or ask for sizing help before continuing.",
  },
  et: {
    colourPrompt: "Enne jätkamist vali värv.",
    help: "Aita mul suurust valida",
    sizePrompt: "Enne jätkamist vali suurus või küsi suuruseabi.",
  },
  ru: {
    colourPrompt: "Перед продолжением выберите цвет.",
    help: "Помогите выбрать размер",
    sizePrompt: "Выберите размер или запросите помощь перед продолжением.",
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
  const { colour, openOrder, selectionError, setColour, setSize, size } =
    useProductInteraction();
  const colourRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectionError === "size") sizeRef.current?.focus();
    if (selectionError === "colour") colourRef.current?.focus();
  }, [selectionError]);

  return (
    <>
      {colours.length ? (
        <section
          aria-label={dictionary.colour}
          className="product-option-preview"
        >
          <h2>{dictionary.colour}</h2>
          <div
            aria-describedby={
              selectionError === "colour" ? "colour-selection-error" : undefined
            }
            className="option-chip-row colour-chip-row"
            ref={colourRef}
            role="group"
            tabIndex={-1}
          >
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
          {selectionError === "colour" ? (
            <p className="selection-prompt" id="colour-selection-error">
              {labels.colourPrompt}
            </p>
          ) : null}
        </section>
      ) : null}

      <section aria-label={dictionary.size} className="product-option-preview">
        <div className="option-heading">
          <h2>{dictionary.size}</h2>
          {sizes.length ? (
            <a href="#size-guide">{dictionary.sizeGuide}</a>
          ) : null}
        </div>
        <div
          aria-describedby={
            selectionError === "size" ? "size-selection-error" : undefined
          }
          className="option-chip-row size-chip-row"
          ref={sizeRef}
          role="group"
          tabIndex={-1}
        >
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
            onClick={() => setSize(SIZE_HELP_VALUE)}
            type="button"
          >
            {labels.help}
          </button>
        </div>
        {selectionError === "size" ? (
          <p className="selection-prompt" id="size-selection-error">
            {labels.sizePrompt}
          </p>
        ) : null}
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
