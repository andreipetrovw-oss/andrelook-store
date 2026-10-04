import { describe, expect, it } from "vitest";

import { requestOrderInput } from "./request-schema";

function validForm() {
  const form = new FormData();
  form.set("city", "Tallinn");
  form.set("colour", "");
  form.set("consent", "accepted");
  form.set("contactMethod", "TELEGRAM");
  form.set("countryCode", "EE");
  form.set("email", "customer@example.com");
  form.set("firstName", "Test");
  form.set("fulfilmentMethod", "PERSONAL_HANDOVER");
  form.set("lastName", "Customer");
  form.set("locale", "et");
  form.set("paymentPreference", "DEPOSIT_30_BALANCE_ON_HANDOVER");
  form.set("phone", "+372 5555 5555");
  form.set("preferredLocale", "et");
  form.set("productId", "product_1");
  form.set("productVersion", "2026-09-26T12:00:00.000Z");
  form.set("quantity", "1");
  form.set("requestKey", "11111111-1111-4111-8111-111111111111");
  form.set("size", "M");
  form.set("socialHandle", "@andrelook_customer");
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

  it("accepts a bounded optional comment and phone contact", () => {
    const form = validForm();
    form.set("contactMethod", "PHONE");
    form.set("comment", "Please contact me in the afternoon.");
    const result = requestOrderInput(form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toBe("Please contact me in the afternoon.");
      expect(result.data.contactMethod).toBe("PHONE");
    }
  });

  it("requires delivery details and full advance outside Estonia", () => {
    const form = validForm();
    form.set("fulfilmentMethod", "DELIVERY");
    form.set("countryCode", "FI");
    const missingAddress = requestOrderInput(form);
    expect(missingAddress.success).toBe(false);

    form.set("addressLine1", "Example street 1");
    form.set("postalCode", "00100");
    form.set("city", "Helsinki");
    form.set("paymentPreference", "FULL_ADVANCE");
    expect(requestOrderInput(form).success).toBe(true);
  });
});
