import {
  expect,
  loginWithDemoRole,
  resetTestBackend,
  test,
} from "./support/erp-fixture";

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("route guard renders a browser-level 403 for an authenticated user without the required boundary", async ({ page }) => {
  await loginWithDemoRole(page, "Admin", "/super-admin/geography/countries");

  await expect(page).toHaveURL(/\/super-admin\/geography\/countries$/);
  await expect(page.getByText("403", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Access Denied" })).toBeVisible();
});

test("super admin can load the protected Countries reference-data surface", async ({ page }) => {
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");

  await expect(page).toHaveURL(/\/super-admin\/geography\/countries$/);
  await expect(
    page.getByRole("heading", { name: "Countries Management" }).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByText("Egypt", { exact: true }).first()).toBeVisible();
});
