import type { Metadata } from "next";
import { BranchesPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Branches | HR Management System" };

export default function Page() {
  return <BranchesPage />;
}
