import type { Metadata } from "next";

import { TenantManagementPage } from "@/platform/tenants";

export const metadata: Metadata = {
  title: "Tenant Management | ERP System",
  description: "Manage tenants, subscriptions, limits, and account usage.",
};

export default function Page() {
  return <TenantManagementPage />;
}
