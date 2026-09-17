"use client";

import { useSession } from "@/lib/auth/SessionContext";
import { ModuleLauncherPage } from "@/platform/modules";
import { TenantDashboardPage } from "@/platform/tenants";
import { RouteLoading } from "@/shared/components/feedback/routes";

const SUPER_ADMIN_ROLE = "super_admin";

export function DashboardLanding() {
  const { user, isLoading } = useSession();

  // The authorization guard deliberately leaves the App Router child slot
  // renderable during session bootstrap so Instant Navigation can validate the
  // target segment. Keep dashboard data work behind the session itself.
  if (!user && isLoading) return <RouteLoading />;

  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  return isSuperAdmin ? <TenantDashboardPage /> : <ModuleLauncherPage />;
}
