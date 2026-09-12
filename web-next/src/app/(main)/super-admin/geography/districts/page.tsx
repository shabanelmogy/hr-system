import type { Metadata } from "next";
import { DistrictsPage } from "@/modules/hr/basic-data/geographical-information/districts";

export const metadata: Metadata = {
  title: "Global Districts | ERP System",
  description: "Super Admin management for the global district catalog.",
};

export default function Page() {
  return <DistrictsPage />;
}
