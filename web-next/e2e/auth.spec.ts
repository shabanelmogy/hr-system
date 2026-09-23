import {
  completeUserTenantAndCompanySelection,
  currentCompanyTrigger,
  expect,
  invalidateAccessTokens,
  invalidateAllSessions,
  loginWithDemoRole,
  resetTestBackend,
  setSessionMode,
  test,
} from "./support/erp-fixture";

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("protected navigation returns an anonymous user to login", async ({ page }) => {
  await page.goto("/finance/ledger-setup/fiscal-years");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Ffinance%2Fledger-setup%2Ffiscal-years$/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("demo user completes tenant and company selection before entering the ERP", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Accounting" })).toBeVisible();
  await expect(page.getByRole("link", { name: "CRM" })).toBeVisible();
  await expect(currentCompanyTrigger(page, "Company One")).toBeVisible();
});

test("explicit logout clears the protected session and rejects the next protected navigation", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await page.locator('[aria-label="Settings"]:visible').click();
  await page.getByRole("menuitem").filter({ hasText: "Logout" }).click();

  await expect(page).toHaveURL(/\/login$/);

  await page.goto("/finance/ledger-setup/fiscal-years");
  await expect(page).toHaveURL(/\/login\?returnTo=%2Ffinance%2Fledger-setup%2Ffiscal-years$/);
});

test("terminal session expiry returns the browser to login", async ({ page, request }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await invalidateAllSessions(request);
  await page.reload();

  await expect(page).toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
});

test("expired access token is refreshed server-side without dropping the browser session", async ({ page, request }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await invalidateAccessTokens(request);
  await page.reload();

  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(currentCompanyTrigger(page, "Company One")).toBeVisible();
  const sessionResponse = await page.request.get("/api/auth/session");
  expect(sessionResponse.ok()).toBeTruthy();
});

test("authentication service outage renders the 503 recovery surface", async ({ page, request }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  await setSessionMode(request, "unavailable");
  await page.reload();

  await expect(page).toHaveURL(/\/route-unavailable\?reason=service/);
  await expect(page.getByText("503", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Service temporarily unavailable" })).toBeVisible();
});

test("@mobile login keeps the critical authentication controls usable", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  await expect(page.getByRole("button", { name: "User", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Google Login" })).toBeVisible();
});

test("@mobile authenticated shell keeps launcher and company context usable", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);

  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Accounting" })).toBeVisible();
  await expect(currentCompanyTrigger(page, "Company One")).toBeVisible();
});
