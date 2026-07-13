import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Districts | HR Management System",
  description: "HR Management System page for Basic Data Districts."
};

import PageComponent from "@/features/basic-data/geographical-information/districts/pages/DistrictsPage";

export default function Page() {
  return <PageComponent />;
}
