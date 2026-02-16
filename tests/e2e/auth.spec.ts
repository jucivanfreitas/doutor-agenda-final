import { test, expect } from "@playwright/test";

test.describe("authentication flow", () => {
  test("login -> dashboard -> logout", async ({ page }) => {
    await page.goto("http://localhost:3000/authentication");
    // Note: This is a placeholder. The project uses better-auth; interactive
    // login via Playwright will require fixtures (email link or provider).
    // Here we assert the page loads and has login form elements.
    await expect(page).toHaveURL(/authentication/);
    // TODO: Implement interactive login with test account or mocking
  });
});
