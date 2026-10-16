import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { decryptTrackingAccessCode } from "@/lib/tracking/security";
import { calculateFinancials } from "@/lib/orders/financials";
import {
  buildAdvertisingRows,
  buildLandingPerformance,
  buildProductPerformance,
} from "@/lib/measurement/reporting";
import {
  applyRateBps,
  calculateActualProfitability,
  calculatePlanningEconomics,
} from "@/lib/economics/calculation";

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
      shipmentLinks: {
        include: {
          shipment: {
            select: {
              id: true,
              kind: true,
              lastSuccessfulSyncAt: true,
              normalizedStatus: true,
              provider: true,
              providerSyncStatus: true,
              staleFlag: true,
            },
          },
        },
        orderBy: { sequence: "asc" },
      },
      statusHistory: { orderBy: { createdAt: "desc" } },
      trackingMilestones: {
        include: { createdByAdmin: { select: { email: true } } },
        orderBy: { occurredAt: "desc" },
      },
      trackingNotifications: { orderBy: { createdAt: "desc" } },
    },
    where: { id },
  });
  if (!order) return null;
  const {
    trackingAccessCodeEncrypted,
    trackingAccessCodeHash: _trackingAccessCodeHash,
    ...safeOrder
  } = order;
  void _trackingAccessCodeHash;
  return {
    ...safeOrder,
    trackingAccessCode: trackingAccessCodeEncrypted
      ? decryptTrackingAccessCode(trackingAccessCodeEncrypted)
      : null,
    ...calculateFinancials(order.confirmedTotalMinor, order.payments),
    isTest: isInternalTestOrder(order.displayNumber),
  };
}

export async function getAdvertisingReport(input: { from: Date; to: Date }) {
  await requireOwner();
  const prisma = getPrisma();
  const [orders, spend, analyticsEvents, metaStatus] = await Promise.all([
    prisma.order.findMany({
      select: {
        attribution: {
          select: {
            touches: {
              select: {
                adName: true,
                adSetName: true,
                campaignName: true,
                landingPage: true,
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
        items: {
          select: {
            paymentRateBpsSnapshot: true,
            productId: true,
            productNameSnapshot: true,
            quantity: true,
            unitLandedCostMinorSnapshot: true,
            unitPriceMinor: true,
          },
        },
        orderDate: true,
        payments: {
          select: { kind: true, processorFeeMinor: true },
        },
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
        adName: true,
        adSetName: true,
        campaignName: true,
        date: true,
        impressions: true,
        landingPageViews: true,
        linkClicks: true,
        outboundClicks: true,
        reach: true,
        source: true,
        spendMinor: true,
      },
      where: { date: { gte: input.from, lt: input.to } },
    }),
    prisma.analyticsEvent.findMany({
      orderBy: { occurredAt: "asc" },
      select: {
        adName: true,
        adSetName: true,
        campaignName: true,
        eventName: true,
        landingPage: true,
        occurredAt: true,
        product: {
          select: {
            internalCode: true,
            translations: {
              select: { name: true },
              take: 1,
              where: { locale: "RU" },
            },
          },
        },
        productId: true,
        sessionId: true,
        source: true,
      },
      where: { occurredAt: { gte: input.from, lt: input.to } },
    }),
    prisma.analyticsDataSourceStatus.findUnique({
      where: { source: "META_INSIGHTS" },
    }),
  ]);
  const reportingOrders = orders.map((order) => {
    const touch =
      order.attribution?.touches.find((item) => item.touchType === "LAST") ??
      order.attribution?.touches.find((item) => item.touchType === "FIRST") ??
      null;
    return {
      displayNumber: order.displayNumber,
      events: order.businessEvents,
      items: order.items.map((item) => ({
        ...item,
        productName: item.productNameSnapshot,
      })),
      orderDate: order.orderDate,
      payments: order.payments,
      status: order.status,
      touch,
    };
  });
  const reportingEvents = analyticsEvents.map((event) => ({
    ...event,
    eventName: event.eventName,
    productName:
      event.product?.translations[0]?.name ??
      event.product?.internalCode ??
      null,
  }));
  const rows = buildAdvertisingRows({
    events: reportingEvents,
    from: input.from,
    orders: reportingOrders,
    spend,
    to: input.to,
  });
  return {
    diagnostics: {
      generatedAt: new Date(),
      metaLastImportedRows: metaStatus?.lastImportedRows ?? null,
      metaLastSuccessAt: metaStatus?.lastSuccessAt ?? null,
      metaStatus: metaStatus?.status ?? "UNAVAILABLE",
    },
    landingRows: buildLandingPerformance({
      events: reportingEvents,
      from: input.from,
      orders: reportingOrders,
      to: input.to,
    }),
    productRows: buildProductPerformance({
      events: reportingEvents,
      from: input.from,
      orders: reportingOrders,
      to: input.to,
    }),
    rows,
  };
}

export async function getCampaignOperationLog() {
  await requireOwner();
  return getPrisma().campaignChangeLog.findMany({
    include: { campaign: { select: { source: true, utmCampaign: true } } },
    orderBy: [{ changedAt: "desc" }, { createdAt: "desc" }],
    take: 50,
  });
}

export async function getEconomicsProductOptions() {
  await requireOwner();
  return getPrisma().product.findMany({
    orderBy: { internalCode: "asc" },
    select: {
      id: true,
      internalCode: true,
      translations: {
        select: { name: true },
        take: 1,
        where: { locale: "EN" },
      },
    },
    where: { economicsVersions: { some: {} } },
  });
}

export async function getProfitabilityReport() {
  await requireOwner();
  const prisma = getPrisma();
  const now = new Date();
  const [products, orders, spend] = await Promise.all([
    prisma.product.findMany({
      orderBy: { internalCode: "asc" },
      select: {
        brand: { select: { displayName: true } },
        economicsVersions: {
          orderBy: [{ effectiveFrom: "desc" }, { version: "desc" }],
          take: 1,
          where: { effectiveFrom: { lte: now } },
        },
        id: true,
        internalCode: true,
        retailPriceMinor: true,
        translations: {
          select: { name: true },
          take: 1,
          where: { locale: "EN" },
        },
      },
      where: { economicsVersions: { some: { effectiveFrom: { lte: now } } } },
    }),
    prisma.order.findMany({
      select: {
        businessEvents: {
          select: { amountMinor: true, eventKey: true },
          where: { eventType: "PAID" },
        },
        id: true,
        items: {
          select: {
            paymentRateBpsSnapshot: true,
            productId: true,
            quantity: true,
            unitLandedCostMinorSnapshot: true,
            unitPriceMinor: true,
          },
        },
        payments: {
          select: { kind: true, processorFeeMinor: true },
        },
      },
      where: {
        ...businessOrderWhere,
        businessEvents: { some: { eventType: "PAID" } },
      },
    }),
    prisma.adSpend.findMany({
      select: { productId: true, spendMinor: true },
      where: { productId: { not: null } },
    }),
  ]);
  const spendByProduct = new Map<string, number>();
  for (const entry of spend) {
    if (!entry.productId) continue;
    spendByProduct.set(
      entry.productId,
      (spendByProduct.get(entry.productId) ?? 0) +
        Math.max(0, entry.spendMinor),
    );
  }

  return products.map((product) => {
    const economics = product.economicsVersions[0]!;
    const planning = calculatePlanningEconomics(economics);
    let revenueMinor = 0;
    let landedCostMinor = 0;
    let paymentCostMinor = 0;
    let actualDataComplete = true;
    let paymentCostEstimated = false;
    let paidCustomers = 0;

    for (const order of orders) {
      const matchingItems = order.items.filter(
        (item) => item.productId === product.id,
      );
      if (!matchingItems.length) continue;
      paidCustomers += 1;
      const orderListMinor = order.items.reduce(
        (sum, item) => sum + (item.unitPriceMinor ?? 0) * item.quantity,
        0,
      );
      const productListMinor = matchingItems.reduce(
        (sum, item) => sum + (item.unitPriceMinor ?? 0) * item.quantity,
        0,
      );
      const paidMinor = new Map(
        order.businessEvents.map((event) => [
          event.eventKey,
          event.amountMinor,
        ]),
      );
      const orderRevenueMinor = [...paidMinor.values()].reduce<number>(
        (sum, amount) => sum + Math.max(0, amount ?? 0),
        0,
      );
      const share = orderListMinor > 0 ? productListMinor / orderListMinor : 0;
      revenueMinor += Math.round(orderRevenueMinor * share);

      if (
        matchingItems.some((item) => item.unitLandedCostMinorSnapshot === null)
      ) {
        actualDataComplete = false;
      } else {
        landedCostMinor += matchingItems.reduce(
          (sum, item) =>
            sum + (item.unitLandedCostMinorSnapshot ?? 0) * item.quantity,
          0,
        );
      }
      const relevantPayments = order.payments.filter(
        (payment) => payment.kind !== "REFUND",
      );
      if (
        relevantPayments.length > 0 &&
        relevantPayments.every((payment) => payment.processorFeeMinor !== null)
      ) {
        const orderFees = relevantPayments.reduce(
          (sum, payment) => sum + (payment.processorFeeMinor ?? 0),
          0,
        );
        paymentCostMinor += Math.round(orderFees * share);
      } else if (
        matchingItems.every(
          (item) =>
            item.unitPriceMinor !== null &&
            item.paymentRateBpsSnapshot !== null,
        )
      ) {
        paymentCostEstimated = true;
        paymentCostMinor += matchingItems.reduce(
          (sum, item) =>
            sum +
            applyRateBps(
              (item.unitPriceMinor ?? 0) * item.quantity,
              item.paymentRateBpsSnapshot ?? 0,
            ),
          0,
        );
      } else {
        actualDataComplete = false;
      }
    }
    const actualAdSpendMinor = spendByProduct.get(product.id) ?? 0;
    const actual = actualDataComplete
      ? calculateActualProfitability({
          actualAdSpendMinor,
          landedCostMinor,
          paidCustomers,
          paymentCostMinor,
          revenueMinor,
        })
      : null;

    return {
      actual,
      actualAdSpendMinor,
      brand: product.brand?.displayName ?? "—",
      economics,
      internalCode: product.internalCode,
      name: product.translations[0]?.name ?? product.internalCode,
      paidCustomers,
      paymentCostEstimated,
      planning,
      retailPriceMinor: product.retailPriceMinor,
      revenueMinor,
    };
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
