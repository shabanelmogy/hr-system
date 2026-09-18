import {
  completeUserTenantAndCompanySelection,
  currentCompanyTrigger,
  expect,
  loginWithDemoRole,
  resetTestBackend,
  test,
} from "./support/erp-fixture";

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("authenticated shell survives hard refresh and browser history navigation", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);

  await page.getByRole("link", { name: "Accounting" }).click();
  await expect(page).toHaveURL(/\/apps\/acc$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/\/apps\/acc$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(currentCompanyTrigger(page, "Company One")).toBeVisible();
});

test("unknown public route renders the App Router 404 surface", async ({ page }) => {
  await page.goto("/login/e2e-missing-route");
  await expect(page.getByText("404", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("authenticated desktop shell can switch to RTL without losing navigation", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  const languageSelector = page
    .getByText("Choose Language", { exact: true })
    .locator("..")
    .getByRole("combobox");
  await languageSelector.click();
  await page.getByRole("option", { name: "Arabic" }).click();

  const languageCookie = (await page.context().cookies()).find((cookie) => cookie.name === "i18next");
  expect(languageCookie?.value).toBe("ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  const arabicLanguageSelector = page
    .getByText("إختر اللغة", { exact: true })
    .locator("..")
    .getByRole("combobox");
  await expect(arabicLanguageSelector).toHaveText("العربية");
});

test("PPR/Instant Navigation keeps the authenticated shell in the same document", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  const initialTimeOrigin = await page.evaluate(() => performance.timeOrigin);
  await page.getByRole("link", { name: "Accounting" }).click();

  await expect(page).toHaveURL(/\/apps\/acc$/);
  await expect.poll(() => page.evaluate(() => performance.timeOrigin)).toBe(initialTimeOrigin);
});
