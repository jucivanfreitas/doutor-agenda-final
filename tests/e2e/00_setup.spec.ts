import { expect, test } from "@playwright/test";

test("generate storage states for userA and userB", async ({ browser }) => {
  // Sanity check: ensure app is not the default Next.js template
  const sanityContext = await browser.newContext();
  const sanityPage = await sanityContext.newPage();
  await sanityPage.goto("/");
  const bodyText = await sanityPage.locator("body").innerText();
  if (bodyText.includes("Create Next App")) {
    await sanityContext.close();
    throw new Error(
      "App appears to be the default template (Create Next App). Aborting E2E.",
    );
  }
  await sanityContext.close();

  const userAEnv = process.env.TEST_USER_A_EMAIL;
  const userBEnv = process.env.TEST_USER_B_EMAIL;

  const timestamp = Date.now();
  const userA = {
    name: process.env.TEST_USER_A_NAME ?? `Test A ${timestamp}`,
    email: userAEnv ?? `test-a-${timestamp}@local.test`,
    password: process.env.TEST_USER_A_PASSWORD ?? "Password123!",
  };
  const userB = {
    name: process.env.TEST_USER_B_NAME ?? `Test B ${timestamp}`,
    email: userBEnv ?? `test-b-${timestamp}@local.test`,
    password: process.env.TEST_USER_B_PASSWORD ?? "Password123!",
  };

  // helper to ensure user exists and save storage state
  async function ensureUser(
    u: { name: string; email: string; password: string },
    outPath: string,
  ) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/authentication");
    // open register tab by index (second tab) via in-page click (robust against overlays)
    await page
      .locator('button[role="tab"]')
      .nth(1)
      .evaluate((el) => (el as HTMLElement).click());
    await page.waitForSelector('input[placeholder="Digite seu nome"]', {
      timeout: 7000,
    });
    const nameInput = page.locator('input[placeholder="Digite seu nome"]');
    const emailInput = page.locator('input[placeholder="Digite seu e-mail"]');
    const passwordInput = page.locator('input[placeholder="Digite sua senha"]');
    await nameInput.fill(u.name);
    await emailInput.fill(u.email);
    await passwordInput.fill(u.password, { force: true });
    // submit the form explicitly
    await page.click('button[type="submit"]');
    // If user already exists, the handler shows error but may not navigate; attempt to login instead
    try {
      await page.waitForURL("/dashboard", { timeout: 7000 });
    } catch {
      // try login via tab trigger
      await page.click('button[role="tab"]:has-text("Login")');
      await page.waitForSelector('input[placeholder="Digite seu e-mail"]', {
        timeout: 7000,
      });
      await page.fill('input[placeholder="Digite seu e-mail"]', u.email);
      await page.fill('input[placeholder="Digite seu senha"]', u.password);
      await page.click('button[type="submit"]');
      await page.waitForURL("/dashboard", { timeout: 7000 });
    }
    await ctx.storageState({ path: outPath });
    await ctx.close();
  }

  // Ensure directories
  const fs = require("fs");
  const path = require("path");
  const authDir = path.join(process.cwd(), "tests", ".auth");
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  await ensureUser(userA, "tests/.auth/userA.json");
  await ensureUser(userB, "tests/.auth/userB.json");
});
