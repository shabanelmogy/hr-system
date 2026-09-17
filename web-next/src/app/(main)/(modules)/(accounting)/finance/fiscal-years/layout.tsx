import type { ReactNode } from "react";
import { AccountingTranslationScope } from "@/locales/scopes/AccountingTranslationScope";

export default function Layout({ children }: { children: ReactNode }) {
  return <AccountingTranslationScope>{children}</AccountingTranslationScope>;
}
