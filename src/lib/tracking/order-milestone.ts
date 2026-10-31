import "server-only";

import { OrderTrackingMilestoneKind, Prisma } from "@prisma/client";
import { z } from "zod";

import { getPrisma } from "@/lib/db";
import { parseTallinnLocalDateTime } from "./time";

const schema = z.object({
  evidenceNote: z.string().trim().min(3).max(500),
  evidenceSource: z.enum([
    "OWNER_CONFIRMED",
    "WAREHOUSE_CONFIRMED",
    "MANUAL_OVERRIDE",
  ]),
  kind: z.enum(OrderTrackingMilestoneKind),
  occurredAt: z.string().trim().min(1).max(30),
  orderId: z.string().min(1).max(100),
});

export function parseOrderMilestone(formData: FormData, now = new Date()) {
  const fields = Object.keys(schema.shape);
  if (fields.some((field) => formData.getAll(field).length !== 1)) {
    return { error: "Проверьте заполнение всех полей события." } as const;
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const messages: Record<string, string> = {
      evidenceNote:
        "Укажите основание: от 3 до 500 символов, не только пробелы.",
      evidenceSource: "Выберите допустимый источник подтверждения.",
      kind: "Выберите событие из списка.",
      occurredAt: "Укажите реальную дату и время события по Таллинну.",
      orderId: "Не удалось определить заказ. Обновите страницу.",
    };
    return {
      error: messages[String(field)] ?? "Проверьте данные события.",
    } as const;
  }
  const occurredAt = parseTallinnLocalDateTime(parsed.data.occurredAt);
  if (!occurredAt || occurredAt > now) {
    return {
      error: "Укажите корректную дату и время по Таллинну, не в будущем.",
    } as const;
  }
  return { data: { ...parsed.data, occurredAt }, error: null } as const;
}

export async function saveOrderMilestone(
  input: Omit<z.infer<typeof schema>, "occurredAt"> & { occurredAt: Date },
  createdByAdminId: string,
) {
  return getPrisma().$transaction(async (tx) => {
    // Serialize retries for this order without a schema change. The event is
    // independent of Shipment/provider identifiers, including pre-dispatch work.
    const orders = await tx.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`SELECT "id" FROM "Order" WHERE "id" = ${input.orderId} FOR UPDATE`,
    );
    if (!orders.length) throw new Error("Order unavailable.");
    const existing = await tx.orderTrackingMilestone.findFirst({
      select: { id: true },
      where: {
        kind: input.kind,
        occurredAt: input.occurredAt,
        orderId: input.orderId,
      },
    });
    if (existing) return false;
    await tx.orderTrackingMilestone.create({
      data: {
        ...input,
        createdByAdminId,
        customerVisible: input.kind !== "PAYMENT_RECEIVED",
      },
    });
    if (input.kind === "ORDER_CONFIRMED") {
      await tx.order.update({
        data: { confirmedAt: input.occurredAt },
        where: { id: input.orderId },
      });
    }
    return true;
  });
}
