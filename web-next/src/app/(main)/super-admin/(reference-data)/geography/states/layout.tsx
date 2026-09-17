import type { ReactNode } from "react";
import { ReferenceStatesTranslationScope } from "@/locales/scopes/ReferenceStatesTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <ReferenceStatesTranslationScope>{children}</ReferenceStatesTranslationScope>;
}
