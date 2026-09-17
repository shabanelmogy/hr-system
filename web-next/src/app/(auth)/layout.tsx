import type { ReactNode } from "react";
import { PlatformAuthTranslationScope } from "@/locales/scopes/PlatformAuthTranslationScope";
import AuthShell from "./AuthShell";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  return (
    <PlatformAuthTranslationScope>
      <AuthShell>{children}</AuthShell>
    </PlatformAuthTranslationScope>
  );
}
