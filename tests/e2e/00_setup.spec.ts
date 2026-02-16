import { test } from "@playwright/test";

test("generate storage states for userA and userB", async ({ browser }) => {
  const userAEmail = process.env.TEST_USER_A_EMAIL;
  const userAPassword = process.env.TEST_USER_A_PASSWORD;
  const userBEmail = process.env.TEST_USER_B_EMAIL;
  const userBPassword = process.env.TEST_USER_B_PASSWORD;

  if (!userAEmail || !userAPassword || !userBEmail || !userBPassword) {
    console.warn(
      "TEST_USER_* env vars not set — skipping storage state generation",
    );
    test.skip();
    return;
  }

  // Create storage for user A
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.goto("/authentication");
  await pageA.fill('input[placeholder="Digite seu e-mail"]', userAEmail);
  await pageA.fill('input[placeholder="Digite sua senha"]', userAPassword);
  await pageA.click('button[type="submit"]');
  await pageA.waitForURL("/dashboard", { timeout: 15000 });
  await contextA.storageState({ path: "tests/.auth/userA.json" });
  await contextA.close();

  // Create storage for user B
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto("/authentication");
  await pageB.fill('input[placeholder="Digite seu e-mail"]', userBEmail);
  await pageB.fill('input[placeholder="Digite sua senha"]', userBPassword);
  await pageB.click('button[type="submit"]');
  await pageB.waitForURL("/dashboard", { timeout: 15000 });
  await contextB.storageState({ path: "tests/.auth/userB.json" });
  await contextB.close();
});
