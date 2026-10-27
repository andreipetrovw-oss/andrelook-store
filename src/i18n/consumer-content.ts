import type { Locale } from "@/config/locales";

type Section = { title: string; body: string };
type ConsumerContent = {
  beforePayment: Section;
  delay: Section;
  returnsIntroduction: string;
  returns: Section[];
  returnsAnswer: string;
};

// General statutory information, not an assertion that an individual contract
// was concluded online. Seller identity and contract formation need confirmation.
// Sources and the separate withdrawal-function release gate are documented in
// docs/customer-trust-consumer-protection.md.
export const consumerContent: Record<Locale, ConsumerContent> = {
  et: {
    beforePayment: {
      title: "Kontrolli enne maksmist",
      body: "Vormi saatmine ei võta raha ega kinnita automaatselt ostu. Enne maksmist küsi kirjalik kinnitus: müüja nimi ja kontaktandmed, mudel, värv, suurus, kogus, lõpphind koos tarnekuludega, ettemaks ja jääk, kättesaamise viis, eeldatav täitmise aeg ning taganemis- ja tagastustingimused. Säilita kokkulepe ja maksekinnitus.",
    },
    delay: {
      title: "Kui tähtaeg muutub",
      body: "2–3 nädalat on eeldatav aeg, mitte garanteeritud tarnekuupäev. Kinnitatud etappe näed isikliku jälgimislingi kaudu; iga päev ei pruugi uut infot lisanduda. Kui kokkulepitud aeg möödub või info puudub, kirjuta meile tellimuse numbriga. Kui kokkulepitud toodet ei saa tarnida, ei asendata seda ilma sinu nõusolekuta. Viivituse korral saad seaduses ette nähtud tingimustel nõuda täitmist lisatähtaja jooksul või lepingust taganeda; õiguspärasel taganemisel tagastatakse tasutud summad.",
    },
    returnsIntroduction:
      "Seadusest tulenev taganemine, vabatahtlik suurusevahetus ja puudusega kauba pretensioon on eri olukorrad. Suuruse kinnitamine ei piira kohustuslikke tarbijaõigusi.",
    returns: [
      {
        title: "Päring, kaugleping ja kohapealne ost",
        body: "Tasumata päring ei ole automaatselt sõlmitud ostuleping. Tavakauba kauglepingust saab tarbija üldjuhul põhjuseta taganeda 14 päeva jooksul kauba kättesaamisest. Eeltellimus, standardsuurus, värvivalik või kauba eraldi hankimine ei muuda toodet iseenesest eritellimuseks. Tallinnas üleandmine ei muuda varem internetis sõlmitud lepingut kohapealseks ostuks. Tõelisel kohapealsel ostul ei ole üldist 14-päevast meelemuutuse õigust; puudusega kauba õigused säilivad.",
      },
      {
        title: "Taganemisest teatamine ja tagastamine",
        body: "Saada tähtaja jooksul ühemõtteline taganemisavaldus aadressile info.andrelook@gmail.com: lisa oma nimi, tellimuse viide ja soov lepingust taganeda. Põhjust ei pea esitama. Saada kaup tagasi hiljemalt 14 päeva jooksul avaldusest, kui müüja ei tule sellele ise järele. Küsi tagastamise sihtkoht ja hoia saatmistõend alles; juhiste ootamine ei pikenda seadusest tulenevat tähtaega.",
      },
      {
        title: "Tagastuskulu ja tagasimakse",
        body: "Otsese tagastuskulu kandmisest tuleb teatada enne lepingu sõlmimist; ilma selle teabeta ei saa kulu tarbijale panna. Taganemisel tagastatakse tasutud summad, sh tavapärase tarne kulu, põhjendamatu viivituseta, hiljemalt 14 päeva jooksul avalduse saamisest. Tagasimakse võib oodata kauba või tagasisaatmise tõendi saamiseni, kui müüja ei ole lubanud kaubale ise järele tulla. Kasutatakse sama makseviisi, kui pole sõnaselgelt ja lisakuluta kokku lepitud teisiti. Ettemaks ei ole automaatselt tagastamatu.",
      },
      {
        title: "Proovimine ja vabatahtlik vahetus",
        body: "Toodet võib üle vaadata ja proovida nagu poes. Pakendi avamine üksi ei kaota taganemisõigust. Vajalikust proovimisest ulatuslikum kasutamine võib kaasa tuua põhjendatud väärtuse vähenemise nõude seaduses lubatud ulatuses, mitte automaatse tagastamisest keeldumise. Vabatahtlik suurusevahetus ei ole garanteeritud: küsi võimalust enne tellimist. See ei asenda seaduslikku taganemisõigust ega puudusega kauba õigusi.",
      },
      {
        title: "Vale või puudusega toode",
        body: "Kirjuta info.andrelook@gmail.com, lisa tellimuse viide, probleemi kirjeldus ja võimalusel fotod ning soovitud lahendus. Ära jätka puudusega toote kasutamist. Müüja vastutab tarbijalemüügil kahe aasta jooksul ilmneva mittevastavuse eest; teata puudusest kahe kuu jooksul selle avastamisest. Kohaldatavate tingimuste järgi saab nõuda tasuta parandamist või asendamist ning vajadusel hinna alandamist või lepingust taganemist. Puuduse lahendamise vajalikud kulud kannab müüja. Kirjalikule kaebusele tuleb vastata 15 päeva jooksul.",
      },
    ],
    returnsAnswer:
      "Tavakauba kauglepingul on üldjuhul 14-päevane taganemisõigus kättesaamisest; eeltellimus ega kinnitatud standardsuurus seda iseenesest ei välista. Vabatahtlik suurusevahetus ja puudusega kauba õigused on eraldi. Tähtajad, kulud ja tegutsemisjuhised leiad lehelt „Tagastus ja vahetus“.",
  },
  ru: {
    beforePayment: {
      title: "Что проверить до оплаты",
      body: "Отправка формы не списывает деньги и не подтверждает покупку автоматически. До оплаты запросите письменное подтверждение: имя и контакты продавца, модель, цвет, размер, количество, итоговую цену с доставкой, предоплату и остаток, способ получения, ожидаемый срок и условия отказа и возврата. Сохраните договорённость и подтверждение платежа.",
    },
    delay: {
      title: "Если срок изменился",
      body: "2–3 недели — ориентир, а не гарантированная дата доставки. Подтверждённые этапы доступны по личной ссылке; новая информация может появляться не каждый день. Если согласованный срок прошёл или обновлений нет, напишите нам с номером заказа. Если согласованный товар нельзя поставить, его не заменяют без вашего согласия. При задержке на предусмотренных законом условиях можно потребовать исполнения в дополнительный срок или отказаться от договора; при правомерном отказе уплаченные суммы возвращаются.",
    },
    returnsIntroduction:
      "Законный отказ от договора, добровольный обмен размера и претензия по недостатку — разные ситуации. Подтверждение размера не ограничивает обязательные права потребителя.",
    returns: [
      {
        title: "Заявка, дистанционный договор и покупка на месте",
        body: "Неоплаченная заявка не означает автоматически заключённый договор покупки. От дистанционного договора на обычный товар потребитель, как правило, может отказаться без причины в течение 14 дней с получения. Предзаказ, стандартный размер, цвет или отдельная закупка сами по себе не делают товар индивидуально изготовленным. Передача в Таллинне не превращает ранее заключённый онлайн-договор в покупку на месте. Для настоящей покупки на месте общего 14-дневного права передумать нет; права при недостатках сохраняются.",
      },
      {
        title: "Как заявить об отказе и вернуть товар",
        body: "В пределах срока отправьте однозначное заявление на info.andrelook@gmail.com: укажите имя, номер заказа и желание отказаться от договора. Причину объяснять не нужно. Отправьте товар обратно не позднее 14 дней после заявления, если продавец не забирает его сам. Уточните адрес возврата и сохраните подтверждение отправки; ожидание инструкций не продлевает установленный законом срок.",
      },
      {
        title: "Расходы и возврат денег",
        body: "Об обязанности оплатить прямые расходы обратной отправки должны сообщить до заключения договора; без этого возложить их на покупателя нельзя. Уплаченные суммы, включая обычную доставку, возвращаются без необоснованной задержки, не позднее 14 дней с получения заявления. Возврат может быть приостановлен до получения товара или доказательства отправки, если продавец не обязался забрать товар сам. Используется прежний способ оплаты, если иной прямо не согласован без дополнительных расходов. Предоплата не становится автоматически невозвратной.",
      },
      {
        title: "Примерка и добровольный обмен",
        body: "Товар можно осмотреть и примерить, как в магазине. Само вскрытие упаковки не лишает права отказа. Использование сверх необходимой проверки может повлечь обоснованное требование возместить снижение стоимости в допустимых законом пределах, но не автоматический запрет возврата. Добровольный обмен размера не гарантирован — уточните возможность до заказа. Он не заменяет законный отказ и права при недостатках.",
      },
      {
        title: "Неверный товар или недостаток",
        body: "Напишите на info.andrelook@gmail.com: укажите номер заказа, проблему, по возможности приложите фото и желаемое решение. Не продолжайте использовать товар с недостатком. Продавец отвечает за несоответствие, проявившееся в течение двух лет; сообщите о нём в течение двух месяцев с обнаружения. При предусмотренных законом условиях доступны бесплатный ремонт или замена, а при соответствующих основаниях — снижение цены или отказ от договора. Необходимые расходы по устранению несоответствия несёт продавец. На письменную претензию должны ответить в течение 15 дней.",
      },
    ],
    returnsAnswer:
      "Для дистанционной покупки обычного товара, как правило, действует 14-дневное право отказа с получения; предзаказ или подтверждение стандартного размера сами по себе его не отменяют. Добровольный обмен и права при недостатках — отдельные вопросы. Сроки, расходы и порядок обращения описаны на странице «Возврат и обмен».",
  },
  en: {
    beforePayment: {
      title: "Check before paying",
      body: "Submitting the form does not charge you or automatically confirm a purchase. Before paying, request written confirmation of the seller’s name and contact details, model, colour, size, quantity, total price including delivery, advance and remaining balance, fulfilment method, expected timing, and withdrawal and return terms. Keep the agreement and payment confirmation.",
    },
    delay: {
      title: "If timing changes",
      body: "2–3 weeks is an estimate, not a guaranteed delivery date. Your private link shows confirmed stages; new information may not appear every day. If the agreed time passes or updates are missing, contact us with your order number. An unavailable agreed item is not replaced without your consent. For delivery delays, the law allows you, subject to its conditions, to require delivery within an additional period or withdraw from the contract; payments must be refunded following valid withdrawal.",
    },
    returnsIntroduction:
      "Statutory withdrawal, a voluntary size exchange and a claim about faulty goods are different situations. Confirming a size does not restrict mandatory consumer rights.",
    returns: [
      {
        title: "Enquiry, distance contract or in-person purchase",
        body: "An unpaid enquiry does not automatically constitute a purchase contract. Consumers can generally withdraw from a distance contract for standard goods without giving a reason within 14 days of receipt. Pre-ordering, a standard size, colour selection or individual sourcing does not by itself make an item custom-made. Handover in Tallinn does not turn a previously concluded online contract into an in-person sale. A genuine in-person purchase has no general 14-day change-of-mind right; rights concerning faulty goods remain.",
      },
      {
        title: "Giving notice and returning goods",
        body: "Within the withdrawal period, send an unambiguous statement to info.andrelook@gmail.com with your name, order reference and intention to withdraw. No reason is required. Send the goods back within 14 days of giving notice, unless the seller collects them. Ask for the return destination and keep proof of dispatch; waiting for instructions does not extend the statutory deadline.",
      },
      {
        title: "Return costs and reimbursement",
        body: "Responsibility for direct return costs must be disclosed before the contract; without that information they cannot be charged to the consumer. Payments, including standard delivery, must be reimbursed without undue delay and within 14 days of receiving notice. Reimbursement may be withheld until the goods or proof of dispatch are received, unless the seller has offered to collect. The original payment method is used unless another is expressly agreed at no extra cost. An advance is not automatically non-refundable.",
      },
      {
        title: "Trying on and voluntary exchanges",
        body: "You may inspect and try on an item as you would in a shop. Opening packaging alone does not remove withdrawal rights. Handling beyond necessary inspection may justify a substantiated deduction for diminished value where the law permits, not an automatic refusal of a return. A voluntary size exchange is not guaranteed; ask before ordering. It does not replace statutory withdrawal or rights concerning faulty goods.",
      },
      {
        title: "Incorrect or faulty goods",
        body: "Email info.andrelook@gmail.com with your order reference, the problem, photos where possible and your requested remedy. Stop using faulty goods. The seller is responsible for non-conformity appearing within two years; report it within two months of discovery. Subject to the legal conditions, remedies include free repair or replacement and, where justified, a price reduction or withdrawal. The seller bears necessary costs of remedying non-conformity. A written complaint must be answered within 15 days.",
      },
    ],
    returnsAnswer:
      "A distance purchase of standard goods generally has a 14-day withdrawal period from receipt; pre-ordering or confirming a standard size does not itself remove it. Voluntary exchanges and rights concerning faulty goods are separate. See “Returns & exchanges” for deadlines, costs and how to contact us.",
  },
};
