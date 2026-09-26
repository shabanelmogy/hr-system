import {
  expect,
  loginWithDemoRole,
  resetTestBackend,
  test,
} from "./support/erp-fixture";

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("admin can open a screen and edit its permissions without a horizontal matrix", async ({ page }) => {
  await loginWithDemoRole(
    page,
    "Admin",
    "/administration/manage-role-permissions/finance-manager",
  );

  await expect(page).toHaveURL(
    /\/administration\/manage-role-permissions\/finance-manager$/,
    { timeout: 15_000 },
  );
  await expect(page.getByRole("heading", { name: "Permissions for Finance managers" }))
    .toBeVisible();
  await expect(page.getByText("Permission workspace", { exact: true })).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);

  const usersScreen = page.getByRole("button", { name: /Users/ });
  await expect(usersScreen).toBeVisible();
  await usersScreen.click();
  await expect(page.getByRole("checkbox", { name: "View permission for Users" }))
    .toBeVisible();
  await expect(page.getByRole("checkbox", { name: "Create permission for Users" }))
    .toBeVisible();

  await page.getByPlaceholder("Search screens or permission actions").fill("users");
  await expect(page.getByText("Users", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Accounts", { exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Select filtered screen permissions" }).click();
  await expect(page.getByText(/permission changes are ready to save/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Save permissions" })).toBeEnabled();
});
