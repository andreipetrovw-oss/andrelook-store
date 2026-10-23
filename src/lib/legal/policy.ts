import type { Locale } from "@/config/locales";

export const LEGAL_POLICY_VERSION = "andrelook-legal-2026-10-v1";
export const TERMS_VERSION = "andrelook-terms-2026-10-v1";
export const RETURNS_VERSION = "andrelook-returns-2026-10-v1";

export const legalPolicyCopy = {
  en: {
    acceptance:
      "I confirm that I have checked the selected model, colour and size, reviewed the available size guide and understood the displayed price and estimated delivery time. I understand that after Andrelook sends the order to the supplier, changes and any voluntary size exchange are not guaranteed. This does not limit my statutory consumer rights, including the right of withdrawal where it applies.",
    acceptanceNoChart:
      "I confirm that I have checked the selected model, colour and size, where selected, and understand that no size guide is available. I understand the displayed price and estimated delivery time and that, after Andrelook sends the order to the supplier, changes and any voluntary exchange are not guaranteed. This does not limit my statutory consumer rights, including the right of withdrawal where it applies.",
    compactTitle: "Before you send the pre-order request",
    directReturnCost:
      "If you exercise the statutory right of withdrawal, you pay the direct cost of returning the item unless Andrelook agrees otherwise or the law requires Andrelook to bear it.",
    exchange:
      "A voluntary model, colour or size exchange is possible only if Andrelook expressly agrees and the replacement is available. Andrelook does not have to make a new supplier purchase solely for a voluntary exchange.",
    legalLinks: "Terms and returns policy",
    selectedDetails:
      "The model, colour, size, displayed price and current delivery estimate are recorded with your request.",
    withdrawal:
      "For a qualifying distance purchase, the statutory 14-day withdrawal right remains available even when a standard item was sourced after your request.",
  },
  et: {
    acceptance:
      "Kinnitan, et olen kontrollinud valitud mudelit, värvi ja suurust, tutvunud olemasoleva suurustabeliga ning saanud aru kuvatud hinnast ja eeldatavast tarneajast. Mõistan, et pärast tellimuse edastamist tarnijale ei ole muudatused ega vabatahtlik suurusevahetus garanteeritud. See ei piira minu seadusest tulenevaid tarbijaõigusi, sealhulgas taganemisõigust, kui see kohaldub.",
    acceptanceNoChart:
      "Kinnitan, et olen kontrollinud valitud mudelit, värvi ja suurust, kui see on valitud, ning mõistan, et suurustabel puudub. Olen saanud aru kuvatud hinnast ja eeldatavast tarneajast ning sellest, et pärast tellimuse edastamist tarnijale ei ole muudatused ega vabatahtlik vahetus garanteeritud. See ei piira minu seadusest tulenevaid tarbijaõigusi, sealhulgas taganemisõigust, kui see kohaldub.",
    compactTitle: "Enne eeltellimuspäringu saatmist",
    directReturnCost:
      "Seadusliku taganemisõiguse kasutamisel kannad asja tagastamise otsesed kulud, kui Andrelook ei lepi kokku teisiti või seadus ei kohusta Andrelooki neid kandma.",
    exchange:
      "Vabatahtlik mudeli-, värvi- või suurusevahetus on võimalik ainult Andrelooki selgesõnalisel nõusolekul ja asendustoote olemasolul. Andrelook ei pea tegema uut tarnijaostu üksnes vabatahtliku vahetuse jaoks.",
    legalLinks: "Tingimused ja tagastuspoliitika",
    selectedDetails:
      "Mudel, värv, suurus, kuvatud hind ja kehtiv tarneprognoos salvestatakse koos sinu päringuga.",
    withdrawal:
      "Nõuetele vastava sidevahendi abil sõlmitud ostu puhul säilib seaduslik 14-päevane taganemisõigus ka siis, kui standardtoode hangiti sinu päringu alusel.",
  },
  ru: {
    acceptance:
      "Я подтверждаю, что проверил(а) выбранные модель, цвет и размер, ознакомился(-ась) с доступной таблицей размеров и понял(а) указанную цену и ориентировочный срок доставки. Я понимаю, что после передачи заказа поставщику изменения и добровольный обмен размера не гарантируются. Это не ограничивает мои предусмотренные законом права потребителя, включая право на отказ от договора, когда оно применяется.",
    acceptanceNoChart:
      "Я подтверждаю, что проверил(а) выбранные модель, цвет и размер, если он выбран, и понимаю, что таблица размеров отсутствует. Я понял(а) указанную цену, ориентировочный срок доставки и то, что после передачи заказа поставщику изменения и добровольный обмен не гарантируются. Это не ограничивает мои предусмотренные законом права потребителя, включая право на отказ от договора, когда оно применяется.",
    compactTitle: "Перед отправкой заявки на предзаказ",
    directReturnCost:
      "При использовании законного права на отказ вы оплачиваете прямые расходы на обратную отправку, если Andrelook не согласовал иное или закон не возлагает эти расходы на Andrelook.",
    exchange:
      "Добровольная замена модели, цвета или размера возможна только с прямого согласия Andrelook и при наличии замены. Andrelook не обязан делать новую закупку исключительно ради добровольного обмена.",
    legalLinks: "Условия и политика возврата",
    selectedDetails:
      "Модель, цвет, размер, указанная цена и актуальный ориентировочный срок сохраняются вместе с вашей заявкой.",
    withdrawal:
      "Для дистанционной покупки, подпадающей под закон, сохраняется 14-дневное право на отказ, даже если стандартный товар был закуплен после вашей заявки.",
  },
} satisfies Record<Locale, Record<string, string>>;

export const withdrawalCopy = {
  en: {
    confirmationEmail: "Email for the electronic confirmation",
    confirmationLead:
      "We have recorded your withdrawal statement. This confirms receipt, not the outcome of any inspection or refund calculation.",
    confirmationDeliveryIssue:
      "Your statement was recorded, but a notification could not be delivered. Keep the reference below and contact info.andrelook@gmail.com to confirm receipt.",
    confirm: "Confirm withdrawal",
    consumerName: "Consumer name",
    error:
      "We could not submit the online form. You may still send an unambiguous withdrawal statement to info.andrelook@gmail.com.",
    eyebrow: "Andrelook · Legal",
    formIntro:
      "Use this function to submit an unambiguous withdrawal statement for a distance purchase. You do not have to use this form and you do not have to give a reason.",
    initialAction: "Withdraw from contract",
    orderReference: "Order number or purchase details",
    privacy:
      "We use these details only to identify the contract and confirm receipt of your statement.",
    policyVersion: "Policy version",
    reference: "Reference",
    statement:
      "I hereby give notice that I withdraw from the distance sales contract identified above.",
    submittedAt: "Submitted",
    successTitle: "Withdrawal statement received",
    title: "Withdraw from contract",
  },
  et: {
    confirmationEmail: "E-post elektroonilise kinnituse saamiseks",
    confirmationLead:
      "Oleme sinu taganemisavalduse registreerinud. See kinnitab avalduse kättesaamist, mitte kontrolli või tagasimakse arvutuse tulemust.",
    confirmationDeliveryIssue:
      "Sinu avaldus registreeriti, kuid üht teadet ei õnnestunud edastada. Hoia allolev viide alles ja kinnita kättesaamist aadressil info.andrelook@gmail.com.",
    confirm: "Kinnitan taganemise",
    consumerName: "Tarbija nimi",
    error:
      "Veebivormi saatmine ebaõnnestus. Võid siiski saata ühemõttelise taganemisavalduse aadressile info.andrelook@gmail.com.",
    eyebrow: "Andrelook · Õigusteave",
    formIntro:
      "Selle funktsiooniga saad esitada sidevahendi abil sõlmitud ostu kohta ühemõttelise taganemisavalduse. Vormi kasutamine ega põhjuse esitamine ei ole kohustuslik.",
    initialAction: "Taganen lepingust",
    orderReference: "Tellimuse number või ostu andmed",
    privacy:
      "Kasutame neid andmeid ainult lepingu tuvastamiseks ja avalduse kättesaamise kinnitamiseks.",
    policyVersion: "Tingimuste versioon",
    reference: "Viide",
    statement:
      "Teatan, et taganen eespool määratletud sidevahendi abil sõlmitud müügilepingust.",
    submittedAt: "Esitatud",
    successTitle: "Taganemisavaldus on kätte saadud",
    title: "Lepingust taganemine",
  },
  ru: {
    confirmationEmail: "Эл. почта для электронного подтверждения",
    confirmationLead:
      "Мы зарегистрировали ваше заявление об отказе. Это подтверждает получение заявления, но не результат проверки товара или расчёта возврата.",
    confirmationDeliveryIssue:
      "Ваше заявление зарегистрировано, но одно из уведомлений не удалось доставить. Сохраните указанный ниже номер и уточните получение на info.andrelook@gmail.com.",
    confirm: "Подтверждаю отказ",
    consumerName: "Имя потребителя",
    error:
      "Не удалось отправить онлайн-форму. Вы по-прежнему можете направить однозначное заявление об отказе на info.andrelook@gmail.com.",
    eyebrow: "Andrelook · Правовая информация",
    formIntro:
      "Эта функция позволяет направить однозначное заявление об отказе от дистанционной покупки. Использовать именно эту форму и указывать причину не обязательно.",
    initialAction: "Отказываюсь от договора",
    orderReference: "Номер заказа или данные покупки",
    privacy:
      "Мы используем эти данные только для идентификации договора и подтверждения получения заявления.",
    policyVersion: "Версия условий",
    reference: "Номер заявления",
    statement:
      "Настоящим уведомляю об отказе от указанного выше договора дистанционной купли-продажи.",
    submittedAt: "Отправлено",
    successTitle: "Заявление об отказе получено",
    title: "Отказ от договора",
  },
} satisfies Record<Locale, Record<string, string>>;
