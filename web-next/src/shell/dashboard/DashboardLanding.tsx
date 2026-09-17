"use client";

import dynamic from "next/dynamic";
import { useSession } from "@/lib/auth/SessionContext";
import { ModuleLauncherPage } from "@/platform/modules/launcher";
import { RouteLoading } from "@/shared/components/feedback/routes/RouteLoading";

const SUPER_ADMIN_ROLE = "super_admin";
const SuperAdminDashboard = dynamic(
  () => import("./SuperAdminDashboard").then((module) => module.SuperAdminDashboard),
  { loading: () => <RouteLoading /> },
);

export function DashboardLanding() {
  const { user, isLoading } = useSession();

  // The authorization guard deliberately leaves the App Router child slot
  // renderable during session bootstrap so Instant Navigation can validate the
  // target segment. Keep dashboard data work behind the session itself.
  if (!user && isLoading) return <RouteLoading />;

  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  return isSuperAdmin ? <SuperAdminDashboard /> : <ModuleLauncherPage />;
}
