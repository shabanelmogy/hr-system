import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Basic Data Countries | HR Management System",
  description: "HR Management System page for Basic Data Countries."
};

import PageComponent from "@/features/basic-data/geographical-information/countries/pages/CountriesPage";

export default function Page() {
  return <PageComponent />;
}
