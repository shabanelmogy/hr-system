import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Districts | ERP System",
  description: "ERP System page for Basic Data Districts."
};

import PageComponent from "@/modules/hr/basic-data/geographical-information/districts/pages/DistrictsPage";

export default function Page() {
  return <PageComponent />;
}
