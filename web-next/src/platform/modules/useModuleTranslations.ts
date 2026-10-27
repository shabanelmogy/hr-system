"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getFrontendModuleDefinition } from "./registry";
import { registerCompanyUiBaseline } from "@/lib/localization/companyUiResources";

const normalizeLanguage = (language: string): "en" | "ar" =>
  language.toLowerCase().startsWith("ar") ? "ar" : "en";

export async function ensureModuleTranslations(
  moduleCode: string | null | undefined,
  language: string,
) {
  if (!moduleCode) return;
  const definition = getFrontendModuleDefinition(moduleCode);
  if (!definition?.translationNamespace || !definition.loadTranslations) return;

  const normalizedLanguage = normalizeLanguage(language);
  const i18n = (await import("@/locales/i18n")).default;
  if (i18n.hasResourceBundle(normalizedLanguage, definition.translationNamespace)) return;

  const [en, ar] = await Promise.all([definition.loadTranslations("en"), definition.loadTranslations("ar")]);
  registerCompanyUiBaseline(i18n, definition.translationNamespace, { en, ar });
}

/** Load only the translation namespace owned by the active business module. */
export function useModuleTranslations(moduleCode: string | null | undefined) {
  const { i18n } = useTranslation();

  useEffect(() => {
    void ensureModuleTranslations(moduleCode, i18n.resolvedLanguage ?? i18n.language);
  }, [i18n, i18n.language, i18n.resolvedLanguage, moduleCode]);
}
