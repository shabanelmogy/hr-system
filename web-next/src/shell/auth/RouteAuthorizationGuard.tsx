"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { useAccessibleModulesQuery } from "@/platform/modules/queries";
import { useSession } from "@/lib/auth/SessionContext";
import {
  canAccessRoute,
  UNAVAILABLE_ROUTE,
} from "@/lib/auth/route-access";
import { hasModuleAccess, requiredModuleForPath } from "@/platform/modules/route-access";
import ForbiddenPage from "@/shared/components/auth/ForbiddenPage";

export interface RouteAuthorizationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RouteAuthorizationGuard({
  children,
  fallback = null,
}: RouteAuthorizationGuardProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PathAwareRouteAuthorizationGuard fallback={fallback}>
        {children}
      </PathAwareRouteAuthorizationGuard>
    </Suspense>
  );
}

function PathAwareRouteAuthorizationGuard({
  children,
  fallback,
}: Required<Pick<RouteAuthorizationGuardProps, "children">> &
  Pick<RouteAuthorizationGuardProps, "fallback">) {
  const pathname = usePathname();
  const { user, isLoading } = useSession();
  const moduleRequirement = requiredModuleForPath(pathname);
  const modulesQuery = useAccessibleModulesQuery(Boolean(user) && Boolean(moduleRequirement));

  // Keep the App Router child slot renderable while the client session is
  // bootstrapping. Next.js Instant Navigation validation needs to reach the
  // target segment boundary; replacing the slot with a parent fallback here
  // prevents that boundary from rendering. Authorization is evaluated as soon
  // as the session request settles, while the BFF/backend remain the security
  // boundary for any request made during bootstrap.
  if (!user && isLoading) return <>{children}</>;

  if (!user) {
    return pathname === UNAVAILABLE_ROUTE
      ? <>{children}</>
      : <>{fallback}</>;
  }
  if (moduleRequirement && modulesQuery.isLoading) return <>{fallback}</>;
  if (moduleRequirement && modulesQuery.isError) return <ForbiddenPage />;

  if (moduleRequirement) {
    if (!hasModuleAccess(modulesQuery.data ?? [], moduleRequirement)) return <ForbiddenPage />;
  }

  if (!canAccessRoute(pathname, user)) return <ForbiddenPage />;
  return <>{children}</>;
}
