import "server-only";

import type { Locale } from "@/config/locales";

export type Dictionary = {
  availability: string;
  availabilityInStock: string;
  availabilityPending: string;
  availabilityPreOrder: string;
  availabilityUnavailable: string;
  backToCatalog: string;
  catalog: string;
  catalogEmpty: string;
  catalogIntro: string;
  categoryAll: string;
  colour: string;
  colourPending: string;
  consent: string;
  contact: string;
  contactEmail: string;
  contactInstagram: string;
  contactMethod: string;
  contactTelegram: string;
  contactValue: string;
  descriptionPending: string;
  details: string;
  exploreCollection: string;
  footerRegion: string;
  formError: string;
  galleryPending: string;
  home: string;
  howItWorks: string;
  howStepOne: string;
  howStepThree: string;
  howStepTwo: string;
  language: string;
  mobileMenu: string;
  name: string;
  navigation: string;
  noProductsInCategory: string;
  personalService: string;
  pricePending: string;
  productInformation: string;
  requestAction: string;
  requestIntro: string;
  requestSuccess: string;
  requestTitle: string;
  reviewBanner: string;
  secondaryContact: string;
  selectColour: string;
  selectSize: string;
  size: string;
  sizeGuide: string;
  sizeGuidePending: string;
  storefrontKicker: string;
  submit: string;
  submitting: string;
  tagline: string;
  viewCatalog: string;
  viewProduct: string;
};

const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    availability: "Наличие",
    availabilityInStock: "В наличии",
    availabilityPending: "Уточним лично",
    availabilityPreOrder: "Предзаказ",
    availabilityUnavailable: "Недоступно",
    backToCatalog: "Назад в каталог",
    catalog: "Каталог",
    catalogEmpty: "Одобренные товары пока не опубликованы.",
    catalogIntro: "Выбранные модели с личной помощью по размеру и заказу.",
    categoryAll: "Все модели",
    colour: "Цвет",
    colourPending: "Цвета ожидают подтверждения",
    consent: "Я согласен, что Andrelook свяжется со мной по этому запросу.",
    contact: "Контакты",
    contactEmail: "Эл. почта",
    contactInstagram: "Instagram",
    contactMethod: "Как с вами связаться",
    contactTelegram: "Telegram",
    contactValue: "Ваш контакт",
    descriptionPending: "Описание готовится к проверке владельцем.",
    details: "О модели",
    exploreCollection: "Откройте коллекцию",
    footerRegion: "Эстония · Европа",
    formError: "Проверьте отмеченные поля.",
    galleryPending: "Фотографии готовятся к проверке владельцем",
    home: "Главная",
    howItWorks: "Как это работает",
    howStepOne: "Выберите модель и укажите размер, если он известен.",
    howStepThree: "Мы лично подтвердим детали до оформления заказа.",
    howStepTwo: "Оставьте удобный контакт — без регистрации и оплаты.",
    language: "Язык",
    mobileMenu: "Меню",
    name: "Имя",
    navigation: "Навигация",
    noProductsInCategory: "В этой категории пока нет моделей для просмотра.",
    personalService: "Личный сервис из Таллинна по всей Европе",
    pricePending: "Цена уточняется",
    productInformation: "Важная информация",
    requestAction: "Уточнить наличие",
    requestIntro:
      "Отправьте запрос — мы лично подтвердим наличие, цену и детали.",
    requestSuccess: "Запрос получен. Мы свяжемся с вами лично.",
    requestTitle: "Запрос по модели",
    reviewBanner: "Локальный режим проверки — товары ещё не опубликованы",
    secondaryContact: "Или напишите нам напрямую в Telegram",
    selectColour: "Выберите цвет",
    selectSize: "Выберите размер",
    size: "Размер",
    sizeGuide: "Таблица размеров",
    sizeGuidePending: "Размеры ожидают проверки",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Отправить запрос",
    submitting: "Отправляем…",
    tagline: "Мировые бренды · Личный подход",
    viewCatalog: "Смотреть каталог",
    viewProduct: "Смотреть модель",
  },
  et: {
    availability: "Saadavus",
    availabilityInStock: "Laos",
    availabilityPending: "Kinnitame isiklikult",
    availabilityPreOrder: "Eeltellimus",
    availabilityUnavailable: "Pole saadaval",
    backToCatalog: "Tagasi kataloogi",
    catalog: "Kataloog",
    catalogEmpty: "Kinnitatud tooteid pole veel avaldatud.",
    catalogIntro: "Valitud mudelid koos personaalse suuruse- ja tellimisabiga.",
    categoryAll: "Kõik mudelid",
    colour: "Värv",
    colourPending: "Värvid ootavad kinnitamist",
    consent: "Nõustun, et Andrelook võtab minuga selle päringu asjus ühendust.",
    contact: "Kontakt",
    contactEmail: "E-post",
    contactInstagram: "Instagram",
    contactMethod: "Eelistatud kontakt",
    contactTelegram: "Telegram",
    contactValue: "Sinu kontakt",
    descriptionPending: "Kirjeldus ootab omaniku ülevaatust.",
    details: "Tootest",
    exploreCollection: "Avasta kollektsioon",
    footerRegion: "Eesti · Euroopa",
    formError: "Kontrolli märgitud välju.",
    galleryPending: "Fotod ootavad omaniku ülevaatust",
    home: "Avaleht",
    howItWorks: "Kuidas see toimib",
    howStepOne: "Vali mudel ja märgi suurus, kui see on teada.",
    howStepThree: "Kinnitame kõik üksikasjad isiklikult enne tellimust.",
    howStepTwo: "Jäta sobiv kontakt — kontot ega makset pole vaja.",
    language: "Keel",
    mobileMenu: "Menüü",
    name: "Nimi",
    navigation: "Navigatsioon",
    noProductsInCategory:
      "Selles kategoorias pole veel ülevaatamiseks mudeleid.",
    personalService: "Personaalne teenindus Tallinnast üle Euroopa",
    pricePending: "Hind täpsustamisel",
    productInformation: "Oluline teave",
    requestAction: "Küsi saadavust",
    requestIntro:
      "Saada päring — kinnitame isiklikult saadavuse, hinna ja detailid.",
    requestSuccess:
      "Päring on vastu võetud. Võtame sinuga isiklikult ühendust.",
    requestTitle: "Tootepäring",
    reviewBanner: "Kohalik ülevaaterežiim — tooted pole veel avaldatud",
    secondaryContact: "Või kirjuta meile otse Telegramis",
    selectColour: "Vali värv",
    selectSize: "Vali suurus",
    size: "Suurus",
    sizeGuide: "Suuruste tabel",
    sizeGuidePending: "Suurused ootavad ülevaatust",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Saada päring",
    submitting: "Saadan…",
    tagline: "Maailma brändid · Isiklik lähenemine",
    viewCatalog: "Vaata kataloogi",
    viewProduct: "Vaata mudelit",
  },
  en: {
    availability: "Availability",
    availabilityInStock: "In stock",
    availabilityPending: "Personally confirmed",
    availabilityPreOrder: "Pre-order",
    availabilityUnavailable: "Unavailable",
    backToCatalog: "Back to catalog",
    catalog: "Catalog",
    catalogEmpty: "No approved products have been published yet.",
    catalogIntro: "Selected pieces with personal sizing and ordering support.",
    categoryAll: "All pieces",
    colour: "Colour",
    colourPending: "Colours await approval",
    consent: "I agree that Andrelook may contact me about this request.",
    contact: "Contact",
    contactEmail: "Email",
    contactInstagram: "Instagram",
    contactMethod: "Preferred contact",
    contactTelegram: "Telegram",
    contactValue: "Your contact",
    descriptionPending: "Description is awaiting owner review.",
    details: "About this piece",
    exploreCollection: "Explore the collection",
    footerRegion: "Estonia · Europe",
    formError: "Please check the highlighted fields.",
    galleryPending: "Images are awaiting owner review",
    home: "Home",
    howItWorks: "How it works",
    howStepOne: "Choose a piece and a size, if you know it.",
    howStepThree: "We personally confirm every detail before an order.",
    howStepTwo: "Leave your preferred contact — no account or payment needed.",
    language: "Language",
    mobileMenu: "Menu",
    name: "Name",
    navigation: "Navigation",
    noProductsInCategory: "No pieces are ready for review in this category.",
    personalService: "Personal service from Tallinn across Europe",
    pricePending: "Price to be confirmed",
    productInformation: "Important information",
    requestAction: "Confirm availability",
    requestIntro:
      "Send a request and we will personally confirm availability, price and details.",
    requestSuccess: "Request received. We will contact you personally.",
    requestTitle: "Request this piece",
    reviewBanner: "Local review mode — products are not yet published",
    secondaryContact: "Or message us directly on Telegram",
    selectColour: "Select colour",
    selectSize: "Select size",
    size: "Size",
    sizeGuide: "Size guide",
    sizeGuidePending: "Sizing awaits review",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Send request",
    submitting: "Sending…",
    tagline: "World brands · Personal approach",
    viewCatalog: "View catalog",
    viewProduct: "View piece",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
