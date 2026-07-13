export const ACCESS_TOKEN_COOKIE = "__Host-hrms-access-token";
export const REFRESH_TOKEN_COOKIE = "__Host-hrms-refresh-token";

export const LEGACY_ACCESS_TOKEN_COOKIE = "hrms_access_token";
export const LEGACY_REFRESH_TOKEN_COOKIE = "hrms_refresh_token";

// Set by the proxy after backend verification and consumed only by server components.
export const INTERNAL_SESSION_HEADER = "x-hrms-resolved-session";
export const SESSION_REFRESHED_HEADER = "x-hrms-session-refreshed";
export const SESSION_CHANGED_EVENT = "auth:session-changed";

export const PUBLIC_ROUTES = [
  // Auth pages
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
  "/resend-email-confirmation",
  "/email-confirmation",
  
  // Static assets (Next.js)
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
] as const;

// Helper function to check if a path should be public
export function isPublicRoute(pathname: string): boolean {
  // Exact match or prefix match
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
}
