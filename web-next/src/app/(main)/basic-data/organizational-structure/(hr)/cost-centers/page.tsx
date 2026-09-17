import type { Metadata } from "next";
import { CostCentersPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Cost Centers | ERP System" };

export default function Page() {
  return <CostCentersPage />;
}
