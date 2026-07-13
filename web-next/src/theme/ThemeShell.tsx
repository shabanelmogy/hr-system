"use client";

import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { ToastProvider } from "@/shared/components/feedback/Toast";
import {
  useThemeSettings,
  type ThemeSettings,
} from "./useThemeSettings";

const ThemeSettingsContext = createContext<ThemeSettings | null>(null);

export function ThemeShell({ children }: { children: ReactNode }) {
  const settings = useThemeSettings();
  const { cacheProvider, mode, theme } = settings;

  useEffect(() => {
    document.body.classList.remove("dark", "light");
    document.body.classList.add(mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  return (
    <ThemeSettingsContext.Provider value={settings}>
      <CacheProvider value={cacheProvider}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider position="top-right">{children}</ToastProvider>
        </ThemeProvider>
      </CacheProvider>
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
