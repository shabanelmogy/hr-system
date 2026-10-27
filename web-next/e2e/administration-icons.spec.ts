import type { Page } from "@playwright/test";
import { expect as baseExpect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";

const expect = baseExpect.configure({ timeout: 30000 });
async function expectLauncherIcons(page: Page, size: number) {
  const icons = page.locator('a [data-slot="launcher-icon"]:visible');
  await expect.poll(async () => icons.evaluateAll((surfaces, expectedSize) => {
    if (!surfaces.length) return [{ error: "No launcher icons rendered" }];
    return surfaces.flatMap(surface => {
      const svg = surface.querySelector("svg");
      if (!svg) return [{ error: "Missing SVG" }];
      const computed = getComputedStyle(svg);
      const foreground = getComputedStyle(surface).color;
      return computed.color === foreground && computed.fontSize === `${expectedSize}px` ? [] : [{
        error: "Unexpected launcher icon style",
        label: surface.closest("a")?.getAttribute("aria-label"),
        foreground, color: computed.color, fontSize: computed.fontSize,
      }];
    });
  }, size)).toEqual([]);
}

test.beforeEach(async ({ request }) => { await resetTestBackend(request); });

test("Administration wrapped icons inherit launcher contrast and size in light and dark", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" },
    { name: "currentMode", value: "light", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/apps");
  await expect(page.getByRole("link", { name: "Administration", exact: true })).toBeVisible({ timeout: 60000 });
  await expectLauncherIcons(page, 60);
  await page.getByRole("link", { name: "Administration", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Administration", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expectLauncherIcons(page, 38);
  await page.screenshot({ path: "../.codex-tmp/administration-icons-light.png", fullPage: false });
  await context.addCookies([{ name: "currentMode", value: "dark", domain: "localhost", path: "/" }]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expectLauncherIcons(page, 38);
  await page.screenshot({ path: "../.codex-tmp/administration-icons-dark.png", fullPage: false });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Company languages and texts", exact: true })).toBeVisible();
});

test("@mobile Arabic Administration icons keep contrast, size and bounded layout", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/apps/administration");
  await expect(page.getByRole("heading", { name: "الإدارة", exact: true })).toBeVisible({ timeout: 60000 });
  await expect(page.locator("html")).toHaveAttribute("data-app-ready", "true");
  await expectLauncherIcons(page, 38);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/administration-icons-ar-phone.png", fullPage: false });
});
