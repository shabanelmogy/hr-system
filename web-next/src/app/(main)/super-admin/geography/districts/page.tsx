import type { Metadata } from "next";
import { DistrictsPage } from "@/features/basic-data/geographical-information/districts";

export const metadata: Metadata = {
  title: "Global Districts | HR Management System",
  description: "Super Admin management for the global district catalog.",
};

export default function Page() {
  return <DistrictsPage />;
}
