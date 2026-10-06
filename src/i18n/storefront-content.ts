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
    editorialLabel: string;
    eyebrow: string;
    faq: Array<{ answer: string; question: string }>;
    faqIntro: string;
    faqTitle: string;
    heroBody: string;
    heroMeta: string;
    heroTitle: string;
    locationLabel: string;
    orderIntro: string;
    orderSteps: Array<{ body: string; title: string }>;
    orderTitle: string;
    serviceIntro: string;
    serviceItems: Array<{ body: string; title: string }>;
    serviceTitle: string;
    sizeMark: string;
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
    sizeGuideUnavailable: string;
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
      detailsPending: "Цена готовится к публикации",
      inStockExplanation: "Модель готова к заказу.",
      preorderExplanation:
        "Предзаказ · ориентировочно 2–3 недели · доставка по Европе.",
      priceOnRequest: "Цена будет добавлена перед публикацией",
      unavailableExplanation:
        "Сейчас модель недоступна. Свяжитесь с нами, чтобы узнать о следующем поступлении.",
    },
    home: {
      assistanceBody:
        "Сверьте параметры в таблице модели. Если таблица пока недоступна или вы сомневаетесь, напишите нам — поможем с выбором.",
      assistanceTitle: "Поможем выбрать размер",
      categoriesIntro:
        "Утеплённые куртки, жилеты, кардиганы, свитшоты и футболки — по категориям, без лишнего поиска.",
      categoriesTitle: "Выберите категорию",
      collectionIntro:
        "23 модели Moncler и Parajumpers с фотографиями каждой вещи и понятными вариантами цвета.",
      collectionTitle: "Избранная коллекция",
      contactBody:
        "Напишите в Telegram, Instagram или по электронной почте — ответим на русском, эстонском или английском.",
      contactTitle: "Поможем с выбором",
      editorialLabel: "ANDRELOOK EDIT",
      eyebrow: "Мировые бренды · Andrelook",
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
      faqIntro: "Главное о предзаказе, размерах и согласовании деталей.",
      faqTitle: "Перед предзаказом",
      heroBody:
        "Отобранные модели мировых брендов. Поможем выбрать модель, найти ваш размер и проведём заказ от первого вопроса до получения.",
      heroMeta: "Предзаказ · 2–3 недели · Таллинн и Европа",
      heroTitle: "Найдите вещь, которая действительно ваша.",
      locationLabel: "Таллинн · Европа",
      orderIntro:
        "Без автоматической оплаты и обязательного аккаунта. Все детали согласуем с вами до оплаты.",
      orderSteps: [
        {
          title: "Выберите модель",
          body: "Выберите цвет и размер. Если сомневаетесь, поможем подобрать.",
        },
        {
          title: "Оформите заявку",
          body: "Оставьте контакт и выберите удобный способ получения.",
        },
        {
          title: "Мы подтвердим заказ",
          body: "Свяжемся с вами и согласуем детали и оплату.",
        },
        {
          title: "Получите заказ",
          body: "Обычно предзаказ занимает около 2–3 недель.",
        },
      ],
      orderTitle: "Как проходит заказ",
      serviceIntro:
        "От выбора размера до получения заказа — вы общаетесь с Andrelook напрямую.",
      serviceItems: [
        {
          title: "Помощь с размером",
          body: "Сопоставим таблицу и ваши вопросы до оформления.",
        },
        {
          title: "Предзаказ 2–3 недели",
          body: "Актуальный срок подтвердим перед оплатой.",
        },
        {
          title: "Таллинн и Европа",
          body: "Получение в Таллинне или доставка по Европе.",
        },
      ],
      serviceTitle: "Персональный сервис из Таллинна",
      sizeMark: "РАЗМЕР",
      sizingPoints: [
        "Таблица размеров рядом с моделью",
        "Личная помощь для моделей без таблицы",
        "Вопрос о посадке можно добавить к предзаказу",
      ],
      stateIntro:
        "Отправка формы не списывает оплату: сначала мы согласуем выбор, получение и итоговые детали.",
      stateTitle: "Четыре понятных шага",
    },
    product: {
      assistanceBody:
        "Не уверены в размере? Добавьте вопрос к предзаказу — мы поможем до подтверждения.",
      commercialIntro:
        "Выберите цвет и размер — итоговые детали согласуем с вами до оплаты.",
      deliverySummary:
        "Личная передача в Таллинне или доставка по Европе. Способ получения и стоимость доставки подтверждаются заранее.",
      detailsLabel: "О модели",
      helpLabel: "Нужна помощь?",
      learnMoreLabel: "Подробнее",
      orderContext: "Оформление предзаказа",
      requestLabel: "Оформить предзаказ",
      returnsSummary:
        "Условия возврата или обмена для вашего заказа сообщаются до подтверждения оплаты.",
      sizeGuideAvailable: "Есть таблица размеров",
      sizeGuideUnavailable: "Поможем выбрать размер",
      sizingLabel: "Размеры",
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
      detailsPending: "Hind lisatakse enne avaldamist",
      inStockExplanation: "Toode on tellimiseks valmis.",
      preorderExplanation:
        "Eeltellimus · eeldatavalt 2–3 nädalat · tarne üle Euroopa.",
      priceOnRequest: "Hind lisatakse enne avaldamist",
      unavailableExplanation:
        "Toode ei ole praegu saadaval. Järgmise võimaluse kohta küsi meilt.",
    },
    home: {
      assistanceBody:
        "Võrdle mõõte toote suurustabeliga. Kui tabelit veel pole või kahtled valikus, kirjuta meile — aitame.",
      assistanceTitle: "Aitame suurust valida",
      categoriesIntro:
        "Soojad joped, vestid, kardiganid, dressipluusid ja T-särgid on jaotatud selgetesse kategooriatesse.",
      categoriesTitle: "Vali kategooria",
      collectionIntro:
        "23 Moncleri ja Parajumpersi mudelit koos iga toote fotode ja selgete värvivalikutega.",
      collectionTitle: "Valitud kollektsioon",
      contactBody:
        "Kirjuta Telegramis, Instagramis või e-posti teel — vastame eesti, vene või inglise keeles.",
      contactTitle: "Aitame valikut teha",
      editorialLabel: "ANDRELOOK EDIT",
      eyebrow: "Maailma moebrändid · Andrelook",
      faq: [
        {
          question: "Kas vormi saatmine on juba ost?",
          answer:
            "Ei. Kinnitame esmalt hinna, suuruse, kättesaamise ja järgmised sammud.",
        },
        {
          question: "Kas saan suuruse valikul abi?",
          answer:
            "Jah. Kasuta tootelehe tabelit või küsi vormi kaudu suuruse valikul abi.",
        },
        {
          question: "Kas konto on vajalik?",
          answer: "Ei. Eeltellimuseks pole kontot vaja.",
        },
      ],
      faqIntro: "Peamine info eeltellimuse, suuruse ja kinnitamise kohta.",
      faqTitle: "Enne eeltellimust",
      heroBody:
        "Hoolikalt valitud mudelid maailma moebrändidelt. Aitame leida sobiva toote ja suuruse ning oleme sinu kõrval valikust kättesaamiseni.",
      heroMeta: "Eeltellimus · 2–3 nädalat · Tallinn ja Euroopa",
      heroTitle: "Leia ese, mis on päriselt sinu oma.",
      locationLabel: "Tallinn · Euroopa",
      orderIntro:
        "Automaatset makset ega kontot pole vaja. Kinnitame kõik detailid enne maksmist.",
      orderSteps: [
        {
          title: "Vali toode",
          body: "Vali värv ja suurus. Kui kahtled, aitame sobiva leida.",
        },
        {
          title: "Esita tellimus",
          body: "Jäta kontakt ja vali sobiv kättesaamisviis.",
        },
        {
          title: "Kinnitame tellimuse",
          body: "Võtame ühendust ning lepime kokku detailid ja makse.",
        },
        {
          title: "Saa tellimus kätte",
          body: "Eeltellimus võtab tavaliselt umbes 2–3 nädalat.",
        },
      ],
      orderTitle: "Kuidas tellimine käib",
      serviceIntro:
        "Suuruse valikust tellimuse kättesaamiseni suhtled otse Andrelookiga.",
      serviceItems: [
        {
          title: "Abi suuruse valikul",
          body: "Vaatame tabelit ja vastame küsimustele enne tellimist.",
        },
        {
          title: "Eeltellimus 2–3 nädalat",
          body: "Ajakohase tähtaja kinnitame enne maksmist.",
        },
        {
          title: "Tallinn ja Euroopa",
          body: "Kättesaamine Tallinnas või tarne üle Euroopa.",
        },
      ],
      serviceTitle: "Personaalne teenindus Tallinnast",
      sizeMark: "SUURUS",
      sizingPoints: [
        "Suurustabel on toote juures",
        "Abi, kui tabel pole veel saadaval",
        "Istuvuse küsimuse saab lisada eeltellimusele",
      ],
      stateIntro:
        "Vormi saatmisel makset ei tehta. Esmalt lepime kokku valiku, kättesaamise ja tellimuse üksikasjad.",
      stateTitle: "Neli selget sammu",
    },
    product: {
      assistanceBody:
        "Kas suurus tekitab küsimusi? Lisa küsimus eeltellimusele ja aitame enne kinnitamist.",
      commercialIntro:
        "Vali värv ja suurus; lõplikud üksikasjad kinnitame enne maksmist.",
      deliverySummary:
        "Personaalne üleandmine Tallinnas või tarne üle Euroopa. Kättesaamine ja tarnekulu kinnitatakse ette.",
      detailsLabel: "Tootest",
      helpLabel: "Vajad abi?",
      learnMoreLabel: "Loe lähemalt",
      orderContext: "Eeltellimuse vormistamine",
      requestLabel: "Vormista eeltellimus",
      returnsSummary:
        "Sinu tellimusele kehtivad tagastus- või vahetustingimused teatatakse enne makse kinnitamist.",
      sizeGuideAvailable: "Suurustabel olemas",
      sizeGuideUnavailable: "Aitame suurust valida",
      sizingLabel: "Suurused",
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
      detailsPending: "Price pending publication",
      inStockExplanation: "This piece is ready to order.",
      preorderExplanation:
        "Pre-order · approximately 2–3 weeks · delivery across Europe.",
      priceOnRequest: "Price will be added before publication",
      unavailableExplanation:
        "This piece is not currently available. Contact us about the next opportunity.",
    },
    home: {
      assistanceBody:
        "Compare the chart with a similar piece you own. If a chart is not yet available or you are unsure, message us for help.",
      assistanceTitle: "Personal sizing help",
      categoriesIntro:
        "Puffer jackets, gilets, cardigans, sweatshirts and T-shirts, arranged for effortless browsing.",
      categoriesTitle: "Shop by category",
      collectionIntro:
        "23 Moncler and Parajumpers pieces, each shown with product photography and clear colour options.",
      collectionTitle: "Selected collection",
      contactBody:
        "Message us on Telegram, Instagram or email — we reply in English, Estonian or Russian.",
      contactTitle: "Let us help you choose",
      editorialLabel: "ANDRELOOK EDIT",
      eyebrow: "Global fashion brands · Andrelook",
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
        "A considered edit of global fashion brands. We help you find the right piece and size, then stay with your order from first question to delivery.",
      heroMeta: "Pre-order · 2–3 weeks · Tallinn & Europe",
      heroTitle: "Find the piece that feels unmistakably yours.",
      locationLabel: "Tallinn · Europe",
      orderIntro:
        "No automatic payment and no account required. We confirm every detail before payment.",
      orderSteps: [
        {
          title: "Choose the piece",
          body: "Select a colour and size. If you are unsure, we will help.",
        },
        {
          title: "Submit your order",
          body: "Leave your contact details and choose how to receive it.",
        },
        {
          title: "We confirm the order",
          body: "We contact you to agree the details and payment.",
        },
        {
          title: "Receive it",
          body: "A pre-order usually takes approximately 2–3 weeks.",
        },
      ],
      orderTitle: "How it works",
      serviceIntro:
        "From choosing a size to receiving your order, you speak directly with Andrelook.",
      serviceItems: [
        {
          title: "Sizing support",
          body: "We review the chart and answer fit questions before you order.",
        },
        {
          title: "2–3 week pre-order",
          body: "We confirm the current lead time before payment.",
        },
        {
          title: "Tallinn & Europe",
          body: "Collect in Tallinn or arrange delivery across Europe.",
        },
      ],
      serviceTitle: "Personal service from Tallinn",
      sizeMark: "SIZE",
      sizingPoints: [
        "Size chart beside the product",
        "Personal help for pieces without a chart",
        "Add a fit question to your pre-order",
      ],
      stateIntro:
        "Submitting the form never takes payment. We first confirm your selection, fulfilment and final order details.",
      stateTitle: "Four clear steps",
    },
    product: {
      assistanceBody:
        "Unsure about the size? Add a question to your pre-order and we will help before confirmation.",
      commercialIntro:
        "Choose your colour and size; we confirm the final details before payment.",
      deliverySummary:
        "Personal handover in Tallinn or delivery across Europe. Fulfilment and delivery cost are confirmed in advance.",
      detailsLabel: "About this piece",
      helpLabel: "Need help?",
      learnMoreLabel: "Learn more",
      orderContext: "Complete your pre-order",
      requestLabel: "Pre-order",
      returnsSummary:
        "The return or exchange terms that apply to your order are shared before payment is confirmed.",
      sizeGuideAvailable: "Size chart available",
      sizeGuideUnavailable: "Personal sizing help",
      sizingLabel: "Sizing",
    },
  },
};

export function getStorefrontContent(locale: Locale) {
  return content[locale];
}
