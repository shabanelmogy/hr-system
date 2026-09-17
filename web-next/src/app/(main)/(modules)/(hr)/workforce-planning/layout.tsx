import type { ReactNode } from "react";
import { HrWorkforceTranslationScope } from "@/locales/scopes/HrWorkforceTranslationScope";
import { WorkforcePlanningLayout } from "@/modules/hr/workforce-planning/routes/layout";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HrWorkforceTranslationScope>
      <WorkforcePlanningLayout>{children}</WorkforcePlanningLayout>
    </HrWorkforceTranslationScope>
  );
}
