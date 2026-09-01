import type { Metadata } from "next";
import { DepartmentsPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Departments | HR Management System" };

export default function Page() {
  return <DepartmentsPage />;
}
