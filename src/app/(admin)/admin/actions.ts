"use server";

import { OrderStatus, PaymentKind, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireActiveAdmin } from "@/lib/admin/identity";
import {
  parseDateInput,
  parseOwnerDateTimeInput,
} from "@/lib/admin/date-input";
import { getPrisma } from "@/lib/db";

const statusSchema = z.object({
  note: z.string().trim().max(500).optional(),
  orderId: z.string().min(1),
  status: z.enum(OrderStatus),
});

const paymentSchema = z.object({
  amount: z.coerce.number().positive().max(1_000_000),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase()),
  kind: z.enum(PaymentKind),
  orderId: z.string().min(1),
  reference: z.string().trim().max(200).optional(),
});

const optionalText = (maximum: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim() === "" ? null : value,
    z.string().trim().max(maximum).nullable(),
  );

const operationsSchema = z
  .object({
    cancelledReason: optionalText(500),
    confirmedTotal: z.preprocess(
      (value) =>
        typeof value === "string" && value.trim() === "" ? null : value,
      z.coerce.number().positive().max(1_000_000).nullable(),
    ),
    currency: optionalText(3).transform(
      (value) => value?.toUpperCase() ?? null,
    ),
    etaDate: optionalText(10),
    etaText: optionalText(200),
    internalNotes: optionalText(2_000),
    nextActionAt: optionalText(16),
    orderId: z.string().min(1),
    supplierOrderedAt: optionalText(10),
    trackingReference: optionalText(200),
  })
  .refine(
    (value) =>
      value.confirmedTotal === null || /^[A-Z]{3}$/.test(value.currency ?? ""),
    { message: "Укажите валюту из трёх букв для подтверждённой суммы." },
  );

export async function updateOrderStatus(formData: FormData) {
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Не удалось проверить новый статус.");
  const changedByAdminId = (await requireActiveAdmin()).id;
  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      select: { status: true },
      where: { id: parsed.data.orderId },
    });
    if (order.status === parsed.data.status) return;
    await tx.order.update({
      data: {
        status: parsed.data.status,
        statusHistory: {
          create: {
            changedByAdminId,
            fromStatus: order.status,
            note: parsed.data.note || null,
            toStatus: parsed.data.status,
          },
        },
      },
      where: { id: parsed.data.orderId },
    });
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function recordPayment(formData: FormData) {
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Проверьте данные оплаты.");
  const recordedByAdminId = (await requireActiveAdmin()).id;
  await getPrisma().payment.create({
    data: {
      amountMinor: Math.round(parsed.data.amount * 100),
      currency: parsed.data.currency,
      kind: parsed.data.kind,
      orderId: parsed.data.orderId,
      receivedAt: new Date(),
      recordedByAdminId,
      reference: parsed.data.reference || null,
    },
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderOperations(formData: FormData) {
  const parsed = operationsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ?? "Проверьте данные заказа.",
    );
  }

  const changedByAdminId = (await requireActiveAdmin()).id;
  const nextActionAt = parseOwnerDateTimeInput(parsed.data.nextActionAt);
  const supplierOrderedAt = parseDateInput(parsed.data.supplierOrderedAt);
  const etaDate = parseDateInput(parsed.data.etaDate);
  const after = {
    cancelledReason: parsed.data.cancelledReason,
    confirmedTotalMinor:
      parsed.data.confirmedTotal === null
        ? null
        : Math.round(parsed.data.confirmedTotal * 100),
    currency: parsed.data.confirmedTotal === null ? null : parsed.data.currency,
    etaDate: etaDate?.toISOString() ?? null,
    etaText: parsed.data.etaText,
    internalNotes: parsed.data.internalNotes,
    nextActionAt: nextActionAt?.toISOString() ?? null,
    supplierOrderedAt: supplierOrderedAt?.toISOString() ?? null,
    trackingReference: parsed.data.trackingReference,
  } satisfies Prisma.JsonObject;

  const prisma = getPrisma();
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUniqueOrThrow({
      select: {
        cancelledReason: true,
        confirmedTotalMinor: true,
        currency: true,
        etaDate: true,
        etaText: true,
        internalNotes: true,
        nextActionAt: true,
        supplierOrderedAt: true,
        trackingReference: true,
      },
      where: { id: parsed.data.orderId },
    });
    const before = {
      ...order,
      etaDate: order.etaDate?.toISOString() ?? null,
      nextActionAt: order.nextActionAt?.toISOString() ?? null,
      supplierOrderedAt: order.supplierOrderedAt?.toISOString() ?? null,
    } satisfies Prisma.JsonObject;
    if (JSON.stringify(before) === JSON.stringify(after)) return;

    await tx.order.update({
      data: {
        ...after,
        etaDate,
        nextActionAt,
        supplierOrderedAt,
      },
      where: { id: parsed.data.orderId },
    });
    await tx.orderAuditEvent.create({
      data: {
        action: "OPERATIONAL_FIELDS_UPDATED",
        afterState: after,
        beforeState: before,
        changedByAdminId,
        note: "Обновлены рабочие данные заказа.",
        orderId: parsed.data.orderId,
      },
    });
  });

  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
