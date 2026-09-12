import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ERP System",
  description: "ERP dashboard overview."
};

import DashboardLanding from "./DashboardLanding";

export default function Page() {
  return <DashboardLanding />;
}
