import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { calculateFinancials } from "@/lib/orders/financials";

export async function getAdminOverview() {
  await requireOwner();
  const prisma = getPrisma();
  const [groups, overdue, productsForReview] = await Promise.all([
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.count({
      where: {
        nextActionAt: { lt: new Date() },
        status: { notIn: ["DELIVERED", "CANCELLED"] },
      },
    }),
    prisma.product.count({ where: { publicationStatus: "READY" } }),
  ]);
  return {
    counts: Object.fromEntries(
      groups.map((group) => [group.status, group._count._all]),
    ),
    overdue,
    productsForReview,
  };
}

export async function getAdminOrders(filters: {
  attention?: string;
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
    ...(filters.attention === "overdue"
      ? {
          nextActionAt: { lt: new Date() },
          status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
        }
      : {}),
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
      items: {
        select: {
          colorSnapshot: true,
          productNameSnapshot: true,
          sizeSnapshot: true,
        },
        take: 1,
      },
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
      auditEvents: {
        include: { changedByAdmin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
      customer: true,
      items: {
        include: {
          product: {
            select: {
              images: {
                select: { url: true },
                take: 1,
                where: {
                  approvedAt: { not: null },
                  reviewStatus: "APPROVED",
                  role: "PRIMARY",
                },
              },
            },
          },
        },
      },
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

export async function getAdminCatalog(filters?: {
  q?: string;
  state?: string;
}) {
  await requireOwner();
  const query = filters?.q?.trim();
  const products = await getPrisma().product.findMany({
    orderBy: [{ publicationStatus: "asc" }, { internalCode: "asc" }],
    select: {
      _count: {
        select: {
          colors: true,
          images: {
            where: { approvedAt: { not: null }, reviewStatus: "APPROVED" },
          },
          translations: true,
          variants: { where: { isEnabled: true } },
        },
      },
      availabilityType: true,
      category: {
        select: {
          slug: true,
          translations: { select: { locale: true, name: true } },
        },
      },
      currency: true,
      id: true,
      images: {
        select: { url: true },
        take: 1,
        where: {
          approvedAt: { not: null },
          reviewStatus: "APPROVED",
          role: "PRIMARY",
        },
      },
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
          categoryDecision: true,
          commercialDecision: true,
          contentDecision: true,
          identityDecision: true,
          imageDecision: true,
          optionsDecision: true,
          ownerPublicationApproved: true,
          sizeDecision: true,
          visualDecision: true,
        },
      },
      retailPriceMinor: true,
      sizeChart: { select: { isPublished: true, reviewStatus: true } },
      slug: true,
      translations: { select: { locale: true, name: true } },
    },
    take: 200,
    where: query
      ? {
          OR: [
            { internalCode: { contains: query, mode: "insensitive" } },
            {
              translations: {
                some: { name: { contains: query, mode: "insensitive" } },
              },
            },
            {
              privateData: {
                supplierProductCode: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
        }
      : undefined,
  });
  const mapped = products.map((product) => {
    const contentComplete = product._count.translations === 3;
    const imageReady = product._count.images > 0;
    const optionsReady =
      product._count.colors > 0 && product._count.variants > 0;
    const commercialReady = Boolean(
      product.availabilityType && product.currency && product.retailPriceMinor,
    );
    const identityReady = Boolean(
      product.review?.identityDecision === "APPROVED" &&
      product.review.categoryDecision === "APPROVED",
    );
    const ownerApproved = product.review?.ownerPublicationApproved === true;
    const completedGates = [
      identityReady,
      commercialReady,
      optionsReady,
      contentComplete,
      imageReady,
      ownerApproved,
    ].filter(Boolean).length;
    return {
      ...product,
      blockingIssues: product.review?.blockingIssues,
      commercialReady,
      completedGates,
      contentComplete,
      identityReady,
      imageReady,
      optionsReady,
      ownerApproved,
      sizeReady: Boolean(
        product.sizeChart?.reviewStatus === "APPROVED" &&
        product.sizeChart.isPublished,
      ),
    };
  });

  return mapped.filter((product) => {
    switch (filters?.state) {
      case "incomplete":
        return product.completedGates < 5;
      case "review":
        return product.publicationStatus === "READY";
      case "ready":
        return product.completedGates === 6;
      case "published":
        return product.publicationStatus === "PUBLISHED";
      default:
        return true;
    }
  });
}
