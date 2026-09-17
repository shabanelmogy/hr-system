import type { ReactNode } from "react";
import { ReportingTranslationScope } from "@/locales/scopes/ReportingTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <ReportingTranslationScope>{children}</ReportingTranslationScope>;
}
