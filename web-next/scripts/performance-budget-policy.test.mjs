import { describe, expect, it } from "vitest";
import {
  classifyRoute,
  findRouteClassBudgetViolations,
  isProtectedRouteClass,
  MIB,
  protectedSharedBudgetSpec,
  routeClassBudgetSpecs,
} from "./performance-budget-policy.mjs";

describe("performance budget policy", () => {
  it("keeps public authentication routes outside the protected-shell budget", () => {
    expect(classifyRoute("/login")).toBe("public-auth");
    expect(classifyRoute("/reset-password")).toBe("public-auth");
  });

  it("classifies protected shell entry routes separately from normal business routes", () => {
    expect(classifyRoute("/")).toBe("protected-shell");
    expect(classifyRoute("/apps/[moduleCode]")).toBe("protected-shell");
    expect(classifyRoute("/finance/fiscal-years")).toBe("business-app");
  });

  it("isolates known heavyweight feature entry points", () => {
    expect(classifyRoute("/appointments")).toBe("heavy-feature");
    expect(classifyRoute("/files/view/[...fileParams]")).toBe("heavy-feature");
  });

  it("keeps fallback/error UI on its own budget", () => {
    expect(classifyRoute("/_not-found")).toBe("error-fallback");
  });

  it("defines positive budgets and protected-route membership explicitly", () => {
    expect(routeClassBudgetSpecs.every((entry) => entry.defaultBytes > 0)).toBe(true);
    expect(protectedSharedBudgetSpec.defaultBytes).toBeGreaterThan(0);
    expect(isProtectedRouteClass("protected-shell")).toBe(true);
    expect(isProtectedRouteClass("business-app")).toBe(true);
    expect(isProtectedRouteClass("heavy-feature")).toBe(true);
    expect(isProtectedRouteClass("public-auth")).toBe(false);
  });

  it("reports the exact route class when a route exceeds its budget", () => {
    const violations = findRouteClassBudgetViolations(
      [
        { route: "/login", bytes: 1.4 * MIB },
        { route: "/finance/fiscal-years", bytes: 2.6 * MIB },
        { route: "/appointments", bytes: 2.5 * MIB },
      ],
      {
        "public-auth": 1.3 * MIB,
        "business-app": 2.55 * MIB,
        "heavy-feature": 2.75 * MIB,
      },
    );

    expect(violations).toEqual([
      {
        route: "/login",
        routeClass: "public-auth",
        bytes: 1.4 * MIB,
        budgetBytes: 1.3 * MIB,
      },
      {
        route: "/finance/fiscal-years",
        routeClass: "business-app",
        bytes: 2.6 * MIB,
        budgetBytes: 2.55 * MIB,
      },
    ]);
  });
});
