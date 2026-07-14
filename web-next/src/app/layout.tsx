import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import type { ReactNode } from "react";
import type { ThemeMode } from "@/theme/ThemePreferences";
import { INTERNAL_SESSION_HEADER } from "@/lib/auth/constants";
import { decodeRequestSession } from "@/lib/auth/request-session";
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

  const requestHeaders = await headers();
  const initialUser = decodeRequestSession(
    requestHeaders.get(INTERNAL_SESSION_HEADER),
  );

  const fg = initialThemeMode === "dark" ? "#90caf9" : "#1976d2";

  return (
    <html lang={savedLang} dir={dir} data-theme={initialThemeMode}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          html[data-theme="light"] {
            --app-background: #ffffff;
            color-scheme: light;
          }
          html[data-theme="dark"] {
            --app-background: #121212;
            color-scheme: dark;
          }
          html, body {
            background: var(--app-background) !important;
          }
          body { margin: 0; }
          #app-loader {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            background: var(--app-background);
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
      <body className={initialThemeMode}>
        <div id="app-loader">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke={fg} strokeOpacity="0.2" strokeWidth="4" />
            <path d="M44 24a20 20 0 0 0-20-20" stroke={fg} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <Providers
          initialThemeMode={initialThemeMode}
          initialDirection={dir}
          initialLanguage={savedLang}
          initialUser={initialUser}
        >
          {children}
        </Providers>
      </body>
    </html>
  );
}
