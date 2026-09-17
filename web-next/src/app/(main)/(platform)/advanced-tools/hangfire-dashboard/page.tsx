import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Hangfire Dashboard | ERP System",
  description: "ERP System page for Advanced Tools Hangfire Dashboard."
};

import { HangfireDashboardPage as PageComponent } from "@/platform/advanced-tools";

export default function Page() {
  return <PageComponent />;
}
