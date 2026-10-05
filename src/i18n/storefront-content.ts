import type { Locale } from "@/config/locales";

export type StorefrontContent = {
  catalog: { discoveryNote: string; filterHint: string; resultsLabel: string };
  commerce: {
    availableExplanation: string;
    detailsPending: string;
    inStockExplanation: string;
    preorderExplanation: string;
    priceOnRequest: string;
    unavailableExplanation: string;
  };
  home: {
    assistanceBody: string;
    assistanceTitle: string;
    categoriesIntro: string;
    categoriesTitle: string;
    collectionIntro: string;
    collectionTitle: string;
    contactBody: string;
    contactTitle: string;
    eyebrow: string;
    faq: Array<{ answer: string; question: string }>;
    faqIntro: string;
    faqTitle: string;
    heroBody: string;
    heroMeta: string;
    heroTitle: string;
    orderIntro: string;
    orderSteps: Array<{ body: string; title: string }>;
    orderTitle: string;
    serviceIntro: string;
    serviceItems: Array<{ body: string; title: string }>;
    serviceTitle: string;
    sizingPoints: string[];
    stateIntro: string;
    stateTitle: string;
  };
  product: {
    assistanceBody: string;
    commercialIntro: string;
    deliverySummary: string;
    detailsLabel: string;
    helpLabel: string;
    learnMoreLabel: string;
    orderContext: string;
    requestLabel: string;
    returnsSummary: string;
    sizeGuideAvailable: string;
    sizingLabel: string;
  };
};

const content: Record<Locale, StorefrontContent> = {
  ru: {
    catalog: {
      discoveryNote: "Найдите модель по названию, бренду или категории.",
      filterHint: "Поиск по коллекции",
      resultsLabel: "Модели",
    },
    commerce: {
      availableExplanation: "Эту модель можно заказать сейчас.",
      detailsPending: "Цена подтверждается лично",
      inStockExplanation: "Модель готова к заказу.",
      preorderExplanation:
        "Предзаказ · ориентировочно 2–3 недели · доставка по Европе.",
      priceOnRequest: "Цена подтверждается перед заказом",
      unavailableExplanation:
        "Сейчас модель недоступна. Свяжитесь с нами, чтобы узнать о следующем поступлении.",
    },
    home: {
      assistanceBody:
        "Для большинства моделей доступна таблица размеров. Если таблицы нет, мы поможем выбрать размер лично.",
      assistanceTitle: "Поможем выбрать размер",
      categoriesIntro:
        "Куртки, жилеты, кардиганы и повседневные модели в одной компактной коллекции.",
      categoriesTitle: "Выберите категорию",
      collectionIntro:
        "23 модели Moncler и Parajumpers с реальными фотографиями и персональным сопровождением заказа.",
      collectionTitle: "Избранная коллекция",
      contactBody:
        "Напишите в Telegram, Instagram или по электронной почте — ответим на русском, эстонском или английском.",
      contactTitle: "Поможем с выбором",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Форма — это уже покупка?",
          answer:
            "Нет. Сначала мы подтвердим цену, размер, способ получения и дальнейшие шаги.",
        },
        {
          question: "Можно получить помощь с размером?",
          answer:
            "Да. Используйте таблицу на странице модели или выберите персональную помощь при оформлении.",
        },
        {
          question: "Нужна регистрация?",
          answer: "Нет. Аккаунт для предзаказа не нужен.",
        },
      ],
      faqIntro: "Главное о предзаказе, размерах и личном подтверждении.",
      faqTitle: "Перед предзаказом",
      heroBody:
        "Премиальные модели по предзаказу с личной помощью из Таллинна и доставкой по Европе.",
      heroMeta: "Предзаказ · 2–3 недели · Европа",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "Без автоматической оплаты и обязательного аккаунта. Мы лично подтверждаем детали до оплаты.",
      orderSteps: [
        {
          title: "Выберите модель",
          body: "Откройте страницу модели, выберите цвет и подходящий размер.",
        },
        {
          title: "Отправьте предзаказ",
          body: "Оставьте контакт и выберите удобный способ получения.",
        },
        {
          title: "Получите подтверждение",
          body: "Мы свяжемся с вами, подтвердим цену, размер, оплату и срок.",
        },
      ],
      orderTitle: "Как работает предзаказ",
      serviceIntro:
        "От выбора размера до получения заказа — вы общаетесь с Andrelook напрямую.",
      serviceItems: [
        {
          title: "Личная помощь",
          body: "Поможем выбрать модель, цвет и размер до оформления.",
        },
        {
          title: "Понятные шаги",
          body: "Цена, оплата и способ получения подтверждаются заранее.",
        },
        {
          title: "Три языка",
          body: "Обслуживание на русском, эстонском и английском.",
        },
      ],
      serviceTitle: "Персональный сервис из Таллинна",
      sizingPoints: [
        "Таблица размеров рядом с моделью",
        "Личная помощь для моделей без таблицы",
        "Вопрос о посадке можно добавить к предзаказу",
      ],
      stateIntro:
        "Выберите модель сейчас — мы подтвердим детали лично. Ориентировочный срок составляет 2–3 недели.",
      stateTitle: "Как работает предзаказ",
    },
    product: {
      assistanceBody:
        "Не уверены в размере? Добавьте вопрос к предзаказу — мы поможем до подтверждения.",
      commercialIntro:
        "Предзаказ · ориентировочно 2–3 недели · личное подтверждение перед оплатой.",
      deliverySummary:
        "Личная передача в Таллинне или доставка по Европе. Способ получения и стоимость доставки подтверждаются заранее.",
      detailsLabel: "О модели",
      helpLabel: "Нужна помощь?",
      learnMoreLabel: "Подробнее",
      orderContext: "Оформление предзаказа",
      requestLabel: "Оформить предзаказ",
      returnsSummary:
        "Условия возврата или обмена для вашего заказа сообщаются до подтверждения оплаты.",
      sizeGuideAvailable: "Таблица размеров",
      sizingLabel: "Размер и посадка",
    },
  },
  et: {
    catalog: {
      discoveryNote: "Leia toode nime, brändi või kategooria järgi.",
      filterHint: "Otsi kollektsioonist",
      resultsLabel: "Tooted",
    },
    commerce: {
      availableExplanation: "Seda toodet saab praegu tellida.",
      detailsPending: "Hind kinnitatakse personaalselt",
      inStockExplanation: "Toode on tellimiseks valmis.",
      preorderExplanation:
        "Eeltellimus · eeldatavalt 2–3 nädalat · tarne üle Euroopa.",
      priceOnRequest: "Hind kinnitatakse enne tellimust",
      unavailableExplanation:
        "Toode ei ole praegu saadaval. Järgmise võimaluse kohta küsi meilt.",
    },
    home: {
      assistanceBody:
        "Enamikul toodetel on suurustabel. Kui tabelit pole, aitame sobiva suuruse personaalselt valida.",
      assistanceTitle: "Aitame suurust valida",
      categoriesIntro:
        "Joped, vestid, kardiganid ja igapäevased mudelid ühes kompaktses valikus.",
      categoriesTitle: "Vali kategooria",
      collectionIntro:
        "23 Moncleri ja Parajumpersi mudelit päris fotode ning personaalse tellimistoega.",
      collectionTitle: "Valitud kollektsioon",
      contactBody:
        "Kirjuta Telegramis, Instagramis või e-posti teel — vastame eesti, vene või inglise keeles.",
      contactTitle: "Aitame valikut teha",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Kas vormi saatmine on juba ost?",
          answer:
            "Ei. Kinnitame esmalt hinna, suuruse, kättesaamise ja järgmised sammud.",
        },
        {
          question: "Kas saan suuruse valikul abi?",
          answer:
            "Jah. Kasuta tootelehe tabelit või vali vormil personaalne suuruseabi.",
        },
        {
          question: "Kas konto on vajalik?",
          answer: "Ei. Eeltellimuseks pole kontot vaja.",
        },
      ],
      faqIntro: "Peamine info eeltellimuse, suuruse ja kinnitamise kohta.",
      faqTitle: "Enne eeltellimust",
      heroBody:
        "Premium-mudelid eeltellimisel, personaalne abi Tallinnast ja tarne üle Euroopa.",
      heroMeta: "Eeltellimus · 2–3 nädalat · Euroopa",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "Automaatset makset ega kontot pole vaja. Kinnitame kõik detailid enne maksmist.",
      orderSteps: [
        {
          title: "Vali toode",
          body: "Ava tooteleht ning vali värv ja sobiv suurus.",
        },
        {
          title: "Saada eeltellimus",
          body: "Jäta kontakt ja vali sobiv kättesaamisviis.",
        },
        {
          title: "Saa kinnitus",
          body: "Võtame ühendust ning kinnitame hinna, suuruse, makse ja tähtaja.",
        },
      ],
      orderTitle: "Kuidas eeltellimus töötab",
      serviceIntro:
        "Suuruse valikust tellimuse kättesaamiseni suhtled otse Andrelookiga.",
      serviceItems: [
        {
          title: "Personaalne abi",
          body: "Aitame enne tellimist valida mudeli, värvi ja suuruse.",
        },
        {
          title: "Selged sammud",
          body: "Hind, makse ja kättesaamine kinnitatakse ette.",
        },
        {
          title: "Kolm keelt",
          body: "Teenindus eesti, vene ja inglise keeles.",
        },
      ],
      serviceTitle: "Personaalne teenindus Tallinnast",
      sizingPoints: [
        "Suurustabel on toote juures",
        "Tabelita toodetele personaalne abi",
        "Istuvuse küsimuse saab lisada eeltellimusele",
      ],
      stateIntro:
        "Vali toode nüüd ja kinnitame detailid personaalselt. Eeldatav aeg on 2–3 nädalat.",
      stateTitle: "Kuidas eeltellimus töötab",
    },
    product: {
      assistanceBody:
        "Kas suurus tekitab küsimusi? Lisa küsimus eeltellimusele ja aitame enne kinnitamist.",
      commercialIntro:
        "Eeltellimus · eeldatavalt 2–3 nädalat · personaalne kinnitus enne maksmist.",
      deliverySummary:
        "Personaalne üleandmine Tallinnas või tarne üle Euroopa. Kättesaamine ja tarnekulu kinnitatakse ette.",
      detailsLabel: "Tootest",
      helpLabel: "Vajad abi?",
      learnMoreLabel: "Loe lähemalt",
      orderContext: "Eeltellimuse vormistamine",
      requestLabel: "Esita eeltellimus",
      returnsSummary:
        "Sinu tellimusele kehtivad tagastus- või vahetustingimused teatatakse enne makse kinnitamist.",
      sizeGuideAvailable: "Suurustabel",
      sizingLabel: "Suurus ja istuvus",
    },
  },
  en: {
    catalog: {
      discoveryNote: "Find a piece by name, brand or category.",
      filterHint: "Search the collection",
      resultsLabel: "Pieces",
    },
    commerce: {
      availableExplanation: "This piece is ready to order.",
      detailsPending: "Price confirmed personally",
      inStockExplanation: "This piece is ready to order.",
      preorderExplanation:
        "Pre-order · approximately 2–3 weeks · delivery across Europe.",
      priceOnRequest: "Price confirmed before ordering",
      unavailableExplanation:
        "This piece is not currently available. Contact us about the next opportunity.",
    },
    home: {
      assistanceBody:
        "Most pieces include a size chart. Where a chart is unavailable, we help you choose personally.",
      assistanceTitle: "Personal sizing help",
      categoriesIntro:
        "Jackets, gilets, cardigans and everyday pieces in one focused collection.",
      categoriesTitle: "Shop by category",
      collectionIntro:
        "23 Moncler and Parajumpers pieces with real photography and personal order support.",
      collectionTitle: "The Andrelook edit",
      contactBody:
        "Message us on Telegram, Instagram or email — we reply in English, Estonian or Russian.",
      contactTitle: "Let us help you choose",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Is submitting the form already a purchase?",
          answer:
            "No. We first confirm the price, size, fulfilment and next steps with you.",
        },
        {
          question: "Can I get help choosing a size?",
          answer:
            "Yes. Use the product size chart or choose personal sizing help in the form.",
        },
        {
          question: "Do I need an account?",
          answer: "No. You can pre-order without creating an account.",
        },
      ],
      faqIntro: "The essentials on pre-ordering, sizing and confirmation.",
      faqTitle: "Before you pre-order",
      heroBody:
        "Premium pieces by pre-order, personal support from Tallinn and delivery across Europe.",
      heroMeta: "Pre-order · 2–3 weeks · Europe",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "No automatic payment and no account required. We confirm every detail before payment.",
      orderSteps: [
        {
          title: "Choose your piece",
          body: "Open the product page and select your colour and size.",
        },
        {
          title: "Send your pre-order",
          body: "Leave your preferred contact and fulfilment method.",
        },
        {
          title: "Receive confirmation",
          body: "We contact you to confirm the price, size, payment and timing.",
        },
      ],
      orderTitle: "How pre-order works",
      serviceIntro:
        "From choosing a size to receiving your order, you speak directly with Andrelook.",
      serviceItems: [
        {
          title: "Personal help",
          body: "We help you choose the piece, colour and size before ordering.",
        },
        {
          title: "Clear next steps",
          body: "Price, payment and fulfilment are confirmed in advance.",
        },
        {
          title: "Three languages",
          body: "Service in English, Estonian and Russian.",
        },
      ],
      serviceTitle: "Personal service from Tallinn",
      sizingPoints: [
        "Size chart beside the product",
        "Personal help for pieces without a chart",
        "Add a fit question to your pre-order",
      ],
      stateIntro:
        "Choose your piece now and we will confirm the details personally. Expected timing is approximately 2–3 weeks.",
      stateTitle: "How pre-order works",
    },
    product: {
      assistanceBody:
        "Unsure about the size? Add a question to your pre-order and we will help before confirmation.",
      commercialIntro:
        "Pre-order · approximately 2–3 weeks · personal confirmation before payment.",
      deliverySummary:
        "Personal handover in Tallinn or delivery across Europe. Fulfilment and delivery cost are confirmed in advance.",
      detailsLabel: "About this piece",
      helpLabel: "Need help?",
      learnMoreLabel: "Learn more",
      orderContext: "Complete your pre-order",
      requestLabel: "Pre-order this piece",
      returnsSummary:
        "The return or exchange terms that apply to your order are shared before payment is confirmed.",
      sizeGuideAvailable: "Size guide",
      sizingLabel: "Size & fit",
    },
  },
};

export function getStorefrontContent(locale: Locale) {
  return content[locale];
}
