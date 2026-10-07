import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";
import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";

/**
 * S3.3 visual baselines (erp-platform-template PLAN): reference screens in every palette,
 * light/dark and LTR/RTL against the deterministic e2e backend. Capture-only: the images
 * are reviewed by people and attached to the plan, not compared pixel by pixel (font
 * rendering differs between Windows, macOS and CI). Run with `npm run capture:theme-baselines`.
 */
const palettes = ["green", "orange", "blue", "monochrome"] as const;
const modes = ["light", "dark"] as const;
const languages = ["en", "ar"] as const;
const outputDir = path.join("test-results", "theme-baselines");

type ReferenceScreen = {
  id: string;
  role: "Admin" | "Super Admin";
  path: string;
  ready: (page: Page) => Promise<void>;
};

const screens: ReferenceScreen[] = [
  {
    id: "P-001-countries",
    role: "Super Admin",
    path: "/super-admin/geography/countries",
    ready: async (page) => {
      await expect(page.getByText("Test Country 12", { exact: true }).first()).toBeVisible({ timeout: 30_000 });
    },
  },
  {
    id: "P-006-role-permissions",
    role: "Admin",
    path: "/administration/manage-role-permissions/finance-manager",
    ready: async (page) => {
      await expect(page.locator("#role-permission-screen-accounts-header")).toBeVisible({
        timeout: 30_000,
      });
    },
  },
];

async function applyPreferences(page: Page, palette: string, mode: string, language: string) {
  const url = new URL(page.url());
  await page.context().addCookies(
    [
      ["themePalette", palette],
      ["currentMode", mode],
      ["i18next", language],
    ].map(([name, value]) => ({ name, value, domain: url.hostname, path: "/" })),
  );
}

test.describe("theme baselines @baseline", () => {
  test.describe.configure({ timeout: 600_000 });

  for (const screen of screens) {
    test(`${screen.id} in every palette, mode and direction`, async ({ page, request }) => {
      await resetTestBackend(request);
      mkdirSync(outputDir, { recursive: true });
      await page.setViewportSize({ width: 1440, height: 900 });
      await loginWithDemoRole(page, screen.role, screen.path);
      await screen.ready(page);

      for (const palette of palettes) {
        for (const mode of modes) {
          for (const language of languages) {
            await applyPreferences(page, palette, mode, language);
            await page.goto(screen.path);
            await page.waitForFunction(() => document.documentElement.dataset.appReady === "true");
            await screen.ready(page);
            await expect(page.locator("html")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
            await page.waitForLoadState("networkidle");
            await page.evaluate(() => document.fonts.ready);
            await page.screenshot({
              path: path.join(outputDir, `${screen.id}-${palette}-${mode}-${language}.png`),
            });
          }
        }
      }
    });
  }
});
