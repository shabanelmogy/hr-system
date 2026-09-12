import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Hangfire Dashboard | ERP System",
  description: "ERP System page for Advanced Tools Hangfire Dashboard."
};

import PageComponent from "@/platform/advanced-tools/hangfire-dashboard/pages/HangfireDashboardPage";

export default function Page() {
  return <PageComponent />;
}
