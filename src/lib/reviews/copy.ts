import type { Locale } from "@/config/locales";

export const reviewCopy = {
  et: {
    languageLabel: "Keel",
    title: "Klientide tagasiside",
    formTitle: "Aitäh tellimuse eest",
    intro:
      "Teie aus tagasiside aitab meil paremaks saada ja teistel Andrelooki tundma õppida.",
    provenance:
      "Märkega „Kinnitatud ost” arvustused on esitatud lõpetatud Andrelooki tellimustega seotud isiklike linkide kaudu.",
    verified: "Kinnitatud ost",
    empty: "Siia lisanduvad meie klientide kinnitatud arvustused.",
    all: "Vaata kõiki arvustusi",
    count: "kinnitatud arvustust",
    rating: "Teie hinnang",
    text: "Teie arvustus",
    textHint: "Mõni sõna Teie kogemusest (10–3000 tähemärki).",
    optional: "Soovi korral täpsustage",
    quality: "Toote kvaliteet",
    communication: "Suhtlus",
    delivery: "Tarnekogemus",
    skip: "Ei soovi hinnata",
    name: "Avalik nimi",
    anonymous: "Anonüümne klient",
    first: "Eesnimi",
    initial: "Eesnimi ja initsiaal",
    product: "Mida soovite hinnata?",
    service: "Andrelooki teenindus",
    consent:
      "Nõustun arvustuse ja valitud nime avaldamisega Andrelooki veebilehel. Minu kontaktandmeid ei avaldata. Kinnitatud ost põhineb tegelikul tellimusel.",
    submit: "Saada arvustus",
    pending: "Saadame…",
    success: "Aitäh tagasiside eest",
    successBody:
      "Arvustus on kätte saadud. Vaatame selle enne avaldamist üle, et kaitsta Teie privaatsust.",
    invalid:
      "See arvustuse link ei ole saadaval. Palun võtke Andrelookiga ühendust.",
    error:
      "Kontrollige hinnangut, teksti ja avaldamise nõusolekut. Kui probleem püsib, proovige hiljem uuesti.",
    home: "Tagasi Andrelooki",
    stars: "tärni viiest",
    newest: "Uusimad esmalt",
    language: "Arvustused on esitatud originaalkeeles.",
    privacy: "Privaatsus",
    already: "Teie arvustus on juba kätte saadud.",
  },
  ru: {
    languageLabel: "Язык",
    title: "Отзывы клиентов",
    formTitle: "Спасибо за ваш заказ",
    intro:
      "Ваш честный отзыв помогает нам становиться лучше, а другим клиентам — познакомиться с Andrelook.",
    provenance:
      "Отзывы с отметкой «Подтверждённая покупка» отправлены по личным ссылкам, связанным с завершёнными заказами Andrelook.",
    verified: "Подтверждённая покупка",
    empty: "Здесь появятся подтверждённые отзывы наших клиентов.",
    all: "Все отзывы",
    count: "подтверждённых отзывов",
    rating: "Ваша оценка",
    text: "Ваш отзыв",
    textHint: "Несколько слов о вашем опыте (10–3000 символов).",
    optional: "По желанию уточните",
    quality: "Качество товара",
    communication: "Общение",
    delivery: "Опыт доставки",
    skip: "Без оценки",
    name: "Имя для публикации",
    anonymous: "Анонимный клиент",
    first: "Только имя",
    initial: "Имя и инициал",
    product: "О чём хотите оставить отзыв?",
    service: "Обслуживание Andrelook",
    consent:
      "Согласен с публикацией отзыва и выбранного имени на сайте Andrelook. Контактные данные не публикуются. Подтверждённая покупка основана на реальном заказе.",
    submit: "Отправить отзыв",
    pending: "Отправляем…",
    success: "Спасибо за отзыв",
    successBody:
      "Мы получили ваш отзыв. Перед публикацией проверим его, чтобы защитить вашу приватность.",
    invalid:
      "Эта ссылка для отзыва недоступна. Пожалуйста, свяжитесь с Andrelook.",
    error:
      "Проверьте оценку, текст и согласие на публикацию. Если проблема сохраняется, попробуйте позже.",
    home: "Вернуться в Andrelook",
    stars: "из 5",
    newest: "Сначала новые",
    language: "Отзывы представлены на языке оригинала.",
    privacy: "Приватность",
    already: "Ваш отзыв уже получен.",
  },
  en: {
    languageLabel: "Language",
    title: "Customer reviews",
    formTitle: "Thank you for your order",
    intro:
      "Your honest feedback helps us improve and helps other customers get to know Andrelook.",
    provenance:
      "Reviews marked “Verified purchase” are submitted through personal links connected to completed Andrelook orders.",
    verified: "Verified purchase",
    empty: "Verified reviews from our customers will appear here.",
    all: "View all reviews",
    count: "verified reviews",
    rating: "Your rating",
    text: "Your review",
    textHint: "A few words about your experience (10–3000 characters).",
    optional: "Optional feedback",
    quality: "Product quality",
    communication: "Communication",
    delivery: "Delivery experience",
    skip: "No rating",
    name: "Public display name",
    anonymous: "Anonymous customer",
    first: "First name",
    initial: "First name and initial",
    product: "What would you like to review?",
    service: "Andrelook service",
    consent:
      "I agree to the publication of my review and chosen name on Andrelook. My contact details are not displayed. Verified purchase is based on a real order.",
    submit: "Submit review",
    pending: "Sending…",
    success: "Thank you for your feedback",
    successBody:
      "We have received your review. We will check it before publication to protect your privacy.",
    invalid: "This review link is unavailable. Please contact Andrelook.",
    error:
      "Please check your rating, review and publication consent. If the problem continues, try again later.",
    home: "Back to Andrelook",
    stars: "out of 5",
    newest: "Newest first",
    language: "Reviews are shown in their original language.",
    privacy: "Privacy",
    already: "Your review has already been received.",
  },
} as const;

export function reviewRequestMessage(locale: Locale, url: string) {
  return {
    et: `Tere!\nLoodame, et jäite oma Andrelooki tellimusega rahule.\n\nKui Teil on hetk, oleksime väga tänulikud ausa tagasiside eest. See võtab umbes minuti ja aitab teistel klientidel Andrelooki usaldada.\n\n${url}\n\nSuur aitäh!`,
    ru: `Здравствуйте!\nНадеемся, что вы остались довольны заказом Andrelook.\n\nЕсли у вас будет минутка, будем очень благодарны за честный отзыв. Это займёт около минуты и поможет другим клиентам лучше узнать Andrelook.\n\n${url}\n\nБольшое спасибо!`,
    en: `Hello!\nWe hope you’re happy with your Andrelook order.\n\nIf you have a moment, we’d really appreciate an honest review. It takes about a minute and helps other customers feel confident choosing Andrelook.\n\n${url}\n\nThank you!`,
  }[locale];
}

export function reviewCountLabel(locale: Locale, count: number) {
  if (locale === "en")
    return `${count} verified ${count === 1 ? "review" : "reviews"}`;
  if (locale === "et")
    return `${count} kinnitatud ${count === 1 ? "arvustus" : "arvustust"}`;
  const form = new Intl.PluralRules("ru").select(count);
  return `${count} ${form === "one" ? "подтверждённый отзыв" : form === "few" ? "подтверждённых отзыва" : "подтверждённых отзывов"}`;
}
