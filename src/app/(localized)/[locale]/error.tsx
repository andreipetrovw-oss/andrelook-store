"use client";

import { usePathname } from "next/navigation";

const copy = {
  en: { action: "Try again", message: "This page could not be loaded." },
  et: { action: "Proovi uuesti", message: "Lehte ei õnnestunud laadida." },
  ru: {
    action: "Попробовать снова",
    message: "Не удалось загрузить страницу.",
  },
} as const;

export default function StorefrontError({ reset }: { reset: () => void }) {
  const segment = usePathname().split("/")[1];
  const locale = segment === "et" || segment === "en" ? segment : "ru";

  return (
    <div className="container route-state" role="alert">
      <span className="eyebrow">Andrelook</span>
      <h1>{copy[locale].message}</h1>
      <button onClick={reset} type="button">
        {copy[locale].action}
      </button>
    </div>
  );
}
