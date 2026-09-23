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

test("company switch revalidates the server session before exposing the new context", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(currentCompanyTrigger(page, "Company One")).toBeVisible();

  await currentCompanyTrigger(page, "Company One").click();
  await page.getByRole("menuitem", { name: /Company Two/ }).click();

  await expect(currentCompanyTrigger(page, "Company Two")).toBeVisible();
  const sessionResponse = await page.request.get("/api/auth/session");
  expect(sessionResponse.ok()).toBeTruthy();
  const body = await sessionResponse.json();
  expect(body.user.companyId).toBe(2);
  expect(body.user.companyNameEn).toBe("Company Two");
});

test("company switch drops old-context business data and loads the new scope", async ({ page }) => {
  await loginWithDemoRole(page, "User", "/finance/ledger-setup/fiscal-years");
  await completeUserTenantAndCompanySelection(page);

  await expect(page.getByText("FY-ONE", { exact: true }).first()).toBeVisible();

  await currentCompanyTrigger(page, "Company One").click();
  await page.getByRole("menuitem", { name: /Company Two/ }).click();
  await expect(currentCompanyTrigger(page, "Company Two")).toBeVisible();

  await expect(page.getByText("FY-TWO", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("FY-ONE", { exact: true })).toHaveCount(0);
});
