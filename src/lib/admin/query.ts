import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { calculateFinancials } from "@/lib/orders/financials";
import { buildAdvertisingRows } from "@/lib/measurement/reporting";

import { businessOrderWhere, isInternalTestOrder } from "./test-orders";

export async function getAdminOverview() {
  await requireOwner();
  const prisma = getPrisma();
  const [groups, overdue] = await Promise.all([
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: businessOrderWhere,
    }),
    prisma.order.count({
      where: {
        ...businessOrderWhere,
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
  source?: string;
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
      attribution: {
        select: {
          touches: {
            orderBy: { occurredAt: "desc" },
            select: {
              campaignName: true,
              source: true,
              sourceGroup: true,
              touchType: true,
            },
          },
        },
      },
      confirmedTotalMinor: true,
      currency: true,
      customer: { select: { name: true } },
      displayNumber: true,
      id: true,
      items: { select: { productNameSnapshot: true }, take: 1 },
      nextActionAt: true,
      notification: { select: { status: true } },
      orderDate: true,
      payments: { select: { amountMinor: true, kind: true } },
      status: true,
    },
    take: 200,
    where,
  });
  return orders
    .map((order) => ({
      ...order,
      ...calculateFinancials(order.confirmedTotalMinor, order.payments),
      isTest: isInternalTestOrder(order.displayNumber),
      source:
        order.attribution?.touches.find(
          (touch) => touch.touchType === "LAST",
        ) ??
        order.attribution?.touches.find(
          (touch) => touch.touchType === "FIRST",
        ) ??
        null,
    }))
    .filter(
      (order) => !filters.source || order.source?.source === filters.source,
    );
}

export async function getAdminOrder(id: string) {
  await requireOwner();
  const order = await getPrisma().order.findUnique({
    include: {
      customer: true,
      attribution: {
        include: { touches: { orderBy: { occurredAt: "asc" } } },
      },
      businessEvents: { orderBy: { occurredAt: "asc" } },
      items: true,
      notification: true,
      payments: { orderBy: { receivedAt: "desc" } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
    where: { id },
  });
  return order
    ? {
        ...order,
        ...calculateFinancials(order.confirmedTotalMinor, order.payments),
        isTest: isInternalTestOrder(order.displayNumber),
      }
    : null;
}

export async function getAdvertisingReport(input: { from: Date; to: Date }) {
  await requireOwner();
  const prisma = getPrisma();
  const [orders, spend] = await Promise.all([
    prisma.order.findMany({
      select: {
        attribution: {
          select: {
            touches: {
              select: {
                campaignName: true,
                source: true,
                sourceGroup: true,
                touchType: true,
              },
            },
          },
        },
        businessEvents: {
          select: {
            amountMinor: true,
            eventKey: true,
            eventType: true,
            occurredAt: true,
          },
          where: { occurredAt: { gte: input.from, lt: input.to } },
        },
        displayNumber: true,
        orderDate: true,
        status: true,
      },
      where: {
        ...businessOrderWhere,
        OR: [
          { orderDate: { gte: input.from, lt: input.to } },
          {
            businessEvents: {
              some: { occurredAt: { gte: input.from, lt: input.to } },
            },
          },
        ],
      },
    }),
    prisma.adSpend.findMany({
      select: {
        campaignName: true,
        date: true,
        source: true,
        spendMinor: true,
      },
      where: { date: { gte: input.from, lt: input.to } },
    }),
  ]);
  return buildAdvertisingRows({
    from: input.from,
    orders: orders.map((order) => {
      const touch =
        order.attribution?.touches.find((item) => item.touchType === "LAST") ??
        order.attribution?.touches.find((item) => item.touchType === "FIRST") ??
        null;
      return {
        displayNumber: order.displayNumber,
        events: order.businessEvents,
        orderDate: order.orderDate,
        status: order.status,
        touch,
      };
    }),
    spend,
    to: input.to,
  });
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
      retailPriceMinor: true,
      sizeChart: { select: { isPublished: true, reviewStatus: true } },
      slug: true,
      translations: { select: { locale: true, name: true } },
    },
    take: 200,
  });
  return products.map((product) => ({
    ...product,
    contentComplete: product._count.translations === 3 && Boolean(product.slug),
    imageReady: product._count.images > 0,
    sizeReady: Boolean(
      product.sizeChart?.reviewStatus === "APPROVED" &&
      product.sizeChart.isPublished,
    ),
  }));
}
