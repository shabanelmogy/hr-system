"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { ThemePalette } from "@app/tokens";
import type { ThemeMode } from "./ThemePreferences";
import { ToastProvider } from "@/shared/components/feedback/transient";
import {
  useThemeSettings,
  type ThemeSettings,
} from "./useThemeSettings";
import { AppEmotionCacheProvider } from "./AppEmotionCacheProvider";

export type ThemeShellSettings = ThemeSettings & {
  /**
   * Applies the user's saved mode/palette after the static shell hydrated with the
   * defaults. When anything differs, the page tree is mounted again: route segments
   * that hydrate later (Suspense boundaries) would otherwise keep server HTML built
   * for the default theme/language, and React does not patch those attributes.
   * Pass `languageChanged` when the language was switched before this call.
   */
  applyInitialPreferences: (next: { mode: ThemeMode; palette: ThemePalette; languageChanged: boolean }) => void;
};

const ThemeSettingsContext = createContext<ThemeShellSettings | null>(null);

export function ThemeShell({ children }: { children: ReactNode }) {
  const baseSettings = useThemeSettings();
  const { mode, theme, palette, setMode, setPalette } = baseSettings;
  const [contentKey, setContentKey] = useState(0);

  const applyInitialPreferences = useCallback<ThemeShellSettings["applyInitialPreferences"]>(
    (next) => {
      const changed = next.languageChanged || next.mode !== mode || next.palette !== palette;
      if (!changed) return;
      setMode(next.mode);
      setPalette(next.palette);
      setContentKey((key) => key + 1);
    },
    [mode, palette, setMode, setPalette],
  );

  const settings = useMemo<ThemeShellSettings>(
    () => ({ ...baseSettings, applyInitialPreferences }),
    [baseSettings, applyInitialPreferences],
  );

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  // index.css and the pre-hydration CSS key the scrollbar colors on data-palette.
  useEffect(() => {
    document.documentElement.dataset.palette = palette;
  }, [palette]);

  return (
    <ThemeSettingsContext.Provider value={settings}>
      <AppEmotionCacheProvider direction={settings.direction}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider position="top-right">
            <Fragment key={contentKey}>{children}</Fragment>
          </ToastProvider>
        </ThemeProvider>
      </AppEmotionCacheProvider>
    </ThemeSettingsContext.Provider>
  );
}

export function useThemeSettingsContext() {
  const value = useContext(ThemeSettingsContext);
  if (!value) {
    throw new Error("useThemeSettingsContext must be used within ThemeShell");
  }
  return value;
}
