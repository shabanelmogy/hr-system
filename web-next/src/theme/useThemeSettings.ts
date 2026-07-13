import createCache, { EmotionCache } from "@emotion/cache";
import { createTheme, Theme } from "@mui/material/styles";
import * as React from "react";
import i18n from "../locales/i18n";
import { getDesignTokens } from "./theme";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import {
  useInitialThemeMode,
  type ThemeMode,
} from "./ThemePreferences";

type Direction = "ltr" | "rtl";

const ltrCache: EmotionCache = createCache({ key: "muiltr" });

// Create RTL cache once at module level (static import avoids ChunkLoadError)
const rtlCacheInstance: EmotionCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

export interface ThemeSettings {
  mode: ThemeMode;
  setMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  direction: Direction;
  theme: Theme;
  cacheProvider: EmotionCache;
}

export const useThemeSettings = (): ThemeSettings => {
  const initialMode = useInitialThemeMode();
  const [mode, setMode] = React.useState<ThemeMode>(initialMode);
  // Read the direction already stamped on <html dir="..."> by the server so
  // the client's first paint matches SSR and avoids a style flash.
  const [direction, setDirection] = React.useState<Direction>(() => {
    if (typeof window !== "undefined") {
      return (document.documentElement.dir as Direction) || "ltr";
    }
    return "ltr";
  });

  React.useEffect(() => {
    const syncDirection = (language: string | undefined) => {
      const isArabic = language?.startsWith("ar");
      const nextDirection: Direction = isArabic ? "rtl" : "ltr";
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
    cacheProvider: direction === "rtl" ? rtlCacheInstance : ltrCache,
  };
};
