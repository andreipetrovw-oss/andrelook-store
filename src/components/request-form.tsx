"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";

import {
  submitOrderRequest,
  type RequestFormState,
} from "@/app/(localized)/[locale]/catalog/actions";
import type { Locale } from "@/config/locales";
import type { Dictionary } from "@/i18n/dictionaries";
import { SIZE_HELP_VALUE } from "@/lib/orders/request-constants";

import { useProductInteraction } from "./product-interaction-context";

const initialRequestFormState: RequestFormState = { status: "idle" };

const europe = [
  ["EE", "Estonia / Eesti / Эстония"],
  ["AT", "Austria"],
  ["BE", "Belgium"],
  ["BG", "Bulgaria"],
  ["HR", "Croatia"],
  ["CY", "Cyprus"],
  ["CZ", "Czechia"],
  ["DK", "Denmark"],
  ["FI", "Finland"],
  ["FR", "France"],
  ["DE", "Germany"],
  ["GR", "Greece"],
  ["HU", "Hungary"],
  ["IS", "Iceland"],
  ["IE", "Ireland"],
  ["IT", "Italy"],
  ["LV", "Latvia"],
  ["LI", "Liechtenstein"],
  ["LT", "Lithuania"],
  ["LU", "Luxembourg"],
  ["MT", "Malta"],
  ["NL", "Netherlands"],
  ["NO", "Norway"],
  ["PL", "Poland"],
  ["PT", "Portugal"],
  ["RO", "Romania"],
  ["SK", "Slovakia"],
  ["SI", "Slovenia"],
  ["ES", "Spain"],
  ["SE", "Sweden"],
  ["CH", "Switzerland"],
  ["GB", "United Kingdom"],
] as const;

const copy = {
  en: {
    address: "Delivery address",
    city: "City",
    close: "Close order panel",
    country: "Country",
    deposit: "30% advance, balance at personal handover",
    email: "Email",
    firstName: "First name",
    fullAdvance: "Full advance payment",
    fulfilment: "How would you like to receive it?",
    handover: "Personal handover in Tallinn",
    instagramUsername: "Instagram username",
    language: "Preferred language",
    lastName: "Last name",
    measurements: "Measurements or sizing question",
    orderSummary: "Your selection",
    nextStep:
      "Thank you. We will contact you through your chosen channel to confirm price, sizing and fulfilment. No payment was taken.",
    payment: "Payment preference",
    phone: "Phone",
    postal: "Postal code",
    quantity: "Quantity",
    reference: "Reference",
    shipping: "Delivery in Europe",
    sizeHelp: "I need help choosing a size",
    sizingAssistance: "Sizing assistance",
    telegramUsername: "Telegram username",
    telegram: "Continue the conversation in Telegram",
  },
  et: {
    address: "Tarneaadress",
    city: "Linn",
    close: "Sulge tellimuspaneel",
    country: "Riik",
    deposit: "30% ettemaks, jääk isiklikul üleandmisel",
    email: "E-post",
    firstName: "Eesnimi",
    fullAdvance: "Täielik ettemaks",
    fulfilment: "Kuidas soovid tellimuse kätte saada?",
    handover: "Isiklik üleandmine Tallinnas",
    instagramUsername: "Instagrami kasutajanimi",
    language: "Eelistatud keel",
    lastName: "Perekonnanimi",
    measurements: "Mõõdud või suuruseküsimus",
    orderSummary: "Sinu valik",
    nextStep:
      "Aitäh. Võtame sinuga valitud kanalis ühendust ning kinnitame hinna, suuruse ja kättesaamise. Makset ei võetud.",
    payment: "Makseeelistus",
    phone: "Telefon",
    postal: "Postiindeks",
    quantity: "Kogus",
    reference: "Viide",
    shipping: "Tarne Euroopas",
    sizeHelp: "Vajan suuruse valikul abi",
    sizingAssistance: "Suuruseabi",
    telegramUsername: "Telegrami kasutajanimi",
    telegram: "Jätka vestlust Telegramis",
  },
  ru: {
    address: "Адрес доставки",
    city: "Город",
    close: "Закрыть оформление",
    country: "Страна",
    deposit: "30% предоплата, остаток при личной передаче",
    email: "Эл. почта",
    firstName: "Имя",
    fullAdvance: "Полная предоплата",
    fulfilment: "Как вы хотите получить заказ?",
    handover: "Личная передача в Таллинне",
    instagramUsername: "Имя пользователя Instagram",
    language: "Предпочтительный язык",
    lastName: "Фамилия",
    measurements: "Мерки или вопрос по размеру",
    orderSummary: "Ваш выбор",
    nextStep:
      "Спасибо. Мы свяжемся с вами по выбранному каналу и подтвердим цену, размер и получение. Оплата не списывалась.",
    payment: "Вариант оплаты",
    phone: "Телефон",
    postal: "Почтовый индекс",
    quantity: "Количество",
    reference: "Номер заявки",
    shipping: "Доставка по Европе",
    sizeHelp: "Мне нужна помощь с размером",
    sizingAssistance: "Помощь с размером",
    telegramUsername: "Имя пользователя Telegram",
    telegram: "Продолжить общение в Telegram",
  },
} satisfies Record<Locale, Record<string, string>>;

function FieldError({
  errors,
  message,
}: {
  errors?: string[];
  message: string;
}) {
  return errors?.length ? <span className="field-error">{message}</span> : null;
}

type Campaign = Record<
  | "initialReferrer"
  | "landingPath"
  | "utmCampaign"
  | "utmContent"
  | "utmMedium"
  | "utmSource"
  | "utmTerm",
  string
>;

const campaignFields: Array<keyof Campaign> = [
  "initialReferrer",
  "landingPath",
  "utmCampaign",
  "utmContent",
  "utmMedium",
  "utmSource",
  "utmTerm",
];

export function RequestForm({
  availability,
  brandName,
  colours,
  dictionary,
  locale,
  productId,
  productImage,
  productName,
  productVersion,
  preorderTime,
  requestKey,
  sizes,
}: {
  availability: "IN_STOCK" | "PRE_ORDER" | "UNAVAILABLE" | null;
  brandName: string;
  colours: Array<{ code: string; name: string }>;
  dictionary: Dictionary;
  locale: Locale;
  productId: string;
  productImage: { alt: string; url: string } | null;
  productName: string;
  productVersion: string;
  preorderTime: string;
  requestKey: string;
  sizes: string[];
}) {
  const labels = copy[locale];
  const [state, action, pending] = useActionState(
    submitOrderRequest,
    initialRequestFormState,
  );
  const [contactMethod, setContactMethod] = useState("TELEGRAM");
  const [country, setCountry] = useState("EE");
  const [fulfilment, setFulfilment] = useState("PERSONAL_HANDOVER");
  const {
    closeOrder,
    colour,
    drawerOpen,
    restoreFocus,
    setColour,
    setSize,
    size,
  } = useProductInteraction();
  const formRef = useRef<HTMLFormElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const successRef = useRef<HTMLElement>(null);

  const selectedColour = colours.find((item) => item.code === colour)?.name;
  const selectedSize =
    size === SIZE_HELP_VALUE ? labels.sizingAssistance : size;

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const firstControl = panel?.querySelector<HTMLElement>(
      "button, input, select, textarea, a[href]",
    );
    firstControl?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeOrder();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const controls = Array.from(
        panel.querySelectorAll<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]",
        ),
      ).filter((element) => element.offsetParent !== null);
      const first = controls[0];
      const last = controls.at(-1);
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
      restoreFocus();
    };
  }, [closeOrder, drawerOpen, restoreFocus]);

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus({ preventScroll: true });
    }
  }, [state.status]);
  useEffect(() => {
    try {
      const stored = JSON.parse(
        sessionStorage.getItem("andrelookCampaign") ?? "{}",
      ) as Partial<Campaign>;
      for (const name of campaignFields) {
        const field = formRef.current?.elements.namedItem(name);
        if (field instanceof HTMLInputElement) field.value = stored[name] ?? "";
      }
    } catch {
      // A blocked session store must never block the order form.
    }
  }, []);

  if (state.status === "success") {
    return (
      <div className="order-experience" data-open={drawerOpen}>
        {drawerOpen ? (
          <button
            aria-label={labels.close}
            className="order-drawer-backdrop"
            onClick={closeOrder}
            type="button"
          />
        ) : null}
        <section
          aria-label={dictionary.requestSuccess}
          aria-live="polite"
          aria-modal={drawerOpen || undefined}
          className="request-success order-drawer-panel"
          id="request"
          ref={(node) => {
            successRef.current = node;
            panelRef.current = node;
          }}
          role={drawerOpen ? "dialog" : undefined}
          tabIndex={-1}
        >
          {drawerOpen ? (
            <button
              aria-label={labels.close}
              className="order-drawer-close"
              onClick={closeOrder}
              type="button"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
          <div aria-hidden="true" className="success-check">
            ✓
          </div>
          <span className="eyebrow">Andrelook</span>
          <h2>{dictionary.requestSuccess}</h2>
          <div className="order-success-product">
            <strong>{productName}</strong>
            <span>
              {[selectedColour, selectedSize].filter(Boolean).join(" · ")}
            </span>
          </div>
          <p>{labels.nextStep}</p>
          <p>
            {labels.reference}: <strong>{state.reference}</strong>
          </p>
          <div className="request-success-actions">
            <a
              className="secondary-contact"
              href="https://t.me/andrelookstore"
              rel="noreferrer"
              target="_blank"
            >
              {labels.telegram} ↗
            </a>
            {drawerOpen ? (
              <button
                className="text-button"
                onClick={closeOrder}
                type="button"
              >
                {labels.close}
              </button>
            ) : null}
          </div>
        </section>
      </div>
    );
  }

  const socialContact =
    contactMethod === "TELEGRAM" || contactMethod === "INSTAGRAM";
  const delivery = fulfilment === "DELIVERY";
  const paymentCountry = delivery ? country : "EE";
  const unavailable = availability === "UNAVAILABLE";
  return (
    <div className="order-experience" data-open={drawerOpen}>
      {drawerOpen ? (
        <button
          aria-label={labels.close}
          className="order-drawer-backdrop"
          onClick={closeOrder}
          type="button"
        />
      ) : null}
      <section
        aria-label={dictionary.requestTitle}
        aria-modal={drawerOpen || undefined}
        className="request-panel order-drawer-panel"
        id="request"
        ref={panelRef}
        role={drawerOpen ? "dialog" : undefined}
      >
        {drawerOpen ? (
          <button
            aria-label={labels.close}
            className="order-drawer-close"
            onClick={closeOrder}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
        <div className="order-summary">
          {productImage ? (
            <span className="order-summary-image">
              <Image
                alt={productImage.alt}
                fill
                sizes="80px"
                src={productImage.url}
              />
            </span>
          ) : null}
          <div>
            <span className="eyebrow">{labels.orderSummary}</span>
            <small>{brandName}</small>
            <strong>{productName}</strong>
            <p>
              {[selectedColour, selectedSize].filter(Boolean).join(" · ") ||
                labels.sizeHelp}
            </p>
            <p>
              {dictionary.availabilityPreOrder} · {preorderTime}
            </p>
          </div>
        </div>
        <h2>{dictionary.requestTitle}</h2>
        <p>{dictionary.requestIntro}</p>
        <form action={action} className="request-form" ref={formRef}>
          <input name="locale" type="hidden" value={locale} />
          <input name="productId" type="hidden" value={productId} />
          <input name="productVersion" type="hidden" value={productVersion} />
          <input name="requestKey" type="hidden" value={requestKey} />
          {campaignFields.map((name) => (
            <input defaultValue="" key={name} name={name} type="hidden" />
          ))}

          <fieldset>
            <legend>{dictionary.productInformation}</legend>
            {sizes.length ? (
              <label>
                <span>{dictionary.selectSize}</span>
                <select
                  name="size"
                  onChange={(event) => setSize(event.target.value)}
                  required
                  value={size}
                >
                  <option disabled value="">
                    —
                  </option>
                  {sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                  <option value={SIZE_HELP_VALUE}>{labels.sizeHelp}</option>
                </select>
                <FieldError
                  errors={state.errors?.size}
                  message={dictionary.validationRequired}
                />
              </label>
            ) : (
              <input name="size" type="hidden" value={SIZE_HELP_VALUE} />
            )}
            <label>
              <span>
                {labels.measurements} <small>({dictionary.optional})</small>
              </span>
              <textarea maxLength={500} name="measurements" rows={3} />
            </label>
            {colours.length ? (
              <label>
                <span>{dictionary.selectColour}</span>
                <select
                  name="colour"
                  onChange={(event) => setColour(event.target.value)}
                  required
                  value={colour}
                >
                  <option disabled value="">
                    —
                  </option>
                  {colours.map((colour) => (
                    <option key={colour.code} value={colour.code}>
                      {colour.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  errors={state.errors?.colour}
                  message={dictionary.validationRequired}
                />
              </label>
            ) : (
              <input name="colour" type="hidden" value="" />
            )}
            <label>
              <span>{labels.quantity}</span>
              <input
                defaultValue="1"
                max="5"
                min="1"
                name="quantity"
                required
                type="number"
              />
            </label>
          </fieldset>

          <fieldset className="request-form-grid">
            <legend>{dictionary.contact}</legend>
            <label>
              <span>{labels.firstName}</span>
              <input autoComplete="given-name" name="firstName" required />
            </label>
            <label>
              <span>
                {labels.lastName} <small>({dictionary.optional})</small>
              </span>
              <input autoComplete="family-name" name="lastName" />
            </label>
            <label>
              <span>{dictionary.contactMethod}</span>
              <select
                name="contactMethod"
                onChange={(event) => setContactMethod(event.target.value)}
                value={contactMethod}
              >
                <option value="TELEGRAM">{dictionary.contactTelegram}</option>
                <option value="INSTAGRAM">{dictionary.contactInstagram}</option>
                <option value="PHONE">{dictionary.contactPhone}</option>
                <option value="EMAIL">{dictionary.contactEmail}</option>
              </select>
            </label>
            {socialContact ? (
              <label>
                <span>
                  {contactMethod === "TELEGRAM"
                    ? labels.telegramUsername
                    : labels.instagramUsername}
                </span>
                <input autoComplete="off" name="socialHandle" required />
              </label>
            ) : (
              <input name="socialHandle" type="hidden" value="" />
            )}
            {contactMethod === "PHONE" ? (
              <label>
                <span>{labels.phone}</span>
                <input
                  autoComplete="tel"
                  inputMode="tel"
                  name="phone"
                  required
                  type="tel"
                />
                <input name="email" type="hidden" value="" />
              </label>
            ) : contactMethod === "EMAIL" ? (
              <label>
                <span>{labels.email}</span>
                <input
                  autoComplete="email"
                  name="email"
                  required
                  type="email"
                />
                <input name="phone" type="hidden" value="" />
              </label>
            ) : (
              <>
                <input name="phone" type="hidden" value="" />
                <input name="email" type="hidden" value="" />
              </>
            )}
            <label>
              <span>{labels.language}</span>
              <select defaultValue={locale} name="preferredLocale">
                <option value="ru">Русский</option>
                <option value="et">Eesti</option>
                <option value="en">English</option>
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>{dictionary.deliveryPayment}</legend>
            <label>
              <span>{labels.fulfilment}</span>
              <select
                name="fulfilmentMethod"
                onChange={(event) => setFulfilment(event.target.value)}
                value={fulfilment}
              >
                <option value="PERSONAL_HANDOVER">{labels.handover}</option>
                <option value="DELIVERY">{labels.shipping}</option>
              </select>
            </label>
            {delivery ? (
              <>
                <label>
                  <span>{labels.country}</span>
                  <select
                    name="countryCode"
                    onChange={(event) => setCountry(event.target.value)}
                    value={country}
                  >
                    {europe.map(([code, name]) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{labels.city}</span>
                  <input autoComplete="address-level2" name="city" required />
                </label>
                <label>
                  <span>{labels.address}</span>
                  <input
                    autoComplete="address-line1"
                    name="addressLine1"
                    required
                  />
                </label>
                <label>
                  <span>
                    {labels.address} 2 <small>({dictionary.optional})</small>
                  </span>
                  <input autoComplete="address-line2" name="addressLine2" />
                </label>
                <label>
                  <span>{labels.postal}</span>
                  <input
                    autoComplete="postal-code"
                    name="postalCode"
                    required
                  />
                </label>
              </>
            ) : (
              <>
                <input name="countryCode" type="hidden" value="EE" />
                <input name="city" type="hidden" value="Tallinn" />
              </>
            )}
            <label>
              <span>{labels.payment}</span>
              <select
                defaultValue={
                  paymentCountry === "EE"
                    ? "DEPOSIT_30_BALANCE_ON_HANDOVER"
                    : "FULL_ADVANCE"
                }
                key={`${paymentCountry}-${fulfilment}`}
                name="paymentPreference"
              >
                {paymentCountry === "EE" ? (
                  <option value="DEPOSIT_30_BALANCE_ON_HANDOVER">
                    {labels.deposit}
                  </option>
                ) : null}
                <option value="FULL_ADVANCE">{labels.fullAdvance}</option>
              </select>
            </label>
          </fieldset>

          <label>
            <span>
              {dictionary.requestComment} <small>({dictionary.optional})</small>
            </span>
            <textarea maxLength={1000} name="comment" rows={4} />
          </label>
          <label className="consent-row">
            <input name="consent" required type="checkbox" value="accepted" />
            <span>{dictionary.consent}</span>
          </label>
          <FieldError
            errors={state.errors?.consent}
            message={dictionary.validationRequired}
          />
          {state.status === "error" ? (
            <p aria-live="polite" className="form-error">
              {dictionary.formError}
            </p>
          ) : null}
          <button disabled={pending || unavailable} type="submit">
            {pending ? dictionary.submitting : dictionary.submit}
          </button>
        </form>
        <a
          className="secondary-contact"
          href="https://t.me/andrelookstore"
          rel="noreferrer"
          target="_blank"
        >
          {dictionary.secondaryContact}
        </a>
      </section>
    </div>
  );
}
