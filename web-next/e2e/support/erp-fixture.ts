import { expect, test as base, type APIRequestContext, type Page } from "@playwright/test";

const testBackendUrl = "http://127.0.0.1:3199";

export const test = base.extend({});
export { expect };

export async function resetTestBackend(request: APIRequestContext) {
  const response = await request.post(`${testBackendUrl}/__e2e/reset`);
  expect(response.ok()).toBeTruthy();
}

export async function setSessionMode(
  request: APIRequestContext,
  mode: "ok" | "unavailable",
) {
  const response = await request.post(`${testBackendUrl}/__e2e/session-mode`, {
    data: { mode },
  });
  expect(response.ok()).toBeTruthy();
}

export async function invalidateAllSessions(request: APIRequestContext) {
  const response = await request.post(`${testBackendUrl}/__e2e/invalidate-sessions`);
  expect(response.ok()).toBeTruthy();
}

export async function invalidateAccessTokens(request: APIRequestContext) {
  const response = await request.post(`${testBackendUrl}/__e2e/invalidate-access`);
  expect(response.ok()).toBeTruthy();
}

export async function setCountriesMode(
  request: APIRequestContext,
  mode: "ok" | "fail",
) {
  const response = await request.post(`${testBackendUrl}/__e2e/countries-mode`, {
    data: { mode },
  });
  expect(response.ok()).toBeTruthy();
}

export async function loginWithDemoRole(
  page: Page,
  role: "User" | "Admin" | "Super Admin",
  returnTo = "/",
) {
  await page.goto(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  await page.getByRole("button", { name: role, exact: true }).click();
}

export async function completeUserTenantAndCompanySelection(page: Page) {
  const tenantDialog = page.getByRole("dialog", { name: "Select tenant" });
  await expect(tenantDialog).toBeVisible();
  await tenantDialog.getByText("Tenant Alpha", { exact: true }).click();
  await tenantDialog.getByRole("button", { name: "Continue" }).click();

  const companyDialog = page.getByRole("dialog", { name: "Select company" });
  await expect(companyDialog).toBeVisible();
  await companyDialog.getByText("Company One", { exact: true }).click();
  await companyDialog.getByRole("button", { name: "Continue" }).click();
}

export function currentCompanyTrigger(page: Page, companyName: string) {
  return page.locator(
    `[aria-label="Current company: ${companyName}"]:visible`,
  );
}
