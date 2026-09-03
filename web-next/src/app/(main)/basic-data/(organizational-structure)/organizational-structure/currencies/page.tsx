import type { Metadata } from "next";
import { CurrenciesPage } from "@/features/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Currencies | HR Management System" };

export default function Page() {
  return <CurrenciesPage />;
}
