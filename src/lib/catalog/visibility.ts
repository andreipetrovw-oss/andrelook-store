export const approvedPublicAssetWhere = {
  approvedAt: { not: null },
  reviewStatus: "APPROVED" as const,
};

export function visiblePublicationStatuses(
  scope: "public" | "local-review",
  reviewMode: boolean,
) {
  return scope === "local-review" && reviewMode
    ? (["READY", "PUBLISHED"] as const)
    : (["PUBLISHED"] as const);
}
