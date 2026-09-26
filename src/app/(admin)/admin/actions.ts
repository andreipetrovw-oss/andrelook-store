"use server";

import { OrderStatus, PaymentKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/server";
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

async function adminId() {
  const identity = await requireOwner();
  const admin = await getPrisma().adminUser.upsert({
    create: {
      email: identity.email,
      provider: identity.provider,
      providerSubject: identity.providerSubject,
    },
    update: { email: identity.email, isActive: true },
    where: {
      provider_providerSubject: {
        provider: identity.provider,
        providerSubject: identity.providerSubject,
      },
    },
  });
  return admin.id;
}

export async function updateOrderStatus(formData: FormData) {
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid status update.");
  const changedByAdminId = await adminId();
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
  if (!parsed.success) throw new Error("Invalid payment.");
  const recordedByAdminId = await adminId();
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
