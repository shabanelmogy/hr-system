import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";
test.beforeEach(async ({ request }) => { await resetTestBackend(request); });

test("global audit uses the shared grid and real cursor pages with protected tool navigation", async ({ page, context }) => {
  test.setTimeout(180000);
  await context.addCookies([{ name: "i18next", value: "en", domain: "localhost", path: "/" }]);
  await page.route(/\/system-audit-trail(?:\/filters)?(?:\?.*)?$/, async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith("filters")) { await route.fulfill({ json: { modules: [{ moduleCode: "platform", entityNames: ["Company"] }] } }); return; }
    const next = Boolean(url.searchParams.get("cursor"));
    await route.fulfill({ json: { items: Array.from({ length: next ? 3 : 50 }, (_, index) => ({ moduleCode: "platform", id: index + (next ? 51 : 1), entityName: "Company", entityKey: String(index + (next ? 51 : 1)), entityDisplay: `Record ${index + (next ? 51 : 1)}`, action: "Modified", userName: "Operator", occurredOn: "2026-10-19T10:00:00Z", changeCount: 1 })), nextCursor: next ? null : "next-50" } });
  });
  await loginWithDemoRole(page, "Super Admin", "/super-admin/audit-trail");
  await expect(page.getByRole("grid")).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole("grid").getByText("Company · Record 1", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Go to next page", exact: true }).focus();
  await page.getByRole("button", { name: "Go to next page", exact: true }).press("Enter");
  await expect(page.getByRole("grid").getByText("Company · Record 51", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Go to previous page", exact: true }).focus();
  await page.getByRole("button", { name: "Go to previous page", exact: true }).press("Enter");
  await expect(page.getByRole("grid").getByText("Company · Record 1", { exact: true })).toBeVisible();
  await page.getByRole("banner").getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("button", { name: "Expand All Sections", exact: true }).click();
  await expect(page.getByRole("button", { name: "System Health", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Background Jobs", exact: true })).toBeVisible();
  await page.screenshot({ path: "../.codex-tmp/super-admin-tools-en.png", fullPage: false });
});
