import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { calculateFinancials } from "@/lib/orders/financials";

export async function getAdminOverview() {
  await requireOwner();
  const prisma = getPrisma();
  const [groups, overdue] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count({
      where: {
        nextActionAt: { lt: new Date() },
        status: { notIn: ["DELIVERED", "CANCELLED"] },
      },
    }),
  ]);
  return {
    counts: Object.fromEntries(
      groups.map((group) => [group.status, group._count._all]),
    ),
    overdue,
  };
}

export async function getAdminOrders(filters: {
  query?: string;
  status?: string;
}) {
  await requireOwner();
  const status = Object.values(OrderStatus).includes(
    filters.status as OrderStatus,
  )
    ? (filters.status as OrderStatus)
    : undefined;
  const query = filters.query?.trim();
  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(query
      ? {
          OR: [
            { displayNumber: { contains: query, mode: "insensitive" } },
            { customer: { name: { contains: query, mode: "insensitive" } } },
            {
              items: {
                some: {
                  productNameSnapshot: { contains: query, mode: "insensitive" },
                },
              },
            },
          ],
        }
      : {}),
  };
  const orders = await getPrisma().order.findMany({
    orderBy: { orderDate: "desc" },
    select: {
      acquisitionChannel: true,
      confirmedTotalMinor: true,
      currency: true,
      customer: { select: { name: true } },
      displayNumber: true,
      id: true,
      items: { select: { productNameSnapshot: true }, take: 1 },
      nextActionAt: true,
      orderDate: true,
      payments: { select: { amountMinor: true, kind: true } },
      status: true,
    },
    take: 200,
    where,
  });
  return orders.map((order) => ({
    ...order,
    ...calculateFinancials(order.confirmedTotalMinor, order.payments),
  }));
}

export async function getAdminOrder(id: string) {
  await requireOwner();
  const order = await getPrisma().order.findUnique({
    include: {
      customer: true,
      items: true,
      payments: { orderBy: { receivedAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
    where: { id },
  });
  return order
    ? {
        ...order,
        ...calculateFinancials(order.confirmedTotalMinor, order.payments),
      }
    : null;
}

export async function getAdminCatalog() {
  await requireOwner();
  const products = await getPrisma().product.findMany({
    orderBy: [{ publicationStatus: "asc" }, { internalCode: "asc" }],
    select: {
      _count: {
        select: {
          images: {
            where: { approvedAt: { not: null }, reviewStatus: "APPROVED" },
          },
          translations: true,
        },
      },
      availabilityType: true,
      currency: true,
      id: true,
      internalCode: true,
      privateData: {
        select: {
          sourceReviewStatus: true,
          supplierAlbumUrl: true,
          supplierName: true,
        },
      },
      publicationStatus: true,
      review: {
        select: {
          blockingIssues: true,
          ownerPublicationApproved: true,
        },
      },
      retailPriceMinor: true,
      sizeChart: { select: { isPublished: true, reviewStatus: true } },
      slug: true,
      translations: { select: { locale: true, name: true } },
    },
    take: 200,
  });
  return products.map((product) => ({
    ...product,
    contentComplete: product._count.translations === 3,
    imageReady: product._count.images > 0,
    ownerApproved: product.review?.ownerPublicationApproved === true,
    blockingIssues: product.review?.blockingIssues,
    sizeReady: Boolean(
      product.sizeChart?.reviewStatus === "APPROVED" &&
      product.sizeChart.isPublished,
    ),
  }));
}
