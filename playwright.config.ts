import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright's webServer subprocess does not always inherit the full parent
 * environment reliably across platforms/CI. When `CI` is set, pass through
 * string env vars explicitly so Next.js sees `E2E_TEST`, `DATABASE_URL`, etc.
 */
function ciWebServerEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === "string" && value.length > 0) {
      env[key] = value;
    }
  }
  // Ensure `next dev` runs in development mode even if the parent process exports NODE_ENV=production.
  env.NODE_ENV = "development";
  // Auth.js: keep callback URLs aligned with Playwright's baseURL in CI.
  env.AUTH_URL ??= "http://localhost:3000";
  return env;
}

export default defineConfig({
  testDir: "./e2e",
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    navigationTimeout: 90_000,
    actionTimeout: 30_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // CI: stable dev server + explicit env. Local: turbopack dev (inherits env).
    command: process.env.CI ? "npm run dev:ci" : "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 180_000 : 120_000,
    ...(process.env.CI ? { env: ciWebServerEnv() } : {}),
  },
});
