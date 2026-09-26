"use server";

import { revalidatePath } from "next/cache";

import {
  approveAndStorePublicImage,
  updateCommercialFields,
  updateLocalizedContent,
  updateOwnerReview,
  updateProductOptions,
  updateSourceImageReview,
} from "@/lib/catalog/owner-control";

function values(formData: FormData) {
  return Object.fromEntries(formData);
}

function refresh(productId: string) {
  revalidatePath(`/admin/catalog/${productId}`);
  revalidatePath("/admin/catalog");
}

export async function saveCommercialFields(formData: FormData) {
  const input = values(formData);
  await updateCommercialFields(input);
  refresh(String(input.productId));
}

export async function saveLocalizedContent(formData: FormData) {
  const input = values(formData);
  await updateLocalizedContent(input);
  refresh(String(input.productId));
}

export async function saveProductOptions(formData: FormData) {
  const input = values(formData);
  await updateProductOptions({
    colors: String(input.colors ?? ""),
    productId: String(input.productId),
    sizes: String(input.sizes ?? ""),
  });
  refresh(String(input.productId));
}

export async function saveSourceImageReview(formData: FormData) {
  const input = values(formData);
  await updateSourceImageReview(input);
  refresh(String(input.productId));
}

export async function saveOwnerReview(formData: FormData) {
  const input = values(formData);
  await updateOwnerReview({
    ...input,
    ownerPublicationApproved: input.ownerPublicationApproved === "yes",
  });
  refresh(String(input.productId));
}

export async function storeApprovedPublicImage(formData: FormData) {
  const input = values(formData);
  const file = formData.get("candidate");
  if (!(file instanceof File))
    throw new Error("A Studio candidate is required.");
  await approveAndStorePublicImage(input, file);
  refresh(String(input.productId));
}
