import type { ReactNode } from "react";
import { PlatformAuthTranslationScope } from "@/locales/scopes/PlatformAuthTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <PlatformAuthTranslationScope>{children}</PlatformAuthTranslationScope>;
}
