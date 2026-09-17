import type { Metadata } from "next";

import { TenantDashboardPage } from "@/platform/tenants";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | ERP System",
  description: "Monitor tenants, subscriptions, companies, and account capacity.",
};

export default function Page() {
  return <TenantDashboardPage />;
}
