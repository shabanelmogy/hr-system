import type { Metadata } from "next";
import { DashboardLanding } from "@/shell/dashboard";

export const metadata: Metadata = {
  title: "Dashboard | ERP System",
  description: "ERP dashboard overview."
};

export default function Page() {
  return <DashboardLanding />;
}
