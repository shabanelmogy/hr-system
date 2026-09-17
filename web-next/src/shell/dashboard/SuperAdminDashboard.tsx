"use client";

import { PlatformTenantsTranslationScope } from "@/locales/scopes/PlatformTenantsTranslationScope";
import { TenantDashboardPage } from "@/platform/tenants";

/**
 * The Super Admin landing page is rendered from the shared dashboard route,
 * outside the /super-admin route group. Keep its tenant translations scoped to
 * this first consumer so regular ERP users do not pay for the tenant catalog.
 */
export function SuperAdminDashboard() {
  return (
    <PlatformTenantsTranslationScope>
      <TenantDashboardPage />
    </PlatformTenantsTranslationScope>
  );
}
