import type { Metadata } from "next";
import { StatesPage } from "@/modules/reference-data/geographical-information/states";

export const metadata: Metadata = {
  title: "Global States | ERP System",
  description: "Super Admin management for the global state catalog.",
};

export default function Page() {
  return <StatesPage />;
}
