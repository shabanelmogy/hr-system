import type { ReactNode } from "react";
import { HrRecruitmentTranslationScope } from "@/locales/scopes/HrRecruitmentTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <HrRecruitmentTranslationScope>{children}</HrRecruitmentTranslationScope>;
}
