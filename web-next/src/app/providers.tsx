"use client";

import { useEffect, type ReactNode } from "react";
import i18n from "@/locales/i18n";
import {
  ThemePreferencesProvider,
  type ThemeDirection,
  type ThemeMode,
} from "@/theme/ThemePreferences";
import { ThemeShell, useThemeSettingsContext } from "@/theme/ThemeShell";
import {
  reconcileRuntimePreferences,
  type RuntimePreferences,
} from "./runtime-preferences";

type ProvidersProps = {
  children: ReactNode;
  initialThemeMode: ThemeMode;
  initialDirection: ThemeDirection;
};

export function Providers({
  children,
  initialThemeMode,
  initialDirection,
}: ProvidersProps) {
  return (
    <ThemePreferencesProvider
      initialMode={initialThemeMode}
      initialDirection={initialDirection}
    >
      <ThemeShell>
        {children}
      </ThemeShell>
    </ThemePreferencesProvider>
  );
}

/**
 * Applies request-specific visual preferences after the static App Shell is
 * already renderable. Keeping this synchronizer separate from the route tree
 * lets cookies() stream independently without preventing Instant Navigation
 * from reaching the destination segment.
 */
export function RuntimePreferencesClientSync({
  preferences,
}: {
  preferences: RuntimePreferences;
}) {
  const { applyInitialPreferences } = useThemeSettingsContext();

  useEffect(() => {
    let cancelled = false;
    let readyFrame = 0;
    const effectivePreferences = reconcileRuntimePreferences(
      preferences,
      document.cookie,
    );

    document.documentElement.lang = effectivePreferences.language;
    document.documentElement.dir = effectivePreferences.direction;
    document.documentElement.dataset.theme = effectivePreferences.themeMode;

    const languageChanged = i18n.resolvedLanguage !== effectivePreferences.language;
    const languageChange = languageChanged
      ? i18n.changeLanguage(effectivePreferences.language)
      : Promise.resolve();

    void languageChange.finally(() => {
      if (cancelled) return;
      // Mode, palette and a remount of the page tree in one update (see ThemeShell).
      applyInitialPreferences({
        mode: effectivePreferences.themeMode,
        palette: effectivePreferences.palette,
        languageChanged,
      });
      readyFrame = window.requestAnimationFrame(() => {
        if (cancelled) return;
        document.body.classList.remove("dark", "light");
        document.body.classList.add(effectivePreferences.themeMode);
        document.documentElement.dataset.appReady = "true";
      });
    });

    return () => {
      cancelled = true;
      if (readyFrame) window.cancelAnimationFrame(readyFrame);
    };
    // Runs once per streamed preference snapshot; applyInitialPreferences changes
    // with the theme state it compares against.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  return null;
}
