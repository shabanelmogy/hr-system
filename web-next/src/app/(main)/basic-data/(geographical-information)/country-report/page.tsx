import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Country Report | ERP System",
  description: "ERP System page for Country Report."
};

import { CountryReportPage } from "@/modules/hr/basic-data/geographical-information/countries";

export default function Page() {
  return <CountryReportPage />;
}
