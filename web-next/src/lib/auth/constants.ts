import { appRoutes } from "@/config/routes";

export const ACCESS_TOKEN_COOKIE = "__Host-hrms-access-token";
export const REFRESH_TOKEN_COOKIE = "__Host-hrms-refresh-token";

export const SESSION_REFRESHED_HEADER = "x-hrms-session-refreshed";
export const SESSION_CHANGED_EVENT = "auth:session-changed";

export const PUBLIC_ROUTES = [
  // Auth pages
  appRoutes.auth.login,
  appRoutes.auth.register,
  appRoutes.auth.forgetPassword,
  appRoutes.auth.resetPassword,
  appRoutes.auth.acceptInvitation,
  appRoutes.auth.resendEmailConfirmation,
  appRoutes.auth.emailConfirmed,
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
] as const;

const PUBLIC_ROUTE_PREFIXES = [
  "/.well-known",
  "/_next",
] as const;

// Helper function to check if a path should be public
export function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.some((route) => pathname === route)) return true;

  return PUBLIC_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
