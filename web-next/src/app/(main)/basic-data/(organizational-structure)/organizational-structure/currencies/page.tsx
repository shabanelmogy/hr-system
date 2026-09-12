import type { Metadata } from "next";
import { CurrenciesPage } from "@/modules/hr/basic-data/organizational-structure/management";

export const metadata: Metadata = { title: "Currencies | ERP System" };

export default function Page() {
  return <CurrenciesPage />;
}
