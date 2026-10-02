import "server-only";

import type { Locale } from "@/config/locales";

export type Dictionary = {
  about: string;
  approvalNotice: string;
  availability: string;
  availabilityInStock: string;
  availabilityPending: string;
  availabilityPreOrder: string;
  availabilityUnavailable: string;
  backToCatalog: string;
  catalog: string;
  catalogEmpty: string;
  catalogIntro: string;
  catalogResults: string;
  catalogSearch: string;
  categoryAll: string;
  colour: string;
  colourPending: string;
  consent: string;
  contact: string;
  contactEmail: string;
  contactInstagram: string;
  contactPhone: string;
  contactMethod: string;
  contactTelegram: string;
  contactValue: string;
  descriptionPending: string;
  details: string;
  delivery: string;
  deliveryPayment: string;
  exploreCollection: string;
  footerRegion: string;
  footerCustomerCare: string;
  footerLegal: string;
  formError: string;
  galleryPending: string;
  galleryLabel: string;
  home: string;
  howItWorks: string;
  howToOrder: string;
  howStepOne: string;
  howStepThree: string;
  howStepTwo: string;
  language: string;
  mobileMenu: string;
  mobileMenuClose: string;
  name: string;
  navigation: string;
  noProductsInCategory: string;
  noSearchResults: string;
  optional: string;
  overview: string;
  personalService: string;
  pricePending: string;
  productInformation: string;
  requestAction: string;
  requestIntro: string;
  requestComment: string;
  requestNextStep: string;
  requestSuccess: string;
  requestTitle: string;
  reviewBanner: string;
  secondaryContact: string;
  skipToContent: string;
  search: string;
  clearFilters: string;
  filterAvailability: string;
  filterAll: string;
  sort: string;
  sortCurated: string;
  sortName: string;
  sortPriceAscending: string;
  sortPriceDescending: string;
  selectColour: string;
  selectSize: string;
  size: string;
  sizeGuide: string;
  sizeGuideHow: string;
  sizeGuideNote: string;
  sizeGuidePending: string;
  storefrontKicker: string;
  submit: string;
  submitting: string;
  tagline: string;
  terms: string;
  privacy: string;
  returnsExchanges: string;
  preorder: string;
  faq: string;
  personalSizing: string;
  categoryContext: string;
  needHelp: string;
  relatedProducts: string;
  selectedProducts: string;
  whyAndrelook: string;
  trustClarity: string;
  trustSupport: string;
  trustLanguages: string;
  validationRequired: string;
  viewCatalog: string;
  viewProduct: string;
};

const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    about: "Об Andrelook",
    approvalNotice:
      "Содержание этой страницы требует утверждения владельцем и юридической проверки до публикации.",
    availability: "Наличие",
    availabilityInStock: "В наличии",
    availabilityPending: "Уточним лично",
    availabilityPreOrder: "Предзаказ",
    availabilityUnavailable: "Недоступно",
    backToCatalog: "Назад в каталог",
    catalog: "Каталог",
    catalogEmpty: "Одобренные товары пока не опубликованы.",
    catalogIntro: "Выбранные модели с личной помощью по размеру и заказу.",
    catalogResults: "Моделей",
    catalogSearch: "Поиск по названию, категории или бренду",
    categoryAll: "Все модели",
    colour: "Цвет",
    colourPending: "Цвета ожидают подтверждения",
    consent: "Я согласен, что Andrelook свяжется со мной по этому запросу.",
    contact: "Контакты",
    contactEmail: "Эл. почта",
    contactInstagram: "Instagram",
    contactPhone: "Телефон",
    contactMethod: "Как с вами связаться",
    contactTelegram: "Telegram",
    contactValue: "Ваш контакт",
    descriptionPending: "Описание готовится к проверке владельцем.",
    details: "О модели",
    delivery: "Доставка и оплата",
    deliveryPayment: "Доставка и оплата",
    exploreCollection: "Откройте коллекцию",
    footerRegion: "Эстония · Европа",
    footerCustomerCare: "Покупателям",
    footerLegal: "Информация",
    formError: "Проверьте отмеченные поля.",
    galleryPending: "Фотографии готовятся к проверке владельцем",
    galleryLabel: "Фотографии модели",
    home: "Главная",
    howItWorks: "Как это работает",
    howToOrder: "Как заказать",
    howStepOne: "Выберите модель и укажите размер, если он известен.",
    howStepThree: "Мы лично подтвердим детали до оформления заказа.",
    howStepTwo: "Оставьте удобный контакт — без регистрации и оплаты.",
    language: "Язык",
    mobileMenu: "Меню",
    mobileMenuClose: "Закрыть меню",
    name: "Имя",
    navigation: "Навигация",
    noProductsInCategory: "В этой категории пока нет моделей для просмотра.",
    noSearchResults: "По выбранным условиям моделей не найдено.",
    optional: "необязательно",
    overview: "Обзор",
    personalService: "Личный сервис из Таллинна по всей Европе",
    pricePending: "Цена уточняется",
    productInformation: "Важная информация",
    requestAction: "Уточнить наличие",
    requestIntro:
      "Отправьте запрос — мы лично подтвердим наличие, цену и детали.",
    requestComment: "Комментарий",
    requestNextStep:
      "Мы проверим запрос и ответим по выбранному вами каналу связи.",
    requestSuccess: "Запрос получен. Мы свяжемся с вами лично.",
    requestTitle: "Запрос по модели",
    reviewBanner: "Локальный режим проверки — товары ещё не опубликованы",
    secondaryContact: "Или напишите нам напрямую в Telegram",
    skipToContent: "Перейти к содержанию",
    search: "Поиск",
    clearFilters: "Сбросить",
    filterAvailability: "Наличие",
    filterAll: "Все",
    sort: "Сортировка",
    sortCurated: "Выбор Andrelook",
    sortName: "По названию",
    sortPriceAscending: "Цена: по возрастанию",
    sortPriceDescending: "Цена: по убыванию",
    selectColour: "Выберите цвет",
    selectSize: "Выберите размер",
    size: "Размер",
    sizeGuide: "Таблица размеров",
    sizeGuideHow: "Как измерять",
    sizeGuideNote:
      "Все значения показаны в единицах исходной проверенной таблицы. Если вы сомневаетесь, запросите помощь с размером.",
    sizeGuidePending: "Размеры ожидают проверки",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Отправить запрос",
    submitting: "Отправляем…",
    tagline: "Мировые бренды · Личный подход",
    terms: "Условия",
    privacy: "Конфиденциальность",
    returnsExchanges: "Возвраты и обмен",
    preorder: "Предзаказ",
    faq: "Вопросы и ответы",
    personalSizing: "Помощь с размером",
    categoryContext:
      "Отобранные модели этой категории. Наличие и детали подтверждаются лично.",
    needHelp: "Нужна помощь?",
    relatedProducts: "Другие модели",
    selectedProducts: "Выбранные модели",
    whyAndrelook: "Почему Andrelook",
    trustClarity:
      "Понятный процесс без обязательной регистрации и автоматической оплаты.",
    trustSupport: "Личная помощь с размером, наличием и деталями до заказа.",
    trustLanguages: "Полный сервис на русском, эстонском и английском языках.",
    validationRequired: "Заполните это поле.",
    viewCatalog: "Смотреть каталог",
    viewProduct: "Смотреть модель",
  },
  et: {
    about: "Andrelookist",
    approvalNotice:
      "Selle lehe sisu vajab enne avaldamist omaniku kinnitust ja õiguslikku kontrolli.",
    availability: "Saadavus",
    availabilityInStock: "Laos",
    availabilityPending: "Kinnitame isiklikult",
    availabilityPreOrder: "Eeltellimus",
    availabilityUnavailable: "Pole saadaval",
    backToCatalog: "Tagasi kataloogi",
    catalog: "Kataloog",
    catalogEmpty: "Kinnitatud tooteid pole veel avaldatud.",
    catalogIntro: "Valitud mudelid koos personaalse suuruse- ja tellimisabiga.",
    catalogResults: "Mudelit",
    catalogSearch: "Otsi nime, kategooria või brändi järgi",
    categoryAll: "Kõik mudelid",
    colour: "Värv",
    colourPending: "Värvid ootavad kinnitamist",
    consent: "Nõustun, et Andrelook võtab minuga selle päringu asjus ühendust.",
    contact: "Kontakt",
    contactEmail: "E-post",
    contactInstagram: "Instagram",
    contactPhone: "Telefon",
    contactMethod: "Eelistatud kontakt",
    contactTelegram: "Telegram",
    contactValue: "Sinu kontakt",
    descriptionPending: "Kirjeldus ootab omaniku ülevaatust.",
    details: "Tootest",
    delivery: "Tarne ja maksmine",
    deliveryPayment: "Tarne ja maksmine",
    exploreCollection: "Avasta kollektsioon",
    footerRegion: "Eesti · Euroopa",
    footerCustomerCare: "Kliendile",
    footerLegal: "Teave",
    formError: "Kontrolli märgitud välju.",
    galleryPending: "Fotod ootavad omaniku ülevaatust",
    galleryLabel: "Toote fotod",
    home: "Avaleht",
    howItWorks: "Kuidas see toimib",
    howToOrder: "Kuidas tellida",
    howStepOne: "Vali mudel ja märgi suurus, kui see on teada.",
    howStepThree: "Kinnitame kõik üksikasjad isiklikult enne tellimust.",
    howStepTwo: "Jäta sobiv kontakt — kontot ega makset pole vaja.",
    language: "Keel",
    mobileMenu: "Menüü",
    mobileMenuClose: "Sulge menüü",
    name: "Nimi",
    navigation: "Navigatsioon",
    noProductsInCategory:
      "Selles kategoorias pole veel ülevaatamiseks mudeleid.",
    noSearchResults: "Valitud tingimustele vastavaid mudeleid ei leitud.",
    optional: "valikuline",
    overview: "Ülevaade",
    personalService: "Personaalne teenindus Tallinnast üle Euroopa",
    pricePending: "Hind täpsustamisel",
    productInformation: "Oluline teave",
    requestAction: "Küsi saadavust",
    requestIntro:
      "Saada päring — kinnitame isiklikult saadavuse, hinna ja detailid.",
    requestComment: "Kommentaar",
    requestNextStep:
      "Kontrollime päringu ja vastame sinu valitud suhtluskanalis.",
    requestSuccess:
      "Päring on vastu võetud. Võtame sinuga isiklikult ühendust.",
    requestTitle: "Tootepäring",
    reviewBanner: "Kohalik ülevaaterežiim — tooted pole veel avaldatud",
    secondaryContact: "Või kirjuta meile otse Telegramis",
    skipToContent: "Liigu sisu juurde",
    search: "Otsi",
    clearFilters: "Lähtesta",
    filterAvailability: "Saadavus",
    filterAll: "Kõik",
    sort: "Järjestus",
    sortCurated: "Andrelooki valik",
    sortName: "Nime järgi",
    sortPriceAscending: "Hind: kasvavalt",
    sortPriceDescending: "Hind: kahanevalt",
    selectColour: "Vali värv",
    selectSize: "Vali suurus",
    size: "Suurus",
    sizeGuide: "Suuruste tabel",
    sizeGuideHow: "Kuidas mõõta",
    sizeGuideNote:
      "Kõik väärtused on kontrollitud lähtetabeli ühikutes. Kahtluse korral küsi suuruse valikul abi.",
    sizeGuidePending: "Suurused ootavad ülevaatust",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Saada päring",
    submitting: "Saadan…",
    tagline: "Maailma brändid · Isiklik lähenemine",
    terms: "Tingimused",
    privacy: "Privaatsus",
    returnsExchanges: "Tagastus ja vahetus",
    preorder: "Eeltellimus",
    faq: "Korduma kippuvad küsimused",
    personalSizing: "Suuruse valiku abi",
    categoryContext:
      "Selle kategooria valitud mudelid. Saadavus ja detailid kinnitatakse isiklikult.",
    needHelp: "Vajad abi?",
    relatedProducts: "Teised mudelid",
    selectedProducts: "Valitud mudelid",
    whyAndrelook: "Miks Andrelook",
    trustClarity:
      "Selge protsess ilma kohustusliku konto ja automaatse makseta.",
    trustSupport:
      "Personaalne abi suuruse, saadavuse ja detailidega enne tellimist.",
    trustLanguages: "Täielik teenindus eesti, vene ja inglise keeles.",
    validationRequired: "Täida see väli.",
    viewCatalog: "Vaata kataloogi",
    viewProduct: "Vaata mudelit",
  },
  en: {
    about: "About Andrelook",
    approvalNotice:
      "This page requires owner approval and legal review before publication.",
    availability: "Availability",
    availabilityInStock: "In stock",
    availabilityPending: "Personally confirmed",
    availabilityPreOrder: "Pre-order",
    availabilityUnavailable: "Unavailable",
    backToCatalog: "Back to catalog",
    catalog: "Catalog",
    catalogEmpty: "No approved products have been published yet.",
    catalogIntro: "Selected pieces with personal sizing and ordering support.",
    catalogResults: "Pieces",
    catalogSearch: "Search by name, category or brand",
    categoryAll: "All pieces",
    colour: "Colour",
    colourPending: "Colours await approval",
    consent: "I agree that Andrelook may contact me about this request.",
    contact: "Contact",
    contactEmail: "Email",
    contactInstagram: "Instagram",
    contactPhone: "Phone",
    contactMethod: "Preferred contact",
    contactTelegram: "Telegram",
    contactValue: "Your contact",
    descriptionPending: "Description is awaiting owner review.",
    details: "About this piece",
    delivery: "Delivery & payment",
    deliveryPayment: "Delivery & payment",
    exploreCollection: "Explore the collection",
    footerRegion: "Estonia · Europe",
    footerCustomerCare: "Customer care",
    footerLegal: "Information",
    formError: "Please check the highlighted fields.",
    galleryPending: "Images are awaiting owner review",
    galleryLabel: "Product images",
    home: "Home",
    howItWorks: "How it works",
    howToOrder: "How to order",
    howStepOne: "Choose a piece and a size, if you know it.",
    howStepThree: "We personally confirm every detail before an order.",
    howStepTwo: "Leave your preferred contact — no account or payment needed.",
    language: "Language",
    mobileMenu: "Menu",
    mobileMenuClose: "Close menu",
    name: "Name",
    navigation: "Navigation",
    noProductsInCategory: "No pieces are ready for review in this category.",
    noSearchResults: "No pieces match the selected criteria.",
    optional: "optional",
    overview: "Overview",
    personalService: "Personal service from Tallinn across Europe",
    pricePending: "Price to be confirmed",
    productInformation: "Important information",
    requestAction: "Confirm availability",
    requestIntro:
      "Send a request and we will personally confirm availability, price and details.",
    requestComment: "Comment",
    requestNextStep:
      "We will review the request and reply through your chosen contact channel.",
    requestSuccess: "Request received. We will contact you personally.",
    requestTitle: "Request this piece",
    reviewBanner: "Local review mode — products are not yet published",
    secondaryContact: "Or message us directly on Telegram",
    skipToContent: "Skip to content",
    search: "Search",
    clearFilters: "Clear",
    filterAvailability: "Availability",
    filterAll: "All",
    sort: "Sort",
    sortCurated: "Andrelook selection",
    sortName: "Name",
    sortPriceAscending: "Price: low to high",
    sortPriceDescending: "Price: high to low",
    selectColour: "Select colour",
    selectSize: "Select size",
    size: "Size",
    sizeGuide: "Size guide",
    sizeGuideHow: "How to measure",
    sizeGuideNote:
      "All values use the units from the verified source table. Ask for sizing help if you are unsure.",
    sizeGuidePending: "Sizing awaits review",
    storefrontKicker: "Andrelook · Tallinn",
    submit: "Send request",
    submitting: "Sending…",
    tagline: "World brands · Personal approach",
    terms: "Terms",
    privacy: "Privacy",
    returnsExchanges: "Returns & exchanges",
    preorder: "Pre-order",
    faq: "Frequently asked questions",
    personalSizing: "Personal sizing help",
    categoryContext:
      "A considered selection from this category. Availability and details are confirmed personally.",
    needHelp: "Need help?",
    relatedProducts: "Other pieces",
    selectedProducts: "Selected pieces",
    whyAndrelook: "Why Andrelook",
    trustClarity:
      "A clear process without a required account or automatic payment.",
    trustSupport:
      "Personal support with sizing, availability and details before ordering.",
    trustLanguages: "Complete service in English, Estonian and Russian.",
    validationRequired: "Please complete this field.",
    viewCatalog: "View catalog",
    viewProduct: "View piece",
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
