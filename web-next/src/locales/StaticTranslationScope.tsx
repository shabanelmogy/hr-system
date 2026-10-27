"use client";

import { useContext, type ReactNode } from "react";
import { I18nContext, I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { registerCompanyUiBaseline } from "@/lib/localization/companyUiResources";

type StaticTranslationScopeProps = {
  children: ReactNode;
  namespace: string;
};

export function registerStaticNamespace(
  namespace: string,
  resources: {
    en: Record<string, unknown>;
    ar: Record<string, unknown>;
  },
) {
  registerCompanyUiBaseline(i18n, namespace, resources);
}

export function StaticTranslationScope({
  children,
  namespace,
}: StaticTranslationScopeProps) {
  const inherited = useContext(I18nContext);
  return (
    // Keep the instance chosen above (ThemeShell pins one while the page hydrates).
    <I18nextProvider i18n={inherited?.i18n ?? i18n} defaultNS={namespace}>
      {children}
    </I18nextProvider>
  );
}
