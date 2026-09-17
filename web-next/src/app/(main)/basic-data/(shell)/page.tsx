import type { Metadata } from "next";
import BasicDataHomePage from "@/shell/basic-data/pages/BasicDataHomePage";

export const metadata: Metadata = {
  title: "Basic Data | ERP System",
  description: "Manage ERP reference data and organizational master data.",
};

export default function Page() {
  return <BasicDataHomePage />;
}
