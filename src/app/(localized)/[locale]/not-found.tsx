"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const copy = {
  en: {
    action: "Back to catalog",
    message: "The requested page is not available.",
  },
  et: { action: "Tagasi kataloogi", message: "Soovitud leht pole saadaval." },
  ru: {
    action: "Назад в каталог",
    message: "Запрошенная страница недоступна.",
  },
} as const;

export default function LocalizedNotFound() {
  const segment = usePathname().split("/")[1];
  const locale = segment === "et" || segment === "en" ? segment : "ru";
  return (
    <section className="container not-found">
      <span className="eyebrow">404</span>
      <h1>Andrelook</h1>
      <p>{copy[locale].message}</p>
      <Link className="primary-action" href={`/${locale}/catalog`}>
        {copy[locale].action}
      </Link>
    </section>
  );
}
