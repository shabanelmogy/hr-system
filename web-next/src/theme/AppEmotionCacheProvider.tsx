"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { type ReactNode } from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

import type { ThemeDirection } from "./ThemePreferences";

/**
 * Keep Emotion's App Router streaming integration owned by MUI's version-aware
 * provider. The previous local copy of Emotion's insert/flush registry could
 * enter a Stylis insertion failure during development SSR on larger routes.
 */
export function AppEmotionCacheProvider({
  children,
  direction,
}: {
  children: ReactNode;
  direction: ThemeDirection;
}) {
  const options = direction === "rtl"
    ? { key: "muirtl", stylisPlugins: [prefixer, rtlPlugin] }
    : { key: "muiltr" };

  return (
    <AppRouterCacheProvider key={direction} options={options}>
      {children}
    </AppRouterCacheProvider>
  );
}

