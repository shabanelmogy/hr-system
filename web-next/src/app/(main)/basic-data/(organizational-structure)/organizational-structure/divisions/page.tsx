import type { Metadata } from "next";
import { DivisionsPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Divisions | HR Management System" };

export default function Page() {
  return <DivisionsPage />;
}
