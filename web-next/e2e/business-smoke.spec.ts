import {
  completeUserTenantAndCompanySelection,
  expect,
  loginWithDemoRole,
  resetTestBackend,
  setCountriesMode,
  test,
} from "./support/erp-fixture";

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("Countries covers list search, validation, create and update through the real BFF", async ({ page }) => {
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");
  await expect(
    page.getByRole("heading", { name: "Countries Management" }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText("Egypt", { exact: true }).first()).toBeVisible();

  const search = page.getByPlaceholder("Search countries by name, code, phone, or currency...");
  await search.fill("Egypt");
  await expect(page.getByText("Egypt", { exact: true }).first()).toBeVisible();

  const missingCountryResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    return (
      response.request().method() === "GET" &&
      url.pathname === "/api/v1/countries" &&
      url.searchParams.get("search") === "missing-country"
    );
  });
  await search.fill("missing-country");
  expect((await missingCountryResponse).ok()).toBeTruthy();
  await expect(page.getByText("Egypt", { exact: true })).toHaveCount(0);
  await search.fill("");

  await page.getByRole("button", { name: "Add", exact: true }).click();
  const addForm = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: "Add Country" }) });
  await expect(addForm).toBeVisible();
  await addForm.getByRole("button", { name: "Create", exact: true }).click();
  await expect(addForm.getByRole("button", { name: /Review 2 validation errors/ })).toBeVisible();

  await addForm.getByLabel("Name Arabic").fill("السعودية");
  await addForm.getByLabel("Name English").fill("Saudi Arabia");
  await addForm.getByLabel("Alpha-2 Code").fill("SA");
  await addForm.getByLabel("Alpha-3 Code").fill("SAU");
  await addForm.getByLabel("Phone Code").fill("+966");
  await addForm.getByLabel("Currency Code").fill("SAR");
  await addForm.getByRole("button", { name: "Create", exact: true }).click();

  await expect(page.getByText("Saudi Arabia", { exact: true }).first()).toBeVisible();

  const createdRow = page.getByRole("row").filter({ hasText: "Saudi Arabia" });
  await createdRow.getByRole("button", { name: "Edit" }).click();
  const editForm = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: "Edit Country" }) });
  await expect(editForm).toBeVisible();
  await editForm.getByLabel("Name English").fill("Saudi Arabia Updated");
  await editForm.getByRole("button", { name: "Update", exact: true }).click();

  await expect(page.getByText("Saudi Arabia Updated", { exact: true }).first()).toBeVisible();
});

test("Countries exposes a recoverable API failure state", async ({ page, request }) => {
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");
  await expect(page.getByText("Egypt", { exact: true }).first()).toBeVisible();

  await setCountriesMode(request, "fail");
  await page.reload();

  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("button", { name: "Retry" })).toBeVisible();

  await setCountriesMode(request, "ok");
  await page.getByRole("button", { name: "Retry" }).click();
  await expect(page.getByText("Egypt", { exact: true }).first()).toBeVisible();
});

test("dirty country form blocks browser history traversal until changes are discarded", async ({ page }) => {
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");
  await expect(page.getByRole("heading", { name: "Countries Management" }).first()).toBeVisible();

  await page.evaluate(() => {
    history.pushState({}, "", "/super-admin/geography/countries?e2e-history=1");
  });
  await page.getByRole("button", { name: "Add", exact: true }).click();
  const addForm = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: "Add Country" }) });
  await addForm.getByLabel("Name English").fill("Unsaved country");

  await page.evaluate(() => history.back());
  const discardDialog = page.getByRole("dialog").filter({ has: page.getByRole("heading", { name: "Unsaved changes" }) });
  await expect(discardDialog).toBeVisible();
  await discardDialog.getByRole("button", { name: "Cancel" }).click();
  await expect(page).toHaveURL(/e2e-history=1/);

  await page.evaluate(() => history.back());
  await expect(discardDialog).toBeVisible();
  await discardDialog.getByRole("button", { name: "Discard changes" }).click();
  await expect(page).toHaveURL(/\/super-admin\/geography\/countries$/);
});

test("Fiscal Years, Appointments and HR each have a browser-level module smoke", async ({ page }) => {
  await loginWithDemoRole(page, "User", "/finance/fiscal-years");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByText("FY-ONE", { exact: true }).first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/appointments");
  await expect(page.getByRole("grid").first()).toBeVisible();

  await page.context().clearCookies();
  await loginWithDemoRole(page, "Admin", "/basic-data/organizational-structure/branches");
  await expect(page.getByText("Head Office", { exact: true }).first()).toBeVisible();
});

test("Fiscal Years covers tenant-scoped create and update through the shared form pattern", async ({ page }) => {
  await loginWithDemoRole(page, "User", "/finance/fiscal-years");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Fiscal Years" })).toBeVisible();

  await page.getByRole("button", { name: "Add", exact: true }).click();
  const addForm = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Add Fiscal Year" }),
  });
  await expect(addForm).toBeVisible();
  await addForm.getByLabel("Code").fill("FY-2027");
  await addForm.getByLabel("Name Arabic").fill("السنة المالية 2027");
  await addForm.getByLabel("Name English").fill("Fiscal Year 2027");
  const startDate = addForm.getByRole("group", { name: "Start date" });
  await startDate.getByRole("spinbutton", { name: "Day" }).fill("01");
  await startDate.getByRole("spinbutton", { name: "Month" }).fill("01");
  await startDate.getByRole("spinbutton", { name: "Year" }).fill("2027");
  await addForm.getByRole("button", { name: "Create", exact: true }).click();

  await expect(page.getByText("FY-2027", { exact: true }).first()).toBeVisible();
  const createdRow = page.getByRole("row").filter({ hasText: "FY-2027" });
  await createdRow.getByRole("button", { name: "Edit" }).click();

  const editForm = page.getByRole("dialog").filter({
    has: page.getByRole("heading", { name: "Edit Fiscal Year" }),
  });
  await expect(editForm).toBeVisible();
  await editForm.getByLabel("Name English").fill("Fiscal Year 2027 Updated");
  await editForm.getByRole("button", { name: "Update", exact: true }).click();

  await expect(page.getByText("Fiscal Year 2027 Updated", { exact: true }).first()).toBeVisible();
});
