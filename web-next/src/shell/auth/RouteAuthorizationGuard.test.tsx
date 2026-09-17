import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  pathname: "/",
  user: null as null | { roles: string[]; permissions: string[] },
  isLoading: true,
  modulesQuery: {
    data: [] as unknown[],
    isLoading: false,
    isError: false,
  },
}));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
}));

vi.mock("@/lib/auth/SessionContext", () => ({
  useSession: () => ({ user: mocks.user, isLoading: mocks.isLoading }),
}));

vi.mock("@/platform/modules", () => ({
  requiredModuleForPath: () => null,
  hasModuleAccess: () => true,
  useAccessibleModulesQuery: () => mocks.modulesQuery,
}));

vi.mock("@/lib/auth/route-access", () => ({
  UNAVAILABLE_ROUTE: "/route-unavailable",
  canAccessRoute: () => true,
}));

vi.mock("@/shared/components/auth/ForbiddenPage", () => ({
  default: () => <div>forbidden</div>,
}));

import RouteAuthorizationGuard from "./RouteAuthorizationGuard";

describe("RouteAuthorizationGuard", () => {
  beforeEach(() => {
    mocks.pathname = "/";
    mocks.user = null;
    mocks.isLoading = true;
    mocks.modulesQuery = { data: [], isLoading: false, isError: false };
  });

  it("keeps the route child slot renderable while the session bootstraps", () => {
    const html = renderToStaticMarkup(
      <RouteAuthorizationGuard fallback={<div>loading</div>}>
        <div>target-segment</div>
      </RouteAuthorizationGuard>,
    );

    expect(html).toContain("target-segment");
    expect(html).not.toContain("loading");
  });

  it("uses the fallback once an unauthenticated session is known", () => {
    mocks.isLoading = false;

    const html = renderToStaticMarkup(
      <RouteAuthorizationGuard fallback={<div>loading</div>}>
        <div>target-segment</div>
      </RouteAuthorizationGuard>,
    );

    expect(html).toContain("loading");
    expect(html).not.toContain("target-segment");
  });
});
