import type { Metadata } from "next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import type { ThemeMode } from "@/theme/ThemePreferences";
import { resolveSession } from "@/lib/auth/backend-session";
import {
  ACCESS_TOKEN_COOKIE,
  LEGACY_ACCESS_TOKEN_COOKIE,
  LEGACY_REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { Providers } from "./providers";
import "@/index.css";

export const metadata: Metadata = {
  title: "HR Management System",
  description: "Operational HR management dashboard"
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  const savedMode = cookieStore.get("currentMode")?.value;
  const initialThemeMode: ThemeMode = savedMode === "dark" ? "dark" : "light";

  const savedLang = cookieStore.get("i18next")?.value === "ar" ? "ar" : "en";
  const dir = savedLang === "ar" ? "rtl" : "ltr";

  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? cookieStore.get(LEGACY_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? cookieStore.get(LEGACY_REFRESH_TOKEN_COOKIE)?.value;
  const resolved = await resolveSession(accessToken, refreshToken);
  const initialUser = resolved.status === "authenticated" ? resolved.session : null;

  const bg = initialThemeMode === "dark" ? "#121212" : "#ffffff";
  const fg = initialThemeMode === "dark" ? "#90caf9" : "#1976d2";

  return (
    <html lang={savedLang} dir={dir} data-theme={initialThemeMode} style={{ background: bg }}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          html, body {
            background: ${bg} !important;
            color-scheme: ${initialThemeMode};
          }
          body { margin: 0; }
          #app-loader {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            background: ${bg};
            opacity: 1;
            visibility: visible;
            pointer-events: all;
            transition: opacity 160ms ease, visibility 160ms ease;
          }
          html[data-app-ready="true"] #app-loader {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
          #app-loader svg { animation: spin 0.8s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </head>
      <body className={initialThemeMode} style={{ background: bg }}>
        <div id="app-loader">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke={fg} strokeOpacity="0.2" strokeWidth="4" />
            <path d="M44 24a20 20 0 0 0-20-20" stroke={fg} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <AppRouterCacheProvider>
          <Providers initialThemeMode={initialThemeMode} initialUser={initialUser}>{children}</Providers>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
