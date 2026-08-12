import type { Metadata } from "next";

import { TenantDashboardPage } from "@/features/tenants";

export const metadata: Metadata = {
  title: "Super Admin Dashboard | HR Management System",
  description: "Monitor tenants, subscriptions, companies, and account capacity.",
};

export default function Page() {
  return <TenantDashboardPage />;
}
