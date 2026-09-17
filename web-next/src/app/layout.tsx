import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Providers } from "./providers";
import { RuntimePreferencesBoundary } from "./RuntimePreferencesBoundary";
import {
  DEFAULT_RUNTIME_PREFERENCES,
  runtimePreferenceBootstrapScript,
} from "./runtime-preferences";
import "@/index.css";

export const metadata: Metadata = {
  title: "ERP System",
  description: "Operational ERP dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: runtimePreferenceBootstrapScript }} />
        {/* FullCalendar reuses this SSR placeholder during client module evaluation. */}
        <style data-fullcalendar="" />
        <style dangerouslySetInnerHTML={{ __html: `
          html[data-theme="light"] {
            --app-background: #ffffff;
            --app-accent: #1976d2;
            color-scheme: light;
          }
          html[data-theme="dark"] {
            --app-background: #121212;
            --app-accent: #90caf9;
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
            color: var(--app-accent);
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
      <body>
        <div id="app-loader">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
            <path d="M44 24a20 20 0 0 0-20-20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <Providers
          initialThemeMode={DEFAULT_RUNTIME_PREFERENCES.themeMode}
          initialDirection={DEFAULT_RUNTIME_PREFERENCES.direction}
          initialLanguage={DEFAULT_RUNTIME_PREFERENCES.language}
        >
          {children}
          <Suspense fallback={null}>
            <RuntimePreferencesBoundary />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
