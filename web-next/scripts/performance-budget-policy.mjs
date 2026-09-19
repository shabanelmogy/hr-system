export const MIB = 1024 * 1024;

const publicAuthRoutes = new Set([
  "/accept-invitation",
  "/confirm-email",
  "/forget-password",
  "/login",
  "/register",
  "/resend-email-confirmation",
  "/reset-password",
]);

const protectedShellRoutes = new Set([
  "/",
  "/[...missing]",
  "/apps",
  "/apps/[moduleCode]",
  "/apps/[moduleCode]/[submoduleCode]",
  "/basic-data",
  "/route-unavailable",
  "/workforce-planning",
]);

const heavyFeatureRoutes = new Set([
  "/administration/crystal-reports",
  "/appointments",
  "/files/view/[...fileParams]",
  "/recruitment",
]);

export const routeClassBudgetSpecs = [
  {
    name: "error-fallback",
    env: "WEB_BUNDLE_MAX_ERROR_ROUTE_BYTES",
    defaultBytes: Math.round(1.1 * MIB),
  },
  {
    name: "public-auth",
    env: "WEB_BUNDLE_MAX_PUBLIC_AUTH_ROUTE_BYTES",
    defaultBytes: Math.round(2.15 * MIB),
  },
  {
    name: "protected-shell",
    env: "WEB_BUNDLE_MAX_PROTECTED_SHELL_ROUTE_BYTES",
    defaultBytes: Math.round(2.25 * MIB),
  },
  {
    name: "business-app",
    env: "WEB_BUNDLE_MAX_BUSINESS_ROUTE_BYTES",
    defaultBytes: Math.round(2.55 * MIB),
  },
  {
    name: "heavy-feature",
    env: "WEB_BUNDLE_MAX_HEAVY_ROUTE_BYTES",
    defaultBytes: Math.round(2.75 * MIB),
  },
];

export const protectedSharedBudgetSpec = {
  env: "WEB_BUNDLE_MAX_PROTECTED_SHARED_JS_BYTES",
  defaultBytes: Math.round(1.85 * MIB),
};

export function classifyRoute(route) {
  if (route === "/_not-found") return "error-fallback";
  if (publicAuthRoutes.has(route)) return "public-auth";
  if (protectedShellRoutes.has(route)) return "protected-shell";
  if (heavyFeatureRoutes.has(route)) return "heavy-feature";
  return "business-app";
}

export function isProtectedRouteClass(routeClass) {
  return routeClass === "protected-shell" || routeClass === "business-app" || routeClass === "heavy-feature";
}

export function findRouteClassBudgetViolations(routeEntries, budgets) {
  const violations = [];
  for (const entry of routeEntries) {
    const routeClass = classifyRoute(entry.route);
    const budgetBytes = budgets[routeClass];
    if (budgetBytes != null && entry.bytes > budgetBytes) {
      violations.push({
        route: entry.route,
        routeClass,
        bytes: entry.bytes,
        budgetBytes,
      });
    }
  }
  return violations;
}
