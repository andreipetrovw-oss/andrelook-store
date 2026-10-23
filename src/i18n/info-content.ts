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
        "Andrelook — сервис из Таллинна с тщательно отобранной коллекцией Moncler и Parajumpers и помощью на каждом этапе заказа.",
      sections: [
        {
          title: "Отобранная коллекция",
          body: "Мы собрали компактный выбор верхней одежды, жилетов, кардиганов и повседневных моделей, чтобы выбирать было проще.",
        },
        {
          title: "Личный подход",
          body: "Мы помогаем с моделью, цветом и размером, а затем согласуем цену, оплату и получение напрямую с вами.",
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
        "Выберите модель, отправьте заявку и согласуйте детали предзаказа напрямую с нами.",
      sections: [
        {
          title: "Выберите модель",
          body: "Откройте страницу товара, посмотрите фотографии и доступные цвета, затем сверьте параметры с таблицей размеров модели. Если сомневаетесь, добавьте вопрос о посадке к предзаказу.",
        },
        {
          title: "Отправьте заявку",
          body: "Укажите выбранный вариант, удобный контакт и способ получения. Аккаунт не нужен, а автоматическая оплата не производится.",
        },
        {
          title: "Согласуйте детали",
          body: "Мы свяжемся с вами и до оплаты подтвердим модель, цвет, размер, цену, способ получения, ориентировочный срок и применимую редакцию условий. Договор заключается только после явного согласования этих данных, а не при простой отправке формы.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Покупателям",
      title: "Доставка и оплата",
      introduction:
        "Способ получения и оплаты согласуется с вами до подтверждения предзаказа.",
      sections: [
        {
          title: "Таллинн",
          body: "В Таллинне заказ можно получить из рук в руки. Доступна предоплата 30% с остатком при получении или полная предоплата.",
        },
        {
          title: "Доставка по Европе",
          body: "Для доставки по Эстонии и другим странам Европы используется полная предоплата. Точный способ и стоимость доставки зависят от адреса и сообщаются заранее.",
        },
        {
          title: "До оплаты",
          body: "До любого платежа вы получите модель, цвет, размер, итоговую сумму, способ получения, ориентировочный срок, порядок изменений, добровольного обмена и законного отказа, включая информацию о прямых расходах на обратную отправку.",
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
          body: "Вы выбираете стандартную модель, цвет и размер, а Andrelook проверяет доступность и закупает товар на основании вашего подтверждённого выбора. Закупка стандартного размера под ваш заказ сама по себе не делает товар индивидуально изготовленным и не отменяет законное право на отказ.",
        },
        {
          title: "Ожидаемый срок",
          body: "Ориентир — 2–3 недели. Актуальный срок для конкретного заказа подтверждается перед оплатой.",
        },
        {
          title: "Изменения после подтверждения",
          body: "Отправка формы не списывает средства и не завершает покупку. После того как подтверждённый заказ передан поставщику, изменение модели, цвета или размера не гарантируется. Если товар соответствует подтверждённому заказу, неподходящий размер сам по себе не означает ошибку продавца; предусмотренные законом права при этом сохраняются.",
        },
        {
          title: "Добровольный обмен",
          body: "Добровольный обмен модели, цвета или размера возможен только по отдельному соглашению и при наличии подходящей замены. Andrelook не гарантирует такой обмен и не обязан делать новую закупку исключительно ради него. Это правило не ограничивает законное право на отказ от дистанционной покупки или права при несоответствии товара договору.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Покупателям",
      title: "Возврат и обмен",
      introduction:
        "Добровольный обмен отделён от обязательных прав потребителя. Для дистанционных покупок применяется законное право на отказ, если закон не предусматривает конкретное исключение.",
      sections: [
        {
          title: "14-дневный отказ",
          body: "Для соответствующей дистанционной покупки вы можете без объяснения причины заявить об отказе в течение 14 дней со дня, когда вы или указанное вами третье лицо, кроме перевозчика, получили товар. Заявление можно подать через онлайн-функцию «Отказываюсь от договора» или направить однозначным сообщением на info.andrelook@gmail.com; использовать только нашу форму не обязательно.",
        },
        {
          title: "Срок и стоимость обратной отправки",
          body: "После заявления об отказе отправьте товар обратно без неоправданной задержки и не позднее 14 дней. Когда закон допускает это и Andrelook заранее не согласовал иное, прямые расходы на обратную почтовую или курьерскую отправку оплачивает покупатель. Перед отправкой запросите подтверждённый адрес возврата; не отправляйте товар поставщику или по адресу с исходной посылки без инструкции Andrelook.",
        },
        {
          title: "Осмотр и уменьшение стоимости",
          body: "Товар можно осмотреть и примерить так, как это обычно разрешено в магазине. Если обращение с товаром вышло за эти пределы и доказуемо уменьшило его стоимость, Andrelook вправе потребовать компенсацию фактического уменьшения стоимости. Отсутствие упаковки или бирок не отменяет право на отказ автоматически, но может учитываться при доказанной утрате стоимости.",
        },
        {
          title: "Возврат денег",
          body: "Andrelook возвращает полученные платежи, включая стоимость самой дешёвой стандартной первоначальной доставки, без неоправданной задержки и не позднее 14 дней после получения заявления. Возврат может быть удержан до получения товара обратно или доказательства его отправки — в зависимости от того, что наступит раньше. Возврат выполняется тем же способом оплаты, если законно не согласовано иное без дополнительных расходов для покупателя.",
        },
        {
          title: "Индивидуально изготовленные товары",
          body: "Исключение из права на отказ применяется только когда товар действительно изготовлен по индивидуальным указаниям покупателя или явно персонализирован. Выбор стандартного размера S, M, L, XL или иной стандартной вариации и закупка стандартного товара под конкретный заказ сами по себе не создают такого исключения.",
        },
        {
          title: "Добровольный обмен и недостатки",
          body: "Добровольный обмен размера возможен только по соглашению и при наличии замены; Andrelook может отказать и не обязан делать новую закупку. Это не влияет на отдельные законные права при несоответствии товара договору. Потребитель может предъявить претензию о недостатке в течение двух лет с момента получения товара и должен сообщить об обнаруженном недостатке без промедления, но не позднее двух месяцев. Andrelook отвечает на письменную жалобу в течение 15 дней либо письменно объясняет задержку и указывает новый разумный срок.",
        },
      ],
    },
    faq: {
      eyebrow: "Помощь",
      title: "Вопросы и ответы",
      introduction:
        "Короткие ответы о предзаказе, размере, оплате и получении.",
      sections: [
        {
          title: "Сколько занимает предзаказ?",
          body: "Ориентировочный срок — 2–3 недели. Актуальный срок по вашему заказу сообщается до оплаты.",
        },
        {
          title: "Как выбрать размер?",
          body: "Сверьте параметры с таблицей на странице модели. Если сомневаетесь между размерами или в посадке, напишите нам - поможем выбрать.",
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
          body: "Для дистанционной покупки обычно действует 14-дневное право на отказ. Покупатель несёт заранее сообщённые прямые расходы на обратную отправку, а доказанное чрезмерное использование может уменьшить сумму возврата. Добровольный обмен размера не гарантируется и возможен только по соглашению и при наличии замены.",
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
          title: "Аналитика и атрибуция",
          body: "Необходимое хранилище поддерживает работу сайта и ваш выбор приватности. Необязательная аналитика и маркетинговые измерения включаются только после вашего выбора. Если они разрешены, мы можем сохранить первый и последний значимый источник обращения в пределах 30 дней и записать его в заявку.",
        },
        {
          title: "Изменить выбор",
          body: "Настройки можно изменить в любой момент через ссылку «Настройки приватности» на сайте. Отказ не мешает просматривать каталог или отправлять заявку.",
        },
        {
          title: "Ваш вопрос о данных",
          body: "По вопросам о доступе, исправлении или удалении ваших данных напишите на info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Правовая информация",
      title: "Условия",
      introduction:
        "Редакция andrelook-legal-2026-10-v1 применяется только к новым заказам, для которых она была показана и подтверждена; она не изменяет ранее заключённые договоры задним числом.",
      sections: [
        {
          title: "Заявка и заключение договора",
          body: "Сайт позволяет отправить заявку на предзаказ, но отправка формы не списывает оплату и сама по себе не заключает договор купли-продажи. До заключения договора Andrelook и покупатель явно согласуют модель, цвет, размер, количество, цену, способ оплаты и получения, ориентировочный срок, условия изменений, возврата и добровольного обмена. Подтверждение договора предоставляется на сохраняемом носителе.",
        },
        {
          title: "Зафиксированный выбор",
          body: "При заявке сохраняются подтверждённые параметры, дата и время, версия условий, источник подтверждения и доступная на тот момент таблица размеров. Andrelook закупает товар по подтверждённому выбору. После передачи заказа поставщику изменения не гарантируются. Если товар соответствует подтверждённым характеристикам, неподходящий размер сам по себе не является ошибкой продавца.",
        },
        {
          title: "Цена, доставка и срок",
          body: "Итоговая цена, стоимость доставки и текущий ориентировочный срок сообщаются до заключения договора. Ориентировочный срок не является гарантированной датой, если это прямо не согласовано. Если стороны не согласовали иной срок исполнения, применяются обязательные сроки закона.",
        },
        {
          title: "Добровольные изменения и обмен",
          body: "После отправки заказа поставщику Andrelook не гарантирует изменение модели, цвета или размера. Добровольный обмен возможен только по отдельному соглашению и при наличии замены; Andrelook вправе отказать и не обязан организовывать новую закупку. Это не ограничивает обязательные права потребителя.",
        },
        {
          title: "Законный отказ и возврат",
          body: "Для подпадающих под закон дистанционных покупок сохраняется 14-дневное право на отказ. Подробные сроки, прямые расходы на обратную отправку, проверка состояния, возможная компенсация доказанного уменьшения стоимости и порядок возврата денег указаны на странице «Возврат и обмен». Онлайн-функция отказа доступна по постоянной ссылке внизу сайта.",
        },
        {
          title: "Соответствие товара и жалобы",
          body: "Оговорки о размере и добровольном обмене не исключают ответственность за товар, не соответствующий договору. Потребитель может предъявить претензию о недостатке в течение двух лет с момента получения товара и сообщает об обнаруженном недостатке без промедления, но не позднее двух месяцев. Направьте письменную жалобу с описанием недостатка и требованием на info.andrelook@gmail.com. Andrelook подтверждает получение и отвечает в течение 15 дней либо письменно объясняет задержку и указывает новый разумный срок; сохраняется право обратиться в компетентный орган по внесудебному разрешению потребительских споров или суд.",
        },
        {
          title: "Контакт и приоритет закона",
          body: "По вопросам заказа, возврата или жалобы пишите на info.andrelook@gmail.com. Если какое-либо условие противоречит обязательному законодательству Эстонии или ЕС, применяется обязательная норма, а остальные условия сохраняют силу.",
        },
      ],
    },
  },
  et: {
    about: {
      eyebrow: "Andrelook",
      title: "Andrelookist",
      introduction:
        "Andrelook on Tallinnast pärit moeteenus hoolikalt valitud Moncleri ja Parajumpersi kollektsiooniga.",
      sections: [
        {
          title: "Valitud kollektsioon",
          body: "Oleme koondanud kompaktsesse valikusse ülerõivad, vestid, kardiganid ja igapäevased mudelid, et valimine oleks lihtsam.",
        },
        {
          title: "Abi päriselt inimeselt",
          body: "Aitame valida mudeli, värvi ja suuruse ning lepime seejärel sinuga kokku hinna, makse ja kättesaamise.",
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
        "Vali toode, saada tellimus ja kinnita üksikasjad otse meiega.",
      sections: [
        {
          title: "Vali toode",
          body: "Vaata tootelehel fotosid ja värve ning võrdle oma mõõte mudeli suurustabeliga. Kui kahtled, lisa eeltellimusele küsimus istuvuse kohta.",
        },
        {
          title: "Saada tellimus",
          body: "Lisa valik, sobiv kontakt ja kättesaamisviis. Kontot pole vaja ning automaatset makset ei tehta.",
        },
        {
          title: "Kinnita üksikasjad",
          body: "Võtame ühendust ning kinnitame enne maksmist mudeli, värvi, suuruse, hinna, kättesaamise, eeldatava aja ja kohaldatava tingimuste versiooni. Leping sõlmitakse alles pärast nende andmete selgesõnalist kokkuleppimist, mitte pelgalt vormi saatmisel.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Kliendile",
      title: "Tarne ja maksmine",
      introduction:
        "Kättesaamis- ja makseviisi lepime enne eeltellimuse kinnitamist sinuga kokku.",
      sections: [
        {
          title: "Tallinn",
          body: "Tallinnas saad tellimuse kätte isiklikult. Valida saab 30% ettemakse ja ülejäänud summa üleandmisel või täieliku ettemakse.",
        },
        {
          title: "Tarne üle Euroopa",
          body: "Eesti-sisese ja Euroopa tarne puhul kasutatakse täielikku ettemakset. Täpne tarneviis ja maksumus sõltuvad aadressist ning teatatakse ette.",
        },
        {
          title: "Enne maksmist",
          body: "Enne makset saad teada mudeli, värvi, suuruse, kogusumma, kättesaamisviisi, eeldatava aja, muutmise ja vabatahtliku vahetuse korra ning seadusliku taganemisõiguse, sealhulgas asja tagastamise otseste kulude kandmise.",
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
          body: "Valid standardse mudeli, värvi ja suuruse ning Andrelook kontrollib saadavust ja hangib toote sinu kinnitatud valiku alusel. Standardse suuruse hankimine sinu tellimuse jaoks ei muuda toodet iseenesest eritellimuskaubaks ega kõrvalda seaduslikku taganemisõigust.",
        },
        {
          title: "Eeldatav aeg",
          body: "Orienteeruv aeg on 2–3 nädalat. Konkreetse tellimuse ajakohane hinnang kinnitatakse enne makset.",
        },
        {
          title: "Muudatused pärast kinnitamist",
          body: "Vormi saatmine ei võta raha ega lõpeta ostu. Kui kinnitatud tellimus on tarnijale edastatud, ei ole mudeli, värvi või suuruse muutmine garanteeritud. Kui kaup vastab kinnitatud tellimusele, ei tähenda ebasobiv suurus iseenesest müüja viga; seadusest tulenevad õigused säilivad.",
        },
        {
          title: "Vabatahtlik vahetus",
          body: "Mudeli, värvi või suuruse vabatahtlik vahetamine on võimalik ainult eraldi kokkuleppel ja sobiva asendustoote olemasolul. Andrelook ei garanteeri vahetust ega pea tegema uut tarnijaostu üksnes selleks. See ei piira seaduslikku taganemisõigust ega õigusi lepingutingimustele mittevastava kauba korral.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Kliendile",
      title: "Tagastus ja vahetus",
      introduction:
        "Vabatahtlik vahetus ja tarbija kohustuslikud õigused on eraldi. Sidevahendi abil sõlmitud ostule kehtib seaduslik taganemisõigus, kui seaduses ei ole konkreetset erandit.",
      sections: [
        {
          title: "14-päevane taganemisõigus",
          body: "Nõuetele vastava sidevahendi abil sõlmitud ostu puhul võid põhjust avaldamata taganeda 14 päeva jooksul päevast, mil sina või sinu nimetatud kolmas isik, kes ei ole vedaja, saab kauba enda valdusse. Avalduse saab teha veebifunktsiooniga „Taganen lepingust“ või saata ühemõttelise teatena aadressile info.andrelook@gmail.com; üksnes meie vormi kasutamine ei ole kohustuslik.",
        },
        {
          title: "Tagastamise tähtaeg ja kulud",
          body: "Pärast taganemisavaldust saada kaup põhjendamatu viivituseta tagasi, kuid hiljemalt 14 päeva jooksul. Kui seadus seda lubab ja Andrelook ei ole eelnevalt teisiti kokku leppinud, kannad asja tagastamise otsesed posti- või kullerikulud. Küsi enne saatmist kinnitatud tagastusaadress; ära saada kaupa ilma Andrelooki juhiseta tarnijale ega algse paki aadressile.",
        },
        {
          title: "Kontroll ja väärtuse vähenemine",
          body: "Kaubaga võib tutvuda ja seda proovida samal viisil nagu tavapäraselt poes. Kui käsitsemine ületab selle piiri ja vähendab tõendatult kauba väärtust, võib Andrelook nõuda tegeliku väärtuse vähenemise hüvitamist. Pakendi või siltide puudumine ei kõrvalda taganemisõigust automaatselt, kuid võib olla oluline tõendatud väärtuse vähenemise hindamisel.",
        },
        {
          title: "Tagasimakse",
          body: "Andrelook tagastab saadud maksed, sealhulgas odavaima tavapärase esialgse tarne kulu, põhjendamatu viivituseta ja hiljemalt 14 päeva jooksul taganemisavalduse saamisest. Tagasimakse võib kinni pidada kuni kauba tagasisaamiseni või saatmist tõendava dokumendi esitamiseni, olenevalt sellest, kumb saabub varem. Kasutatakse sama makseviisi, kui seaduslikult ei lepita kokku muud tarbijale lisakuludeta viisi.",
        },
        {
          title: "Isikupärastatud kaup",
          body: "Taganemisõiguse erand kehtib ainult siis, kui kaup on päriselt valmistatud tarbija isiklike juhiste järgi või selgelt isikupärastatud. Standardse S-, M-, L-, XL- või muu tavavariandi valik ja standardkauba hankimine konkreetsele kliendile seda erandit iseenesest ei loo.",
        },
        {
          title: "Vabatahtlik vahetus ja puudused",
          body: "Suuruse vabatahtlik vahetus on võimalik ainult kokkuleppel ja asendustoote olemasolul; Andrelook võib keelduda ega pea uut ostu korraldama. See ei mõjuta eraldi õigusi lepingutingimustele mittevastava kauba korral. Tarbija võib esitada puuduse kohta pretensiooni kahe aasta jooksul kauba kättesaamisest ja peab avastatud puudusest teatama viivitamata, kuid hiljemalt kahe kuu jooksul. Andrelook vastab kirjalikule kaebusele 15 päeva jooksul või põhjendab viivitust kirjalikult ja määrab uue mõistliku tähtaja.",
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
          body: "Võrdle oma mõõte tootelehe suurustabeliga. Kui kahtled kahe suuruse vahel või istuvuses, kirjuta meile - aitame valida.",
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
          body: "Sidevahendi abil sõlmitud ostule kehtib tavaliselt 14-päevane taganemisõigus. Ostja kannab eelnevalt teatatud otsesed tagastuskulud ning tõendatud liigne kasutamine võib vähendada tagasimakset. Vabatahtlik suurusevahetus ei ole garanteeritud ning sõltub kokkuleppest ja asendustoote olemasolust.",
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
          title: "Analüütika ja omistamine",
          body: "Vajalik salvestus toetab veebilehe tööd ja sinu privaatsusvalikut. Valikuline analüütika ning turundusmõõtmine käivituvad alles pärast sinu valikut. Loa korral võime säilitada esimese ja viimase olulise päringuallika 30 päeva jooksul ning lisada selle päringule.",
        },
        {
          title: "Valiku muutmine",
          body: "Valikut saab igal ajal muuta veebilehe lingi „Privaatsusseaded“ kaudu. Keeldumine ei takista kataloogi vaatamist ega päringu saatmist.",
        },
        {
          title: "Sinu andmeküsimus",
          body: "Andmetele ligipääsu, parandamise või kustutamise küsimustes kirjuta info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Õigusinfo",
      title: "Tingimused",
      introduction:
        "Versioon andrelook-legal-2026-10-v1 kehtib ainult uutele tellimustele, mille puhul seda näidati ja kinnitati; see ei muuda varem sõlmitud lepinguid tagasiulatuvalt.",
      sections: [
        {
          title: "Päring ja lepingu sõlmimine",
          body: "Sait võimaldab saata eeltellimuspäringu, kuid vormi saatmine ei võta makset ega sõlmi iseenesest müügilepingut. Enne lepingu sõlmimist lepivad Andrelook ja ostja selgesõnaliselt kokku mudeli, värvi, suuruse, koguse, hinna, makse- ja kättesaamisviisi, eeldatava aja ning muutmise, tagastamise ja vabatahtliku vahetuse tingimused. Lepingu kinnitus antakse püsival andmekandjal.",
        },
        {
          title: "Salvestatud valik",
          body: "Päringuga salvestatakse kinnitatud parameetrid, kuupäev ja kellaaeg, tingimuste versioon, kinnituse allikas ning sel hetkel olemas olnud suurustabel. Andrelook hangib kauba kinnitatud valiku alusel. Pärast tellimuse tarnijale edastamist ei ole muudatused garanteeritud. Kinnitatud omadustele vastava kauba ebasobiv suurus ei ole iseenesest müüja viga.",
        },
        {
          title: "Hind, tarne ja aeg",
          body: "Lõplik hind, tarnekulu ja kehtiv eeldatav aeg teatatakse enne lepingu sõlmimist. Eeldatav aeg ei ole garanteeritud kuupäev, kui seda ei ole sõnaselgelt kokku lepitud. Kui muud tähtaega ei lepita kokku, kohaldub seadusest tulenev kohustuslik tähtaeg.",
        },
        {
          title: "Vabatahtlikud muudatused ja vahetus",
          body: "Pärast tellimuse tarnijale edastamist ei garanteeri Andrelook mudeli, värvi või suuruse muutmist. Vabatahtlik vahetus sõltub eraldi kokkuleppest ja asendustoote olemasolust; Andrelook võib keelduda ega pea uut tarnijaostu korraldama. Tarbija kohustuslikke õigusi see ei piira.",
        },
        {
          title: "Seaduslik taganemine ja tagastus",
          body: "Nõuetele vastava sidevahendi abil sõlmitud ostu puhul säilib 14-päevane taganemisõigus. Tähtajad, otsesed tagastuskulud, kauba seisundi kontroll, tõendatud väärtuse vähenemise võimalik hüvitamine ja tagasimakse kord on lehel „Tagastus ja vahetus“. Veebipõhine taganemisfunktsioon on pidevalt kättesaadav saidi jaluses.",
        },
        {
          title: "Lepingutingimustele vastavus ja kaebused",
          body: "Suuruse ja vabatahtliku vahetuse tingimused ei kõrvalda vastutust lepingutingimustele mittevastava kauba eest. Tarbija võib esitada puuduse kohta pretensiooni kahe aasta jooksul kauba kättesaamisest ja peab avastatud puudusest teatama viivitamata, kuid hiljemalt kahe kuu jooksul. Saada puuduse kirjeldus ja nõue kirjalikult aadressile info.andrelook@gmail.com. Andrelook kinnitab kättesaamise ja vastab 15 päeva jooksul või põhjendab viivitust kirjalikult ja määrab uue mõistliku tähtaja; säilib õigus pöörduda pädeva kohtuvälise tarbijavaidluste lahendamise üksuse või kohtu poole.",
        },
        {
          title: "Kontakt ja kohustusliku õiguse ülimuslikkus",
          body: "Tellimuse, tagastuse või kaebuse küsimustes kirjuta info.andrelook@gmail.com. Kui mõni tingimus on vastuolus Eesti või Euroopa Liidu kohustusliku õigusega, kohaldub kohustuslik norm ja ülejäänud tingimused jäävad kehtima.",
        },
      ],
    },
  },
  en: {
    about: {
      eyebrow: "Andrelook",
      title: "About",
      introduction:
        "Andrelook is a Tallinn-based fashion service with a focused edit of Moncler and Parajumpers pieces and human help throughout the order.",
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
        "Choose a piece, send your request and confirm the pre-order details directly with us.",
      sections: [
        {
          title: "Choose your piece",
          body: "Review the product photography and colours, then compare your measurements with the size guide for the piece. If you are unsure, add a fit question to your pre-order.",
        },
        {
          title: "Send your request",
          body: "Add your selection, preferred contact and fulfilment method. No account is required and no automatic payment is taken.",
        },
        {
          title: "Confirm the details",
          body: "We contact you and, before payment, confirm the piece, colour, size, price, fulfilment, expected timing and applicable terms version. A contract is formed only after those details are expressly agreed, not merely when the form is submitted.",
        },
      ],
    },
    "delivery-payment": {
      eyebrow: "Customer care",
      title: "Delivery & payment",
      introduction:
        "Fulfilment and payment are agreed with you before the pre-order is confirmed.",
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
          body: "Before any payment, you receive the piece, colour, size, total amount, fulfilment method, expected timing, change and voluntary-exchange rules, statutory withdrawal information and notice of the direct return cost responsibility.",
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
          body: "You select a standard piece, colour and size; Andrelook checks availability and sources the item on the basis of your confirmed selection. Sourcing a standard size for your order does not by itself make the item personalised or remove the statutory right of withdrawal.",
        },
        {
          title: "Expected timing",
          body: "The guide is approximately 2–3 weeks. The current estimate for your specific order is confirmed before payment.",
        },
        {
          title: "Changes after confirmation",
          body: "Submitting the form does not take payment or complete a purchase. Once the confirmed order has been sent to the supplier, a change of piece, colour or size is not guaranteed. If the item matches the confirmed order, an unsuitable size does not by itself mean seller error; statutory rights remain unaffected.",
        },
        {
          title: "Voluntary exchange",
          body: "A voluntary piece, colour or size exchange is available only by separate agreement and where a suitable replacement exists. Andrelook does not guarantee an exchange and does not have to make a new supplier purchase solely for it. This does not restrict the statutory distance-withdrawal right or remedies for non-conforming goods.",
        },
      ],
    },
    "returns-exchanges": {
      eyebrow: "Customer care",
      title: "Returns & exchanges",
      introduction:
        "A voluntary exchange is separate from mandatory consumer rights. A qualifying distance purchase carries the statutory withdrawal right unless a specific legal exception applies.",
      sections: [
        {
          title: "14-day withdrawal",
          body: "For a qualifying distance purchase, you may withdraw without giving a reason within 14 days from the day you, or a third party you nominate other than the carrier, takes physical possession of the item. Submit the statement through the online “Withdraw from contract” function or send an unambiguous notice to info.andrelook@gmail.com; use of our form is not mandatory.",
        },
        {
          title: "Return deadline and cost",
          body: "After notifying withdrawal, send the item back without undue delay and no later than 14 days. Where the law permits and Andrelook has not agreed otherwise in advance, you pay the direct postal or courier cost of returning it. Ask for the confirmed return address before dispatch; do not send an item to a supplier or the original parcel address without Andrelook's instruction.",
        },
        {
          title: "Inspection and diminished value",
          body: "You may inspect and try on the item as you normally could in a shop. If handling goes beyond that and demonstrably reduces its value, Andrelook may claim compensation for the actual diminution. Missing packaging or tags does not automatically remove the withdrawal right, but it may be relevant to proven loss of value.",
        },
        {
          title: "Refund",
          body: "Andrelook reimburses payments received, including the cost of the least expensive standard outbound delivery, without undue delay and no later than 14 days after receiving the withdrawal notice. Reimbursement may be withheld until the item is received back or evidence of return dispatch is supplied, whichever happens first. The same payment method is used unless another lawful, fee-free method is expressly agreed.",
        },
        {
          title: "Genuinely personalised goods",
          body: "The withdrawal exception applies only where an item is genuinely made to the consumer's individual specifications or clearly personalised. Selecting a standard S, M, L, XL or other standard variation, and sourcing a standard item for a particular customer, does not by itself create that exception.",
        },
        {
          title: "Voluntary exchange and defects",
          body: "A voluntary size exchange is available only by agreement and where a replacement exists; Andrelook may decline and does not have to arrange a new purchase. This does not affect separate statutory remedies for goods that do not conform to the contract. A consumer may complain about a defect within two years after receiving the goods and must report a discovered defect without delay, and no later than two months. Andrelook answers a written complaint within 15 days or explains the delay in writing and gives a new reasonable deadline.",
        },
      ],
    },
    faq: {
      eyebrow: "Help",
      title: "FAQ",
      introduction:
        "Quick answers about pre-ordering, sizing, payment and fulfilment.",
      sections: [
        {
          title: "How long does pre-order take?",
          body: "The expected timeframe is approximately 2–3 weeks. The current timing for your order is shared before payment.",
        },
        {
          title: "How do I choose a size?",
          body: "Compare your measurements with the size guide on the product page. If you are between sizes or unsure about the fit, message us and we’ll help you choose.",
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
          body: "A distance purchase normally carries a 14-day withdrawal right. The customer bears the pre-disclosed direct return cost, and proven excessive handling may reduce the refund. A voluntary size exchange is not guaranteed and depends on agreement and replacement availability.",
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
          title: "Analytics and attribution",
          body: "Necessary storage supports the site and remembers your privacy choice. Optional analytics and marketing measurement start only after your choice. If allowed, we may retain the first and last meaningful enquiry source within a 30-day window and attach that snapshot to your request.",
        },
        {
          title: "Change your choice",
          body: "You can change your choice at any time through the “Privacy settings” link on the site. Declining does not prevent catalog browsing or request submission.",
        },
        {
          title: "Questions about your data",
          body: "For access, correction or deletion questions, email info.andrelook@gmail.com.",
        },
      ],
    },
    terms: {
      eyebrow: "Legal information",
      title: "Terms",
      introduction:
        "Version andrelook-legal-2026-10-v1 applies only to new orders for which it was displayed and accepted; it does not alter earlier contracts retrospectively.",
      sections: [
        {
          title: "Request and contract formation",
          body: "The site lets you send a pre-order request, but submitting the form does not take payment or by itself form a sales contract. Before a contract is formed, Andrelook and the customer expressly agree the piece, colour, size, quantity, price, payment, fulfilment, expected timing and the change, return and voluntary-exchange terms. Confirmation of the contract is supplied on a durable medium.",
        },
        {
          title: "Recorded selection",
          body: "The request records the confirmed parameters, date and time, terms version, confirmation source and the size guide available at that time. Andrelook sources the item on the confirmed selection. Changes are not guaranteed after the order is sent to the supplier. If the item matches the confirmed characteristics, an unsuitable size is not by itself seller error.",
        },
        {
          title: "Price, delivery and timing",
          body: "The final price, delivery charge and current estimated timing are provided before contract formation. An estimated timeframe is not a guaranteed date unless expressly agreed. If no different performance period is agreed, the mandatory statutory period applies.",
        },
        {
          title: "Voluntary changes and exchange",
          body: "After an order is sent to the supplier, Andrelook does not guarantee a change of piece, colour or size. A voluntary exchange depends on a separate agreement and replacement availability; Andrelook may decline and does not have to arrange a new supplier purchase. Mandatory consumer rights are unaffected.",
        },
        {
          title: "Statutory withdrawal and return",
          body: "The 14-day withdrawal right remains available for qualifying distance purchases. The Returns & exchanges page explains deadlines, direct return costs, condition inspection, possible compensation for proven diminished value and refund timing. The online withdrawal function remains available through the footer.",
        },
        {
          title: "Conformity and complaints",
          body: "The sizing and voluntary-exchange terms do not exclude liability for goods that fail to conform to the contract. A consumer may complain about a defect within two years after receiving the goods and must report a discovered defect without delay, and no later than two months. Send a written description and requested remedy to info.andrelook@gmail.com. Andrelook confirms receipt and responds within 15 days or explains the delay in writing and gives a new reasonable deadline; the right to use a competent consumer ADR body or court remains available.",
        },
        {
          title: "Contact and mandatory-law priority",
          body: "For an order, return or complaint, email info.andrelook@gmail.com. If any term conflicts with mandatory Estonian or European Union law, the mandatory rule applies and the remaining terms continue to operate.",
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
