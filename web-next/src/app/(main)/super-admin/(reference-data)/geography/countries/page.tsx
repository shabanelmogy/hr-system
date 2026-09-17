import type { Metadata } from "next";
import { CountriesPage } from "@/modules/reference-data/geographical-information/countries";

export const metadata: Metadata = {
  title: "Global Countries | ERP System",
  description: "Super Admin management for the global country catalog.",
};

export default function Page() {
  return <CountriesPage />;
}
