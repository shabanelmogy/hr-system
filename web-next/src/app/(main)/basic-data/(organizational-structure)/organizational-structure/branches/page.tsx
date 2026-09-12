import type { Metadata } from "next";
import { BranchesPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Branches | ERP System" };

export default function Page() {
  return <BranchesPage />;
}
