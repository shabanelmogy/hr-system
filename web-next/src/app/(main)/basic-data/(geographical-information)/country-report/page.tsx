import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Country Report | HR Management System",
  description: "HR Management System page for Country Report."
};

import { CountryReportPage } from "@/features/basic-data/geographical-information/countries";

export default function Page() {
  return <CountryReportPage />;
}
