import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Tools Api Endpoints | HR Management System",
  description: "HR Management System page for Advanced Tools Api Endpoints."
};

import PageComponent from "@/features/advanced-tools/external-tools/pages/ApiEndpointsPage";

export default function Page() {
  return <PageComponent />;
}
