import type { Metadata } from "next";
import { StatesPage } from "@/features/basic-data/geographical-information/states";

export const metadata: Metadata = {
  title: "Global States | HR Management System",
  description: "Super Admin management for the global state catalog.",
};

export default function Page() {
  return <StatesPage />;
}
