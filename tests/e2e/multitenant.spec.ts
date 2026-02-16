import { test, expect } from "@playwright/test";

test.describe("multitenant isolation", () => {
  test("user A patient not visible to user B (placeholder)", async ({
    page,
  }) => {
    // Placeholder: requires programmatic login and API calls to create patient
    await page.goto("http://localhost:3000");
    await expect(page).toHaveTitle(/Doutor Agenda/i);
  });
});
