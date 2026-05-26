import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";

// Load .env.local so SUPABASE_SERVICE_ROLE_KEY + ANON_KEY reach the test
// process. .env* files are gitignored — these keys never get committed.
loadEnv({ path: ".env.local" });

/**
 * Playwright config — UI tests for the SAA 2025 Award System.
 * Target: http://localhost:3000 (dev server must be running).
 * Tests live in ./tests, reports in ./playwright-report.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
});
