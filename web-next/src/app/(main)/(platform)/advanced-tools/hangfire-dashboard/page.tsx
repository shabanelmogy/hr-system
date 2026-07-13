import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Hangfire Dashboard | HR Management System",
  description: "HR Management System page for Advanced Tools Hangfire Dashboard."
};

import PageComponent from "@/features/advanced-tools/pages/HangfireDashboard";

export default function Page() {
  return <PageComponent />;
}