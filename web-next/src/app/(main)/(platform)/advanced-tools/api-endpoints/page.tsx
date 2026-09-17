import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Api Endpoints | ERP System",
  description: "ERP System page for Advanced Tools Api Endpoints."
};

import { ApiEndpointsPage as PageComponent } from "@/platform/advanced-tools";

export default function Page() {
  return <PageComponent />;
}
