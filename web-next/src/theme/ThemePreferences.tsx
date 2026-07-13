"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeDirection = "ltr" | "rtl";

const ThemeModeContext = createContext<ThemeMode>("light");
const ThemeDirectionContext = createContext<ThemeDirection>("ltr");

export function ThemePreferencesProvider({
  children,
  initialMode,
  initialDirection,
}: {
  children: ReactNode;
  initialMode: ThemeMode;
  initialDirection: ThemeDirection;
}) {
  return (
    <ThemeModeContext.Provider value={initialMode}>
      <ThemeDirectionContext.Provider value={initialDirection}>
        {children}
      </ThemeDirectionContext.Provider>
    </ThemeModeContext.Provider>
  );
}

export const useInitialThemeMode = () => useContext(ThemeModeContext);
export const useInitialThemeDirection = () =>
  useContext(ThemeDirectionContext);
