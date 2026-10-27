import type { Locale } from "@/config/locales";

type TrustContent = {
  flowTitle: string;
  steps: Array<{ title: string; body: string }>;
  pdpTitle: string;
  afterSubmit: string;
  trackingTitle: string;
  tracking: string;
  reviewTitle: string;
  review: string;
  contact: string;
};

export const trustContent: Record<Locale, TrustContent> = {
  et: {
    flowTitle: "Kuus selget sammu",
    steps: [
      {
        title: "Vali mudel",
        body: "Vali värv ja suurus. Igal mudelil on oma suurustabel; kahtluse korral aitame mõõte võrrelda.",
      },
      {
        title: "Saada eeltellimus",
        body: "Jäta kontakt ja eelista sobivat kättesaamis- ning makseviisi. Vormi saatmisel raha ei võeta.",
      },
      {
        title: "Lepime üksikasjad kokku",
        body: "Võtame sinuga isiklikult ühendust: kinnitame mudeli, suuruse, hinna, kättesaamise, ajakava ja maksekorralduse.",
      },
      {
        title: "Kinnitame tellimuse",
        body: "Pärast kokkulepet kinnitame tellimuse ja saad oma Andrelooki tellimuse numbri.",
      },
      {
        title: "Jälgi tellimuse teekonda",
        body: "Saad isikliku turvalise jälgimislingi, kus näed kinnitatud uuendusi kuni kättesaamiseni.",
      },
      {
        title: "Saa tellimus kätte",
        body: "Personaalne üleandmine Tallinnas või kokkulepitud tarne Euroopas. Oleme abiks kuni tellimuse kättesaamiseni.",
      },
    ],
    pdpTitle: "Mis juhtub pärast saatmist?",
    afterSubmit:
      "Vormi saatmisel raha ei võeta. Võtame sinuga isiklikult ühendust ning lepime enne maksmist kokku suuruse, hinna, kättesaamise ja muud detailid. Vajadusel aitame suurust valida. Pärast kinnitamist saad tellimuse numbri ja isikliku jälgimislingi; kinnitatud uuendused ja meie abi on sinuga kuni kättesaamiseni.",
    trackingTitle: "Kuidas saan tellimuse käiku jälgida?",
    tracking:
      "Päringu numbri näed pärast vormi edukat saatmist; see ei ole veel ostu kinnitus. Pärast tellimuse kinnitamist saad isikliku jälgimislingi. Hoia see alles või ava menüüst „Jälgi tellimust“ ning sisesta tellimuse number ja isiklik juurdepääsukood. Leht näitab kinnitatud etappe, mitte reaalajas asukohta. Uuendusi ei pruugi lisanduda iga päev. Kui link puudub või kokkulepitud aeg möödub, kirjuta meile tellimuse numbriga.",
    reviewTitle: "Mida tähendab „Kinnitatud ost“?",
    review:
      "Sellise märgisega arvustuse saab esitada ainult isikliku arvustuslingi kaudu, mis on seotud lõpetatud Andrelooki tellimusega. Arvustused vaadatakse enne avaldamist üle. Märgis kinnitab seost tegeliku tellimusega, mitte hinnangu positiivsust.",
    contact:
      "Küsimused enne tellimist on teretulnud. Kirjuta mudeli, suuruse või tellimuse kohta Telegramis, Instagramis või e-posti teel; aitame kuni kättesaamiseni.",
  },
  ru: {
    flowTitle: "Шесть понятных шагов",
    steps: [
      {
        title: "Выберите модель",
        body: "Выберите цвет и размер. У каждой модели своя таблица; если сомневаетесь, поможем сопоставить измерения.",
      },
      {
        title: "Отправьте предзаказ",
        body: "Оставьте контакт и предпочтения по получению и оплате. Отправка формы не списывает деньги.",
      },
      {
        title: "Согласуем детали лично",
        body: "Свяжемся с вами: подтвердим модель, размер, цену, получение, ожидаемый срок и порядок оплаты.",
      },
      {
        title: "Подтвердим заказ",
        body: "После согласования подтвердим заказ — вы получите индивидуальный номер заказа Andrelook.",
      },
      {
        title: "Следите за заказом",
        body: "Вы получите личную защищённую ссылку с подтверждёнными обновлениями по заказу до получения.",
      },
      {
        title: "Получите заказ",
        body: "Личная передача в Таллинне или согласованная доставка по Европе. Остаёмся на связи до получения.",
      },
    ],
    pdpTitle: "Что будет после отправки?",
    afterSubmit:
      "Отправка формы не списывает деньги. Свяжемся с вами лично и до оплаты согласуем размер, цену, получение и остальные детали. Если нужно, поможем с размером. После подтверждения вы получите номер заказа и личную ссылку для отслеживания: подтверждённые обновления и наша поддержка доступны до получения.",
    trackingTitle: "Как узнать, на каком этапе мой заказ?",
    tracking:
      "Номер заявки появится после успешной отправки формы; сам по себе он ещё не подтверждает покупку. После подтверждения заказа вы получите личную ссылку. Сохраните её или откройте в меню «Отследить заказ» и введите номер заказа и индивидуальный код. Страница показывает подтверждённые этапы, а не местоположение в реальном времени. Обновления могут появляться не каждый день. Если ссылки нет или согласованный срок прошёл, напишите нам с номером заказа.",
    reviewTitle: "Что означает «Подтверждённая покупка»?",
    review:
      "Отзыв с этой отметкой можно отправить только по личной ссылке, связанной с завершённым заказом Andrelook. Перед публикацией отзывы проходят модерацию. Отметка подтверждает связь с реальным заказом, а не положительную оценку.",
    contact:
      "Вопросы до заказа приветствуются. Напишите о модели, размере или заказе в Telegram, Instagram или по электронной почте — остаёмся на связи до получения.",
  },
  en: {
    flowTitle: "Six clear steps",
    steps: [
      {
        title: "Choose your piece",
        body: "Select the colour and size. Each model has its own size guide; we can help compare measurements if you are unsure.",
      },
      {
        title: "Submit a pre-order",
        body: "Leave your contact and preferred fulfilment and payment options. Submitting the form does not charge you.",
      },
      {
        title: "Agree the details personally",
        body: "We contact you to confirm the model, size, price, handover or delivery, expected timing and payment arrangement.",
      },
      {
        title: "Confirm your order",
        body: "Once the details are agreed, we confirm your order and provide your individual Andrelook order number.",
      },
      {
        title: "Follow your order",
        body: "You receive a secure personal tracking link showing confirmed updates through to receipt.",
      },
      {
        title: "Receive your order",
        body: "Personal handover in Tallinn or agreed delivery across Europe. We remain available until you receive it.",
      },
    ],
    pdpTitle: "What happens after you submit?",
    afterSubmit:
      "Submitting the form does not charge you. We contact you personally to agree the size, price, fulfilment and other details before payment, with sizing help if needed. After confirmation, you receive an order number and private tracking link with confirmed updates. We remain available through to receipt.",
    trackingTitle: "How can I follow my order?",
    tracking:
      "Your request reference appears after successful form submission; it is not yet purchase confirmation. After your order is confirmed, you receive a private tracking link. Save it, or select “Track order” in the menu and enter your order number and individual access code. The page shows confirmed stages, not a live location. Updates may not appear every day. If the link is missing or the agreed time has passed, contact us with your order number.",
    reviewTitle: "What does “Verified purchase” mean?",
    review:
      "A review with this badge can only be submitted through a personal review link associated with a completed Andrelook order. Reviews are moderated before publication. The badge confirms a connection to a real order, not a positive rating.",
    contact:
      "Questions before ordering are welcome. Ask about a piece, sizing or your order on Telegram, Instagram or email; we remain available through to receipt.",
  },
};
