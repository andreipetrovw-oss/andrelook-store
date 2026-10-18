import { getPrisma } from "../src/lib/db";
import { getServerConfig } from "../src/lib/env";
import { importOwnerLogisticsEvidence } from "../src/lib/tracking/owner-evidence";
import {
  isVerifiedPilotOrderSet,
  verifiedPilotEvidence,
} from "../src/lib/tracking/pilot-evidence";

async function main() {
  const shipmentId = process.env.PILOT_SHIPMENT_ID?.trim();
  const ownerEmail = getServerConfig().ownerEmails[0];
  if (!ownerEmail)
    throw new Error("An existing OWNER_EMAILS entry is required.");
  const prisma = getPrisma();
  const [shipments, admin] = await Promise.all([
    prisma.shipment.findMany({
      select: {
        _count: { select: { orderLinks: true } },
        id: true,
        kind: true,
        orderLinks: {
          select: { order: { select: { displayNumber: true } } },
        },
        provider: true,
      },
      where: shipmentId
        ? { id: shipmentId }
        : {
            kind: "INTERNATIONAL_INBOUND",
            provider: "SEVENTEEN_TRACK",
          },
    }),
    prisma.adminUser.findUniqueOrThrow({
      select: { id: true },
      where: { email: ownerEmail },
    }),
  ]);
  const matchingShipments = shipments.filter((candidate) => {
    const linkedOrders = candidate.orderLinks.map(
      ({ order }) => order.displayNumber,
    );
    return isVerifiedPilotOrderSet(linkedOrders);
  });
  if (matchingShipments.length !== 1) {
    throw new Error("Exactly one shipment must match the real pilot orders.");
  }
  const shipment = matchingShipments[0]!;
  if (
    shipment.kind !== "INTERNATIONAL_INBOUND" ||
    shipment.provider !== "SEVENTEEN_TRACK" ||
    shipment._count.orderLinks !== 3
  ) {
    throw new Error(
      "The selected shipment does not match the real pilot invariant.",
    );
  }
  const pilot = verifiedPilotEvidence(shipment.id);
  const result = await importOwnerLogisticsEvidence({
    adminId: admin.id,
    eta: pilot.eta,
    evidence: pilot.evidence,
    shipmentId: shipment.id,
  });
  console.log(
    JSON.stringify({
      createdEvidence: result.created,
      linkedOrders: shipment._count.orderLinks,
      normalizedStatus: result.state.status,
    }),
  );
}

main().catch((error) => {
  console.error(
    error instanceof Error ? error.message : "Evidence import failed.",
  );
  process.exitCode = 1;
});
