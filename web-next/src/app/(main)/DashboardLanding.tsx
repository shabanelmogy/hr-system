"use client";

import { TenantDashboardPage } from "@/platform/tenants";
import { useSession } from "@/lib/auth/SessionContext";
import AppsPage from "./apps/page";

const SUPER_ADMIN_ROLE = "super_admin";

export default function DashboardLanding() {
  const { user } = useSession();
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  return isSuperAdmin ? <TenantDashboardPage /> : <AppsPage />;
}
