import "server-only";
import { requireOwner } from "@/lib/auth/server";
import { getPrisma } from "@/lib/db";
import { reviewEligible } from "./model";

// Attention clears through the existing explicit moderation action, not a GET.
export async function getReviewAttention() {
  await requireOwner();
  const rows = await getPrisma().customerReview.findMany({
    where: { status: "SUBMITTED", invitation: { revokedAt: null } },
    select: {
      id: true,
      invitation: {
        select: {
          order: {
            select: {
              id: true,
              status: true,
              displayNumber: true,
              customer: {
                select: {
                  name: true,
                  email: true,
                  preferredContactValue: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "desc" },
  });
  return rows
    .filter((row) => reviewEligible(row.invitation.order))
    .map((row) => ({
      id: row.id,
      orderId: row.invitation.order.id,
    }));
}
