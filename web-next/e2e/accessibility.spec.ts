import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import {
  completeUserTenantAndCompanySelection,
  expect,
  loginWithDemoRole,
  resetTestBackend,
  test,
} from "./support/erp-fixture";

const wcagTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function expectNoAccessibilityViolations(page: Page, include?: string) {
  const builder = new AxeBuilder({ page }).withTags(wcagTags);
  if (include) builder.include(include);
  const results = await builder.analyze();

  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  }));

  expect(violations).toEqual([]);
}

async function waitForStableUserWelcome(page: Page) {
  const userWelcome = page.getByTestId("user-welcome").filter({ visible: true });

  await expect(userWelcome).toHaveCSS("opacity", "1");
}

test.beforeEach(async ({ request }) => {
  await resetTestBackend(request);
});

test("@a11y login has no WCAG A/AA automated violations", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});

test("@a11y authenticated application shell has no WCAG A/AA automated violations", async ({ page }) => {
  await loginWithDemoRole(page, "User");
  await completeUserTenantAndCompanySelection(page);
  await expect(page.getByRole("heading", { name: "Applications" })).toBeVisible();

  // UserWelcome intentionally fades into the top bar. Axe evaluates the
  // composited colors of the current rendered frame, so wait for that finite
  // transition to reach its stable state before measuring color contrast.
  await waitForStableUserWelcome(page);

  await expectNoAccessibilityViolations(page);
});

test("@a11y representative CRUD page and form have no WCAG A/AA automated violations", async ({ page }) => {
  await loginWithDemoRole(page, "Super Admin", "/super-admin/geography/countries");
  await expect(
    page.getByRole("heading", { name: "Countries Management" }).filter({ visible: true }),
  ).toBeVisible();
  await waitForStableUserWelcome(page);

  await expectNoAccessibilityViolations(page);

  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Add Country" })).toBeVisible();

  await expectNoAccessibilityViolations(page, '[role="dialog"]');
});

test("@a11y @mobile critical mobile login has no WCAG A/AA automated violations", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await expectNoAccessibilityViolations(page);
});
