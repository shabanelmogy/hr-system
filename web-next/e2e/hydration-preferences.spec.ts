import type { Page } from "@playwright/test";
import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";

/**
 * Saved preferences (language, mode, palette) are applied after the static shell hydrates.
 * Protected route segments stream in later; they must still hydrate against the server
 * HTML (built with the defaults) without a hydration mismatch.
 */
function collectHydrationErrors(page: Page) {
  const errors: string[] = [];
  const record = (text: string) => {
    if (/hydrat|did not match|didn.t match|react\.dev\/errors\/(418|423|425)/i.test(text)) errors.push(text.slice(0, 300));
  };
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") record(message.text());
  });
  page.on("pageerror", (error) => record(error.message));
  return errors;
}

test("protected pages hydrate cleanly with saved Arabic, dark, orange preferences", async ({ page, request }) => {
  test.setTimeout(240_000);
  await resetTestBackend(request);
  await loginWithDemoRole(page, "Super Admin", "/super-admin");
  await expect(page.getByText("Tenant Gamma", { exact: true }).first()).toBeVisible({ timeout: 30_000 });

  const url = new URL(page.url());
  await page.context().addCookies(
    [
      ["i18next", "ar"],
      ["currentMode", "dark"],
      ["themePalette", "orange"],
    ].map(([name, value]) => ({ name, value, domain: url.hostname, path: "/" })),
  );

  const errors = collectHydrationErrors(page);
  for (const path of ["/super-admin", "/super-admin/geography/countries", "/super-admin"]) {
    await page.goto(path);
    await page.waitForFunction(() => document.documentElement.dataset.appReady === "true");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1_000);
    if (errors.length) console.log(path, errors);
  }
  expect(errors).toEqual([]);
});
