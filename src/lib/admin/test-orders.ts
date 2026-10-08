import type { Prisma } from "@prisma/client";

export const acceptanceTestOrderNumbers = ["AL-20261007-3C7477"] as const;

const acceptanceTestOrderNumberSet = new Set<string>(
  acceptanceTestOrderNumbers,
);

export const businessOrderWhere = {
  displayNumber: { notIn: [...acceptanceTestOrderNumbers] },
} satisfies Prisma.OrderWhereInput;

export function isInternalTestOrder(displayNumber: string) {
  return acceptanceTestOrderNumberSet.has(displayNumber);
}
