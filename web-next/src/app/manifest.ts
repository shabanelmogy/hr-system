import type { MetadataRoute } from "next";
import { getTheme } from "@app/tokens";

// Web app manifest (Next.js metadata route). Colors come from the default palette so
// the install splash screen matches the app.
const lightTheme = getTheme("green", "light");

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ERP System",
    short_name: "ERP",
    description: "Operational ERP dashboard",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: lightTheme.colors.background,
    theme_color: lightTheme.colors.primary,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
