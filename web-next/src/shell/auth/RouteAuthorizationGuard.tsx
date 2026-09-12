"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useAccessibleModulesQuery } from "@/platform/modules";
import { useSession } from "@/lib/auth/SessionContext";
import {
  canAccessRoute,
  UNAVAILABLE_ROUTE,
} from "@/lib/auth/route-access";
import { hasModuleAccess, requiredModuleForPath } from "@/platform/modules";
import ForbiddenPage from "@/shared/components/auth/ForbiddenPage";

export interface RouteAuthorizationGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function RouteAuthorizationGuard({
  children,
  fallback = null,
}: RouteAuthorizationGuardProps) {
  const pathname = usePathname();
  const { user, isLoading } = useSession();
  const moduleRequirement = requiredModuleForPath(pathname);
  const modulesQuery = useAccessibleModulesQuery(Boolean(user) && Boolean(moduleRequirement));

  if (!user) {
    return pathname === UNAVAILABLE_ROUTE && !isLoading
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
