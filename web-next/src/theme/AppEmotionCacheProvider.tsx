"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { ReactNode } from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import type { ThemeDirection } from "./ThemePreferences";

const ltrOptions = { key: "muiltr" };
const rtlOptions = {
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
};

export function AppEmotionCacheProvider({
  children,
  direction,
}: {
  children: ReactNode;
  direction: ThemeDirection;
}) {
  return (
    <AppRouterCacheProvider
      options={direction === "rtl" ? rtlOptions : ltrOptions}
    >
      {children}
    </AppRouterCacheProvider>
  );
}
