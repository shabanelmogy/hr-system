import type { Metadata } from "next";
import { PositionsPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Positions | ERP System" };

export default function Page() {
  return <PositionsPage />;
}
