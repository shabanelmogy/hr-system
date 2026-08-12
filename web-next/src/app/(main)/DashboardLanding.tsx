"use client";

import PageComponent from "@/features/home/pages/HomePage";
import { TenantDashboardPage } from "@/features/tenants";
import { useSession } from "@/lib/auth/SessionContext";

const SUPER_ADMIN_ROLE = "super_admin";

export default function DashboardLanding() {
  const { user } = useSession();
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === SUPER_ADMIN_ROLE,
  );

  return isSuperAdmin ? <TenantDashboardPage /> : <PageComponent />;
}
