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

const supplementalContent: Record<
  Locale,
  Record<InfoPageSlug, InfoPage["sections"]>
> = {
  ru: {
    about: [
      {
        title: "Каталог с границами",
        body: "Цена, наличие, цвета и другие коммерческие сведения появляются только после подтверждения. Непроверенные данные не выдаются за факты.",
      },
      {
        title: "Три языка",
        body: "Вы можете пройти весь путь и получить поддержку на русском, эстонском или английском языке.",
      },
    ],
    "how-to-order": [
      {
        title: "Помощь с размером",
        body: "Используйте проверенную таблицу на странице модели или добавьте вопрос в комментарий к запросу.",
      },
      {
        title: "Запрос — не оплата",
        body: "Отправка формы не списывает средства и не подтверждает покупку автоматически.",
      },
    ],
    "delivery-payment": [
      {
        title: "Что ещё требуется",
        body: "До публикации владелец должен утвердить способы оплаты, географию, стоимость и сроки доставки.",
      },
      {
        title: "Для конкретного запроса",
        body: "Применимые условия сообщаются напрямую после уточнения модели, статуса и места назначения.",
      },
    ],
    "pre-order": [
      {
        title: "Без выдуманных сроков",
        body: "Если срок не подтверждён, сайт его не показывает. Актуальная оценка сообщается до оформления.",
      },
      {
        title: "Следующий шаг",
        body: "Оставьте запрос по модели; это позволит проверить доступность без автоматического обязательства купить.",
      },
    ],
    "returns-exchanges": [
      {
        title: "Что должно быть утверждено",
        body: "Владельцу и юридическому консультанту необходимо подтвердить сроки, исключения, процедуру и контакт для обращений.",
      },
      {
        title: "До публикации политики",
        body: "Не полагайтесь на эту страницу как на окончательные условия покупки; запросите применимые условия напрямую.",
      },
    ],
    faq: [
      {
        title: "Почему цена может отсутствовать?",
        body: "Цена показывается только после владельческого подтверждения. Если её нет, она будет уточнена в ответе на запрос.",
      },
      {
        title: "Что означают статусы?",
        body: "«В наличии», «Предзаказ» и «Недоступно» показываются только для моделей с подтверждённым коммерческим статусом.",
      },
    ],
    contact: [
      {
        title: "Что указать",
        body: "Пришлите название модели, желаемый размер и вопрос. Не отправляйте платёжные данные через форму запроса.",
      },
      {
        title: "Язык общения",
        body: "Можно написать на русском, эстонском или английском языке.",
      },
    ],
    privacy: [
      {
        title: "Данные формы",
        body: "Технически форма сохраняет имя, выбранный канал и контакт, выбранную модель и параметры, комментарий, язык и подтверждение согласия для обработки запроса.",
      },
      {
        title: "Что ещё требуется",
        body: "До публикации владелец и юридический консультант должны утвердить правовое основание, сроки хранения, права пользователя и контакты ответственного лица.",
      },
    ],
    terms: [
      {
        title: "Статус каталога",
        body: "Карточка модели сама по себе не является офертой; цена, наличие и применимые условия требуют подтверждения.",
      },
      {
        title: "Что ещё требуется",
        body: "До публикации должны быть утверждены сведения о продавце, порядок заключения договора, оплаты, доставки, возврата и разрешения споров.",
      },
    ],
  },
  et: {
    about: [
      {
        title: "Selged piirid",
        body: "Hind, saadavus, värvid ja muu müügiinfo kuvatakse alles pärast kinnitamist. Kontrollimata andmeid ei esitata faktina.",
      },
      {
        title: "Kolm keelt",
        body: "Kogu teekond ja personaalne tugi on saadaval eesti, vene või inglise keeles.",
      },
    ],
    "how-to-order": [
      {
        title: "Suuruse valiku abi",
        body: "Kasuta mudeli kontrollitud suurustabelit või lisa küsimus päringu kommentaari.",
      },
      {
        title: "Päring ei ole makse",
        body: "Vormi saatmine ei võta raha ega kinnita ostu automaatselt.",
      },
    ],
    "delivery-payment": [
      {
        title: "Mis vajab veel kinnitamist",
        body: "Enne avaldamist peab omanik kinnitama makseviisid, piirkonnad, tarnekulu ja ajad.",
      },
      {
        title: "Konkreetse päringu jaoks",
        body: "Kehtivad tingimused antakse otse pärast mudeli, oleku ja sihtkoha täpsustamist.",
      },
    ],
    "pre-order": [
      {
        title: "Väljamõeldud aegu ei kuvata",
        body: "Kui tähtaega pole kinnitatud, veebileht seda ei luba. Hetkehinnang antakse enne tellimist.",
      },
      {
        title: "Järgmine samm",
        body: "Saada mudeli kohta päring, et saadavust kontrollida ilma automaatse ostukohustuseta.",
      },
    ],
    "returns-exchanges": [
      {
        title: "Mis tuleb kinnitada",
        body: "Omanik ja õigusnõustaja peavad kinnitama tähtajad, erandid, menetluse ja pöördumise kontakti.",
      },
      {
        title: "Enne poliitika avaldamist",
        body: "Ära käsitle seda lehte lõplike ostutingimustena; küsi kehtivad tingimused otse.",
      },
    ],
    faq: [
      {
        title: "Miks võib hind puududa?",
        body: "Hinda näidatakse ainult pärast omaniku kinnitust. Puuduv hind täpsustatakse päringule vastates.",
      },
      {
        title: "Mida olekud tähendavad?",
        body: "„Laos”, „Eeltellimus” ja „Pole saadaval” kuvatakse ainult kinnitatud müügiolekuga mudelitel.",
      },
    ],
    contact: [
      {
        title: "Mida lisada",
        body: "Kirjuta mudeli nimi, soovitud suurus ja küsimus. Ära saada päringuvormi kaudu makseandmeid.",
      },
      {
        title: "Suhtluskeel",
        body: "Kirjutada saab eesti, vene või inglise keeles.",
      },
    ],
    privacy: [
      {
        title: "Vormi andmed",
        body: "Vorm salvestab tehniliselt nime, valitud kontaktkanali ja kontakti, mudeli ja valikud, kommentaari, keele ning nõusoleku kinnituse päringu käsitlemiseks.",
      },
      {
        title: "Mis vajab veel kinnitamist",
        body: "Enne avaldamist peavad omanik ja õigusnõustaja kinnitama õigusliku aluse, säilitamisajad, kasutaja õigused ja vastutava isiku kontaktid.",
      },
    ],
    terms: [
      {
        title: "Kataloogi staatus",
        body: "Tooteleht ei ole iseenesest siduv pakkumus; hind, saadavus ja kohaldatavad tingimused vajavad kinnitamist.",
      },
      {
        title: "Mis vajab veel kinnitamist",
        body: "Enne avaldamist tuleb kinnitada müüja teave ning lepingu, makse, tarne, tagastuse ja vaidluste kord.",
      },
    ],
  },
  en: {
    about: [
      {
        title: "Clear evidence boundaries",
        body: "Price, availability, colours and other commercial details appear only after confirmation. Unreviewed information is never presented as fact.",
      },
      {
        title: "Three languages",
        body: "The complete journey and personal support are available in English, Estonian or Russian.",
      },
    ],
    "how-to-order": [
      {
        title: "Sizing support",
        body: "Use the verified chart on the product page or add a sizing question to your request.",
      },
      {
        title: "A request is not payment",
        body: "Submitting the form does not charge you or automatically complete a purchase.",
      },
    ],
    "delivery-payment": [
      {
        title: "Still to be approved",
        body: "Payment methods, service areas, delivery costs and delivery times require owner approval before publication.",
      },
      {
        title: "For a specific request",
        body: "Applicable details are shared directly after the piece, status and destination are confirmed.",
      },
    ],
    "pre-order": [
      {
        title: "No invented timing",
        body: "When timing is not confirmed, the website does not promise it. A current estimate is shared before ordering.",
      },
      {
        title: "The next step",
        body: "Send a request for the piece so availability can be checked without an automatic commitment to buy.",
      },
    ],
    "returns-exchanges": [
      {
        title: "What must be approved",
        body: "The owner and legal reviewer must confirm time limits, exceptions, the process and the contact for requests.",
      },
      {
        title: "Before policy publication",
        body: "Do not treat this page as final purchase terms; ask Andrelook for the terms that apply.",
      },
    ],
    faq: [
      {
        title: "Why might a price be missing?",
        body: "A price appears only after owner confirmation. If absent, it will be checked in the response to your request.",
      },
      {
        title: "What do product states mean?",
        body: "In stock, Pre-order and Unavailable are shown only for pieces with a confirmed commercial state.",
      },
    ],
    contact: [
      {
        title: "What to include",
        body: "Share the model name, preferred size and your question. Do not send payment information through the request form.",
      },
      {
        title: "Language",
        body: "You can write in English, Estonian or Russian.",
      },
    ],
    privacy: [
      {
        title: "Request-form data",
        body: "The form technically stores a name, selected contact method and contact, model and choices, comment, language and consent confirmation to handle the request.",
      },
      {
        title: "Still to be approved",
        body: "Before publication, the owner and legal reviewer must approve the legal basis, retention periods, user rights and controller contact details.",
      },
    ],
    terms: [
      {
        title: "Catalog status",
        body: "A product page is not by itself a binding offer; price, availability and applicable terms require confirmation.",
      },
      {
        title: "Still to be approved",
        body: "Seller details and the contracting, payment, delivery, returns and dispute processes must be approved before publication.",
      },
    ],
  },
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
  if (!infoPageSlugs.includes(slug as InfoPageSlug)) return null;
  const typedSlug = slug as InfoPageSlug;
  const page = content[locale][typedSlug];
  return {
    ...page,
    sections: [...page.sections, ...supplementalContent[locale][typedSlug]],
  };
}
