import type { Metadata } from "next";
import { CompanyGeographicScopePage } from "@/features/basic-data/organizational-structure/company-geographic-scope";

export const metadata: Metadata = {
  title: "Company Geographic Scope | HR Management System",
  description: "Configure the current company's operating countries.",
};

export default function Page() {
  return <CompanyGeographicScopePage />;
}
