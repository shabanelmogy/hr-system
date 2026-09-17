import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Health Check | ERP System",
  description: "ERP System page for Advanced Tools Health Check."
};

import { HealthCheckPage as PageComponent } from "@/platform/advanced-tools";

export default function Page() {
  return <PageComponent />;
}
