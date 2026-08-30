import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  globalSetup: "./e2e/global.setup.ts",
  use: { baseURL: "http://localhost:3000", trace: "on-first-retry" },
  // E2E must exercise this checkout, not a stale dev server already using port 3000.
  webServer: { command: "pnpm dev", url: "http://localhost:3000", reuseExistingServer: false },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
