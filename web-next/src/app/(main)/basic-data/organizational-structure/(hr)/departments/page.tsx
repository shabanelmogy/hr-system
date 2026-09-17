import type { Metadata } from "next";
import { DepartmentsPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Departments | ERP System" };

export default function Page() {
  return <DepartmentsPage />;
}
