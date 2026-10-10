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
import { I18nextProvider } from "react-i18next";
import type { ThemePalette } from "@app/tokens";
import i18n from "@/locales/i18n";
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
   *
   * Until this runs, the tree translates through a frozen copy of i18next in the server
   * language: switching the shared instance happens before React commits the remount, and a
   * route segment that streams in during that window would otherwise hydrate with the new
   * language and fail ("server rendered text didn't match the client").
   */
  applyInitialPreferences: (next: { mode: ThemeMode; palette: ThemePalette; languageChanged: boolean }) => void;
};

const ThemeSettingsContext = createContext<ThemeShellSettings | null>(null);

export function ThemeShell({ children }: { children: ReactNode }) {
  const baseSettings = useThemeSettings();
  const { mode, theme, palette, setMode, setPalette } = baseSettings;
  const [contentKey, setContentKey] = useState(0);
  const [hydrationI18n] = useState(() => i18n.cloneInstance({ lng: i18n.language, initAsync: false }));
  const [preferencesApplied, setPreferencesApplied] = useState(false);

  const applyInitialPreferences = useCallback<ThemeShellSettings["applyInitialPreferences"]>(
    (next) => {
      setPreferencesApplied(true);
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
            <I18nextProvider i18n={preferencesApplied ? i18n : hydrationI18n}>
              <Fragment key={contentKey}>{children}</Fragment>
            </I18nextProvider>
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
