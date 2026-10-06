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
};

const pages: Record<Locale, Record<InfoPageSlug, InfoPage>> = {
  ru: {
    about: {
      eyebrow: "Andrelook",
      title: "О нас",
      introduction:
        "Andrelook — персональный fashion-сервис из Таллинна с тщательно отобранной коллекцией Moncler и Parajumpers.",
      sections: [
        {
          title: "Отобранная коллекция",
          body: "Мы собрали компактный выбор верхней одежды, жилетов, кардиганов и повседневных моделей, чтобы выбирать было проще.",
        },
        {
          title: "Личный подход",
          body: "Мы помогаем с моделью, цветом и размером, а затем лично подтверждаем цену, оплату и получение.",
        },
        {
          title: "Таллинн и Европа",
          body: "Заказ можно получить лично в Таллинне или оформить доставку по Европе. Общение доступно на русском, эстонском и английском.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Покупателям",
      title: "Как заказать",
      introduction:
        "Выберите модель, отправьте заявку и получите личное подтверждение предзаказа.",
      sections: [
        {
          title: "1. Выберите модель",
          body: "Откройте страницу товара, посмотрите фотографии, доступные цвета и таблицу размеров. Если таблицы нет, выберите личную помощь с размером.",
        },
        {
          title: "2. Заполните форму",
          body: "Укажите выбранный вариант, удобный контакт и способ получения. Аккаунт не нужен, а автоматическая оплата не производится.",
        },
        {
          title: "3. Получите подтверждение",
          body: "Мы свяжемся с вами и до оплаты подтвердим цену, размер, способ получения и ожидаемый срок.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Покупателям",
      title: "Доставка и оплата",
      introduction:
        "Способ получения и оплаты согласуется лично до подтверждения предзаказа.",
      sections: [
        {
          title: "Таллинн",
          body: "Доступна личная передача в Таллинне. Для неё можно выбрать 30% предоплаты и остаток при получении либо полную предоплату.",
        },
        {
          title: "Доставка по Европе",
          body: "Для доставки по Эстонии и другим странам Европы используется полная предоплата. Точный способ и стоимость доставки зависят от адреса и сообщаются заранее.",
        },
        {
          title: "До оплаты",
          body: "Вы получите подтверждение модели, размера, итоговой суммы и способа получения до любого платежа.",
        },
      ],
    },
    "pre-order": {
      eyebrow: "Покупателям",
      title: "Предзаказ",
      introduction:
        "Коллекция Andrelook доступна по предзаказу с ориентировочным сроком 2–3 недели.",
      sections: [
        {
          title: "Что значит предзаказ",
          body: "Вы выбираете модель сейчас, а мы лично подтверждаем её для вас до оплаты.",
        },
        {
          title: "Ожидаемый срок",
          body: "Ориентир — 2–3 недели. Актуальный срок для конкретного заказа подтверждается перед оплатой.",
        },
        {
          title: "Без автоматических обязательств",
          body: "Отправка формы не списывает средства и не завершает покупку. Следующий шаг начинается после личного контакта.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Покупателям",
      title: "Возврат и обмен",
      introduction:
        "Применимые условия зависят от типа заказа и способа получения и сообщаются до оплаты.",
      sections: [
        {
          title: "До подтверждения",
          body: "Мы заранее сообщим условия возврата или обмена, применимые к вашему заказу, чтобы вы могли принять решение до оплаты.",
        },
        {
          title: "Если возникла проблема",
          body: "Свяжитесь с Andrelook как можно скорее через указанный при заказе канал и сохраните товар и упаковку в полученном состоянии.",
        },
        {
          title: "Персональная помощь",
          body: "Мы рассмотрим обращение по конкретному заказу и объясним доступные дальнейшие шаги.",
        },
      ],
    },
    faq: {
      eyebrow: "Помощь",
      title: "Частые вопросы",
      introduction:
        "Короткие ответы о предзаказе, размере, оплате и получении.",
      sections: [
        {
          title: "Сколько занимает предзаказ?",
          body: "Ориентировочный срок — 2–3 недели. Актуальный срок по вашему заказу сообщается до оплаты.",
        },
        {
          title: "Как выбрать размер?",
          body: "Используйте таблицу на странице модели. Для шести моделей без таблицы доступна персональная помощь с размером.",
        },
        {
          title: "Как проходит оплата?",
          body: "При получении в Таллинне можно внести 30% предоплаты и оплатить остаток при передаче или выбрать полную предоплату. Для доставки используется полная предоплата.",
        },
        {
          title: "Можно забрать заказ в Таллинне?",
          body: "Да. Личная передача в Таллинне доступна как один из вариантов получения.",
        },
        {
          title: "Доставляете по Европе?",
          body: "Да. Способ и точная стоимость доставки зависят от адреса и сообщаются заранее.",
        },
        {
          title: "Что происходит после отправки формы?",
          body: "Мы свяжемся выбранным способом, согласуем модель, размер, получение, оплату и срок. На сайте оплата не списывается.",
        },
        {
          title: "Какие условия возврата или обмена?",
          body: "Условия, применимые к конкретному заказу и способу получения, сообщаются до оплаты.",
        },
        {
          title: "Как связаться с Andrelook?",
          body: "Напишите в Telegram, Instagram или на info.andrelook@gmail.com.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook",
      title: "Контакты",
      introduction:
        "Напишите нам о модели, размере или заказе удобным способом.",
      sections: [
        {
          title: "Telegram",
          body: "Быстрый способ обсудить модель и детали предзаказа: @andrelookstore.",
        },
        {
          title: "Instagram",
          body: "Следите за Andrelook и отправляйте сообщения: @andrelook.store.",
        },
        {
          title: "Email",
          body: "Для подробных вопросов: info.andrelook@gmail.com.",
        },
      ],
    },
    privacy: {
      eyebrow: "Правовая информация",
      title: "Конфиденциальность",
      introduction:
        "Мы используем данные из формы только для обработки вашего запроса и сопровождения заказа.",
      sections: [
        {
          title: "Какие данные мы получаем",
          body: "Имя, контактные данные, выбранная модель, размер, цвет, способ получения и информация, которую вы сами добавляете в комментарий.",
        },
        {
          title: "Для чего они нужны",
          body: "Чтобы связаться с вами, подтвердить детали, выполнить заказ, вести историю обслуживания и решать вопросы по заказу.",
        },
        {
          title: "Ваш вопрос о данных",
          body: "По вопросам о доступе, исправлении или удалении ваших данных напишите на info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Правовая информация",
      title: "Условия использования",
      introduction:
        "Сайт помогает выбрать модель и отправить запрос на предзаказ; сама форма не является автоматическим подтверждением покупки.",
      sections: [
        {
          title: "Информация о моделях",
          body: "Фотографии, цвета и размеры помогают сделать выбор. Итоговые коммерческие детали подтверждаются лично до оплаты.",
        },
        {
          title: "Предзаказ",
          body: "Обязательство возникает только после согласования цены, модели, размера, оплаты, получения и применимых условий.",
        },
        {
          title: "Связь",
          body: "Если вам нужно уточнение до отправки формы, свяжитесь с нами через Telegram, Instagram или info.andrelook@gmail.com.",
        },
      ],
    },
  },
  et: {
    about: {
      eyebrow: "Andrelook",
      title: "Meist",
      introduction:
        "Andrelook on Tallinnast pärit personaalne moeteenus hoolikalt valitud Moncleri ja Parajumpersi kollektsiooniga.",
      sections: [
        {
          title: "Valitud kollektsioon",
          body: "Oleme koondanud kompaktsesse valikusse ülerõivad, vestid, kardiganid ja igapäevased mudelid, et valimine oleks lihtsam.",
        },
        {
          title: "Personaalne lähenemine",
          body: "Aitame valida mudeli, värvi ja suuruse ning kinnitame seejärel hinna, makse ja kättesaamise personaalselt.",
        },
        {
          title: "Tallinn ja Euroopa",
          body: "Tellimuse saab kätte Tallinnas või lasta tarnida üle Euroopa. Suhtleme eesti, vene ja inglise keeles.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Kliendile",
      title: "Kuidas tellida",
      introduction:
        "Vali toode, saada tellimus ja saa personaalne eeltellimuse kinnitus.",
      sections: [
        {
          title: "1. Vali toode",
          body: "Vaata tootelehel fotosid, värve ja suurustabelit. Kui tabelit pole, vali personaalne suuruseabi.",
        },
        {
          title: "2. Täida vorm",
          body: "Lisa valik, sobiv kontakt ja kättesaamisviis. Kontot pole vaja ning automaatset makset ei tehta.",
        },
        {
          title: "3. Saa kinnitus",
          body: "Võtame ühendust ning kinnitame enne maksmist hinna, suuruse, kättesaamise ja eeldatava aja.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Kliendile",
      title: "Tarne ja maksmine",
      introduction:
        "Kättesaamis- ja makseviis lepitakse personaalselt kokku enne eeltellimuse kinnitamist.",
      sections: [
        {
          title: "Tallinn",
          body: "Tallinnas on võimalik personaalne üleandmine. Valida saab 30% ettemakse ja ülejäänud summa üleandmisel või täieliku ettemakse.",
        },
        {
          title: "Tarne üle Euroopa",
          body: "Eesti-sisese ja Euroopa tarne puhul kasutatakse täielikku ettemakset. Täpne tarneviis ja maksumus sõltuvad aadressist ning teatatakse ette.",
        },
        {
          title: "Enne maksmist",
          body: "Enne mis tahes makset saad kinnituse mudeli, suuruse, kogusumma ja kättesaamisviisi kohta.",
        },
      ],
    },
    "pre-order": {
      eyebrow: "Kliendile",
      title: "Eeltellimus",
      introduction:
        "Andrelooki kollektsioon on eeltellitav eeldatava 2–3-nädalase ajaga.",
      sections: [
        {
          title: "Mida eeltellimus tähendab",
          body: "Valid toote nüüd ning meie kinnitame selle sulle personaalselt enne maksmist.",
        },
        {
          title: "Eeldatav aeg",
          body: "Orienteeruv aeg on 2–3 nädalat. Konkreetse tellimuse ajakohane hinnang kinnitatakse enne makset.",
        },
        {
          title: "Automaatset kohustust ei teki",
          body: "Vormi saatmine ei võta raha ega lõpeta ostu. Järgmine samm algab pärast personaalset kontakti.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Kliendile",
      title: "Tagastus ja vahetus",
      introduction:
        "Kohaldatavad tingimused sõltuvad tellimusest ja kättesaamisviisist ning need antakse enne maksmist.",
      sections: [
        {
          title: "Enne kinnitamist",
          body: "Anname sinu tellimusele kehtivad tagastus- või vahetustingimused ette, et saaksid enne makset teadliku otsuse teha.",
        },
        {
          title: "Kui tekib probleem",
          body: "Võta Andrelookiga esimesel võimalusel ühendust tellimisel valitud kanalis ning hoia toode ja pakend saadud seisukorras.",
        },
        {
          title: "Personaalne abi",
          body: "Vaatame konkreetse tellimuse olukorra üle ja selgitame võimalikud järgmised sammud.",
        },
      ],
    },
    faq: {
      eyebrow: "Abi",
      title: "Korduma kippuvad küsimused",
      introduction:
        "Lühivastused eeltellimuse, suuruse, makse ja kättesaamise kohta.",
      sections: [
        {
          title: "Kui kaua eeltellimus aega võtab?",
          body: "Eeldatav aeg on 2–3 nädalat. Sinu tellimuse ajakohane tähtaeg antakse enne makset.",
        },
        {
          title: "Kuidas suurust valida?",
          body: "Kasuta tootelehe tabelit. Kuue tabelita mudeli puhul pakume personaalset suuruseabi.",
        },
        {
          title: "Kuidas maksmine toimub?",
          body: "Tallinnas üleandmisel saab tasuda 30% ettemaksu ja ülejäänu kättesaamisel või valida täieliku ettemakse. Tarne puhul kasutatakse täielikku ettemakset.",
        },
        {
          title: "Kas tellimusele saab Tallinnas järele tulla?",
          body: "Jah. Personaalne üleandmine Tallinnas on üks kättesaamisvõimalustest.",
        },
        {
          title: "Kas tarnite üle Euroopa?",
          body: "Jah. Tarneviis ja täpne maksumus sõltuvad aadressist ning antakse ette.",
        },
        {
          title: "Mis juhtub pärast vormi saatmist?",
          body: "Võtame sinuga valitud kanalis ühendust ning lepime kokku mudeli, suuruse, kättesaamise, makse ja tähtaja. Veebilehel makset ei võeta.",
        },
        {
          title: "Millised on tagastus- või vahetustingimused?",
          body: "Konkreetsele tellimusele ja kättesaamisviisile kehtivad tingimused antakse enne makset.",
        },
        {
          title: "Kuidas Andrelookiga ühendust võtta?",
          body: "Kirjuta Telegramis, Instagramis või aadressil info.andrelook@gmail.com.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook",
      title: "Kontakt",
      introduction:
        "Kirjuta meile mudeli, suuruse või tellimuse kohta sobivas kanalis.",
      sections: [
        {
          title: "Telegram",
          body: "Kiire viis mudelit ja eeltellimust arutada: @andrelookstore.",
        },
        {
          title: "Instagram",
          body: "Jälgi Andrelooki ja saada sõnum: @andrelook.store.",
        },
        {
          title: "E-post",
          body: "Pikemate küsimuste jaoks: info.andrelook@gmail.com.",
        },
      ],
    },
    privacy: {
      eyebrow: "Õigusinfo",
      title: "Privaatsus",
      introduction:
        "Kasutame vormi kaudu saadud andmeid ainult päringu töötlemiseks ja tellimuse teenindamiseks.",
      sections: [
        {
          title: "Milliseid andmeid saame",
          body: "Nimi, kontaktandmed, valitud toode, suurus, värv, kättesaamisviis ja teave, mille ise kommentaari lisad.",
        },
        {
          title: "Milleks neid kasutame",
          body: "Et sinuga ühendust võtta, detailid kinnitada, tellimus täita, teenindusajalugu hoida ja tellimusküsimusi lahendada.",
        },
        {
          title: "Sinu andmeküsimus",
          body: "Andmetele ligipääsu, parandamise või kustutamise küsimustes kirjuta info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Õigusinfo",
      title: "Kasutustingimused",
      introduction:
        "Sait aitab valida toote ja saata eeltellimuspäringu; vormi saatmine ei kinnita ostu automaatselt.",
      sections: [
        {
          title: "Tooteinfo",
          body: "Fotod, värvid ja suurused aitavad valida. Lõplikud müügidetailid kinnitatakse personaalselt enne makset.",
        },
        {
          title: "Eeltellimus",
          body: "Kohustus tekib alles pärast hinna, mudeli, suuruse, makse, kättesaamise ja kohaldatavate tingimuste kokkuleppimist.",
        },
        {
          title: "Võta ühendust",
          body: "Kui vajad enne vormi saatmist täpsustust, kirjuta Telegramis, Instagramis või aadressil info.andrelook@gmail.com.",
        },
      ],
    },
  },
  en: {
    about: {
      eyebrow: "Andrelook",
      title: "About us",
      introduction:
        "Andrelook is a personal fashion service from Tallinn with a focused edit of Moncler and Parajumpers pieces.",
      sections: [
        {
          title: "A focused collection",
          body: "We bring outerwear, gilets, cardigans and everyday pieces into one considered edit, making it easier to choose.",
        },
        {
          title: "Personal service",
          body: "We help with the piece, colour and size, then confirm price, payment and fulfilment with you directly.",
        },
        {
          title: "Tallinn and Europe",
          body: "Collect personally in Tallinn or arrange delivery across Europe. We support customers in English, Estonian and Russian.",
        },
      ],
    },
    "how-to-order": {
      eyebrow: "Customer care",
      title: "How to order",
      introduction:
        "Choose a piece, submit your order and receive personal pre-order confirmation.",
      sections: [
        {
          title: "1. Choose your piece",
          body: "Review the product photography, colours and size guide. If no chart is available, choose personal sizing help.",
        },
        {
          title: "2. Complete the form",
          body: "Add your selection, preferred contact and fulfilment method. No account is required and no automatic payment is taken.",
        },
        {
          title: "3. Receive confirmation",
          body: "We contact you and confirm the price, size, fulfilment and expected timing before payment.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Customer care",
      title: "Delivery & payment",
      introduction:
        "Fulfilment and payment are agreed personally before your pre-order is confirmed.",
      sections: [
        {
          title: "Tallinn",
          body: "Personal handover is available in Tallinn. Choose either a 30% advance with the balance at handover, or full advance payment.",
        },
        {
          title: "Delivery across Europe",
          body: "Delivery within Estonia and across Europe uses full advance payment. The exact method and cost depend on the address and are shared before payment.",
        },
        {
          title: "Before payment",
          body: "You receive confirmation of the piece, size, total amount and fulfilment method before making any payment.",
        },
      ],
    },
    "pre-order": {
      eyebrow: "Customer care",
      title: "Pre-order",
      introduction:
        "The Andrelook collection is available by pre-order with an expected timeframe of approximately 2–3 weeks.",
      sections: [
        {
          title: "What pre-order means",
          body: "You select the piece now and we confirm it for you personally before payment.",
        },
        {
          title: "Expected timing",
          body: "The guide is approximately 2–3 weeks. The current estimate for your specific order is confirmed before payment.",
        },
        {
          title: "No automatic commitment",
          body: "Submitting the form does not take payment or complete a purchase. The next step begins after personal contact.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Customer care",
      title: "Returns & exchanges",
      introduction:
        "Applicable terms depend on the order and fulfilment method and are shared before payment.",
      sections: [
        {
          title: "Before confirmation",
          body: "We share the return or exchange terms that apply to your order so you can make an informed decision before payment.",
        },
        {
          title: "If something is wrong",
          body: "Contact Andrelook through your chosen channel as soon as possible and keep the piece and packaging in the condition received.",
        },
        {
          title: "Personal support",
          body: "We review the circumstances of the specific order and explain the available next steps.",
        },
      ],
    },
    faq: {
      eyebrow: "Help",
      title: "Frequently asked questions",
      introduction:
        "Quick answers about pre-ordering, sizing, payment and fulfilment.",
      sections: [
        {
          title: "How long does pre-order take?",
          body: "The expected timeframe is approximately 2–3 weeks. The current timing for your order is shared before payment.",
        },
        {
          title: "How do I choose a size?",
          body: "Use the chart on the product page. Personal sizing help is available for the six pieces without a chart.",
        },
        {
          title: "How does payment work?",
          body: "For Tallinn handover, choose a 30% advance with the balance at handover or full advance payment. Delivery uses full advance payment.",
        },
        {
          title: "Can I collect in Tallinn?",
          body: "Yes. Personal handover in Tallinn is available as a fulfilment option.",
        },
        {
          title: "Do you deliver across Europe?",
          body: "Yes. The delivery method and exact cost depend on the address and are shared in advance.",
        },
        {
          title: "What happens after I submit the form?",
          body: "We contact you through your selected channel and agree the piece, size, fulfilment, payment and timing. No payment is taken on the website.",
        },
        {
          title: "What are the return or exchange terms?",
          body: "The terms that apply to the specific order and fulfilment method are shared before payment.",
        },
        {
          title: "How can I contact Andrelook?",
          body: "Message us on Telegram or Instagram, or email info.andrelook@gmail.com.",
        },
      ],
    },
    contact: {
      eyebrow: "Andrelook",
      title: "Contact",
      introduction:
        "Talk to us about a piece, sizing or an order through your preferred channel.",
      sections: [
        {
          title: "Telegram",
          body: "A quick way to discuss a piece and pre-order details: @andrelookstore.",
        },
        {
          title: "Instagram",
          body: "Follow Andrelook and send us a message: @andrelook.store.",
        },
        {
          title: "Email",
          body: "For detailed questions: info.andrelook@gmail.com.",
        },
      ],
    },
    privacy: {
      eyebrow: "Legal information",
      title: "Privacy",
      introduction:
        "We use information from the form only to handle your request and support your order.",
      sections: [
        {
          title: "Information we receive",
          body: "Your name, contact details, selected piece, size, colour, fulfilment choice and anything you choose to add in the comment.",
        },
        {
          title: "Why we use it",
          body: "To contact you, confirm details, fulfil the order, maintain service history and resolve order-related questions.",
        },
        {
          title: "Questions about your data",
          body: "For access, correction or deletion questions, email info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Legal information",
      title: "Terms of use",
      introduction:
        "This site helps you choose a piece and send a pre-order request; submitting the form does not automatically confirm a purchase.",
      sections: [
        {
          title: "Product information",
          body: "Photography, colours and sizing help you choose. Final commercial details are confirmed personally before payment.",
        },
        {
          title: "Pre-order",
          body: "A commitment begins only after price, piece, size, payment, fulfilment and the applicable terms have been agreed.",
        },
        {
          title: "Contact",
          body: "If you need clarification before using the form, contact us on Telegram, Instagram or info.andrelook@gmail.com.",
        },
      ],
    },
  },
};

export function getInfoPage(locale: Locale, slug: string) {
  return infoPageSlugs.includes(slug as InfoPageSlug)
    ? pages[locale][slug as InfoPageSlug]
    : null;
}
