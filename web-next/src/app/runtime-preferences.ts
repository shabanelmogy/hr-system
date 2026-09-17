import type { ThemeDirection, ThemeMode } from "@/theme/ThemePreferences";

export type RuntimeLanguage = "en" | "ar";

export type RuntimePreferences = {
  language: RuntimeLanguage;
  direction: ThemeDirection;
  themeMode: ThemeMode;
};

export const DEFAULT_RUNTIME_PREFERENCES: RuntimePreferences = {
  language: "en",
  direction: "ltr",
  themeMode: "light",
};

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

export function resolveRuntimePreferences(cookies: CookieReader): RuntimePreferences {
  const language: RuntimeLanguage = cookies.get("i18next")?.value === "ar"
    ? "ar"
    : DEFAULT_RUNTIME_PREFERENCES.language;
  const themeMode: ThemeMode = cookies.get("currentMode")?.value === "dark"
    ? "dark"
    : DEFAULT_RUNTIME_PREFERENCES.themeMode;

  return {
    language,
    direction: language === "ar" ? "rtl" : "ltr",
    themeMode,
  };
}

export const runtimePreferenceBootstrapScript = String.raw`
(() => {
  const values = Object.create(null);
  for (const part of document.cookie.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = decodeURIComponent(part.slice(0, separator).trim());
    const value = decodeURIComponent(part.slice(separator + 1).trim());
    values[key] = value;
  }

  const language = values.i18next === "ar" ? "ar" : "en";
  const theme = values.currentMode === "dark" ? "dark" : "light";
  const root = document.documentElement;

  root.lang = language;
  root.dir = language === "ar" ? "rtl" : "ltr";
  root.dataset.theme = theme;
})();
`;
