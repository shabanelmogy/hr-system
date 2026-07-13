import { createTheme, Theme } from "@mui/material/styles";
import * as React from "react";
import i18n from "../locales/i18n";
import { getDesignTokens } from "./theme";
import {
  useInitialThemeDirection,
  useInitialThemeMode,
  type ThemeDirection,
  type ThemeMode,
} from "./ThemePreferences";

export interface ThemeSettings {
  mode: ThemeMode;
  setMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  direction: ThemeDirection;
  theme: Theme;
}

export const useThemeSettings = (): ThemeSettings => {
  const initialMode = useInitialThemeMode();
  const initialDirection = useInitialThemeDirection();
  const [mode, setMode] = React.useState<ThemeMode>(initialMode);
  const [direction, setDirection] =
    React.useState<ThemeDirection>(initialDirection);

  React.useEffect(() => {
    const syncDirection = (language: string | undefined) => {
      const isArabic = language?.startsWith("ar");
      const nextDirection: ThemeDirection = isArabic ? "rtl" : "ltr";
      setDirection(nextDirection);
      document.documentElement.lang = isArabic ? "ar" : "en";
      document.documentElement.dir = nextDirection;
      document.body.dir = nextDirection;
      localStorage.setItem("direction", nextDirection);
    };

    syncDirection(i18n.resolvedLanguage || i18n.language);
    i18n.on("languageChanged", syncDirection);

    return () => {
      i18n.off("languageChanged", syncDirection);
    };
  }, []);

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode, direction)),
    [mode, direction]
  );

  return {
    mode,
    setMode,
    direction,
    theme,
  };
};
