import { describe, expect, it } from "vitest";

import { requestOrderInput } from "./request-schema";

function validForm() {
  const form = new FormData();
  form.set("colour", "");
  form.set("consent", "accepted");
  form.set("contactMethod", "TELEGRAM");
  form.set("contactValue", "@andrelook_customer");
  form.set("locale", "et");
  form.set("name", "Customer");
  form.set("productId", "product_1");
  form.set("productVersion", "2026-09-26T12:00:00.000Z");
  form.set("requestKey", "11111111-1111-4111-8111-111111111111");
  form.set("size", "M");
  return form;
}

describe("assisted order request validation", () => {
  it("accepts the minimal approved form shape", () => {
    expect(requestOrderInput(validForm()).success).toBe(true);
  });

  it("rejects missing consent, invalid locales and invalid idempotency keys", () => {
    const form = validForm();
    form.delete("consent");
    form.set("locale", "de");
    form.set("requestKey", "repeat-me");
    const result = requestOrderInput(form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toMatchObject({
        consent: expect.any(Array),
        locale: expect.any(Array),
        requestKey: expect.any(Array),
      });
    }
  });

  it("does not accept client price, availability or product-name facts", () => {
    const form = validForm();
    form.set("price", "1");
    form.set("availability", "IN_STOCK");
    form.set("productName", "Injected name");
    const result = requestOrderInput(form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("price");
      expect(result.data).not.toHaveProperty("availability");
      expect(result.data).not.toHaveProperty("productName");
    }
  });
});
