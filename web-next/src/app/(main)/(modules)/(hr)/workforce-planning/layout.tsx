import type { ReactNode } from "react";
import WorkforcePlanningLayout from "@/modules/hr/workforce-planning/layout/WorkforcePlanningLayout";

export default function Layout({ children }: { children: ReactNode }) {
  return <WorkforcePlanningLayout>{children}</WorkforcePlanningLayout>;
}
