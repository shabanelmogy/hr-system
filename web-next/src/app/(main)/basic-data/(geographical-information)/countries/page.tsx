import type { Metadata } from "next";
import { CountriesPage } from "@/modules/hr/basic-data/geographical-information/countries";

export const metadata: Metadata = {
  title: "Basic Data Countries | ERP System",
  description: "ERP System page for Basic Data Countries."
};

export default function Page() {
  return <CountriesPage />;
}
