import type { ReactNode } from "react";
import { CrmTranslationScope } from "@/locales/scopes/CrmTranslationScope";

export default function AppointmentsLayout({ children }: { children: ReactNode }) {
  return <CrmTranslationScope>{children}</CrmTranslationScope>;
}
