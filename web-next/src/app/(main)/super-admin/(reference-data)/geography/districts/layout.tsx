import type { ReactNode } from "react";
import { ReferenceDistrictsTranslationScope } from "@/locales/scopes/ReferenceDistrictsTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <ReferenceDistrictsTranslationScope>{children}</ReferenceDistrictsTranslationScope>;
}
