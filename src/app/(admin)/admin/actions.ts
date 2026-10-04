"use server";

import {
  AvailabilityType,
  OrderStatus,
  PaymentKind,
  PublicationStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { sendNewOrderNotification } from "@/lib/notifications/order-notification";

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

const productCommercialSchema = z.object({
  availabilityType: z.union([z.enum(AvailabilityType), z.literal("")]),
  currency: z.string().trim().max(3),
  preorderEstimateText: z.string().trim().max(300),
  productId: z.string().min(1),
  publicationStatus: z.enum(PublicationStatus),
  retailPrice: z.string().trim().max(20),
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

export async function retryOrderNotification(formData: FormData) {
  await requireOwner();
  const orderId = z.string().min(1).parse(formData.get("orderId"));
  await sendNewOrderNotification(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateProductCommercialState(formData: FormData) {
  await requireOwner();
  const parsed = productCommercialSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) throw new Error("Invalid product commercial update.");
  const retailPrice = parsed.data.retailPrice
    ? Number.parseFloat(parsed.data.retailPrice.replace(",", "."))
    : null;
  if (
    retailPrice !== null &&
    (!Number.isFinite(retailPrice) || retailPrice < 0)
  ) {
    throw new Error("Retail price must be a positive number or empty.");
  }
  const currency = parsed.data.currency
    ? parsed.data.currency.toUpperCase()
    : null;
  if (currency && !/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Currency must be a three-letter ISO code.");
  }

  const prisma = getPrisma();
  const product = await prisma.product.findUniqueOrThrow({
    select: {
      _count: {
        select: {
          images: {
            where: {
              approvedAt: { not: null },
              reviewStatus: "APPROVED",
              role: "PRIMARY",
            },
          },
          translations: true,
        },
      },
      category: { select: { translations: true } },
      publicationStatus: true,
      slug: true,
    },
    where: { id: parsed.data.productId },
  });

  if (parsed.data.publicationStatus === "PUBLISHED") {
    const blockers = [
      !product.slug ? "storefront slug" : null,
      product._count.translations !== 3 ? "three product translations" : null,
      product.category?.translations.length !== 3
        ? "three category translations"
        : null,
      product._count.images === 0 ? "an approved primary image" : null,
      !parsed.data.availabilityType ? "availability" : null,
      retailPrice === null ? "retail price" : null,
      !currency ? "currency" : null,
    ].filter(Boolean);
    if (blockers.length) {
      throw new Error(`Publishing blocked: missing ${blockers.join(", ")}.`);
    }
  }

  await prisma.product.update({
    data: {
      availabilityType: parsed.data.availabilityType || null,
      currency,
      preorderEstimateText: parsed.data.preorderEstimateText || null,
      publicationStatus: parsed.data.publicationStatus,
      publishedAt:
        parsed.data.publicationStatus === "PUBLISHED"
          ? product.publicationStatus === "PUBLISHED"
            ? undefined
            : new Date()
          : null,
      retailPriceMinor:
        retailPrice === null ? null : Math.round(retailPrice * 100),
    },
    where: { id: parsed.data.productId },
  });

  revalidatePath(`/admin/catalog/${parsed.data.productId}`);
  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
}
