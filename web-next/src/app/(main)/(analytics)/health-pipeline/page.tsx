import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Health Pipeline | ERP System",
  description: "ERP System page for Health Pipeline."
};

import PageComponent from "@/modules/hr/home/pages/HealthPipelinePage";

export default function Page() {
  return <PageComponent />;
}