import type { Metadata } from "next";
import { WorkforcePlanningHomePage } from "@/features/workforce-planning";

export const metadata: Metadata = {
  title: "Workforce Planning | HR Management System",
  description: "Plan, authorize, and monitor workforce demand and commitments.",
};

export default function Page() {
  return <WorkforcePlanningHomePage />;
}
