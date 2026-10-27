import { expect, loginWithDemoRole, resetTestBackend, test } from "./support/erp-fixture";
import en from "../src/locales/resources/core/en.json" with { type: "json" };
import ar from "../src/locales/resources/core/ar.json" with { type: "json" };

test.beforeEach(async ({ request }) => { await resetTestBackend(request); });
for (const language of ["en", "ar"] as const) {
  test(`company template editor previews final draft, validates, saves and resets (${language})`, async ({ page, context }) => {
    test.setTimeout(180000);
    const labels = (language === "ar" ? ar : en).emailTemplates;
    await context.addCookies([{ name: "i18next", value: language, domain: "localhost", path: "/" }]);
    let revision = 0;
    const defaults = [
      { id: "email-confirmation", nameEn: "Email confirmation", nameAr: "تأكيد البريد الإلكتروني" },
      { id: "password-reset", nameEn: "Password reset", nameAr: "استعادة كلمة المرور" },
      { id: "user-invitation", nameEn: "User invitation", nameAr: "دعوة مستخدم" },
    ];
    let saved: { subject: string; body: string } | null = null;
    let saves = 0;
    const originalBody = '<h2>Account message</h2><p>Hello {FIRST_NAME}</p><p><a href="{ACTION_URL}">Continue</a></p>';
    await page.route(/\/company-email-templates(?:\/[^?]*)?(?:\?.*)?$/, async route => {
      const request = route.request(); const url = new URL(request.url());
      if (request.method() === "GET") {
        let rows = defaults.map(item => ({ ...item, language: url.searchParams.get("language") ?? "en", subject: saved?.subject ?? "ERP message", body: saved?.body ?? originalBody,
          isCustomized: saved !== null, revision, variables: [
            { token: "{FIRST_NAME}", nameEn: "First name", nameAr: "الاسم الأول", sample: "Alex", subjectAllowed: true, required: false },
            { token: "{ACTION_URL}", nameEn: "Account action link", nameAr: "رابط إجراء الحساب", sample: "https://example.invalid/account-action", subjectAllowed: false, required: true },
          ] }));
        const search = url.searchParams.get("search")?.toLowerCase() ?? "";
        rows = rows.filter(item => (item.nameEn + item.nameAr + item.subject).toLowerCase().includes(search));
        const status = url.searchParams.get("status");
        rows = rows.filter(item => status !== "customized" || item.isCustomized).filter(item => status !== "default" || !item.isCustomized);
        await route.fulfill({ json: { items: rows, totalCount: rows.length, page: 1, pageSize: 10, revision } }); return;
      }
      const body = request.postDataJSON() as { subject?: string; body?: string; expectedRevision?: number };
      if (url.pathname.endsWith("/preview")) {
        await route.fulfill({ json: { subject: body.subject ?? saved?.subject ?? "ERP message",
          html: `<html dir="${language === "ar" ? "rtl" : "ltr"}"><body>${(body.body ?? saved?.body ?? originalBody).replaceAll("{FIRST_NAME}", "Alex").replaceAll("{ACTION_URL}", "https://example.invalid/account-action")}</body></html>`, text: "Hello Alex" } }); return;
      }
      if (body.expectedRevision !== revision) { await route.fulfill({ status: 409, json: { title: "Conflict" } }); return; }
      revision++;
      if (url.pathname.endsWith("/reset")) saved = null;
      else { saved = { subject: body.subject!, body: body.body! }; saves++; }
      await route.fulfill({ status: 204 });
    });
    await loginWithDemoRole(page, "Admin", "/administration/email-templates");
    await page.waitForURL(/\/administration\/email-templates$/, { timeout: 90000 });
    await expect(page.getByRole("heading", { name: labels.title, exact: true })).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole("grid")).toBeVisible();
    if (language === "ar") {
      await page.getByRole("combobox", { name: labels.language, exact: true }).click();
      await page.getByRole("option", { name: labels.arabic, exact: true }).click();
    }
    const row = page.getByRole("row").filter({ hasText: language === "ar" ? "تأكيد البريد الإلكتروني" : "Email confirmation" });
    await row.getByRole("button", { name: labels.edit, exact: true }).click();
    const dialog = page.getByRole("dialog");
    const subject = dialog.getByRole("textbox", { name: labels.subject, exact: true });
    const editor = dialog.getByRole("textbox", { name: labels.body, exact: true });
    await expect(editor).toBeVisible({ timeout: 30000 });
    await subject.fill("");
    await dialog.getByRole("button", { name: language === "ar" ? /حفظ/ : "Save Changes", exact: true }).click();
    await expect(dialog.getByText(labels.subjectValidation, { exact: true }).last()).toBeVisible();
    expect(saves).toBe(0);
    await subject.fill(language === "ar" ? "رسالة شركتي" : "My company message");
    await editor.click(); await editor.press("Control+End"); await editor.press("ArrowRight"); await editor.pressSequentially(" Extra");
    const formatting = (language === "ar" ? ar : en).richText;
    const bold = dialog.getByRole("button", { name: formatting.bold, exact: true });
    await bold.click(); await expect(bold).toHaveAttribute("aria-pressed", "true");
    await editor.pressSequentially(" Bold");
    await expect(editor.locator("strong")).toContainText("Bold");
    await dialog.getByRole("button", { name: formatting.undo, exact: true }).click();
    await dialog.getByRole("button", { name: formatting.redo, exact: true }).click();
    await expect(editor.locator("strong")).toContainText("Bold");
    await dialog.getByRole("button", { name: labels.preview, exact: true }).click();
    const frame = page.frameLocator(`iframe[title="${labels.preview}"]`);
    await expect(frame.getByText(/Hello Alex/)).toBeVisible();
    await expect(frame.locator("body")).toContainText("Extra");
    await page.locator(`iframe[title="${labels.preview}"]`).scrollIntoViewIfNeeded();
    expect(saves).toBe(0);
    await page.screenshot({ path: `../.codex-tmp/email-template-preview-${language}.png`, fullPage: false });
    await dialog.getByRole("button", { name: language === "ar" ? /حفظ/ : "Save Changes", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    expect(saves).toBe(1);
    await row.getByRole("button", { name: labels.reset, exact: true }).click();
    await page.getByRole("dialog").getByRole("button", { name: labels.reset, exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const next = page.getByRole("button", { name: (language === "ar" ? ar : en).pagination.goToNextRecord, exact: true });
    await next.scrollIntoViewIfNeeded(); await expect(next).toBeInViewport();
    await page.screenshot({ path: `../.codex-tmp/email-templates-${language}.png`, fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}
