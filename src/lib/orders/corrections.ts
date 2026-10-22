import "server-only";

import {
  DeliveryMode,
  FulfilmentMethod,
  OrderStatus,
  PaymentKind,
  Prisma,
} from "@prisma/client";

import { getPrisma } from "@/lib/db";

import {
  calculateFinancials,
  effectiveTotalMinor,
  itemSnapshotTotalMinor,
  recalculatedCommercialStatus,
} from "./financials";

const editableStatuses = new Set<OrderStatus>([
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "AWAITING_PAYMENT",
  "PAID",
  "ORDERED",
  "IN_TRANSIT",
  "READY",
]);

type AuditValue = string | number | boolean | null;

function jsonValue(value: AuditValue) {
  return value === null ? Prisma.JsonNull : value;
}

async function audit(
  tx: Prisma.TransactionClient,
  input: {
    actorId: string;
    field: string;
    next: AuditValue;
    orderId: string;
    previous: AuditValue;
  },
) {
  if (input.previous === input.next) return;
  await tx.orderCorrectionHistory.create({
    data: {
      changedByAdminId: input.actorId,
      changedField: input.field,
      newValue: jsonValue(input.next),
      orderId: input.orderId,
      previousValue: jsonValue(input.previous),
    },
  });
}

function assertEditable(status: OrderStatus) {
  if (!editableStatuses.has(status)) {
    throw new Error("This order state is not editable.");
  }
}

export class FinancialCorrectionError extends Error {}

function assertFinanciallyEditable(status: OrderStatus) {
  if (status !== "DELIVERED" && !editableStatuses.has(status)) {
    throw new FinancialCorrectionError("This order state is not editable.");
  }
}

// Ledger validation, idempotency and writes must see one consistent balance.
// Retry a serialization conflict rather than allow two concurrent overpayments.
async function financialTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getPrisma().$transaction(callback, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034"
      ) {
        if (attempt < 2) continue;
        throw new FinancialCorrectionError("Payment changed. Please retry.");
      }
      throw error;
    }
  }
}

async function validatePayment(
  tx: Prisma.TransactionClient,
  input: {
    amountMinor: number;
    currency: string;
    kind: PaymentKind;
    orderId: string;
    paymentId?: string;
    processorFeeMinor: number | null;
  },
) {
  if (
    !Number.isSafeInteger(input.amountMinor) ||
    input.amountMinor <= 0 ||
    input.amountMinor > 100_000_000 ||
    (input.processorFeeMinor !== null &&
      (!Number.isSafeInteger(input.processorFeeMinor) ||
        input.processorFeeMinor < 0 ||
        input.processorFeeMinor > input.amountMinor))
  ) {
    throw new FinancialCorrectionError("Invalid payment amount or fee.");
  }
  const order = await tx.order.findUniqueOrThrow({
    where: { id: input.orderId },
    select: {
      status: true,
      currency: true,
      agreedTotalMinor: true,
      confirmedTotalMinor: true,
      items: { select: { quantity: true, unitPriceMinor: true } },
      payments: {
        where: {
          status: "ACTIVE",
          ...(input.paymentId ? { id: { not: input.paymentId } } : {}),
        },
        select: { amountMinor: true, kind: true, status: true, currency: true },
      },
    },
  });
  assertFinanciallyEditable(order.status);
  if (
    input.currency !== order.currency ||
    order.payments.some((payment) => payment.currency !== order.currency)
  ) {
    throw new FinancialCorrectionError(
      "Payment currency must match the order.",
    );
  }
  const total = effectiveTotalMinor({
    agreedTotalMinor: order.agreedTotalMinor,
    confirmedTotalMinor: order.confirmedTotalMinor,
    itemTotalMinor: itemSnapshotTotalMinor(order.items),
  });
  const { paidMinor } = calculateFinancials(total, [
    ...order.payments,
    { amountMinor: input.amountMinor, kind: input.kind },
  ]);
  if (paidMinor < 0 || (total !== null && paidMinor > total)) {
    throw new FinancialCorrectionError(
      "Payment exceeds the available balance.",
    );
  }
}

async function recalculateFinancialState(
  tx: Prisma.TransactionClient,
  orderId: string,
  actorId: string,
) {
  const order = await tx.order.findUniqueOrThrow({
    select: {
      agreedTotalMinor: true,
      confirmedTotalMinor: true,
      currency: true,
      items: { select: { quantity: true, unitPriceMinor: true } },
      paymentPreference: true,
      payments: {
        select: { amountMinor: true, kind: true, status: true },
        where: { status: "ACTIVE" },
      },
      status: true,
    },
    where: { id: orderId },
  });
  const effectiveTotal = effectiveTotalMinor({
    agreedTotalMinor: order.agreedTotalMinor,
    confirmedTotalMinor: order.confirmedTotalMinor,
    itemTotalMinor: itemSnapshotTotalMinor(order.items),
  });
  const { paidMinor } = calculateFinancials(effectiveTotal, order.payments);
  const isFullyPaid =
    effectiveTotal !== null &&
    effectiveTotal > 0 &&
    paidMinor >= effectiveTotal;
  const nextStatus = recalculatedCommercialStatus({
    currentStatus: order.status,
    effectiveTotalMinor: effectiveTotal,
    paidMinor,
    paymentPreference: order.paymentPreference,
  });
  if (nextStatus !== order.status) {
    await tx.order.update({
      data: {
        status: nextStatus,
        statusHistory: {
          create: {
            changedByAdminId: actorId,
            fromStatus: order.status,
            note: "Автоматический пересчёт после финансовой корректировки",
            toStatus: nextStatus,
          },
        },
      },
      where: { id: orderId },
    });
    await audit(tx, {
      actorId,
      field: "financial_status",
      next: nextStatus,
      orderId,
      previous: order.status,
    });
  }
  if (isFullyPaid) {
    await tx.orderBusinessEvent.upsert({
      create: {
        amountMinor: effectiveTotal,
        currency: order.currency,
        eventKey: `paid:${orderId}`,
        eventType: "PAID",
        isActive: true,
        orderId,
      },
      update: {
        amountMinor: effectiveTotal,
        currency: order.currency,
        isActive: true,
      },
      where: { eventKey: `paid:${orderId}` },
    });
  } else {
    await tx.orderBusinessEvent.updateMany({
      data: { isActive: false },
      where: { eventKey: `paid:${orderId}`, isActive: true },
    });
  }
  return { effectiveTotal, nextStatus, paidMinor };
}

export async function correctOrderDetails(input: {
  actorId: string;
  customerNotes: string | null;
  deliveryMode: DeliveryMode | null;
  fulfilmentMethod: FulfilmentMethod | null;
  internalNotes: string | null;
  orderId: string;
}) {
  return getPrisma().$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      select: {
        customerNotes: true,
        deliveryMode: true,
        fulfilmentMethod: true,
        internalNotes: true,
        shipmentLinks: { select: { id: true }, take: 1 },
        status: true,
      },
      where: { id: input.orderId },
    });
    assertEditable(order.status);
    const changes = [
      ["customer_notes", order.customerNotes, input.customerNotes],
      ["owner_notes", order.internalNotes, input.internalNotes],
      ["fulfilment", order.fulfilmentMethod, input.fulfilmentMethod],
      ["delivery_mode", order.deliveryMode, input.deliveryMode],
    ] as const;
    await tx.order.update({
      data: {
        customerNotes: input.customerNotes,
        deliveryMode: input.deliveryMode,
        fulfilmentMethod: input.fulfilmentMethod,
        internalNotes: input.internalNotes,
      },
      where: { id: input.orderId },
    });
    for (const [field, previous, next] of changes) {
      await audit(tx, {
        actorId: input.actorId,
        field,
        next,
        orderId: input.orderId,
        previous,
      });
    }
    return { shipmentLinked: order.shipmentLinks.length > 0 };
  });
}

export async function correctOrderItem(input: {
  actorId: string;
  color: string | null;
  itemId: string;
  measurementsNote: string | null;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  size: string | null;
}) {
  return getPrisma().$transaction(async (tx) => {
    const item = await tx.orderItem.findFirstOrThrow({
      select: {
        colorSnapshot: true,
        measurementsNote: true,
        order: {
          select: {
            shipmentLinks: { select: { id: true }, take: 1 },
            status: true,
          },
        },
        productId: true,
        productNameSnapshot: true,
        quantity: true,
        sizeSnapshot: true,
      },
      where: { id: input.itemId, orderId: input.orderId },
    });
    assertEditable(item.order.status);
    const product = await tx.product.findUniqueOrThrow({
      select: {
        availabilityType: true,
        internalCode: true,
        slug: true,
      },
      where: { id: input.productId },
    });
    await tx.orderItem.update({
      data: {
        availabilityTypeSnapshot: product.availabilityType,
        colorSnapshot: input.color,
        measurementsNote: input.measurementsNote,
        productId: input.productId,
        productInternalCodeSnapshot: product.internalCode,
        productNameSnapshot: input.productName,
        productSlugSnapshot: product.slug,
        quantity: input.quantity,
        sizeHelpRequested: false,
        sizeSnapshot: input.size,
      },
      where: { id: input.itemId },
    });
    const changes = [
      ["product", item.productId, input.productId],
      ["model", item.productNameSnapshot, input.productName],
      ["color", item.colorSnapshot, input.color],
      ["size", item.sizeSnapshot, input.size],
      ["quantity", item.quantity, input.quantity],
      ["customer_item_note", item.measurementsNote, input.measurementsNote],
    ] as const;
    for (const [field, previous, next] of changes) {
      await audit(tx, {
        actorId: input.actorId,
        field: `item.${input.itemId}.${field}`,
        next,
        orderId: input.orderId,
        previous,
      });
    }
    return { shipmentLinked: item.order.shipmentLinks.length > 0 };
  });
}

export async function correctAgreedPrice(input: {
  actorId: string;
  agreedTotalMinor: number | null;
  existingPaymentsAcknowledged: boolean;
  orderId: string;
}) {
  return financialTransaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      select: {
        agreedTotalMinor: true,
        confirmedTotalMinor: true,
        items: { select: { quantity: true, unitPriceMinor: true } },
        payments: {
          select: { id: true },
          where: { status: "ACTIVE" },
        },
        status: true,
      },
      where: { id: input.orderId },
    });
    assertFinanciallyEditable(order.status);
    if (order.payments.length && !input.existingPaymentsAcknowledged) {
      throw new Error("Confirm the price correction with existing payments.");
    }
    const previousEffective = effectiveTotalMinor({
      agreedTotalMinor: order.agreedTotalMinor,
      confirmedTotalMinor: order.confirmedTotalMinor,
      itemTotalMinor: itemSnapshotTotalMinor(order.items),
    });
    await tx.order.update({
      data: { agreedTotalMinor: input.agreedTotalMinor },
      where: { id: input.orderId },
    });
    const nextEffective = effectiveTotalMinor({
      agreedTotalMinor: input.agreedTotalMinor,
      confirmedTotalMinor: order.confirmedTotalMinor,
      itemTotalMinor: itemSnapshotTotalMinor(order.items),
    });
    await audit(tx, {
      actorId: input.actorId,
      field: "agreed_price",
      next: input.agreedTotalMinor,
      orderId: input.orderId,
      previous: order.agreedTotalMinor,
    });
    await audit(tx, {
      actorId: input.actorId,
      field: "effective_total",
      next: nextEffective,
      orderId: input.orderId,
      previous: previousEffective,
    });
    return recalculateFinancialState(tx, input.orderId, input.actorId);
  });
}

export async function addPaymentRecord(input: {
  actorId: string;
  amountMinor: number;
  currency: string;
  kind: PaymentKind;
  orderId: string;
  processorFeeMinor: number | null;
  reference: string | null;
  requestKey: string;
}) {
  if (!/^[0-9a-f-]{36}$/i.test(input.requestKey)) {
    throw new FinancialCorrectionError("Invalid payment request.");
  }
  return financialTransaction(async (tx) => {
    const replay = await tx.orderCorrectionHistory.findFirst({
      where: {
        orderId: input.orderId,
        changedField: `payment_request.${input.requestKey}`,
      },
      select: { newValue: true },
    });
    if (replay && typeof replay.newValue === "string") {
      const existing = await tx.payment.findUniqueOrThrow({
        where: { id: replay.newValue },
      });
      if (
        existing.amountMinor !== input.amountMinor ||
        existing.currency !== input.currency ||
        existing.kind !== input.kind ||
        existing.processorFeeMinor !== input.processorFeeMinor ||
        existing.reference !== input.reference
      ) {
        throw new FinancialCorrectionError(
          "Payment request already used. Reload the order.",
        );
      }
      return existing;
    }
    await validatePayment(tx, input);
    const payment = await tx.payment.create({
      data: {
        amountMinor: input.amountMinor,
        currency: input.currency,
        kind: input.kind,
        orderId: input.orderId,
        processorFeeMinor: input.processorFeeMinor,
        receivedAt: new Date(),
        recordedByAdminId: input.actorId,
        reference: input.reference,
      },
    });
    await audit(tx, {
      actorId: input.actorId,
      field: `payment_request.${input.requestKey}`,
      next: payment.id,
      orderId: input.orderId,
      previous: null,
    });
    await audit(tx, {
      actorId: input.actorId,
      field: `payment.${payment.id}.added`,
      next: input.amountMinor,
      orderId: input.orderId,
      previous: null,
    });
    await recalculateFinancialState(tx, input.orderId, input.actorId);
    return payment;
  });
}

export async function editPaymentRecord(input: {
  actorId: string;
  amountMinor: number;
  currency: string;
  kind: PaymentKind;
  orderId: string;
  paymentId: string;
  processorFeeMinor: number | null;
  reference: string | null;
}) {
  return financialTransaction(async (tx) => {
    const payment = await tx.payment.findFirstOrThrow({
      select: {
        amountMinor: true,
        currency: true,
        kind: true,
        order: { select: { status: true } },
        processorFeeMinor: true,
        reference: true,
      },
      where: {
        id: input.paymentId,
        orderId: input.orderId,
        status: "ACTIVE",
      },
    });
    assertFinanciallyEditable(payment.order.status);
    await validatePayment(tx, input);
    await tx.payment.update({
      data: {
        amountMinor: input.amountMinor,
        currency: input.currency,
        kind: input.kind,
        processorFeeMinor: input.processorFeeMinor,
        reference: input.reference,
      },
      where: { id: input.paymentId },
    });
    const changes = [
      ["amount", payment.amountMinor, input.amountMinor],
      ["kind", payment.kind, input.kind],
      ["currency", payment.currency, input.currency],
      ["processor_fee", payment.processorFeeMinor, input.processorFeeMinor],
      ["reference", payment.reference, input.reference],
    ] as const;
    for (const [field, previous, next] of changes) {
      await audit(tx, {
        actorId: input.actorId,
        field: `payment.${input.paymentId}.${field}`,
        next,
        orderId: input.orderId,
        previous,
      });
    }
    await recalculateFinancialState(tx, input.orderId, input.actorId);
  });
}

export async function voidPaymentRecord(input: {
  actorId: string;
  orderId: string;
  paymentId: string;
  reason: string;
}) {
  return financialTransaction(async (tx) => {
    const payment = await tx.payment.findFirstOrThrow({
      select: {
        amountMinor: true,
        order: { select: { status: true } },
        status: true,
      },
      where: {
        id: input.paymentId,
        orderId: input.orderId,
        status: "ACTIVE",
      },
    });
    assertFinanciallyEditable(payment.order.status);
    await tx.payment.update({
      data: {
        status: "VOIDED",
        voidedAt: new Date(),
        voidedByAdminId: input.actorId,
        voidReason: input.reason,
      },
      where: { id: input.paymentId },
    });
    await audit(tx, {
      actorId: input.actorId,
      field: `payment.${input.paymentId}.status`,
      next: "VOIDED",
      orderId: input.orderId,
      previous: payment.status,
    });
    await audit(tx, {
      actorId: input.actorId,
      field: `payment.${input.paymentId}.active_amount`,
      next: 0,
      orderId: input.orderId,
      previous: payment.amountMinor,
    });
    await recalculateFinancialState(tx, input.orderId, input.actorId);
  });
}
