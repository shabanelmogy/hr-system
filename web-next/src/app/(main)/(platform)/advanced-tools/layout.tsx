import type { ReactNode } from "react";
import { PlatformAdvancedToolsTranslationScope } from "@/locales/scopes/PlatformAdvancedToolsTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <PlatformAdvancedToolsTranslationScope>{children}</PlatformAdvancedToolsTranslationScope>;
}
