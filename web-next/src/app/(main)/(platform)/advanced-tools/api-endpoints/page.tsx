import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Api Endpoints | ERP System",
  description: "ERP System page for Advanced Tools Api Endpoints."
};

import PageComponent from "@/platform/advanced-tools/external-tools/pages/ApiEndpointsPage";

export default function Page() {
  return <PageComponent />;
}
