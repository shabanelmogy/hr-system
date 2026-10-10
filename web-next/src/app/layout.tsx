import type { Metadata, Viewport } from "next";
import { Suspense, type ReactNode } from "react";
import { Providers } from "./providers";
import { RuntimePreferencesBoundary } from "./RuntimePreferencesBoundary";
import { ClientObservability } from "./ClientObservability";
import { ServiceWorkerRegistration } from "./ServiceWorkerRegistration";
import {
  DEFAULT_RUNTIME_PREFERENCES,
  runtimePreferenceBootstrapScript,
} from "./runtime-preferences";
import { defaultPalette, getTheme, themePaletteOrder } from "@app/tokens";
import "@/fonts.css";
import "@/index.css";

// Background and loader accent before React hydrates, per palette and mode, from the same
// tokens as the MUI theme (the bootstrap script sets data-theme and data-palette).
const preHydrationPaletteCss = themePaletteOrder
  .flatMap((palette) =>
    (["light", "dark"] as const).map((mode) => {
      const { colors } = getTheme(palette, mode);
      const selector = palette === defaultPalette
        ? `html[data-theme="${mode}"]:not([data-palette]), html[data-theme="${mode}"][data-palette="${palette}"]`
        : `html[data-theme="${mode}"][data-palette="${palette}"]`;
      return `${selector} { --app-background: ${colors.background}; --app-accent: ${colors.primary}; color-scheme: ${mode}; }`;
    }),
  )
  .join("\n");

export const metadata: Metadata = {
  title: "ERP System",
  description: "Operational ERP dashboard",
  applicationName: "ERP System",
  appleWebApp: { capable: true, title: "ERP", statusBarStyle: "default" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F766E" },
    { media: "(prefers-color-scheme: dark)", color: "#101514" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" dir="ltr" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: runtimePreferenceBootstrapScript }} />
        {/* Most screens use the regular weight in Latin and Arabic; fetch those first. */}
        <link rel="preload" href="/fonts/ibm-plex-sans-arabic/ibm-plex-sans-arabic-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ibm-plex-sans-arabic/ibm-plex-sans-arabic-arabic-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        {/* FullCalendar reuses this SSR placeholder during client module evaluation. */}
        <style data-fullcalendar="" />
        <style dangerouslySetInnerHTML={{ __html: `
          ${preHydrationPaletteCss}
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
        <Suspense fallback={null}>
          <ClientObservability />
          <ServiceWorkerRegistration />
        </Suspense>
        <div id="app-loader">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="4" />
            <path d="M44 24a20 20 0 0 0-20-20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
        <Providers
          initialThemeMode={DEFAULT_RUNTIME_PREFERENCES.themeMode}
          initialDirection={DEFAULT_RUNTIME_PREFERENCES.direction}
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
