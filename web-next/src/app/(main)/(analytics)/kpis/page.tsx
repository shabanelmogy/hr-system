import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kpis | ERP System",
  description: "ERP System page for Kpis."
};

import PageComponent from "@/modules/hr/home/pages/KpisPage";

export default function Page() {
  return <PageComponent />;
}