import type { ReactNode } from "react";
import { PlatformFilesTranslationScope } from "@/locales/scopes/PlatformFilesTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <PlatformFilesTranslationScope>{children}</PlatformFilesTranslationScope>;
}
