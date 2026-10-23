import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findFirst = vi.fn();
const findDuplicate = vi.fn();
const transaction = vi.fn();

vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    $transaction: transaction,
    order: { findUnique: findDuplicate },
    product: { findFirst },
  }),
}));
vi.mock("@/lib/env", () => ({
  getServerConfig: () => ({ storefrontReviewMode: false }),
}));

import { createOrderRequest } from "./service";

const input = {
  city: "Tallinn",
  colour: "black",
  consent: "accepted" as const,
  contactMethod: "TELEGRAM" as const,
  countryCode: "EE",
  email: "customer@example.com",
  firstName: "Test",
  fulfilmentMethod: "PERSONAL_HANDOVER" as const,
  lastName: "Customer",
  locale: "en" as const,
  paymentPreference: "DEPOSIT_30_BALANCE_ON_HANDOVER" as const,
  phone: "+3725555555",
  preferredLocale: "en" as const,
  productId: "product_1",
  productVersion: "2026-09-26T12:00:00.000Z",
  quantity: 1,
  requestKey: "11111111-1111-4111-8111-111111111111",
  selectionConfirmation: "accepted" as const,
  size: "M",
  socialHandle: "@customer",
};

const databaseProduct = {
  availabilityType: "PRE_ORDER" as const,
  colors: [{ code: "black" }],
  currency: "EUR",
  economicsVersions: [
    {
      landedCostEstimateMinor: 10_000,
      logisticsEstimateMinor: 2_000,
      paymentRateBps: 300,
      purchaseEstimateMinor: 8_000,
      sourceType: "ESTIMATE" as const,
      version: 1,
    },
  ],
  id: "product_1",
  internalCode: "AL-SRC-TEST",
  privateData: { landedCostMinor: 10_000 },
  preorderEstimateText: "2–3 weeks",
  publicationStatus: "PUBLISHED" as const,
  retailPriceMinor: 25_000,
  sizeChart: {
    chartData: { measurements: [], sizes: ["S", "M"] },
    isPublished: true,
    reviewStatus: "APPROVED" as const,
    units: "cm",
  },
  slug: "approved-product",
  translations: [{ locale: "EN" as const, name: "Database product" }],
  updatedAt: new Date(input.productVersion),
};

describe("transactional assisted-order service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findFirst.mockResolvedValue(databaseProduct);
  });

  it("writes server-resolved product, price and initial history in one transaction", async () => {
    const createOrder = vi
      .fn()
      .mockResolvedValue({ displayNumber: "AL-REF", id: "order_1" });
    transaction.mockImplementation(async (callback) =>
      callback({
        customer: { create: vi.fn().mockResolvedValue({ id: "customer_1" }) },
        order: { create: createOrder },
      }),
    );

    const touch = {
      adName: "Maya video",
      adSetName: "Jackets",
      campaignName: "Autumn",
      contentLabel: "maya_video_01",
      eventId: "event-attribution-1",
      fbc: null,
      fbclid: null,
      fbp: null,
      gaClientId: null,
      gaSessionId: null,
      gclid: null,
      landingPage: "/en/catalog",
      locale: "en",
      occurredAt: "2026-10-01T10:00:00.000Z",
      referrer: "https://instagram.com/andrelook.store",
      source: "META_ADS",
      sourceGroup: "PAID",
      utmCampaign: "Autumn",
      utmContent: "maya_video_01",
      utmMedium: "paid_social",
      utmSource: "instagram",
      utmTerm: null,
    };
    await expect(
      createOrderRequest(
        {
          ...input,
          orderAttribution: JSON.stringify({
            analyticsConsent: true,
            consentVersion: "g2-consent-v1",
            firstTouch: touch,
            lastTouch: touch,
            marketingConsent: false,
          }),
        },
        { initialReferrer: null, landingPath: "/en" },
      ),
    ).resolves.toEqual({
      duplicate: false,
      orderId: "order_1",
      reference: "AL-REF",
    });
    const data = createOrder.mock.calls[0]![0].data;
    expect(data.items.create).toMatchObject({
      productInternalCodeSnapshot: "AL-SRC-TEST",
      productNameSnapshot: "Database product",
      economicsSourceTypeSnapshot: "ESTIMATE",
      economicsVersionSnapshot: 1,
      paymentRateBpsSnapshot: 300,
      unitLandedCostMinorSnapshot: 10_000,
      unitLogisticsCostMinorSnapshot: 2_000,
      unitPriceMinor: 25_000,
      unitPurchaseCostMinorSnapshot: 8_000,
    });
    expect(data.statusHistory.create).toEqual({ toStatus: "NEW" });
    expect(data.legalRequestSnapshot).toMatchObject({
      availability: "PRE_ORDER",
      color: "black",
      currency: "EUR",
      deliveryEstimate: "2–3 weeks",
      policyVersion: "andrelook-legal-2026-10-v1",
      productCode: "AL-SRC-TEST",
      productName: "Database product",
      quantity: 1,
      returnsVersion: "andrelook-returns-2026-10-v1",
      sizeGuideAvailable: true,
      sizeGuideVersion: expect.stringMatching(/^[a-f0-9]{64}$/),
      size: "M",
      source: "WEBSITE_CHECKBOX",
      termsVersion: "andrelook-terms-2026-10-v1",
      unitPriceMinor: 25_000,
    });
    expect(data.attribution.create).toMatchObject({
      analyticsConsent: true,
      marketingConsent: false,
      touches: {
        create: [
          expect.objectContaining({ source: "META_ADS", touchType: "FIRST" }),
          expect.objectContaining({ source: "META_ADS", touchType: "LAST" }),
        ],
      },
    });
    expect(data.businessEvents.create).toMatchObject({
      eventKey: `lead:${input.requestKey}`,
      eventType: "LEAD_CREATED",
    });
  });

  it("returns the original reference when the request key is repeated", async () => {
    transaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("duplicate", {
        clientVersion: "6.12.0",
        code: "P2002",
      }),
    );
    findDuplicate.mockResolvedValue({
      displayNumber: "AL-ORIGINAL",
      id: "order_original",
    });
    await expect(
      createOrderRequest(input, { initialReferrer: null, landingPath: null }),
    ).resolves.toEqual({
      duplicate: true,
      orderId: "order_original",
      reference: "AL-ORIGINAL",
    });
  });
});
