import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | HR Management System",
  description: "HR management dashboard overview."
};

import DashboardLanding from "./DashboardLanding";

export default function Page() {
  return <DashboardLanding />;
}
