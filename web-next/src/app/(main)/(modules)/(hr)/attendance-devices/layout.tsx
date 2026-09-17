import type { ReactNode } from "react";
import { HrAttendanceTranslationScope } from "@/locales/scopes/HrAttendanceTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <HrAttendanceTranslationScope>{children}</HrAttendanceTranslationScope>;
}
