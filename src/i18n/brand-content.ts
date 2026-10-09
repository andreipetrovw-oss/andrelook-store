import type { Locale } from "@/config/locales";

export const publicBrandSlugs = ["moncler", "parajumpers"] as const;
export type PublicBrandSlug = (typeof publicBrandSlugs)[number];

export function isPublicBrandSlug(value: string): value is PublicBrandSlug {
  return publicBrandSlugs.includes(value as PublicBrandSlug);
}

type BrandContent = {
  description: string;
  eyebrow: string;
  sections: Array<{ body: string; title: string }>;
  title: string;
};

const content: Record<PublicBrandSlug, Record<Locale, BrandContent>> = {
  moncler: {
    en: {
      description:
        "Explore Andrelook’s current Moncler selection by pre-order from Tallinn, with approved prices, model-specific size guides and personal sizing help.",
      eyebrow: "Brand selection",
      sections: [
        {
          title: "Current Andrelook selection",
          body: "Browse the Moncler models currently published by Andrelook, including outerwear, gilets, knitwear and everyday pieces.",
        },
        {
          title: "Pre-order from Tallinn",
          body: "Availability and the current timing for a specific model are confirmed personally before payment. The usual pre-order estimate is 2–3 weeks.",
        },
        {
          title: "Sizing support",
          body: "Each published model includes its verified size guide. Andrelook can also help compare measurements before the request is confirmed.",
        },
      ],
      title: "Moncler at Andrelook",
    },
    et: {
      description:
        "Vaata Andrelooki praegust Moncleri eeltellimuse valikut Tallinnast koos kinnitatud hindade, mudelipõhiste suurustabelite ja personaalse suuruseabiga.",
      eyebrow: "Brändivalik",
      sections: [
        {
          title: "Andrelooki praegune valik",
          body: "Vaata Andrelookis praegu avaldatud Moncleri mudeleid, sealhulgas ülerõivaid, veste, kudumeid ja igapäevaseid rõivaid.",
        },
        {
          title: "Eeltellimus Tallinnast",
          body: "Konkreetse mudeli saadavus ja ajakohane tähtaeg kinnitatakse personaalselt enne makset. Tavapärane eeltellimuse hinnang on 2–3 nädalat.",
        },
        {
          title: "Abi suuruse valikul",
          body: "Iga avaldatud mudeli juures on kontrollitud suurustabel. Andrelook aitab enne tellimuse kinnitamist ka mõõte võrrelda.",
        },
      ],
      title: "Moncler Andrelookis",
    },
    ru: {
      description:
        "Актуальная подборка Moncler в Andrelook по предзаказу из Таллинна: подтверждённые цены, таблицы размеров для каждой модели и помощь с выбором.",
      eyebrow: "Подборка бренда",
      sections: [
        {
          title: "Актуальная подборка Andrelook",
          body: "Посмотрите опубликованные в Andrelook модели Moncler: верхнюю одежду, жилеты, трикотаж и повседневные вещи.",
        },
        {
          title: "Предзаказ из Таллинна",
          body: "Доступность и актуальный срок для конкретной модели подтверждаются лично до оплаты. Обычный ориентир для предзаказа — 2–3 недели.",
        },
        {
          title: "Помощь с размером",
          body: "Для каждой опубликованной модели доступна проверенная таблица размеров. Andrelook также поможет сопоставить параметры до подтверждения запроса.",
        },
      ],
      title: "Moncler в Andrelook",
    },
  },
  parajumpers: {
    en: {
      description:
        "Explore Andrelook’s current Parajumpers selection by pre-order from Tallinn, with approved prices, model-specific size guides and personal sizing help.",
      eyebrow: "Brand selection",
      sections: [
        {
          title: "Current Andrelook selection",
          body: "Browse the Parajumpers models currently published by Andrelook, with product photography, colour choices and clear commercial details.",
        },
        {
          title: "Pre-order from Tallinn",
          body: "Availability and the current timing for a specific model are confirmed personally before payment. The usual pre-order estimate is 2–3 weeks.",
        },
        {
          title: "Sizing support",
          body: "Each published model includes its verified size guide. Andrelook can also help compare measurements before the request is confirmed.",
        },
      ],
      title: "Parajumpers at Andrelook",
    },
    et: {
      description:
        "Vaata Andrelooki praegust Parajumpersi eeltellimuse valikut Tallinnast koos kinnitatud hindade, mudelipõhiste suurustabelite ja personaalse suuruseabiga.",
      eyebrow: "Brändivalik",
      sections: [
        {
          title: "Andrelooki praegune valik",
          body: "Vaata Andrelookis praegu avaldatud Parajumpersi mudeleid koos tootefotode, värvivalikute ja selgete tellimusandmetega.",
        },
        {
          title: "Eeltellimus Tallinnast",
          body: "Konkreetse mudeli saadavus ja ajakohane tähtaeg kinnitatakse personaalselt enne makset. Tavapärane eeltellimuse hinnang on 2–3 nädalat.",
        },
        {
          title: "Abi suuruse valikul",
          body: "Iga avaldatud mudeli juures on kontrollitud suurustabel. Andrelook aitab enne tellimuse kinnitamist ka mõõte võrrelda.",
        },
      ],
      title: "Parajumpers Andrelookis",
    },
    ru: {
      description:
        "Актуальная подборка Parajumpers в Andrelook по предзаказу из Таллинна: подтверждённые цены, таблицы размеров для каждой модели и помощь с выбором.",
      eyebrow: "Подборка бренда",
      sections: [
        {
          title: "Актуальная подборка Andrelook",
          body: "Посмотрите опубликованные в Andrelook модели Parajumpers с фотографиями, вариантами цвета и понятными условиями запроса.",
        },
        {
          title: "Предзаказ из Таллинна",
          body: "Доступность и актуальный срок для конкретной модели подтверждаются лично до оплаты. Обычный ориентир для предзаказа — 2–3 недели.",
        },
        {
          title: "Помощь с размером",
          body: "Для каждой опубликованной модели доступна проверенная таблица размеров. Andrelook также поможет сопоставить параметры до подтверждения запроса.",
        },
      ],
      title: "Parajumpers в Andrelook",
    },
  },
};

export function getBrandContent(locale: Locale, slug: PublicBrandSlug) {
  return content[slug][locale];
}
