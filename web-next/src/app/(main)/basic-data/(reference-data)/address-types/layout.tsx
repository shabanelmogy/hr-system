import type { ReactNode } from "react";
import { ReferenceAddressTypesTranslationScope } from "@/locales/scopes/ReferenceAddressTypesTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <ReferenceAddressTypesTranslationScope>{children}</ReferenceAddressTypesTranslationScope>;
}
