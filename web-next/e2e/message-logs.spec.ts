import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";
import en from "../src/locales/resources/platform-messages/en.json" with { type: "json" };
import ar from "../src/locales/resources/platform-messages/ar.json" with { type: "json" };
import enCore from "../src/locales/resources/core/en.json" with { type: "json" };
import arCore from "../src/locales/resources/core/ar.json" with { type: "json" };

test.beforeEach(async ({ request }) => { await resetTestBackend(request); });
for (const language of ["en", "ar"] as const) {
  test(`company message history uses shared controls, scoped export and redacted scrollable detail (${language})`, async ({ page, context }) => {
    test.setTimeout(180000);
    const labels = (language === "ar" ? ar : en).messageLogs; const core = language === "ar" ? arCore : enCore;
    await context.addCookies([{ name: "i18next", value: language, domain: "localhost", path: "/" }]);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const rows = Array.from({ length: 30 }, (_, index) => ({
      id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, startedOnUtc: "2026-10-21T12:00:00Z", completedOnUtc: "2026-10-21T12:00:01Z", durationMs: index === 0 ? 0 : 1000,
      type: "email", templateId: "email-confirmation", language, recipient: `recipient${index}@example.test`, subject: `Recorded subject ${index + 1}`,
      status: index < 20 ? "accepted" : "uncertain", phase: index < 20 ? "disconnect" : "send", cause: index < 20 ? null : "communication", smtpStatusCode: null, correlationId: `message-test-${index}`, snapshotTruncated: false,
    }));
    let lastExport = "";
    await page.route(/\/api\/v1\/message-logs(?:\/[^?]*)?(?:\?.*)?$/, async route => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith("/export")) {
        lastExport = url.search;
        await route.fulfill({ contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers: { "Content-Disposition": 'attachment; filename="message-logs.xlsx"' }, body: Buffer.from("PK\x03\x04test-download") }); return;
      }
      const selected = rows.find(row => url.pathname.endsWith("/" + row.id));
      if (selected) {
        const content = Array.from({ length: 45 }, (_, index) => `<p>Recorded body line ${index + 1}</p>`).join("");
        await route.fulfill({ json: { entry: selected, snapshotHtml: `<html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}"><body><h2>Historical snapshot</h2>${content}<a>Deactivated action</a><p>LAST_RECORDED_LINE</p></body></html>` } }); return;
      }
      const search = url.searchParams.get("search")?.toLowerCase() ?? "";
      const filtered = rows.filter(row => (!url.searchParams.get("status") || row.status === url.searchParams.get("status")) &&
        (!url.searchParams.get("recipient") || row.recipient.includes(url.searchParams.get("recipient")!)) &&
        (row.subject + row.recipient + row.correlationId).toLowerCase().includes(search));
      const size = Number(url.searchParams.get("pageSize") ?? 25); const current = Number(url.searchParams.get("page") ?? 1);
      await route.fulfill({ json: { items: filtered.slice((current - 1) * size, current * size), totalCount: filtered.length, page: current, pageSize: size } });
    });
    await loginWithDemoRole(page, "Admin", "/administration/message-logs");
    await expect(page.getByRole("heading", { name: labels.title, exact: true })).toBeVisible({ timeout: 45000 });
    await expect(page.getByRole("grid")).toBeVisible();
    await expect(page.getByRole("button", { name: core.actions.gridOptions, exact: true })).toBeVisible();
    const lastPage = page.waitForResponse(response => new URL(response.url()).pathname.endsWith("/message-logs") && new URL(response.url()).searchParams.get("page") === "2");
    const lastRecord = page.getByRole("button", { name: core.pagination.goToLastRecord, exact: true });
    await lastRecord.scrollIntoViewIfNeeded(); await lastRecord.click(); await lastPage;
    await expect(page.getByRole("grid").getByText("Recorded subject 30", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: core.pagination.goToFirstRecord, exact: true }).click();
    await expect(page.getByRole("grid").getByText("Recorded subject 1", { exact: true })).toBeVisible();
    await page.getByRole("grid").getByRole("row").filter({ hasText: "Recorded subject 1" }).first().dblclick();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(labels.snapshotHint, { exact: true })).toBeVisible();
    const iframe = dialog.locator(`iframe[title="${labels.snapshot}"]`); await iframe.scrollIntoViewIfNeeded();
    await expect(iframe).toHaveAttribute("tabindex", "0"); await expect(iframe).toHaveCSS("pointer-events", "auto");
    const frame = page.frameLocator(`iframe[title="${labels.snapshot}"]`);
    await expect(frame.getByText("Historical snapshot", { exact: true })).toBeVisible();
    await expect(frame.locator("a[href]")).toHaveCount(0); await expect(frame.locator("html")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
    await iframe.hover(); await page.mouse.wheel(0, 6000); await expect(frame.getByText("LAST_RECORDED_LINE", { exact: true })).toBeInViewport();
    await dialog.getByRole("button", { name: labels.copyDetails, exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain("LAST_RECORDED_LINE");
    await page.screenshot({ path: `../.codex-tmp/message-log-detail-${language}.png`, fullPage: false });
    await dialog.getByRole("button", { name: core.general.close, exact: true }).filter({ hasText: core.general.close }).click();
    await page.getByRole("combobox", { name: labels.status, exact: true }).click();
    await page.getByRole("option", { name: labels.statuses.uncertain, exact: true }).click();
    await expect(page.getByRole("grid").getByText("Recorded subject 21", { exact: true })).toBeVisible();
    await expect(page.getByRole("grid").getByText("Recorded subject 1", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: core.views.cards, exact: true }).click();
    await expect(page.getByText("recipient20@example.test", { exact: true })).toBeVisible();
    const download = page.waitForEvent("download"); await page.getByRole("button", { name: core.actions.export, exact: true }).click();
    await page.getByRole("menuitem", { name: labels.export, exact: true }).click();
    expect((await download).suggestedFilename()).toBe("message-logs.xlsx"); expect(lastExport).toContain("status=uncertain");
    await page.screenshot({ path: `../.codex-tmp/message-logs-cards-${language}.png`, fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
