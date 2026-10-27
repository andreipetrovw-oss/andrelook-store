# Customer trust and consumer protection — 27 October 2026

## Baseline and scope

Accepted production: `313b3d39807c29b7cf075217d188c5ee9224714b`, deployment
`dpl_hmRr1RNKRZ3KwyupW3xRgUnmuJsX`. Previous six-step/PDP/tracking trust work is
accepted, not reimplemented. This descendant changes localized explanatory copy
and its tests only, plus the feature-branch CI trigger. No transaction, schema,
review, tracking, payment, analytics, catalog or design changes.

**Legal readiness: BLOCKED.** On 27 October the owner confirmed that the actual
seller identity, geographical contact address and return destination are not yet
defined. Brand/contact details do not replace these. No registered company,
registry/VAT number or address has been invented or published. Acting as a
professional seller as a natural person does not itself remove consumer duties.

## Targeted buyer-gap review

| Existing surface                             | Already present / retained                                               | Remaining gap addressed                                                                                  |
| -------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Home, Vezere PDP, how to order               | Six steps, personal support, no form charge, size help, private progress | No extra section or redesign; keep these accepted surfaces                                               |
| Delivery and payment                         | Existing payment choices and fulfilment                                  | Written pre-payment checklist, estimate vs guarantee, missing updates, delay/non-supply                  |
| Returns and exchanges                        | Previously only “terms shared before payment”                            | General mandatory rights, separate exchange/defect/withdrawal rules; no fictional seller-specific policy |
| FAQ                                          | Ten existing questions, tracking and review provenance                   | Replace vague return answer; clarify reopening/no real-time tracking and moderation                      |
| Tracking, navigation, footer                 | Secure URL or order number + access code                                 | No architecture changes; FAQ now explains the existing entry points                                      |
| Reviews, home review section, associated PDP | Existing published order-linked review                                   | Preserve review, consent, moderation, schema and placement; no fabricated case                           |
| About/contact/legal footer                   | Brand, Tallinn, existing public contact channels                         | Cannot establish legal seller/address from these; owner gate explicit here, no public placeholders       |

All changes are ET/RU/EN. Rights information is general and conditional on the
actual contract, not a claim that every inquiry is an online sale or that every
Tallinn handover is exempt from distance-selling rules. No new promise of
automatic messages, real-time scans, guaranteed delivery or voluntary exchange.

## Read-only process proof

An explicitly read-only database transaction returned aggregates only:

- 3 delivered orders, with delivery transitions for 3 orders;
- 3 shipment links, 19 tracking events, 9 payment records;
- 1 published review with publication consent, linked to a delivered order.

This supports an operational order-progress/completion and verified-review
process, not a guarantee of future outcomes, authenticity or delivery dates.
No customer-case publication permission was established. Consent to publish a
review is not permission to publish the entire order/payment/tracking story.
No names, order references, tokens, private screenshots or customer case were
added to public content. The existing six-step process remains a process
explanation, not a purported testimonial.

## Current contract workflow — owner confirmed

The website form is an inquiry, not payment or final purchase confirmation.
Details are agreed through Instagram, Telegram, email or a meeting. The customer
then confirms in conversation and/or pays. There is no uniform acceptance text
or legally standardized formation moment. Website code creates a NEW CRM record
and displays its reference upon submission; that administrative event is not
proof of contractual acceptance. Manual/offsite orders may be recorded later.

Do not describe every order as concluded on payment, on a CRM status change, or
on submission. Physical collection in Tallinn does not reclassify a contract
already concluded remotely. A genuine in-person contract is a different case;
off-premises rules may also apply depending on the circumstances of a meeting.

### Proposed minimal confirmation standard — NOT yet active terms

No CRM feature is needed. Use one dated message/email containing the complete
offer, receive explicit acceptance **before** requesting payment, retain both
messages with their timestamps and the versioned terms. Give the buyer a copy
that can be retained unchanged (email/PDF or an equivalent durable medium);
do not assume an editable/deletable chat thread alone is sufficient. A public
page link alone is not an immutable copy of the accepted terms.

The offer must contain the actual seller and geographical/contact/complaints
address; model, colour, size, quantity; total EUR price including applicable
taxes and delivery; advance, balance and due points; delivery/handover; agreed
fulfilment timing (distinguish estimate from deadline); withdrawal information,
return destination/costs, model withdrawal form and applicable complaint rights.
Include the online withdrawal-function location when applicable. Save the exact
offer/terms version, not only the current website URL. Customer-selected size
confirms the selection, never a waiver of mandatory rights.

The following is an **internal draft**. Replace brackets with confirmed facts;
never send it with blanks. Have the actual seller/legal adviser approve the
offer/acceptance rule and channel applicability before using it as standard terms.

**RU offer:**

> Подтверждаем условия вашего заказа: продавец [имя и адрес, контакты]; товар
> [модель], [цвет], [размер], [количество]; всего [сумма] EUR, включая [доставку
> и применимые налоги]; предоплата [сумма и срок], остаток [сумма и срок];
> получение [способ и место]; срок [согласованный срок, отдельно ориентир].
> Прилагаем условия [версия/дата], информацию об отказе, адрес и расходы возврата,
> порядок претензий. Пожалуйста, проверьте параметры и подтвердите согласие до оплаты.

**RU acceptance:**

> Подтверждаю заказ на изложенных условиях [версия/дата сообщения]: [модель,
> цвет, размер, количество], итоговая цена [сумма] EUR и согласованный порядок
> оплаты. Условия получения, отказа, возврата и претензий получил(а).

**ET offer:**

> Kinnitame tellimuse tingimused: müüja [nimi, aadress, kontaktid]; toode [mudel],
> [värv], [suurus], [kogus]; kokku [summa] EUR, sh [tarne ja kohaldatavad maksud];
> ettemaks [summa ja tähtaeg], jääk [summa ja tähtaeg]; kättesaamine [viis ja koht];
> täitmise aeg [kokkulepe, hinnang eraldi]. Lisame tingimused [versioon/kuupäev],
> taganemisinfo, tagastusaadressi ja -kulud ning pretensioonide esitamise korra.
> Palun kontrolli valikuid ja kinnita nõusolek enne maksmist.

**ET acceptance:**

> Kinnitan tellimuse esitatud tingimustel [sõnumi versioon/kuupäev]: [mudel,
> värv, suurus, kogus], koguhind [summa] EUR ja kokkulepitud maksekord.
> Olen saanud kättesaamise, taganemise, tagastamise ja pretensioonide tingimused.

**EN offer:**

> Your order terms: seller [name, geographical address, contacts]; item [model],
> [colour], [size], [quantity]; total [amount] EUR including [delivery and applicable
> taxes]; advance [amount and due date], balance [amount and due date]; fulfilment
> [method/place]; timing [agreement, estimate distinguished]. Attached: terms
> [version/date], withdrawal information, return address/costs and complaint process.
> Please check your selection and explicitly accept before paying.

**EN acceptance:**

> I confirm this order on the stated terms [message version/date]: [model,
> colour, size, quantity], total [amount] EUR and the agreed payment obligation.
> I have received the fulfilment, withdrawal, return and complaint terms.

An explicit acceptance received by the seller can establish agreement under VÕS
§9; this is a proposed standard, **not a retroactive finding about any order**.
Do not use payment alone as a replacement for providing pre-contract information.

## Official law verified

Read the current Estonian text in Riigi Teataja, effective 1 September–31 December
2026, and the enacted amending act, not merely a draft or an older English PDF.

- [VÕS current text](https://www.riigiteataja.ee/et/akt/V%C3%95S): §§9, 54–56⁴,
  62, 209, 218–223. Distance-contract withdrawal is normally 14 days from receipt
  of goods; the period can extend where mandatory information was not supplied.
  Standard size/colour selection and preorder sourcing alone are not the
  made-to-specification exception. Do not apply an exception without facts.
- [Enacted amendment RT I, 27.05.2026, 2](https://www.riigiteataja.ee/et/akt/127052026002):
  §1 introduces VÕS §56⁴; §3 expressly commences on **1 September 2026**.
  This is not limited to financial-services contracts.
- [Directive (EU) 2023/2673](https://eur-lex.europa.eu/eli/dir/2023/2673/oj/eng):
  Article 11a / recital 37 address the online withdrawal function. EU application
  date and Estonia's enacted national commencement must not be conflated.
- [TTJA business e-commerce guidance](https://ttja.ee/en/business-client/entrepreneurship/consumer-protection-requirements/e-commerce):
  refunds, disclosed direct return costs, diminished value and statutory exceptions.
- [TTJA consumer e-commerce guidance](https://ttja.ee/en/private-client/consumer-rights/trade-services/e-commerce):
  pre-contract information, withdrawal and non-conformity protections. Do not copy
  its obsolete reference to the closed EU ODR platform.
- [TTJA claims guidance](https://www.ttja.ee/eraklient/tarbija-oigused/tarbija-oigused-ja-kohustused/kaebuse-esitamine):
  written claim, two-year liability, notice within two months of discovery,
  complaint response within 15 days.

Withdrawal: notice within the statutory period; goods back within 14 days after
notice unless collected. Reimburse without undue delay, no later than 14 days
after notice, including standard outbound delivery, subject to lawful withholding
until goods/proof of dispatch unless the seller collects. Same payment method
unless expressly agreed otherwise without consumer cost. Direct return costs
require advance disclosure. Ordinary inspection is allowed; substantiated
diminished value may be recoverable for excessive handling if legal conditions
and information duties are met. Packaging opening alone is not a blanket bar.

Defect claims are not change-of-mind returns: necessary remedy costs are the
seller's; repair/replacement are subject to proportionality and other statutory
conditions, with reduction/withdrawal where their legal conditions are met.
There is no mandatory “exchange only” or automatically non-refundable advance.
Delivery delay ordinarily involves an additional period, with statutory cases
permitting immediate withdrawal. Supplier/carrier problems do not transfer the
seller's obligations to the customer. No guaranteed ETA has been introduced.

## Online withdrawal function — release gate and reuse plan

**BLOCKED for public release, not declared exempt.** Actual sales can be agreed
through online messaging; “no card checkout” or “just a form” is not a sufficient
exemption. The owner has not defined the seller or standardized formation. Obtain
legal confirmation for the actual website/Instagram/Telegram/email contract flow.

Existing implementation was inspected read-only on
`origin/codex/legal-seller-protection` (separate worktree); it is not in the
accepted production baseline. Reuse its localized `/[locale]/withdrawal` form,
server action, durable statement storage and existing Resend sender/owner inbox.
Do not duplicate it or merge that old branch wholesale.

Smallest next release, after the gate is resolved:

1. Expose a clearly labelled “Taganen lepingust” / localized equivalent, easily
   and continuously accessible during the withdrawal period. Provide its location
   in the pre-contract information and retained confirmation for online contracts.
2. Name, contract-identifying details, electronic acknowledgement destination;
   no account, secure-order-token requirement or public order lookup. A declaration
   must be recorded even when a supplied reference cannot be matched automatically.
3. Explicit second “Kinnitan taganemise” / equivalent confirmation; durable,
   immediate acknowledgement with statement content and transmission date/time.
4. Persist once using the existing legal-branch WithdrawalRequest design, notify
   owner and customer through Resend, handle delivery failures/retries safely.
   Revalidate request-key binding, concurrent idempotency, payload limits and abuse
   limits when adapting it; previous staging evidence is not a new release approval.
5. The live schema has no neutral declaration store. Existing order status/history
   or reviews tables are not suitable substitutes: they require an order or have
   unrelated semantics. Existing email infrastructure can be reused, but email
   alone is not proof of durable independent storage/reliable acknowledgement.
   Prefer reusing the already designed minimal table, not a second new table.
6. No automatic order cancellation, refund, payment change, logistics change,
   historical terms update or CRM module. Separate the old branch's size-chart
   data correction and request snapshot work from any narrowly approved migration.
7. Stage with non-production declaration data; verify storage, email delivery,
   no duplicates/PII disclosure and unchanged business hashes before approval.

No migration or withdrawal submission/email was executed in this task. Do not
claim the email statement instructions are themselves a completed §56⁴ function.

## Owner-only inputs still needed

1. Actual current contracting seller (natural person/entity as applicable),
   geographical service/complaints address, return destination and actual applicable
   registration/VAT details (if any). A future unregistered company is not the seller.
2. Approve the complete written offer/acceptance standard, durable copy channel,
   delivery/advance/balance terms and pre-disclosed return-cost allocation; have
   the contract-channel / §56⁴ applicability reviewed and release the reused function
   if applicable. Do not delay mandatory duties merely because standardization is pending.
3. Only if a real customer case is wanted: specific separate publication permission
   and redacted evidence. Not needed to keep the existing consented review visible.

## Supplier documentation — deferred, no catalog edits

For each exact model/variant: verifiable supplier identity and purchase/source
chain, product identifiers and authenticity evidence; legible sewn-in composition,
lining/fill/care/origin labels; documented material/fill/technical claims only
where supported; exact size-chart labels/units and fit evidence; permission to use
photos. Do not infer authenticity from branding, price, photographs or delivery.
Do not publish fill power, temperature, composition or origin without evidence.

## Release evidence

Record final SHA, CI, exact staging/production IDs and visual checks in the final
handoff. Legal seller identity/function remain blocked independently of any green
technical checks. Public copy contains no unfinished seller placeholders. No real
orders, payments, reviews or logistics events are to be created during verification.
