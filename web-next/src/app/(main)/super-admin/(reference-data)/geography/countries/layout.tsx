import type { ReactNode } from "react";
import { ReferenceCountriesTranslationScope } from "@/locales/scopes/ReferenceCountriesTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <ReferenceCountriesTranslationScope>{children}</ReferenceCountriesTranslationScope>;
}
