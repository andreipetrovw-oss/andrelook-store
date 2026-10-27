"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/server";
import { syncMetaSpend } from "@/lib/measurement/meta-spend";

export async function refreshMetaCampaign() {
  await requireOwner();
  let status: string;
  try {
    status = (await syncMetaSpend()).status;
  } catch {
    status = "failed";
  }
  revalidatePath("/admin/advertising");
  redirect(`/admin/advertising?metaSync=${status}`);
}
