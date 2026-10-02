import type { Locale } from "@/config/locales";

export type StorefrontContent = {
  catalog: {
    discoveryNote: string;
    filterHint: string;
    resultsLabel: string;
  };
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
    detailsLabel: string;
    helpLabel: string;
    learnMoreLabel: string;
    orderContext: string;
    requestLabel: string;
    sizeGuideAvailable: string;
    sizingLabel: string;
  };
};

const content: Record<Locale, StorefrontContent> = {
  ru: {
    catalog: {
      discoveryNote:
        "Ищите по модели или категории, а затем уточните статус и порядок отображения.",
      filterHint: "Настройте выбор",
      resultsLabel: "Подготовленные модели",
    },
    commerce: {
      availableExplanation:
        "Статус модели и коммерческие детали показаны только после проверки.",
      detailsPending: "Детали по запросу",
      inStockExplanation:
        "Модель отмечается «В наличии» только после проверки текущего статуса Andrelook.",
      preorderExplanation:
        "Предзаказ означает, что срок, цена и доступность подтверждаются до оформления.",
      priceOnRequest: "Цена по запросу",
      unavailableExplanation:
        "Недоступную модель нельзя запросить, пока её статус не изменится.",
    },
    home: {
      assistanceBody:
        "Проверенная таблица остаётся рядом с моделью. Если данных недостаточно, поможем разобраться лично до оформления запроса.",
      assistanceTitle: "Размер без догадок",
      categoriesIntro:
        "Переходите сразу к нужному типу вещи. Количество отражает модели, подготовленные для текущего просмотра.",
      categoriesTitle: "Найдите свой раздел",
      collectionIntro:
        "Отобранные модели с ясной структурой размеров и запроса. Факты о цене, наличии и вариантах появляются только после подтверждения.",
      collectionTitle: "Выбранные модели",
      contactBody:
        "Напишите в Telegram, Instagram или по электронной почте. Ответим на русском, эстонском или английском.",
      contactTitle: "Обсудим выбранную модель",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Запрос — это уже покупка?",
          answer:
            "Нет. Сначала Andrelook подтверждает цену, доступность, размер и дальнейшие шаги.",
        },
        {
          question: "Можно получить помощь с размером?",
          answer:
            "Да. Используйте таблицу на странице модели или оставьте комментарий в запросе.",
        },
        {
          question: "Нужна регистрация?",
          answer: "Нет. Для запроса достаточно имени и удобного канала связи.",
        },
      ],
      faqIntro:
        "Короткие ответы о выборе и запросе. Полная информация собрана в разделе помощи.",
      faqTitle: "Перед запросом",
      heroBody:
        "Выбирайте модель в спокойном темпе — с понятной информацией, проверенными таблицами размеров и личной помощью.",
      heroMeta: "Таллинн · Эстония · Личная поддержка",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "Без автоматической оплаты и обязательного аккаунта. Каждый запрос остаётся понятным на всех этапах.",
      orderSteps: [
        {
          title: "Выберите модель",
          body: "Откройте карточку, изучите статус и проверенную размерную информацию.",
        },
        {
          title: "Укажите детали",
          body: "Выберите доступные параметры и оставьте удобный контакт.",
        },
        {
          title: "Получите подтверждение",
          body: "Andrelook лично сверит цену, доступность и дальнейшие шаги.",
        },
      ],
      orderTitle: "Как начинается заказ",
      serviceIntro:
        "Доверие строится на ясной информации и живом контакте, а не на неподтверждённых обещаниях.",
      serviceItems: [
        {
          title: "Проверенные данные",
          body: "Публикуем только подтверждённые сведения о модели, статусе и вариантах.",
        },
        {
          title: "Помощь до заказа",
          body: "Можно уточнить размер и детали до любого решения.",
        },
        {
          title: "Три языка",
          body: "Полный путь доступен на русском, эстонском и английском.",
        },
      ],
      serviceTitle: "Личный подход — это ясность",
      sizingPoints: [
        "Исходные единицы измерения сохраняются",
        "Неясные подписи не угадываются",
        "Можно запросить личную помощь",
      ],
      stateIntro:
        "Статусы помогают понять следующий шаг ещё до того, как вы оставите контакт.",
      stateTitle: "В наличии или предзаказ",
    },
    product: {
      assistanceBody:
        "Не уверены в размере или параметрах? Укажите вопрос в форме — подтверждение будет до оформления заказа.",
      commercialIntro:
        "Цена и доступность фиксируются только после проверки. Запрос не является оплатой или подтверждённым заказом.",
      detailsLabel: "Информация о модели",
      helpLabel: "Помощь перед запросом",
      learnMoreLabel: "Подробнее",
      orderContext: "Как оформить запрос",
      requestLabel: "Перейти к запросу",
      sizeGuideAvailable: "Проверенная таблица",
      sizingLabel: "Размер и посадка",
    },
  },
  et: {
    catalog: {
      discoveryNote:
        "Otsi mudeli või kategooria järgi, seejärel täpsusta olekut ja järjestust.",
      filterHint: "Täpsusta valikut",
      resultsLabel: "Ettevalmistatud mudelid",
    },
    commerce: {
      availableExplanation:
        "Mudeli olekut ja müügiinfot näidatakse alles pärast kontrolli.",
      detailsPending: "Üksikasjad päringu alusel",
      inStockExplanation:
        "Märge „Laos” kuvatakse ainult pärast seda, kui Andrelook on hetkeseisu kontrollinud.",
      preorderExplanation:
        "Eeltellimuse puhul kinnitatakse aeg, hind ja saadavus enne vormistamist.",
      priceOnRequest: "Hind päringu alusel",
      unavailableExplanation:
        "Mittesaadava mudeli kohta ei saa päringut saata enne oleku muutmist.",
    },
    home: {
      assistanceBody:
        "Kontrollitud suurustabel asub alati mudeli juures. Kui andmeid on vähe, aitame enne päringut isiklikult.",
      assistanceTitle: "Suurus ilma oletusteta",
      categoriesIntro:
        "Liigu kohe sobiva tootetüübi juurde. Arv näitab praeguseks ülevaatuseks ettevalmistatud mudeleid.",
      categoriesTitle: "Leia õige kategooria",
      collectionIntro:
        "Valitud mudelid selge suuruse- ja päringuteekonnaga. Hind, saadavus ja valikud ilmuvad alles pärast kinnitamist.",
      collectionTitle: "Valitud mudelid",
      contactBody:
        "Kirjuta Telegramis, Instagramis või e-posti teel. Vastame eesti, vene või inglise keeles.",
      contactTitle: "Räägime valitud mudelist",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Kas päring on juba ost?",
          answer:
            "Ei. Andrelook kinnitab esmalt hinna, saadavuse, suuruse ja järgmised sammud.",
        },
        {
          question: "Kas saan suuruse valikul abi?",
          answer:
            "Jah. Kasuta tootelehe tabelit või lisa küsimus päringu kommentaari.",
        },
        {
          question: "Kas konto on vajalik?",
          answer: "Ei. Päringuks piisab nimest ja sobivast kontaktkanalist.",
        },
      ],
      faqIntro:
        "Lühivastused valiku ja päringu kohta. Täielik teave on abilehel.",
      faqTitle: "Enne päringut",
      heroBody:
        "Vali mudel rahulikus tempos — selge teabe, kontrollitud suurustabelite ja personaalse abiga.",
      heroMeta: "Tallinn · Eesti · Personaalne tugi",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "Ilma automaatse makse ja kohustusliku kontota. Iga päringu järgmine samm on selge.",
      orderSteps: [
        {
          title: "Vali mudel",
          body: "Ava tooteleht ning vaata olekut ja kontrollitud suurusinfot.",
        },
        {
          title: "Lisa üksikasjad",
          body: "Vali kinnitatud valikud ja jäta sobiv kontakt.",
        },
        {
          title: "Saa kinnitus",
          body: "Andrelook kontrollib isiklikult hinna, saadavuse ja järgmised sammud.",
        },
      ],
      orderTitle: "Kuidas tellimus algab",
      serviceIntro:
        "Usaldus sünnib selgest teabest ja päris kontaktist, mitte kinnitamata lubadustest.",
      serviceItems: [
        {
          title: "Kontrollitud teave",
          body: "Avaldame ainult kinnitatud mudeli-, oleku- ja variandiinfo.",
        },
        {
          title: "Abi enne tellimist",
          body: "Suuruse ja üksikasjad saab enne otsust üle küsida.",
        },
        {
          title: "Kolm keelt",
          body: "Kogu teekond on eesti, vene ja inglise keeles.",
        },
      ],
      serviceTitle: "Personaalne lähenemine tähendab selgust",
      sizingPoints: [
        "Algseid mõõtühikuid ei muudeta",
        "Ebaselgeid nimetusi ei oletata",
        "Saad küsida personaalset abi",
      ],
      stateIntro:
        "Olekud näitavad järgmist sammu juba enne kontaktandmete jätmist.",
      stateTitle: "Laos või eeltellimus",
    },
    product: {
      assistanceBody:
        "Kas suurus või detailid tekitavad küsimusi? Lisa küsimus vormi — kõik kinnitatakse enne tellimist.",
      commercialIntro:
        "Hind ja saadavus fikseeritakse alles pärast kontrolli. Päring ei ole makse ega kinnitatud tellimus.",
      detailsLabel: "Mudeli info",
      helpLabel: "Abi enne päringut",
      learnMoreLabel: "Loe lähemalt",
      orderContext: "Kuidas päringut esitada",
      requestLabel: "Liigu päringu juurde",
      sizeGuideAvailable: "Kontrollitud tabel",
      sizingLabel: "Suurus ja istuvus",
    },
  },
  en: {
    catalog: {
      discoveryNote:
        "Search by model or category, then refine by status and order.",
      filterHint: "Refine your selection",
      resultsLabel: "Prepared pieces",
    },
    commerce: {
      availableExplanation:
        "Model status and commercial details appear only after review.",
      detailsPending: "Details on request",
      inStockExplanation:
        "A piece is marked In stock only after Andrelook checks its current status.",
      preorderExplanation:
        "Pre-order means timing, price and availability are confirmed before an order is placed.",
      priceOnRequest: "Price on request",
      unavailableExplanation:
        "An unavailable piece cannot be requested until its status changes.",
    },
    home: {
      assistanceBody:
        "A verified size chart stays beside each supported piece. If the evidence is incomplete, we help personally before a request is placed.",
      assistanceTitle: "Sizing without guesswork",
      categoriesIntro:
        "Go straight to the type of piece you need. Counts reflect models prepared for the current review.",
      categoriesTitle: "Find your category",
      collectionIntro:
        "A considered selection with clear sizing and request paths. Price, availability and option facts appear only after confirmation.",
      collectionTitle: "Selected pieces",
      contactBody:
        "Message us on Telegram, Instagram or email. We can respond in English, Estonian or Russian.",
      contactTitle: "Let’s discuss your selection",
      eyebrow: "Andrelook · Tallinn",
      faq: [
        {
          question: "Is a request already a purchase?",
          answer:
            "No. Andrelook first confirms price, availability, sizing and the next steps.",
        },
        {
          question: "Can I get sizing help?",
          answer:
            "Yes. Use the chart on the product page or add your question to the request.",
        },
        {
          question: "Do I need an account?",
          answer:
            "No. A name and your preferred contact channel are enough for a request.",
        },
      ],
      faqIntro:
        "Short answers about choosing and requesting. Full guidance is available in the help section.",
      faqTitle: "Before you request",
      heroBody:
        "Choose at your own pace — with clear information, verified size charts and personal support.",
      heroMeta: "Tallinn · Estonia · Personal support",
      heroTitle: "ANDRELOOK",
      orderIntro:
        "No automatic payment and no required account. Every request has a clear next step.",
      orderSteps: [
        {
          title: "Choose a piece",
          body: "Open the product page and review its status and verified sizing evidence.",
        },
        {
          title: "Add the details",
          body: "Select the available options and leave your preferred contact.",
        },
        {
          title: "Receive confirmation",
          body: "Andrelook personally checks price, availability and the next steps.",
        },
      ],
      orderTitle: "How an order begins",
      serviceIntro:
        "Trust comes from clear information and real contact, never unverified promises.",
      serviceItems: [
        {
          title: "Reviewed information",
          body: "Only confirmed model, status and option data is published.",
        },
        {
          title: "Help before ordering",
          body: "Ask about sizing and details before making any decision.",
        },
        {
          title: "Three languages",
          body: "The complete journey works in English, Estonian and Russian.",
        },
      ],
      serviceTitle: "Personal service means clarity",
      sizingPoints: [
        "Original measurement units are preserved",
        "Ambiguous labels are never guessed",
        "Personal sizing help is available",
      ],
      stateIntro:
        "Clear states explain the next step before you share any contact details.",
      stateTitle: "In stock or pre-order",
    },
    product: {
      assistanceBody:
        "Unsure about sizing or another detail? Add the question to your request — confirmation comes before ordering.",
      commercialIntro:
        "Price and availability are fixed only after review. A request is not a payment or a confirmed order.",
      detailsLabel: "Product information",
      helpLabel: "Help before requesting",
      learnMoreLabel: "Learn more",
      orderContext: "How to make a request",
      requestLabel: "Go to request",
      sizeGuideAvailable: "Verified chart",
      sizingLabel: "Size and fit",
    },
  },
};

export function getStorefrontContent(locale: Locale): StorefrontContent {
  return content[locale];
}
