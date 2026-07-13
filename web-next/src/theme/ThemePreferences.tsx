"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";

const ThemeModeContext = createContext<ThemeMode>("light");

export function ThemePreferencesProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode: ThemeMode;
}) {
  return (
    <ThemeModeContext.Provider value={initialMode}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export const useInitialThemeMode = () => useContext(ThemeModeContext);
