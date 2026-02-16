import { expect, test } from "@playwright/test";
import fs from "fs";

test.describe("multitenant isolation", () => {
  test("user A patient not visible to user B", async ({ browser }) => {
    const userAState = "tests/.auth/userA.json";
    const userBState = "tests/.auth/userB.json";

    if (!fs.existsSync(userAState) || !fs.existsSync(userBState)) {
      test.skip(
        true,
        "Storage state files missing — run tests/e2e/00_setup.spec.ts first",
      );
      return;
    }

    // Use programmatic contexts with storageState
    const contextA = await browser.newContext({ storageState: userAState });
    const pageA = await contextA.newPage();
    await pageA.goto("/appointments");

    // Create patient via API (preferred) — fallback to UI if API missing
    try {
      // call API to create patient directly
      const resp = await pageA.request.post("/api/patients", {
        data: {
          name: "Patient A",
          phoneNumber: "11999999999",
          email: "patient-a@example.test",
          sex: "male",
          clinicId: null,
        },
      });
      if (!resp.ok()) {
        // fallback to UI create if API returns error
        await pageA.click("text=Pacientes");
        await pageA.click("text=Novo paciente");
        await pageA.fill('input[placeholder="Nome"]', "Patient A");
        await pageA.fill('input[placeholder="Telefone"]', "11999999999");
        await pageA.click("text=Salvar");
      }
    } catch (e) {
      await pageA.click("text=Pacientes");
      await pageA.click("text=Novo paciente");
      await pageA.fill('input[placeholder="Nome"]', "Patient A");
      await pageA.fill('input[placeholder="Telefone"]', "11999999999");
      await pageA.click("text=Salvar");
    }

    await contextA.close();

    // Now open as user B and assert patient A not visible
    const contextB = await browser.newContext({ storageState: userBState });
    const pageB = await contextB.newPage();
    await pageB.goto("/patients");
    const content = await pageB.content();
    expect(content).not.toContain("Patient A");
    await contextB.close();
  });
});
