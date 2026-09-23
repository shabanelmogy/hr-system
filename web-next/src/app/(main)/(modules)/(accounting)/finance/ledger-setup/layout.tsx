import type { ReactNode } from "react";
import { AccountingTranslationScope } from "@/locales/scopes/AccountingTranslationScope";

export default function LedgerSetupLayout({ children }: { children: ReactNode }) {
  return <AccountingTranslationScope>{children}</AccountingTranslationScope>;
}
