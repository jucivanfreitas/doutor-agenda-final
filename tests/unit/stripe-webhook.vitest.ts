// Vitest-only test file — named to avoid Playwright discovery
import { describe, it, expect } from "vitest";
import { POST } from "../../../src/app/api/stripe/webhook/route";

describe("Stripe webhook handler (basic checks)", () => {
  it("throws when webhook secret is not configured", async () => {
    const original = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const req = new Request("https://example.com/webhook", {
      method: "POST",
      body: "{}",
    });
    await expect(() => POST(req)).rejects.toThrow();
    process.env.STRIPE_WEBHOOK_SECRET = original;
  });

  it.todo("should be idempotent (integration test)");
  it.todo(
    "should handle invoice.paid with customer fallback (integration test)",
  );
  it.todo("should log fatal on update failure (integration test)");
});
