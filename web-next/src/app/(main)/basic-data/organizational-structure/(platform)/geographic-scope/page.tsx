import type { Metadata } from "next";
import { CompanyGeographicScopePage } from "@/platform/company-geographic-scope";

export const metadata: Metadata = {
  title: "Company Geographic Scope | ERP System",
  description: "Configure the current company's operating countries.",
};

export default function Page() {
  return <CompanyGeographicScopePage />;
}
