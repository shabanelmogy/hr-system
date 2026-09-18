import { defineConfig, devices } from "@playwright/test";

const appPort = 3100;
const backendPort = 3199;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  // The deterministic upstream fixture intentionally models one mutable ERP
  // tenant/company data store. Keep browser scenarios serial until each worker
  // owns an isolated fixture instance; otherwise one test reset can invalidate
  // another test's authenticated session or CRUD state.
  fullyParallel: false,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: 1,
  reporter: isCi ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${appPort}`,
    locale: "en-US",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      grepInvert: /@mobile/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      grep: /@mobile/,
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: [
    {
      command: `node e2e/support/test-backend.mjs --port ${backendPort}`,
      url: `http://127.0.0.1:${backendPort}/__e2e/health`,
      reuseExistingServer: !isCi,
      timeout: 30_000,
    },
    {
      command: isCi
        ? `cross-env BACKEND_URL=http://127.0.0.1:${backendPort} npm run start -- --hostname 127.0.0.1 --port ${appPort}`
        : `cross-env BACKEND_URL=http://127.0.0.1:${backendPort} npm run dev:http -- --hostname 127.0.0.1 --port ${appPort}`,
      url: `http://localhost:${appPort}/login`,
      reuseExistingServer: !isCi,
      // A clean Turbopack cache can spend most of the first request compiling
      // the login graph. Readiness should test the app, not race a cold compile.
      timeout: isCi ? 90_000 : 60_000,
    },
  ],
});
