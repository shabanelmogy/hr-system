import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";

test.beforeEach(async ({ request }) => { await resetTestBackend(request); });

test("system viewer and tabbed Settings are siblings inside Administration", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Super Admin", "/super-admin/error-logs");
  await expect(page.getByRole("heading", { name: "System Error Logs", exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole("grid")).toBeVisible();
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await page.getByRole("button", { name: "View", exact: true }).nth(1).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("ClientError", { exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Administration", exact: true }).click();
  await expect(page.getByRole("button", { name: "System Error Logs", exact: true })).toBeVisible();
  const group = page.getByRole("button", { name: "Settings", exact: true }).last();
  await group.click();
  await expect(page).toHaveURL(/\/administration\/settings$/);
  await expect(page.getByRole("tab", { name: "Error Log Settings", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tab", { name: "Company languages and texts", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Error Log Settings", exact: true })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("90", { exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/settings-tabs-system-en.png", fullPage: false });
  await context.addCookies([{ name: "currentMode", value: "dark", domain: "localhost", path: "/" }]);
  await page.reload();
  await expect(page.getByRole("button", { name: "Edit retention", exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/settings-cards-retention-en-dark.png", fullPage: false });
});

test("Settings embeds company editors in shared tabs and preserves deep selection", async ({ page, context }) => {
  test.setTimeout(120000);
  const settingsExpect = expect.configure({ timeout: 30000 });
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/administration/settings");
  await settingsExpect(page).toHaveURL(/\/administration\/settings$/, { timeout: 60000 });
  const translations = page.getByRole("tab", { name: "Company languages and texts", exact: true });
  const offline = page.getByRole("tab", { name: "Offline Operations", exact: true });
  await settingsExpect(translations).toHaveAttribute("aria-selected", "true");
  await settingsExpect(page.getByRole("heading", { name: "Company languages and texts", exact: true })).toBeVisible({ timeout: 30000 });
  await settingsExpect(page.getByRole("grid")).toBeVisible({ timeout: 30000 });
  await settingsExpect(page.getByRole("tab", { name: "Error Log Settings", exact: true })).toHaveCount(0);
  await offline.click();
  await settingsExpect(page).toHaveURL(/\/administration\/settings\?tab=offline-operations$/);
  await settingsExpect(page.getByRole("heading", { name: "Offline Operations", exact: true })).toBeVisible();
  await settingsExpect(offline).toHaveAttribute("aria-selected", "true");
  await settingsExpect(page.getByRole("region", { name: "Active policy scope", exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/settings-cards-offline-en.png", fullPage: false });
  await settingsExpect(page.getByRole("grid")).toHaveCount(0);
  await page.reload();
  await settingsExpect(offline).toHaveAttribute("aria-selected", "true");
  await translations.click();
  await settingsExpect(page.getByRole("grid")).toBeVisible({ timeout: 30000 });
  const footer = page.locator(".MuiDataGrid-footerContainer");
  await settingsExpect(footer).toBeVisible();
  const footerBox = await footer.boundingBox();
  expect(footerBox).not.toBeNull();
  expect(footerBox!.y + footerBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Administration", exact: true }).click();
  const settingsEntry = page.locator("#app-sidebar").getByRole("button", { name: "Settings", exact: true });
  await settingsExpect(settingsEntry).toBeVisible();
  await settingsEntry.scrollIntoViewIfNeeded();
  await settingsExpect(settingsEntry).toBeInViewport();
  await page.screenshot({ path: "../.codex-tmp/settings-tabs-company-en.png", fullPage: false });
});

test("@mobile Arabic Settings uses scrollable shared tabs and bounded editors", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/administration/settings");
  await expect(page.getByRole("tab", { name: "لغات الشركة وترجمة الواجهة", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "العمليات دون اتصال", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toBeVisible();
  await expect(page.getByRole("tab", { name: "العمليات دون اتصال", exact: true })).toHaveAttribute("aria-selected", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/settings-tabs-company-ar-phone.png", fullPage: false });
});

test("@mobile Arabic retention cards keep the primary action and metrics readable", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Super Admin", "/administration/settings");
  await expect(page.getByRole("tab")).toHaveCount(1);
  const edit = page.getByRole("button", { name: "تعديل مدة الاحتفاظ", exact: true });
  await expect(edit).toBeVisible({ timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.appReady === "true");
  await edit.click({ trial: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/settings-cards-retention-ar-phone.png", fullPage: false });
  await edit.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("company error logs are scoped, filtered and export the current query", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/advanced-tools/error-logs");
  await expect(page.getByRole("heading", { name: "Error Logs", exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Administration", exact: true }).click();
  await expect(page.getByRole("button", { name: "Error Logs", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "System Error Logs", exact: true })).toHaveCount(0);
  await page.screenshot({ path: "../.codex-tmp/administration-company-menu-en.png", fullPage: false });
  await page.getByRole("banner").getByRole("button", { name: "Close navigation", exact: true }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  await page.getByRole("button", { name: "Filter", exact: true }).click();
  await expect(page.getByRole("button", { name: "Filter", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Grid options", exact: true })).toBeVisible();
  await expect(page.getByRole("grid").getByRole("checkbox")).toHaveCount(0);
  const lastPage = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname.endsWith("/error-logs") && url.searchParams.get("page") === "2" && response.ok();
  });
  await page.getByRole("button", { name: "Go to last record", exact: true }).click();
  await lastPage;
  await page.getByRole("button", { name: "Go to first record", exact: true }).click();
  // The first page is still fresh in React Query; returning need not issue HTTP.
  await expect(page.getByText("Page 1 of 2", { exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/error-logs-company-grid-en.png", fullPage: true });
  await page.getByPlaceholder("Search summary, service, action or correlation").fill("error-correlation-1");
  const filtered = await page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname.endsWith("/error-logs") && url.searchParams.get("search") === "error-correlation-1" && response.ok();
  });
  expect((await filtered.json()).totalCount).toBeGreaterThan(0);
  await page.getByRole("button", { name: "View", exact: true }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").getByText("IP address")).toHaveCount(0);
  await page.screenshot({ path: "../.codex-tmp/error-logs-company-detail-en.png", fullPage: true });
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export XLSX" }).click();
  expect((await download).suggestedFilename()).toBe("error-logs.xlsx");
});

test("global retention validates and resolves stale revision without losing the draft", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Super Admin", "/super-admin/error-log-settings");
  await expect(page.getByRole("heading", { name: "Error Log Settings" })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("90", { exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/error-log-settings-en.png", fullPage: false });
  await page.getByRole("button", { name: "Edit retention" }).click();
  const dialog = page.getByRole("dialog");
  const days = dialog.getByRole("spinbutton", { name: "Retention days" });
  await days.fill("0");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByText("Enter a whole number from 1 to 3,650.")).toBeVisible();
  await days.fill("30");
  const concurrent = await page.request.put("/api/v1/system-error-logs/settings", { data: { retentionDays: 60, expectedRevision: 0 } });
  expect(concurrent.status()).toBe(200);
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog.getByText(/settings changed elsewhere/i)).toBeVisible();
  await dialog.getByRole("button", { name: "Reload", exact: true }).click();
  await expect(days).toHaveValue("30");
  await dialog.getByRole("button", { name: "Save" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("30", { exact: true }).first()).toBeVisible();
});

test("shared criteria survive Grid and Cards, preserve UTC dates and recover from an empty result", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/advanced-tools/error-logs");
  const toggle = page.getByRole("button", { name: "Filter", exact: true });
  await toggle.click();
  const from = page.getByRole("group", { name: "From date (UTC)" });
  await from.getByRole("spinbutton").first().click();
  await page.keyboard.type("17102026");
  await expect(from.getByRole("textbox", { includeHidden: true })).toHaveValue("17/10/2026");
  await page.getByRole("textbox", { name: "User", exact: true }).fill("admin");
  await page.getByRole("combobox", { name: "Source", exact: true }).click();
  await page.getByRole("option", { name: "Mobile", exact: true }).click();
  const filteredResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return url.pathname.endsWith("/error-logs") && url.searchParams.get("source") === "mobile"
      && url.searchParams.get("fromUtc") === "2026-10-17T00:00:00.000Z" && response.ok();
  });
  await page.getByRole("combobox", { name: "HTTP status", exact: true }).click();
  await page.getByRole("option", { name: "404", exact: true }).click();
  expect((await (await filteredResponse).json()).page).toBe(1);
  await expect(page.getByText("No matching errors found.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Source", exact: true })).toHaveValue("Mobile");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.getByRole("textbox", { name: "User", exact: true })).toHaveValue("admin");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(page.getByRole("button", { name: "View", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Source", exact: true })).toHaveValue("All");
  await page.screenshot({ path: "../.codex-tmp/error-logs-shared-filters-cards-en.png", fullPage: false });
});

test("@mobile Arabic company cards keep direction and no page overflow", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "ar", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Admin", "/advanced-tools/error-logs");
  await expect(page.getByRole("heading", { name: "سجلات الأخطاء", exact: true })).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "بطاقات" }).click();
  const filters = page.getByRole("button", { name: "تصفية", exact: true });
  await filters.click();
  await expect(filters).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("group", { name: "من تاريخ (UTC)" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "../.codex-tmp/error-logs-shared-filters-phone-ar.png", fullPage: false });
  await filters.click();
  await expect(page.getByRole("navigation", { name: /pages|الصفحات/i }).filter({ hasText: /عرض 1-25 من 31/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  console.log("Error Logs mobile layout", await page.evaluate(() => ({
    viewportHeight: window.innerHeight,
    documentHeight: document.documentElement.scrollHeight,
    scrollables: [...document.querySelectorAll("*")].filter((element) => element.scrollHeight > element.clientHeight + 5 && getComputedStyle(element).overflowY === "auto").slice(-8).map((element) => ({
      tag: element.tagName, className: String(element.className).slice(0, 80), clientHeight: element.clientHeight, scrollHeight: element.scrollHeight,
    })),
  })));
  await page.screenshot({ path: "../.codex-tmp/error-logs-company-cards-phone-ar.png", fullPage: false });
});

test("existing Countries Grid and Cards retain the shared header and sorting controls", async ({ page, context }) => {
  test.setTimeout(120000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");
  await expect(page.getByRole("heading", { name: "Countries Management" }).filter({ visible: true })).toBeVisible();
  await expect(page.getByRole("grid")).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/error-logs-reference-countries-grid-en.png", fullPage: false });
  await page.getByRole("button", { name: "Cards", exact: true }).click();
  await expect(page.getByPlaceholder("Search countries by name, code, phone, or currency...")).toBeVisible();
  await expect(page.getByText("Sort By", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset", exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/error-logs-reference-countries-cards-en.png", fullPage: false });
});
