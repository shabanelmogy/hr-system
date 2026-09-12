import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trends | ERP System",
  description: "ERP System page for Trends."
};

import PageComponent from "@/modules/hr/home/pages/TrendsPage";

export default function Page() {
  return <PageComponent />;
}