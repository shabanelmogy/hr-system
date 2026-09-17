import type { ReactNode } from "react";
import { PlatformTenantsTranslationScope } from "@/locales/scopes/PlatformTenantsTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <PlatformTenantsTranslationScope>{children}</PlatformTenantsTranslationScope>;
}
