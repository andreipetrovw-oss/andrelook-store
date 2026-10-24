import "server-only";

import { OrderStatus, Prisma } from "@prisma/client";

import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { decryptTrackingAccessCode } from "@/lib/tracking/security";
import {
  calculateFinancials,
  effectiveTotalMinor,
  itemSnapshotTotalMinor,
  requiredPrepaymentMinor,
} from "@/lib/orders/financials";
import { buildAdvertisingRows } from "@/lib/measurement/reporting";
import {
  applyRateBps,
  calculateActualProfitability,
  calculatePlanningEconomics,
} from "@/lib/economics/calculation";

import { businessOrderWhere, isInternalTestOrder } from "./test-orders";
import {
  businessSummary,
  websiteSummary,
  websiteBreakdowns,
} from "@/lib/measurement/correctness";

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
      agreedTotalMinor: true,
      confirmedTotalMinor: true,
      currency: true,
      customer: { select: { name: true } },
      displayNumber: true,
      id: true,
      items: {
        select: {
          productNameSnapshot: true,
          quantity: true,
          unitPriceMinor: true,
        },
      },
      nextActionAt: true,
      notification: { select: { status: true } },
      reviewInvitation: {
        select: { requestedAt: true, review: { select: { status: true } } },
      },
      orderDate: true,
      paymentPreference: true,
      payments: {
        select: { amountMinor: true, kind: true, status: true },
        where: { status: "ACTIVE" },
      },
      status: true,
    },
    take: 200,
    where,
  });
  return orders
    .map((order) => {
      const storeTotalMinor = itemSnapshotTotalMinor(order.items);
      const totalMinor = effectiveTotalMinor({
        agreedTotalMinor: order.agreedTotalMinor,
        confirmedTotalMinor: order.confirmedTotalMinor,
        itemTotalMinor: storeTotalMinor,
      });
      return {
        ...order,
        ...calculateFinancials(totalMinor, order.payments),
        effectiveTotalMinor: totalMinor,
        isTest: isInternalTestOrder(order.displayNumber),
        source:
          order.attribution?.touches.find(
            (touch) => touch.touchType === "LAST",
          ) ??
          order.attribution?.touches.find(
            (touch) => touch.touchType === "FIRST",
          ) ??
          null,
        storeTotalMinor,
      };
    })
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
      businessEvents: {
        orderBy: { occurredAt: "asc" },
        where: { isActive: true },
      },
      correctionHistory: {
        include: { changedByAdmin: { select: { email: true } } },
        orderBy: { createdAt: "desc" },
      },
      items: true,
      notification: true,
      payments: { orderBy: { receivedAt: "desc" } },
      shipmentLinks: {
        include: {
          shipment: {
            select: {
              id: true,
              lastConfirmedEventAt: true,
              normalizedStatus: true,
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
  const storeTotalMinor = itemSnapshotTotalMinor(order.items);
  const totalMinor = effectiveTotalMinor({
    agreedTotalMinor: order.agreedTotalMinor,
    confirmedTotalMinor: order.confirmedTotalMinor,
    itemTotalMinor: storeTotalMinor,
  });
  return {
    ...safeOrder,
    trackingAccessCode: trackingAccessCodeEncrypted
      ? decryptTrackingAccessCode(trackingAccessCodeEncrypted)
      : null,
    ...calculateFinancials(totalMinor, order.payments),
    activePayments: order.payments.filter(
      (payment) => payment.status === "ACTIVE",
    ),
    effectiveTotalMinor: totalMinor,
    isTest: isInternalTestOrder(order.displayNumber),
    requiredPrepaymentMinor: requiredPrepaymentMinor(
      totalMinor,
      order.paymentPreference,
    ),
    storeTotalMinor,
  };
}

export async function getOrderCorrectionProductOptions() {
  await requireOwner();
  return getPrisma().product.findMany({
    orderBy: [{ brand: { displayName: "asc" } }, { internalCode: "asc" }],
    select: {
      brand: { select: { displayName: true } },
      id: true,
      internalCode: true,
      translations: {
        select: { name: true },
        take: 1,
        where: { locale: "RU" },
      },
    },
  });
}

export async function getAdvertisingReport(input: {
  from: Date;
  to: Date;
  spendFrom?: Date;
  spendTo?: Date;
  source?: string;
  campaign?: string;
}) {
  await requireOwner();
  const prisma = getPrisma();
  const [orders, spend, analyticsEvents, metaStatus] = await Promise.all([
    prisma.order.findMany({
      select: {
        attribution: {
          select: {
            analyticsConsent: true,
            websiteSessionId: true,
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
          where: {
            isActive: true,
            occurredAt: { gte: input.from, lt: input.to },
          },
        },
        displayNumber: true,
        createdAt: true,
        currency: true,
        agreedTotalMinor: true,
        confirmedTotalMinor: true,
        statusHistory: { select: { toStatus: true, createdAt: true } },
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
          select: {
            kind: true,
            processorFeeMinor: true,
            amountMinor: true,
            status: true,
            currency: true,
            receivedAt: true,
          },
          where: { status: "ACTIVE" },
        },
        status: true,
      },
      where: {
        ...businessOrderWhere,
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
      where: {
        date: {
          gte: input.spendFrom ?? input.from,
          lt: input.spendTo ?? input.to,
        },
      },
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
    spendFrom: input.spendFrom,
    spendTo: input.spendTo,
  });
  for (const row of rows) {
    const matches = (
      touch: {
        source: string;
        campaignName: string | null;
        adSetName?: string | null;
        adName?: string | null;
      } | null,
    ) =>
      (touch?.source ?? "UNKNOWN") === row.source &&
      (touch?.campaignName ?? null) === row.campaign &&
      (touch?.adSetName ?? null) === row.adSet &&
      (touch?.adName ?? null) === row.ad;
    const rowOrders = orders.filter((o) =>
      matches(
        o.attribution?.touches.find((t) => t.touchType === "LAST") ??
          o.attribution?.touches.find((t) => t.touchType === "FIRST") ??
          null,
      ),
    );
    const business = businessSummary(rowOrders, input.from, input.to);
    const web = websiteSummary(
      rowOrders,
      reportingEvents.filter((e) => matches(e)),
      input.from,
      input.to,
    );
    row.leads = business.leads;
    row.confirmed = business.confirmed;
    row.paid = business.fullyPaid;
    row.revenueMinor = business.cashReceivedMinor;
    row.siteVisits = web.sessions;
    row.productViews = web.productViewSessions;
    row.preorderOpens = web.preorderOpenSessions;
    row.costPerLeadMinor = row.leads
      ? Math.round(row.spendMinor / row.leads)
      : null;
    row.costPerCustomerMinor = row.paid
      ? Math.round(row.spendMinor / row.paid)
      : null;
    row.roas = row.spendMinor > 0 ? row.revenueMinor / row.spendMinor : null;
  }
  const scope = (
    touch: { source: string; campaignName: string | null } | null,
  ) =>
    (!input.source || (touch?.source ?? "UNKNOWN") === input.source) &&
    (!input.campaign || touch?.campaignName === input.campaign);
  const scopedOrders = orders.filter((o) =>
    scope(
      o.attribution?.touches.find((t) => t.touchType === "LAST") ??
        o.attribution?.touches.find((t) => t.touchType === "FIRST") ??
        null,
    ),
  );
  const scopedEvents = reportingEvents.filter(scope);
  return {
    business: businessSummary(scopedOrders, input.from, input.to),
    website: websiteSummary(scopedOrders, scopedEvents, input.from, input.to),
    ...websiteBreakdowns(scopedOrders, scopedEvents, input.from, input.to),
    diagnostics: {
      generatedAt: new Date(),
      metaLastImportedRows: metaStatus?.lastImportedRows ?? null,
      metaLastSuccessAt: metaStatus?.lastSuccessAt ?? null,
      metaStatus: metaStatus?.status ?? "UNAVAILABLE",
    },
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
          where: { eventType: "PAID", isActive: true },
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
          where: { status: "ACTIVE" },
        },
      },
      where: {
        ...businessOrderWhere,
        businessEvents: { some: { eventType: "PAID", isActive: true } },
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
