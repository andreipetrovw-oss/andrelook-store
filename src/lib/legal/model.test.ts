import { describe, expect, it, vi, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { withdrawalEnvironment, withdrawalSchema } from "./model";
import { withdrawalCopy } from "./policy";

const input = {
  consumerName: "Test Person",
  confirmationEmail: "test@example.com",
  orderReference: "Purchase details",
  locale: "en",
  requestKey: "11111111-1111-4111-8111-111111111111",
  statementConfirmed: "accepted",
};
afterEach(() => vi.unstubAllEnvs());
describe("minimal withdrawal privacy and accessibility boundary", () => {
  it("accepts a declaration without order matching, authentication or a reason", () => {
    expect(withdrawalSchema.safeParse(input).success).toBe(true);
    for (const [key, value] of [
      ["consumerName", "x".repeat(201)],
      ["orderReference", "x".repeat(501)],
      ["confirmationEmail", "invalid"],
      ["statementConfirmed", "no"],
      ["requestKey", "guess"],
      ["consumerName", "Test\nPerson"],
    ])
      expect(
        withdrawalSchema.safeParse({ ...input, [key!]: value }).success,
      ).toBe(false);
  });
  it("allows only the production storefront or isolated staging, never CRM or production previews", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_UQULSqjeAyfvSEsY9bxTQ7ZsT1DH");
    expect(withdrawalEnvironment("www.andrelook.store")).toBe(true);
    for (const host of [
      "crm.andrelook.store",
      "localhost:3000",
      "preview.vercel.app",
      "www.andrelook.store.evil.test",
    ])
      expect(withdrawalEnvironment(host)).toBe(false);
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(withdrawalEnvironment("preview.vercel.app")).toBe(false);
    vi.stubEnv("VERCEL_PROJECT_ID", "prj_M6hDxQzBiShNOpWkWwSj3FOZmf1m");
    expect(withdrawalEnvironment("preview.vercel.app")).toBe(true);
    expect(withdrawalEnvironment("www.andrelook.store")).toBe(false);
  });
  for (const locale of ["et", "ru", "en"] as const)
    it(`${locale}: has clear declaration, confirmation and acknowledgement`, () => {
      const copy = withdrawalCopy[locale];
      expect(copy.initialAction).toBeTruthy();
      expect(copy.confirm).toBeTruthy();
      expect(copy.statement).toBeTruthy();
      expect(copy.retry).toBeTruthy();
      expect(JSON.stringify(copy)).not.toMatch(
        /Andreluk OÜ|Superbuy|DHL|17TRACK|registry|registrikood/,
      );
    });
  it("adds only the standalone declaration table, with no historical data operations", () => {
    const sql = readFileSync(
      "prisma/migrations/20261028010000_minimal_withdrawal/migration.sql",
      "utf8",
    ).replace(/--[^\n]*/g, "");
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "WithdrawalRequest"');
    expect(sql).not.toMatch(/ALTER|UPDATE|DELETE|DROP|INSERT|REFERENCES|Order/);
    const service = readFileSync("src/lib/legal/withdrawal.ts", "utf8");
    expect(service).not.toMatch(
      /prisma\.(order|payment|shipment|trackingEvent|customerReview)\b/,
    );
    const page = readFileSync(
      "src/app/(localized)/[locale]/withdrawal/page.tsx",
      "utf8",
    );
    expect(page).toContain('dynamic = "force-dynamic"');
    expect(page).toContain("randomUUID()");
    const form = readFileSync("src/components/withdrawal-form.tsx", "utf8");
    expect(form).toContain('type="submit"');
    expect(form).not.toContain('type="checkbox"');
    expect(form).not.toMatch(/email.*order|token|trackingAccessCode/);
  });
});
