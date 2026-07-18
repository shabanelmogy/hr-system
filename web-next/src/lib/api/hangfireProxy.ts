const antiforgeryCookiePrefix = ".AspNetCore.Antiforgery.";

export function createHangfireBackendPath(path: readonly string[] = []): string {
  const suffix = path.map((segment) => encodeURIComponent(segment)).join("/");
  return suffix ? `/hangfire/${suffix}` : "/hangfire";
}

export function rewriteHangfireLocation(
  location: string | null,
  backendBaseUrl: string,
): string | null {
  if (!location) return null;

  const backendUrl = new URL(backendBaseUrl);
  const resolvedLocation = new URL(location, backendUrl);
  if (
    resolvedLocation.origin === backendUrl.origin &&
    (resolvedLocation.pathname === "/hangfire" ||
      resolvedLocation.pathname.startsWith("/hangfire/"))
  ) {
    return `${resolvedLocation.pathname}${resolvedLocation.search}${resolvedLocation.hash}`;
  }

  return location;
}

export function rewriteHangfireAntiforgeryCookie(
  cookie: string,
): string | null {
  const cookieName = cookie.slice(0, cookie.indexOf("=")).trim();
  if (!cookieName.startsWith(antiforgeryCookiePrefix)) return null;

  return cookie.replace(/;\s*Domain=[^;]+/gi, "");
}

export function isHangfireAntiforgeryCookie(name: string): boolean {
  return name.startsWith(antiforgeryCookiePrefix);
}
