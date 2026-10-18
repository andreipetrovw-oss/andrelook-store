import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const findUnique = vi.fn();
const findFirst = vi.fn();
const updateMany = vi.fn();
const upsertBucket = vi.fn();
vi.mock("@/lib/db", () => ({
  getPrisma: () => ({
    order: { findFirst, findUnique, updateMany },
    trackingLookupBucket: { upsert: upsertBucket },
  }),
}));

import {
  authenticateTrackingLookup,
  consumeLookupAttempt,
  getPublicTrackingOrder,
  inferDeliveryMode,
  publicStatusLabel,
} from "./public";
import { verifiedPilotEvidence } from "./pilot-evidence";

function trackedOrder(overrides: Record<string, unknown> = {}) {
  return {
    city: "Tartu",
    countryCode: "EE",
    createdAt: new Date("2026-10-15T20:30:00Z"),
    deliveryMode: "ESTONIA_DELIVERY",
    displayNumber: "AL-CUSTOMER-C",
    fulfilmentMethod: "DELIVERY",
    items: [
      {
        colorSnapshot: "черный",
        productNameSnapshot: "Customer C item",
        product: {
          translations: [
            { locale: "ET", name: "Kliendi toode" },
            { locale: "EN", name: "Customer item" },
            { locale: "RU", name: "Товар клиента" },
          ],
        },
        quantity: 1,
        sizeSnapshot: "M",
      },
    ],
    requestedLocale: "ET",
    shipmentLinks: [],
    trackingMilestones: [],
    ...overrides,
  };
}

describe("public tracking presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertBucket.mockResolvedValue({ attempts: 1 });
  });

  it("rejects invalid public tokens without touching the database", async () => {
    await expect(getPublicTrackingOrder("guessable-token")).resolves.toBeNull();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("maps fulfilment facts and exact localized customer labels", () => {
    expect(
      inferDeliveryMode({
        countryCode: "EE",
        deliveryMode: null,
        fulfilmentMethod: "DELIVERY",
      }),
    ).toBe("ESTONIA_DELIVERY");
    expect(publicStatusLabel("ET", "LOGISTICS_REGISTERED")).toBe(
      "Logistikaandmed edastatud",
    );
    expect(publicStatusLabel("RU", "LOGISTICS_REGISTERED")).toBe(
      "Логистическая информация передана",
    );
    expect(publicStatusLabel("EN", "LOGISTICS_REGISTERED")).toBe(
      "Logistics information received",
    );
    expect(publicStatusLabel("RU", "READY_FOR_HANDOVER")).not.toContain(
      "17TRACK",
    );
  });

  it("uses a neutral tracking-added event when confirmation evidence is unknown", async () => {
    findUnique.mockResolvedValue(trackedOrder());
    const result = await getPublicTrackingOrder("a".repeat(43));
    expect(result).toMatchObject({
      lastUpdatedAt: null,
      status: "TRACKING_ADDED",
      statusLabel: "Tellimus lisati Andrelooki jälgimissüsteemi",
    });
    expect(result?.timeline).toEqual([
      {
        label: "Tellimus lisati Andrelooki jälgimissüsteemi",
        occurredAt: "2026-10-15T20:30:00.000Z",
        status: "TRACKING_ADDED",
      },
    ]);
    expect(result?.items[0]?.colour).toBe("must");
    expect(result?.items[0]?.name).toBe("Kliendi toode");
  });

  it("uses only evidence-backed milestones for status and last update", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        trackingMilestones: [
          {
            kind: "ORDER_CONFIRMED",
            occurredAt: new Date("2026-10-01T09:00:00Z"),
          },
          {
            kind: "PREPARATION_STARTED",
            occurredAt: new Date("2026-10-02T10:00:00Z"),
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("b".repeat(43), "EN");
    expect(result?.status).toBe("PREPARING");
    expect(result?.lastUpdatedAt).toBe("2026-10-02T10:00:00.000Z");
    expect(result?.timeline.map((event) => event.status)).toEqual([
      "ORDER_CONFIRMED",
      "PREPARING",
    ]);
  });

  it("surfaces one evidence-timestamped InfoReceived milestone without advancing the main status", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "ORDER_CONFIRMED",
                  publicTimestamp: new Date("2026-10-04T09:00:00Z"),
                  rawStatus: "InfoReceived",
                },
              ],
              exposePublicTracking: false,
              normalizedStatus: "ORDER_CONFIRMED",
              provider: "SEVENTEEN_TRACK",
              providerRecords: [
                {
                  latestEventAt: new Date("2026-10-04T09:00:00Z"),
                  provider: "SEVENTEEN_TRACK",
                  syncStatus: "SUCCESS",
                },
                {
                  latestEventAt: new Date("2026-10-04T09:00:00Z"),
                  provider: "SEVENTEEN_TRACK",
                  syncStatus: "SUCCESS",
                },
              ],
              providerSyncStatus: "SUCCESS",
              publicCarrierName: null,
              publicTrackingNumber: null,
              rawStatus: "InfoReceived",
            },
          },
        ],
      }),
    );

    const result = await getPublicTrackingOrder("f".repeat(43), "ET");

    expect(result?.status).toBe("TRACKING_ADDED");
    expect(
      result?.timeline.filter(
        ({ status }) => status === "LOGISTICS_REGISTERED",
      ),
    ).toEqual([
      {
        label: "Logistikaandmed edastatud",
        occurredAt: "2026-10-04T09:00:00.000Z",
        status: "LOGISTICS_REGISTERED",
      },
    ]);
    expect(result?.lastUpdatedAt).toBe("2026-10-04T09:00:00.000Z");
    expect(JSON.stringify(result)).not.toMatch(
      /17TRACK|DHL|InfoReceived|SEVENTEEN_TRACK/,
    );
  });

  it("omits the InfoReceived timestamp when successful provider evidence has no event time", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        requestedLocale: "EN",
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [],
              exposePublicTracking: false,
              normalizedStatus: "ORDER_CONFIRMED",
              provider: "SEVENTEEN_TRACK",
              providerRecords: [],
              providerSyncStatus: "SUCCESS",
              publicCarrierName: null,
              publicTrackingNumber: null,
              rawStatus: "InfoReceived",
            },
          },
        ],
      }),
    );

    const result = await getPublicTrackingOrder("g".repeat(43), "EN");

    expect(result?.timeline.at(-1)).toEqual({
      label: "Logistics information received",
      occurredAt: null,
      status: "LOGISTICS_REGISTERED",
    });
    expect(result?.status).toBe("TRACKING_ADDED");
  });

  it("returns a safe DTO without master-shipment or provider secrets", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "HANDED_TO_LOGISTICS",
                  publicTimestamp: new Date("2026-10-02T10:00:00Z"),
                  rawStatus: "InTransit",
                },
              ],
              exposePublicTracking: false,
              internalTrackingNumber: "MUST-NEVER-LEAK",
              normalizedStatus: "HANDED_TO_LOGISTICS",
              providerPayload: "SUPERBUY-CHINA-MUST-NEVER-LEAK",
              publicCarrierName: null,
              publicTrackingNumber: null,
            },
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("c".repeat(43));
    expect(result?.status).toBe("IN_TRANSIT");
    expect(JSON.stringify(result)).not.toContain("MUST-NEVER-LEAK");
    expect(JSON.stringify(result)).not.toContain("SUPERBUY");
    const query = findUnique.mock.calls[0]?.[0];
    expect(JSON.stringify(query)).not.toContain("internalTrackingNumber");
    expect(JSON.stringify(query)).not.toContain("payload");
  });

  it.each([
    [
      "ET",
      [
        "Logistikaandmed edastatud",
        "Saadetis vastu võetud rahvusvahelisse logistikasse",
        "Saadetis üle antud lennutranspordile",
        "Rahvusvaheline transport alanud",
        "Saadetis saabus Euroopasse",
        "Euroopa logistiline töötlemine lõpetatud - ootel tollivormistus",
      ],
    ],
    [
      "RU",
      [
        "Логистическая информация передана",
        "Отправление принято международной логистикой",
        "Отправление передано авиаперевозчику",
        "Международная перевозка началась",
        "Отправление прибыло в Европу",
        "Обработка в европейском логистическом центре завершена - ожидается таможенное оформление",
      ],
    ],
    [
      "EN",
      [
        "Logistics information received",
        "Shipment accepted into international logistics",
        "Shipment handed over for air transport",
        "International transit started",
        "Shipment arrived in Europe",
        "European logistics processing completed - awaiting customs clearance",
      ],
    ],
  ] as const)(
    "publishes the exact safe pilot timeline in %s without leaking private evidence",
    async (locale, labels) => {
      const pilot = verifiedPilotEvidence("shipment-pilot");
      const logisticsEvidence = pilot.evidence.map((record, index) => ({
        customerVisible: record.customerVisible,
        eventTimestamp: record.eventTimestamp,
        eventType: record.eventType,
        id: `evidence-${index}`,
        supersedesId: null,
        verificationStatus: record.verificationStatus,
      }));
      findUnique.mockResolvedValue(
        trackedOrder({
          requestedLocale: locale,
          shipmentLinks: [
            {
              sequence: 0,
              shipment: {
                estimatedDeliveryAt: pilot.eta.date,
                etaFrom: pilot.eta.date,
                etaTo: pilot.eta.date,
                events: [
                  {
                    evidenceSource: "PROVIDER_EVENT",
                    normalizedStatus: "ORDER_CONFIRMED",
                    provider: "SEVENTEEN_TRACK",
                    publicTimestamp: new Date("2026-10-04T09:00:00Z"),
                    rawStatus: "InfoReceived",
                  },
                ],
                exposePublicTracking: false,
                logisticsEvidence,
                normalizedStatus: "EUROPEAN_LOGISTICS",
                provider: "SEVENTEEN_TRACK",
                providerRecords: [
                  {
                    latestEventAt: new Date("2026-10-04T09:00:00Z"),
                    provider: "SEVENTEEN_TRACK",
                    syncStatus: "SUCCESS",
                  },
                ],
                providerSyncStatus: "SUCCESS",
                publicCarrierName: null,
                publicTrackingNumber: null,
                rawStatus: "InfoReceived",
              },
            },
          ],
        }),
      );

      const result = await getPublicTrackingOrder("p".repeat(43), locale);

      expect(result?.status).toBe("IN_TRANSIT");
      expect(result?.timeline.map((event) => event.label)).toEqual(labels);
      expect(result?.lastUpdatedAt).toBe("2026-10-15T07:03:00.000Z");
      expect(result?.estimatedDeliveryFrom).toBe("2026-10-19T09:00:00.000Z");
      expect(result?.estimatedDeliveryTo).toBe("2026-10-19T09:00:00.000Z");
      expect(
        result?.timeline.filter(
          ({ status }) => status === "LOGISTICS_REGISTERED",
        ),
      ).toHaveLength(1);
      expect(JSON.stringify(result)).not.toMatch(
        /Superbuy|China|Shenzhen|Germany|Netherlands|DHL|17TRACK|InfoReceived|SEVENTEEN_TRACK|owner verified/i,
      );
      const query = findUnique.mock.calls.at(-1)?.[0];
      expect(JSON.stringify(query)).not.toMatch(
        /sourceLabel|evidenceNote|internalLocation|internalReference|sourceTimestampText/,
      );
    },
  );

  it("gives all three linked real orders one shared shipment timeline", async () => {
    const pilot = verifiedPilotEvidence("shipment-pilot");
    const logisticsEvidence = pilot.evidence.map((record, index) => ({
      customerVisible: record.customerVisible,
      eventTimestamp: record.eventTimestamp,
      eventType: record.eventType,
      id: `shared-evidence-${index}`,
      supersedesId: null,
      verificationStatus: record.verificationStatus,
    }));
    const shipment = {
      estimatedDeliveryAt: pilot.eta.date,
      etaFrom: pilot.eta.date,
      etaTo: pilot.eta.date,
      events: [],
      exposePublicTracking: false,
      logisticsEvidence,
      normalizedStatus: "EUROPEAN_LOGISTICS",
      provider: "SEVENTEEN_TRACK",
      providerRecords: [],
      providerSyncStatus: "SUCCESS",
      publicCarrierName: null,
      publicTrackingNumber: null,
      rawStatus: "InfoReceived",
    };
    const orderNumbers = [
      "AL-20261015-3D0AA1",
      "AL-20261015-4F3DAD",
      "AL-20261015-32CC44",
    ];
    for (const displayNumber of orderNumbers) {
      findUnique.mockResolvedValueOnce(
        trackedOrder({
          displayNumber,
          requestedLocale: "EN",
          shipmentLinks: [{ sequence: 0, shipment }],
        }),
      );
    }

    const results = await Promise.all(
      orderNumbers.map((_, index) =>
        getPublicTrackingOrder(String(index + 1).repeat(43), "EN"),
      ),
    );

    expect(results.map((result) => result?.reference)).toEqual(orderNumbers);
    expect(results.map((result) => result?.timeline)).toEqual([
      results[0]?.timeline,
      results[0]?.timeline,
      results[0]?.timeline,
    ]);
    expect(results.every((result) => result?.status === "IN_TRANSIT")).toBe(
      true,
    );
  });

  it("follows a customer's own local leg and exposes only owner-approved carrier data", async () => {
    findUnique.mockResolvedValue(
      trackedOrder({
        requestedLocale: "EN",
        shipmentLinks: [
          {
            sequence: 0,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "ARRIVED_AT_ANDRELOOK",
                  publicTimestamp: new Date("2026-10-10T10:00:00Z"),
                  rawStatus: "Delivered",
                },
              ],
              exposePublicTracking: false,
              normalizedStatus: "ARRIVED_AT_ANDRELOOK",
              publicCarrierName: null,
              publicTrackingNumber: null,
            },
          },
          {
            sequence: 1,
            shipment: {
              estimatedDeliveryAt: null,
              etaFrom: null,
              etaTo: null,
              events: [
                {
                  normalizedStatus: "LOCAL_CARRIER",
                  publicTimestamp: new Date("2026-10-11T10:00:00Z"),
                  rawStatus: "PickedUp",
                },
              ],
              exposePublicTracking: true,
              normalizedStatus: "LOCAL_CARRIER",
              publicCarrierName: "Safe local carrier",
              publicTrackingNumber: "OWNER-APPROVED-LOCAL",
            },
          },
        ],
      }),
    );
    const result = await getPublicTrackingOrder("d".repeat(43));
    expect(result).toMatchObject({
      carrierName: "Safe local carrier",
      deliveryMethod: "Delivery within Estonia",
      status: "LOCAL_DELIVERY",
      trackingNumber: "OWNER-APPROVED-LOCAL",
    });
  });

  it("requires the exact order and access-code pair without email", async () => {
    findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: "order-c",
      publicTrackingToken: "e".repeat(43),
    });
    await expect(
      authenticateTrackingLookup({
        accessCode: "2345-6789",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBeNull();
    await expect(
      authenticateTrackingLookup({
        accessCode: "ABCD-EFGH",
        reference: "AL-TARTU-C",
      }),
    ).resolves.toBe("e".repeat(43));
    expect(findFirst.mock.calls[1]?.[0]).toMatchObject({
      where: {
        displayNumber: "AL-TARTU-C",
        trackingAccessCodeHash: expect.stringMatching(/^[a-f0-9]{64}$/),
      },
    });
    expect(JSON.stringify(findFirst.mock.calls)).not.toContain("@example.com");
  });

  it("rate-limits both address and address/order buckets", async () => {
    upsertBucket
      .mockResolvedValueOnce({ attempts: 15 })
      .mockResolvedValueOnce({ attempts: 5 })
      .mockResolvedValueOnce({ attempts: 16 })
      .mockResolvedValueOnce({ attempts: 6 });
    await expect(consumeLookupAttempt("198.51.100.1", "AL-ONE")).resolves.toBe(
      true,
    );
    await expect(consumeLookupAttempt("198.51.100.1", "AL-ONE")).resolves.toBe(
      false,
    );
    expect(upsertBucket).toHaveBeenCalledTimes(4);
  });
});
