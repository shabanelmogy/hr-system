import type { ReactNode } from "react";
import { WorkforcePlanningLayout } from "@/features/workforce-planning";

export default function Layout({ children }: { children: ReactNode }) {
  return <WorkforcePlanningLayout>{children}</WorkforcePlanningLayout>;
}
