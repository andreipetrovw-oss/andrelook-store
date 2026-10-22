import { PrismaClient } from "@prisma/client";
import { reviewEligible } from "../src/lib/reviews/model";
import { newReviewCredentials } from "../src/lib/reviews/security";

// Run server-side only after the additive migration. No requests or reviews are fabricated.
const prisma = new PrismaClient();
async function main() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "DELIVERED" },
      include: { customer: true, reviewInvitation: true },
    });
    let created = 0;
    for (const order of orders) {
      if (!reviewEligible(order) || order.reviewInvitation) continue;
      await prisma.reviewInvitation.upsert({
        where: { orderId: order.id },
        update: {},
        create: { orderId: order.id, ...newReviewCredentials() },
      });
      created++;
    }
    console.log(
      JSON.stringify({
        eligible: orders.filter(reviewEligible).length,
        invitationsEnabled: created,
        reviewsCreated: 0,
        requestsSent: 0,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}
void main();
