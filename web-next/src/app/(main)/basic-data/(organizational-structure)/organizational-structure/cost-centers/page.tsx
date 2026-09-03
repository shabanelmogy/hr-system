import type { Metadata } from "next";
import { CostCentersPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Cost Centers | HR Management System" };

export default function Page() {
  return <CostCentersPage />;
}
