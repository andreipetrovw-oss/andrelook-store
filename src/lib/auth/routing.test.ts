import { describe, expect, it } from "vitest";

import { routeNeedsClerk } from "./routing";

describe("Clerk route boundary", () => {
  it("keeps public storefront and order routes outside Clerk", () => {
    expect(routeNeedsClerk("/et", false)).toBe(false);
    expect(routeNeedsClerk("/en/catalog", false)).toBe(false);
    expect(routeNeedsClerk("/ru/catalog/jackets/product", false)).toBe(false);
    expect(routeNeedsClerk("/api/public", false)).toBe(false);
  });

  it("keeps CRM, admin and sign-in routes inside Clerk", () => {
    expect(routeNeedsClerk("/admin", false)).toBe(true);
    expect(routeNeedsClerk("/admin/orders", false)).toBe(true);
    expect(routeNeedsClerk("/sign-in", false)).toBe(true);
    expect(routeNeedsClerk("/anything", true)).toBe(true);
  });
});
