import type { Metadata } from "next";
import BasicDataHomePage from "@/modules/hr/basic-data/pages/BasicDataHomePage";

export const metadata: Metadata = {
  title: "Basic Data | ERP System",
  description: "Manage shared HR reference data.",
};

export default function Page() {
  return <BasicDataHomePage />;
}
