import { defineConfig } from "@playwright/test";

export default defineConfig({
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
      baseURL: "http://localhost:3000",
      headless: true,
      // Default storageState can be overridden per-context in tests
      storageState: undefined,
  },
});
