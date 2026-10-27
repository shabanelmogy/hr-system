import { expect as baseExpect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";

const expect = baseExpect.configure({ timeout: 30000 });

test.beforeEach(async ({ request }) => { await resetTestBackend(request); });

test("Administration is one application with permission-filtered children and Settings tabs", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/apps");
  await expect(page).toHaveURL(/\/apps$/, { timeout: 60000 });
  const administration = page.getByRole("link", { name: "Administration", exact: true });
  await expect(administration).toBeVisible({ timeout: 30000 });
  await expect(administration).toHaveCount(1);
  await expect(page.locator('a[href="/administration/users"]')).toHaveCount(0);
  await expect(page.locator('a[href="/administration/company-localizations"]')).toHaveCount(0);
  await page.screenshot({ path: "../.codex-tmp/administration-applications-en.png", fullPage: false });
  await administration.click();
  await expect(page).toHaveURL(/\/apps\/administration$/);
  await expect(page.getByRole("heading", { name: "Administration", exact: true })).toBeVisible();
  await expect(page.locator('a[href="/administration/users"]')).toBeVisible();
  await expect(page.locator('a[href="/administration/roles"]')).toBeVisible();
  await expect(page.locator('a[href="/advanced-tools/error-logs"]')).toBeVisible();
  await expect(page.locator('a[href="/super-admin/error-logs"]')).toHaveCount(0);
  await expect(page.locator('a[href="/administration/company-localizations"]')).toHaveCount(0);
  await page.screenshot({ path: "../.codex-tmp/administration-module-en.png", fullPage: false });
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Company languages and texts", exact: true })).toBeVisible();
  await expect(page.getByRole("grid")).toBeVisible();
});

test("@mobile Administration preserves Arabic layout and direct module child URLs", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/apps/administration");
  await expect(page.getByRole("heading", { name: "الإدارة", exact: true })).toBeVisible({ timeout: 60000 });
  await expect(page.locator('a[href="/administration/settings"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/administration-module-ar-phone.png", fullPage: false });
  await page.goto("/apps/administration/administration-settings");
  await expect(page).toHaveURL(/\/administration\/settings$/, { timeout: 30000 });
  await expect(page.getByRole("tab", { name: "لغات الشركة وترجمة الواجهة", exact: true })).toBeVisible();
});
