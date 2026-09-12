import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Health Check | ERP System",
  description: "ERP System page for Advanced Tools Health Check."
};

import PageComponent from "@/platform/advanced-tools/health-check/pages/HealthCheckPage";

export default function Page() {
  return <PageComponent />;
}
