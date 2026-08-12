import type { Metadata } from "next";

import { TenantManagementPage } from "@/features/tenants";

export const metadata: Metadata = {
  title: "Tenant Management | HR Management System",
  description: "Manage tenants, subscriptions, limits, and account usage.",
};

export default function Page() {
  return <TenantManagementPage />;
}
