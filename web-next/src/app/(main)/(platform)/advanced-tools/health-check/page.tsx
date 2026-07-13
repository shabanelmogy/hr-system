import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Health Check | HR Management System",
  description: "HR Management System page for Advanced Tools Health Check."
};

import PageComponent from "@/features/advanced-tools/pages/HealthCheck";

export default function Page() {
  return <PageComponent />;
}