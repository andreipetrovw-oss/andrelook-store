import { beforeEach, expect, it, vi } from "vitest";
vi.mock("@/lib/auth/server", () => ({ requireOwner: vi.fn() }));
vi.mock("@/lib/measurement/meta-spend", () => ({ syncMetaSpend: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
import { requireOwner } from "@/lib/auth/server";
import { syncMetaSpend } from "@/lib/measurement/meta-spend";
import { redirect } from "next/navigation";
import { refreshMetaCampaign } from "./meta-actions";
beforeEach(() => vi.resetAllMocks());
it("rejects non-owner before provider or database synchronization", async () => {
  vi.mocked(requireOwner).mockRejectedValue(new Error("Not authorized"));
  await expect(refreshMetaCampaign()).rejects.toThrow("Not authorized");
  expect(syncMetaSpend).not.toHaveBeenCalled();
});
it("returns only a sanitized failure state, never provider error details", async () => {
  vi.mocked(syncMetaSpend).mockRejectedValue(
    new Error("private-provider-detail"),
  );
  await refreshMetaCampaign();
  expect(redirect).toHaveBeenCalledWith("/admin/advertising?metaSync=failed");
});
