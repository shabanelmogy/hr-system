"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth/SessionContext";
import { canAccessRoute, UNAVAILABLE_ROUTE } from "@/lib/auth/route-access";
import ForbiddenPage from "./ForbiddenPage";

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

  if (!user) {
    return pathname === UNAVAILABLE_ROUTE && !isLoading
      ? <>{children}</>
      : <>{fallback}</>;
  }
  if (!canAccessRoute(pathname, user)) return <ForbiddenPage />;
  return <>{children}</>;
}
