import type { Metadata } from "next";
import WorkforcePlanningHomePage from "@/modules/hr/workforce-planning/pages/WorkforcePlanningHomePage";

export const metadata: Metadata = {
  title: "Workforce Planning | ERP System",
  description: "Plan, authorize, and monitor workforce demand and commitments.",
};

export default function Page() {
  return <WorkforcePlanningHomePage />;
}
