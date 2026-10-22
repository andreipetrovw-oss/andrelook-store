import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ log: [] });
const reference = "TEST-UAT-REVIEWS-V1";
const stageHost =
  "ep-twilight-sun-b1raxfqz-pooler.c-5.eu-central-1.aws.neon.tech";
if (
  new URL(process.env.DATABASE_URL ?? "http://invalid").hostname !== stageHost
)
  throw new Error(
    "UAT is restricted to the existing isolated staging database.",
  );
async function main() {
  try {
    if (process.argv[2] === "create") {
      const existing = await prisma.order.findUnique({
        where: { displayNumber: reference },
      });
      if (existing)
        throw new Error("Fixture already exists; do not duplicate it.");
      const product = await prisma.product.findFirstOrThrow({
        where: { internalCode: "AL-LEGACY-001" },
        include: { translations: { where: { locale: "EN" } } },
      });
      const customer = await prisma.customer.create({
        data: {
          name: "TEST UAT Reviews",
          preferredContactMethod: "EMAIL",
          preferredContactValue: "reviews-uat@example.invalid",
          preferredLocale: "EN",
          internalNotes: "Disposable TEST/UAT fixture. Not a real customer.",
        },
      });
      await prisma.order.create({
        data: {
          displayNumber: reference,
          requestKey: reference,
          customerId: customer.id,
          status: "DELIVERED",
          currency: "EUR",
          requestedLocale: "EN",
          consentVersion: "TEST-UAT",
          consentAt: new Date(),
          internalNotes:
            "Disposable TEST/UAT review workflow fixture. Never copy to production.",
          items: {
            create: {
              productId: product.id,
              productInternalCodeSnapshot: product.internalCode,
              productNameSnapshot:
                product.translations[0]?.name ?? "TEST UAT Product",
              quantity: 1,
              unitPriceMinor: product.retailPriceMinor,
            },
          },
        },
      });
      // The normal authenticated owner action creates the invitation using the
      // deployment's non-exportable encryption secret during browser UAT.
      console.log(JSON.stringify({ fixtureCreated: true, reference }));
    } else if (process.argv[2] === "inspect") {
      const order = await prisma.order.findUniqueOrThrow({
        where: { displayNumber: reference },
        include: {
          reviewInvitation: {
            include: { review: { include: { moderationHistory: true } } },
          },
        },
      });
      console.log(
        JSON.stringify({
          orderId: order.id,
          requested: !!order.reviewInvitation?.requestedAt,
          reviewStatus: order.reviewInvitation?.review?.status ?? null,
          reviewCount: await prisma.customerReview.count(),
          moderationActions:
            order.reviewInvitation?.review?.moderationHistory.map(
              (h) => h.action,
            ) ?? [],
        }),
      );
    } else if (process.argv[2] === "cleanup") {
      const order = await prisma.order.findUniqueOrThrow({
        where: { displayNumber: reference },
        include: {
          reviewInvitation: { include: { review: true } },
          customer: true,
        },
      });
      if (
        order.customer.name !== "TEST UAT Reviews" ||
        order.requestKey !== reference
      )
        throw new Error("Unexpected fixture identity.");
      await prisma.$transaction(async (tx) => {
        if (order.reviewInvitation) {
          await tx.reviewModerationHistory.deleteMany({
            where: { invitationId: order.reviewInvitation.id },
          });
          await tx.customerReview.deleteMany({
            where: { invitationId: order.reviewInvitation.id },
          });
          await tx.reviewInvitation.delete({
            where: { id: order.reviewInvitation.id },
          });
        }
        await tx.order.delete({ where: { id: order.id } });
        if (
          (await tx.order.count({
            where: { customerId: order.customerId },
          })) === 0
        )
          await tx.customer.delete({ where: { id: order.customerId } });
      });
      console.log(
        JSON.stringify({
          fixtureRemoved: true,
          remainingReviews: await prisma.customerReview.count(),
        }),
      );
    } else throw new Error("Use create, inspect or cleanup.");
  } finally {
    await prisma.$disconnect();
  }
}
void main();
