"use client";

import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

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
  for (const language of ["en", "ar"] as const) {
    if (!i18n.hasResourceBundle(language, namespace)) {
      i18n.addResourceBundle(language, namespace, resources[language], true, true);
    }
  }
}

export function StaticTranslationScope({
  children,
  namespace,
}: StaticTranslationScopeProps) {
  return (
    <I18nextProvider i18n={i18n} defaultNS={namespace}>
      {children}
    </I18nextProvider>
  );
}
