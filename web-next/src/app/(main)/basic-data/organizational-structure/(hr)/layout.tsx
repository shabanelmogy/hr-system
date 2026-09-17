import type { ReactNode } from "react";
import { HrOrganizationalStructureTranslationScope } from "@/locales/scopes/HrOrganizationalStructureTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <HrOrganizationalStructureTranslationScope>{children}</HrOrganizationalStructureTranslationScope>;
}
