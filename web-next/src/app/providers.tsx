"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState, type ReactNode } from "react";
import cookies from "js-cookie";
import { createQueryClient } from "@/shared/config/queryClient";
import { SessionProvider } from "@/lib/auth/SessionContext";
import i18n from "@/locales/i18n";
import {
  ThemePreferencesProvider,
  type ThemeDirection,
  type ThemeMode,
} from "@/theme/ThemePreferences";
import { ThemeShell } from "@/theme/ThemeShell";
import type { SessionClaims } from "@/lib/auth/session";

type ProvidersProps = {
  children: ReactNode;
  initialThemeMode: ThemeMode;
  initialDirection: ThemeDirection;
  initialLanguage: "en" | "ar";
  initialUser: SessionClaims | null;
};

export function Providers({
  children,
  initialThemeMode,
  initialDirection,
  initialLanguage,
  initialUser,
}: ProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  // Match the server-selected cookie language before any translated client
  // component renders, preventing an English/Arabic hydration mismatch.
  if (i18n.resolvedLanguage !== initialLanguage) {
    void i18n.changeLanguage(initialLanguage);
  }

  useEffect(() => {
    // Keep the static loader visible until the client provider tree and theme are mounted.
    document.documentElement.dataset.appReady = "true";
  }, []);

  useEffect(() => {
    let destroyPullToRefresh: (() => void) | undefined;

    void import("@syncfusion/ej2-base").then(({ registerLicense }) => {
      const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
      if (licenseKey && !licenseKey.startsWith("replace-")) {
        registerLicense(licenseKey);
      }
    });

    void import("pulltorefreshjs").then(({ default: PullToRefresh }) => {
      const pullToRefresh = PullToRefresh.init({
        mainElement: "body",
        onRefresh() {
          window.location.reload();
        }
      });

      destroyPullToRefresh = () => {
        PullToRefresh.destroyAll();
        pullToRefresh?.destroy?.();
      };
    });

    return () => {
      destroyPullToRefresh?.();
    };
  }, []);

  useEffect(() => {
    const savedLanguage = cookies.get("i18next") === "ar" ? "ar" : "en";

    document.documentElement.lang = savedLanguage;
    document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
    void i18n.changeLanguage(savedLanguage);
  }, []);

  return (
    <ThemePreferencesProvider
      initialMode={initialThemeMode}
      initialDirection={initialDirection}
    >
      <ThemeShell>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""}
        >
          <QueryClientProvider client={queryClient}>
            <SessionProvider initialUser={initialUser}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {children}
              </LocalizationProvider>
            </SessionProvider>
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
          </QueryClientProvider>
        </GoogleOAuthProvider>
      </ThemeShell>
    </ThemePreferencesProvider>
  );
}
