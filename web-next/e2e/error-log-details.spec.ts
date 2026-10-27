import type { Page } from "@playwright/test";
import type { ErrorLogDetail } from "../src/platform/error-logs/types/errorLogs";
import { expect as baseExpect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";
const expect = baseExpect.configure({ timeout: 30000 });
const message = "Database operation failed.\nFull visible message: " + "database-context-".repeat(35);
const frames = ["Microsoft.Data.SqlClient.SqlException", "Erp." + "VeryLongNamespace.".repeat(90) + "GetResult", "Final.Frame"];
async function mockLongDetail(page: Page, system: boolean) {
  await page.route(system ? /\/system-error-logs\/[0-9a-f-]+(?:\?.*)?$/i : /\/error-logs\/[0-9a-f-]+(?:\?.*)?$/i, async route => {
    const response = await route.fetch();
    const detail: ErrorLogDetail = await response.json();
    await route.fulfill({ response, json: { ...detail, entry: { ...detail.entry, summary: message,
      browser: "Browser/" + "long-user-agent-".repeat(50), ipAddress: "127.0.0.1" }, diagnostics: frames } });
  });
}
test.beforeEach(async ({ request }) => { await resetTestBackend(request); });

test("system error details wrap long frames and copy the complete report in light and dark", async ({ page, context }) => {
  test.setTimeout(180000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await mockLongDetail(page, true);
  await loginWithDemoRole(page, "Super Admin", "/super-admin/error-logs");
  await expect(page.getByRole("heading", { name: "System Error Logs", exact: true })).toBeVisible({ timeout: 60000 });
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(message, { exact: true })).toBeVisible();
  await expect(dialog.getByRole("region", { name: "Action information", exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/error-detail-summary-light.png", fullPage: false });
  const technical = dialog.locator('pre[aria-label="Error diagnostics"]');
  await technical.scrollIntoViewIfNeeded();
  await expect(technical).toHaveText(frames.join("\n"));
  expect(await technical.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  const copy = dialog.getByRole("button", { name: "Copy message", exact: true });
  await expect(copy).toBeInViewport();
  await copy.click();
  await expect(dialog.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
  const copied = (await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n");
  expect(copied).toContain(message);
  expect(copied).toContain(frames.join("\n"));
  expect(copied).toContain("127.0.0.1");
  await page.screenshot({ path: "../.codex-tmp/error-detail-diagnostics-light.png", fullPage: false });
  await context.addCookies([{ name: "currentMode", value: "dark", domain: "localhost", path: "/" }]);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await expect(dialog.getByText(message, { exact: true })).toBeVisible();
  await technical.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "../.codex-tmp/error-detail-diagnostics-dark.png", fullPage: false });
});

test("@mobile company Arabic details stay bounded and copy only company-visible fields", async ({ page, context }) => {
  test.setTimeout(180000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await mockLongDetail(page, false);
  await loginWithDemoRole(page, "Admin", "/advanced-tools/error-logs");
  await expect(page.getByRole("heading", { name: "سجلات الأخطاء", exact: true })).toBeVisible({ timeout: 60000 });
  await page.getByRole("button", { name: "بطاقات", exact: true }).click();
  await page.getByRole("button", { name: "عرض", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText(message, { exact: true })).toBeVisible();
  await expect(dialog.locator("pre")).toHaveCount(0);
  await expect(dialog.getByRole("region", { name: "تشخيص الخطأ", exact: true })).toHaveCount(0);
  await expect(dialog.getByText("127.0.0.1", { exact: true })).toHaveCount(0);
  const copy = dialog.getByRole("button", { name: "نسخ الرسالة", exact: true });
  await expect(copy).toBeInViewport();
  await copy.click();
  await expect(dialog.getByRole("button", { name: "تم النسخ", exact: true })).toBeVisible();
  const copied = (await page.evaluate(() => navigator.clipboard.readText())).replaceAll("\r\n", "\n");
  expect(copied).toContain(message);
  expect(copied).not.toContain("127.0.0.1");
  expect(copied).not.toContain(frames[0]);
  expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/error-detail-company-ar-phone.png", fullPage: false });
});

test("copy denial shows retryable feedback inside the detail dialog", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/advanced-tools/error-logs");
  await expect(page.getByRole("heading", { name: "Error Logs", exact: true })).toBeVisible({ timeout: 60000 });
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  const copy = dialog.getByRole("button", { name: "Copy message", exact: true });
  await expect(copy).toBeVisible();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true,
    value: { writeText: async () => { throw new DOMException("Denied", "NotAllowedError"); } } }));
  await copy.click();
  const retry = dialog.getByRole("button", { name: "Copy failed", exact: true });
  await expect(retry).toBeEnabled();
  await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true,
    value: { writeText: async () => undefined } }));
  await retry.click();
  await expect(dialog.getByRole("button", { name: "Copied", exact: true })).toBeVisible();
});


for (const language of ["en", "ar"] as const) {
  test(`${language === "ar" ? "@mobile " : ""}system empty diagnostics stays explicit and copyable in ${language}`, async ({ page, context }) => {
    test.setTimeout(180000);
    const arabic = language === "ar";
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await context.addCookies([{ name: "i18next", value: language, domain: "localhost", path: "/" }]);
    await page.route(/\/system-error-logs\/[0-9a-f-]+(?:\?.*)?$/i, async route => {
      const response = await route.fetch();
      const detail: ErrorLogDetail = await response.json();
      await route.fulfill({ response, json: { ...detail, diagnostics: [] } });
    });
    await loginWithDemoRole(page, "Super Admin", "/super-admin/error-logs");
    await page.getByRole("button", { name: arabic ? "بطاقات" : "Cards", exact: true }).click();
    await page.getByRole("button", { name: arabic ? "عرض" : "View", exact: true }).first().click();
    const dialog = page.getByRole("dialog");
    const heading = arabic ? "تشخيص الخطأ" : "Error diagnostics";
    const empty = arabic ? "لم تُسجّل تفاصيل تشخيص فنية لهذا السجل." : "No technical diagnostics were captured for this record.";
    const section = dialog.getByRole("region", { name: heading, exact: true });
    await section.scrollIntoViewIfNeeded();
    await expect(section).toBeVisible();
    await expect(section.getByText(empty, { exact: true })).toBeVisible();
    await expect(section.locator("pre")).toHaveCount(0);
    await dialog.getByRole("button", { name: arabic ? "نسخ الرسالة" : "Copy message", exact: true }).click();
    await expect(dialog.getByRole("button", { name: arabic ? "تم النسخ" : "Copied", exact: true })).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    expect(copied).toContain(heading);
    expect(copied).toContain(empty);
    expect(await dialog.evaluate(node => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
    await page.screenshot({ path: `../.codex-tmp/error-diagnostics-empty-${language}.png`, fullPage: false });
  });
}
