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
        "Все модели запуска доступны по предзаказу. Ожидаемый срок — около 2–3 недель; детали подтверждаются лично.",
      priceOnRequest: "Цена по запросу",
      unavailableExplanation:
        "Недоступную модель нельзя запросить, пока её статус не изменится.",
    },
    home: {
      assistanceBody:
        "Проверенная таблица остаётся рядом с моделью. Если данных недостаточно, поможем разобраться лично до оформления запроса.",
      assistanceTitle: "Размер без догадок",
      categoriesIntro:
        "Переходите сразу к нужному типу вещи. Количество отражает модели текущей стартовой коллекции.",
      categoriesTitle: "Найдите свой раздел",
      collectionIntro:
        "Реальные модели Andrelook с фотографиями, цветами, размерной информацией и личным сопровождением предзаказа.",
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
        "Тщательно отобранные модели по предзаказу с доставкой по Европе, проверенными таблицами размеров и личной помощью из Таллинна.",
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
          body: "Andrelook лично подтвердит цену, размер, оплату и ожидаемый срок 2–3 недели.",
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
        "Каждую модель можно запросить сейчас; ожидаемый срок и следующий шаг понятны до отправки формы.",
      stateTitle: "Стартовая коллекция по предзаказу",
    },
    product: {
      assistanceBody:
        "Не уверены в размере или параметрах? Укажите вопрос в форме — подтверждение будет до оформления заказа.",
      commercialIntro:
        "Предзаказ с ожидаемым сроком около 2–3 недель. Запрос не списывает оплату: мы сначала лично подтверждаем цену и детали.",
      deliverySummary:
        "Личная передача в Таллинне или доставка по Европе. Способ оплаты зависит от получения и подтверждается до оплаты.",
      detailsLabel: "Информация о модели",
      helpLabel: "Помощь перед запросом",
      learnMoreLabel: "Подробнее",
      orderContext: "Как оформить запрос",
      requestLabel: "Перейти к запросу",
      returnsSummary:
        "Применимые условия возврата или обмена сообщаются до подтверждения заказа.",
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
        "Kõik stardikollektsiooni mudelid on eeltellitavad. Eeldatav aeg on umbes 2–3 nädalat; üksikasjad kinnitatakse isiklikult.",
      priceOnRequest: "Hind päringu alusel",
      unavailableExplanation:
        "Mittesaadava mudeli kohta ei saa päringut saata enne oleku muutmist.",
    },
    home: {
      assistanceBody:
        "Kontrollitud suurustabel asub alati mudeli juures. Kui andmeid on vähe, aitame enne päringut isiklikult.",
      assistanceTitle: "Suurus ilma oletusteta",
      categoriesIntro:
        "Liigu kohe sobiva tootetüübi juurde. Arv näitab praeguse stardikollektsiooni mudeleid.",
      categoriesTitle: "Leia õige kategooria",
      collectionIntro:
        "Andrelooki päris mudelid koos fotode, värvide, suurusinfo ja personaalse eeltellimustoega.",
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
        "Hoolikalt valitud eeltellimusmudelid, tarne üle Euroopa, kontrollitud suurustabelid ja personaalne abi Tallinnast.",
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
          body: "Andrelook kinnitab isiklikult hinna, suuruse, makse ja eeldatava 2–3-nädalase aja.",
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
        "Iga mudelit saab kohe küsida; eeldatav aeg ja järgmine samm on selged enne vormi saatmist.",
      stateTitle: "Stardikollektsioon eeltellimisel",
    },
    product: {
      assistanceBody:
        "Kas suurus või detailid tekitavad küsimusi? Lisa küsimus vormi — kõik kinnitatakse enne tellimist.",
      commercialIntro:
        "Eeltellimuse eeldatav aeg on umbes 2–3 nädalat. Päring ei võta makset — esmalt kinnitame hinna ja detailid isiklikult.",
      deliverySummary:
        "Isiklik üleandmine Tallinnas või tarne üle Euroopa. Makseviis sõltub kättesaamisest ja kinnitatakse enne makset.",
      detailsLabel: "Mudeli info",
      helpLabel: "Abi enne päringut",
      learnMoreLabel: "Loe lähemalt",
      orderContext: "Kuidas päringut esitada",
      requestLabel: "Liigu päringu juurde",
      returnsSummary:
        "Kohaldatavad tagastus- või vahetustingimused antakse enne tellimuse kinnitamist.",
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
        "Every launch piece is available by pre-order. The expected timeframe is approximately 2–3 weeks, with details confirmed personally.",
      priceOnRequest: "Price on request",
      unavailableExplanation:
        "An unavailable piece cannot be requested until its status changes.",
    },
    home: {
      assistanceBody:
        "A verified size chart stays beside each supported piece. If the evidence is incomplete, we help personally before a request is placed.",
      assistanceTitle: "Sizing without guesswork",
      categoriesIntro:
        "Go straight to the type of piece you need. Counts reflect the current launch collection.",
      categoriesTitle: "Find your category",
      collectionIntro:
        "Real Andrelook pieces with photography, colours, sizing information and personal pre-order support.",
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
        "A considered pre-order edit with delivery across Europe, verified size guides and personal support from Tallinn.",
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
          body: "Andrelook personally confirms price, size, payment and the expected 2–3 week timeframe.",
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
        "Every piece can be requested now, with the expected timing and next step clear before you submit.",
      stateTitle: "The launch collection, by pre-order",
    },
    product: {
      assistanceBody:
        "Unsure about sizing or another detail? Add the question to your request — confirmation comes before ordering.",
      commercialIntro:
        "Pre-order with an expected timeframe of approximately 2–3 weeks. A request takes no payment; we first confirm price and details personally.",
      deliverySummary:
        "Personal handover in Tallinn or delivery across Europe. Payment depends on fulfilment and is confirmed before payment.",
      detailsLabel: "Product information",
      helpLabel: "Help before requesting",
      learnMoreLabel: "Learn more",
      orderContext: "How to make a request",
      requestLabel: "Go to request",
      returnsSummary:
        "The return or exchange terms that apply are shared before your order is confirmed.",
      sizeGuideAvailable: "Verified chart",
      sizingLabel: "Size and fit",
    },
  },
};

export function getStorefrontContent(locale: Locale): StorefrontContent {
  return content[locale];
}
