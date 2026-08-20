import type { Metadata } from "next";
import { CountriesPage } from "@/features/basic-data/geographical-information/countries";

export const metadata: Metadata = {
  title: "Basic Data Countries | HR Management System",
  description: "HR Management System page for Basic Data Countries."
};

export default function Page() {
  return <CountriesPage />;
}
