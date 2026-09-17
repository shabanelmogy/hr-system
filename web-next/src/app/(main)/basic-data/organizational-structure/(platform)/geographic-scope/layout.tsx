import type { ReactNode } from "react";
import { PlatformCompanyGeographyTranslationScope } from "@/locales/scopes/PlatformCompanyGeographyTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <PlatformCompanyGeographyTranslationScope>
      {children}
    </PlatformCompanyGeographyTranslationScope>
  );
}
