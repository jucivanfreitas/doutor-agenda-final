import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

test("generate storage states for userA and userB (programmatic)", async ({
  request,
  browser,
}) => {
  // Sanity check: ensure app is not the default Next.js template
  const sanityContext = await browser.newContext();
  const sanityPage = await sanityContext.newPage();
  await sanityPage.goto("/");
  await expect(sanityPage.locator("body")).not.toContainText("Create Next App");
  await sanityContext.close();

  const users = [
    {
      email: process.env.TEST_USER_A_EMAIL ?? "testelogin5@gmail.com",
      password: process.env.TEST_USER_A_PASSWORD ?? "testelogin5",
      name: "Test A",
    },
    {
      email: process.env.TEST_USER_B_EMAIL ?? "testelogin6@gmail.com",
      password: process.env.TEST_USER_B_PASSWORD ?? "testelogin6",
      name: "Test B",
    },
  ];

  const authDir = path.join(process.cwd(), "tests", ".auth");
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    // Create user via API (ignore 409)
    try {
      await request.post("/api/auth/sign-up/email", {
        data: { email: u.email, password: u.password, name: u.name },
      });
    } catch (e: any) {
      if (e && e.status !== 409) {
        throw e;
      }
    }

    // Login programmatically
    const loginResp = await request.post("/api/auth/sign-in/email", {
      data: { email: u.email, password: u.password },
    });
    if (!loginResp.ok()) {
      const body = await loginResp.text().catch(() => "<no body>");
      console.warn(
        `Login failed for ${u.email}: status=${await loginResp.status()} body=${body}`,
      );
    }

    // Grab storage state from request context and create browser context with it
    const storage = await request.storageState();
    const cookies = storage.cookies ?? [];
    if (!cookies.length) {
      console.warn(
        `No cookies found in request.storageState() after login for ${u.email}. storageState keys: ${Object.keys(storage).join(",")}`,
      );
    }
    const outPath = `tests/.auth/user${i === 0 ? "A" : "B"}.json`;
    const context = await browser.newContext({ storageState: storage });
    await context.storageState({ path: outPath });
    await context.close();
  }
});
