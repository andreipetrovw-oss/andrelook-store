import type { Locale } from "@/config/locales";

export const withdrawalCopy = {
  en: {
    retry: "Retry acknowledgement",
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
    retry: "Saada kinnitus uuesti",
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
    retry: "Повторить отправку подтверждения",
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
