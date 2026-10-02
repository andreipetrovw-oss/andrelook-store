import type { Locale } from "@/config/locales";

export const infoPageSlugs = [
  "about",
  "how-to-order",
  "delivery-payment",
  "pre-order",
  "returns-exchanges",
  "faq",
  "contact",
  "privacy",
  "terms",
] as const;

export type InfoPageSlug = (typeof infoPageSlugs)[number];

export type InfoPage = {
  eyebrow: string;
  title: string;
  introduction: string;
  sections: Array<{ title: string; body: string }>;
  requiresApproval?: boolean;
};

const content: Record<Locale, Record<InfoPageSlug, InfoPage>> = {
  ru: {
    about: {
      eyebrow: "Andrelook · Tallinn",
      title: "Об Andrelook",
      introduction:
        "Andrelook помогает выбрать модель, размер и удобный способ заказа с личной поддержкой.",
      sections: [
        {
          title: "Спокойный выбор",
          body: "В каталоге показаны только модели и сведения, подготовленные для публичного просмотра.",
        },
        {
          title: "Личный контакт",
          body: "Перед заказом мы подтверждаем детали напрямую — без обязательной регистрации и сложного оформления.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Покупателям",
      title: "Как заказать",
      introduction:
        "Выберите модель и отправьте короткий запрос. Это не является автоматической оплатой или подтверждённым заказом.",
      sections: [
        {
          title: "1. Выберите модель",
          body: "Откройте карточку товара и укажите подтверждённые варианты размера или цвета, если они доступны.",
        },
        {
          title: "2. Оставьте контакт",
          body: "Сообщите имя и удобный способ связи. Регистрация не требуется.",
        },
        {
          title: "3. Получите подтверждение",
          body: "Andrelook лично уточнит наличие, цену, сроки и дальнейшие шаги до оформления.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Покупателям",
      title: "Доставка и оплата",
      introduction:
        "Условия доставки, сроки и способ оплаты подтверждаются лично до оформления заказа.",
      sections: [
        {
          title: "До подтверждения",
          body: "Мы сообщим применимые к вашему заказу условия после уточнения модели, наличия и места доставки.",
        },
      ],
      requiresApproval: true,
    },
    "pre-order": {
      eyebrow: "Покупателям",
      title: "Как работает предзаказ",
      introduction:
        "Статус «Предзаказ» означает, что модель не обещана к немедленной выдаче.",
      sections: [
        {
          title: "Личное подтверждение",
          body: "Срок, доступность, цена и условия подтверждаются до того, как запрос станет заказом.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Покупателям",
      title: "Возвраты и обмен",
      introduction:
        "Полные условия возврата и обмена должны быть утверждены владельцем и проверены на соответствие применимому праву.",
      sections: [
        {
          title: "Перед заказом",
          body: "Запросите действующие условия для конкретной покупки у Andrelook. Эта страница пока не заменяет утверждённую политику.",
        },
      ],
      requiresApproval: true,
    },
    faq: {
      eyebrow: "Помощь",
      title: "Частые вопросы",
      introduction: "Коротко о текущем процессе выбора и запроса.",
      sections: [
        {
          title: "Нужна ли регистрация?",
          body: "Нет. Для запроса достаточно имени, выбранной модели и удобного контакта.",
        },
        {
          title: "Запрос означает покупку?",
          body: "Нет. Andrelook сначала подтверждает доступность, цену и детали лично.",
        },
        {
          title: "Можно ли получить помощь с размером?",
          body: "Да. Отправьте запрос или напишите напрямую, если таблица размеров не отвечает на ваш вопрос.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook · Tallinn",
      title: "Связаться с нами",
      introduction: "Выберите удобный канал связи — мы ответим лично.",
      sections: [
        {
          title: "Контакты",
          body: "Telegram: @andrelookstore · Instagram: @andrelook.store · Email: info.andrelook@gmail.com",
        },
      ],
    },
    privacy: {
      eyebrow: "Юридическая информация",
      title: "Конфиденциальность",
      introduction:
        "Окончательный текст политики конфиденциальности требует утверждения владельцем и юридической проверки.",
      sections: [
        {
          title: "Запросы покупателей",
          body: "Форма запрашивает контактные данные только для ответа на запрос по выбранной модели. До публикации необходима полная утверждённая политика.",
        },
      ],
      requiresApproval: true,
    },
    terms: {
      eyebrow: "Юридическая информация",
      title: "Условия использования",
      introduction:
        "Окончательные коммерческие и юридические условия ещё не утверждены для публикации.",
      sections: [
        {
          title: "Важно",
          body: "Запрос через сайт не является автоматическим подтверждением заказа. Полный текст условий требует утверждения владельцем и юридической проверки.",
        },
      ],
      requiresApproval: true,
    },
  },
  et: {
    about: {
      eyebrow: "Andrelook · Tallinn",
      title: "Andrelookist",
      introduction:
        "Andrelook aitab valida mudeli ja suuruse ning esitada päringu personaalse toe abil.",
      sections: [
        {
          title: "Rahulik valik",
          body: "Kataloogis kuvatakse ainult avalikuks ülevaatuseks ette valmistatud mudeleid ja andmeid.",
        },
        {
          title: "Isiklik kontakt",
          body: "Enne tellimust kinnitame üksikasjad otse — kohustusliku konto ja keeruka kassata.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Kliendile",
      title: "Kuidas tellida",
      introduction:
        "Vali mudel ja saada lühike päring. See ei ole automaatne makse ega kinnitatud tellimus.",
      sections: [
        {
          title: "1. Vali mudel",
          body: "Ava tooteleht ja vali kinnitatud suurus või värv, kui need on saadaval.",
        },
        {
          title: "2. Jäta kontakt",
          body: "Lisa nimi ja sobiv suhtluskanal. Kontot pole vaja.",
        },
        {
          title: "3. Saa kinnitus",
          body: "Andrelook kinnitab enne tellimist isiklikult saadavuse, hinna, aja ja järgmised sammud.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Kliendile",
      title: "Tarne ja maksmine",
      introduction:
        "Tarneviis, aeg ja makseviis kinnitatakse isiklikult enne tellimust.",
      sections: [
        {
          title: "Enne kinnitamist",
          body: "Anname konkreetse tellimuse tingimused pärast mudeli, saadavuse ja sihtkoha täpsustamist.",
        },
      ],
      requiresApproval: true,
    },
    "pre-order": {
      eyebrow: "Kliendile",
      title: "Kuidas eeltellimus toimib",
      introduction:
        "Märge „Eeltellimus” tähendab, et mudelit ei lubata kohe väljastamiseks.",
      sections: [
        {
          title: "Isiklik kinnitus",
          body: "Aeg, saadavus, hind ja tingimused kinnitatakse enne, kui päringust saab tellimus.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Kliendile",
      title: "Tagastus ja vahetus",
      introduction:
        "Täielikud tagastus- ja vahetustingimused vajavad omaniku kinnitust ning õiguslikku kontrolli.",
      sections: [
        {
          title: "Enne tellimist",
          body: "Küsi Andrelookilt konkreetse ostu kehtivaid tingimusi. See leht ei asenda veel kinnitatud poliitikat.",
        },
      ],
      requiresApproval: true,
    },
    faq: {
      eyebrow: "Abi",
      title: "Korduma kippuvad küsimused",
      introduction: "Lühidalt valiku ja päringu praegusest protsessist.",
      sections: [
        {
          title: "Kas konto on vajalik?",
          body: "Ei. Päringuks piisab nimest, valitud mudelist ja sobivast kontaktist.",
        },
        {
          title: "Kas päring tähendab ostu?",
          body: "Ei. Andrelook kinnitab esmalt isiklikult saadavuse, hinna ja üksikasjad.",
        },
        {
          title: "Kas suuruse valikul saab abi?",
          body: "Jah. Saada päring või kirjuta otse, kui suurustabelist ei piisa.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook · Tallinn",
      title: "Võta ühendust",
      introduction: "Vali sobiv kanal — vastame isiklikult.",
      sections: [
        {
          title: "Kontaktid",
          body: "Telegram: @andrelookstore · Instagram: @andrelook.store · E-post: info.andrelook@gmail.com",
        },
      ],
    },
    privacy: {
      eyebrow: "Õigusteave",
      title: "Privaatsus",
      introduction:
        "Lõplik privaatsuspoliitika vajab omaniku kinnitust ja õiguslikku kontrolli.",
      sections: [
        {
          title: "Kliendipäringud",
          body: "Vorm küsib kontaktandmeid ainult valitud mudeli päringule vastamiseks. Enne avaldamist on vaja täielikku kinnitatud poliitikat.",
        },
      ],
      requiresApproval: true,
    },
    terms: {
      eyebrow: "Õigusteave",
      title: "Kasutustingimused",
      introduction:
        "Lõplikud äri- ja õigustingimused ei ole veel avaldamiseks kinnitatud.",
      sections: [
        {
          title: "Oluline",
          body: "Veebipäring ei kinnita tellimust automaatselt. Täistekst vajab omaniku kinnitust ja õiguslikku kontrolli.",
        },
      ],
      requiresApproval: true,
    },
  },
  en: {
    about: {
      eyebrow: "Andrelook · Tallinn",
      title: "About Andrelook",
      introduction:
        "Andrelook helps you choose a piece and size, then make a request with personal support.",
      sections: [
        {
          title: "A considered selection",
          body: "The catalog shows only pieces and information prepared for public review.",
        },
        {
          title: "Personal contact",
          body: "We confirm details directly before an order, without a required account or complicated checkout.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Customer care",
      title: "How to order",
      introduction:
        "Choose a piece and send a short request. This is not an automatic payment or confirmed order.",
      sections: [
        {
          title: "1. Choose a piece",
          body: "Open the product page and select an approved size or colour when available.",
        },
        {
          title: "2. Leave a contact",
          body: "Add your name and preferred contact channel. No account is required.",
        },
        {
          title: "3. Receive confirmation",
          body: "Andrelook personally confirms availability, price, timing and next steps before an order.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Customer care",
      title: "Delivery & payment",
      introduction:
        "Delivery method, timing and payment method are confirmed personally before an order.",
      sections: [
        {
          title: "Before confirmation",
          body: "We provide the terms that apply to your request after confirming the piece, availability and destination.",
        },
      ],
      requiresApproval: true,
    },
    "pre-order": {
      eyebrow: "Customer care",
      title: "How pre-order works",
      introduction:
        "A “Pre-order” status means the piece is not promised for immediate collection or dispatch.",
      sections: [
        {
          title: "Personal confirmation",
          body: "Timing, availability, price and terms are confirmed before a request becomes an order.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Customer care",
      title: "Returns & exchanges",
      introduction:
        "Full return and exchange terms require owner approval and review against applicable law.",
      sections: [
        {
          title: "Before ordering",
          body: "Ask Andrelook for the current terms that apply to a specific purchase. This page does not yet replace an approved policy.",
        },
      ],
      requiresApproval: true,
    },
    faq: {
      eyebrow: "Help",
      title: "Frequently asked questions",
      introduction:
        "A concise guide to the current selection and request process.",
      sections: [
        {
          title: "Do I need an account?",
          body: "No. A name, selected piece and preferred contact are enough to make a request.",
        },
        {
          title: "Does a request complete a purchase?",
          body: "No. Andrelook first confirms availability, price and details personally.",
        },
        {
          title: "Can I get sizing help?",
          body: "Yes. Send a request or message us directly if the verified size guide does not answer your question.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook · Tallinn",
      title: "Contact Andrelook",
      introduction:
        "Choose the channel that suits you and we will reply personally.",
      sections: [
        {
          title: "Contact details",
          body: "Telegram: @andrelookstore · Instagram: @andrelook.store · Email: info.andrelook@gmail.com",
        },
      ],
    },
    privacy: {
      eyebrow: "Legal information",
      title: "Privacy",
      introduction:
        "The final privacy policy requires owner approval and legal review.",
      sections: [
        {
          title: "Customer requests",
          body: "The form asks for contact details only to respond to a request about the selected piece. A complete approved policy is required before publication.",
        },
      ],
      requiresApproval: true,
    },
    terms: {
      eyebrow: "Legal information",
      title: "Terms of use",
      introduction:
        "Final commercial and legal terms have not yet been approved for publication.",
      sections: [
        {
          title: "Important",
          body: "A website request does not automatically confirm an order. The complete terms require owner approval and legal review.",
        },
      ],
      requiresApproval: true,
    },
  },
};

export function getInfoPage(locale: Locale, slug: string): InfoPage | null {
  return infoPageSlugs.includes(slug as InfoPageSlug)
    ? content[locale][slug as InfoPageSlug]
    : null;
}
