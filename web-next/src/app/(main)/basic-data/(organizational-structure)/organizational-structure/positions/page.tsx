import type { Metadata } from "next";
import { PositionsPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Positions | HR Management System" };

export default function Page() {
  return <PositionsPage />;
}
