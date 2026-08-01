import type { Metadata } from "next";
import BasicDataHomePage from "@/features/basic-data/pages/BasicDataHomePage";

export const metadata: Metadata = {
  title: "Basic Data | HR Management System",
  description: "Manage shared HR reference data.",
};

export default function Page() {
  return <BasicDataHomePage />;
}
