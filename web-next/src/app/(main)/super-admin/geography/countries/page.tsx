import type { Metadata } from "next";
import { CountriesPage } from "@/features/basic-data/geographical-information/countries";

export const metadata: Metadata = {
  title: "Global Countries | HR Management System",
  description: "Super Admin management for the global country catalog.",
};

export default function Page() {
  return <CountriesPage />;
}
