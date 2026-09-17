import type { Metadata } from "next";
import { DivisionsPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Divisions | ERP System" };

export default function Page() {
  return <DivisionsPage />;
}
