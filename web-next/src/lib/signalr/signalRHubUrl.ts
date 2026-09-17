const SAME_ORIGIN_SIGNALR_HUB = "/api/hubs/company";

function isLoopbackHost(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "[::1]";
}

export function resolveSignalRHubUrl(
  configuredUrl: string | undefined,
  browserLocation?: Pick<Location, "hostname" | "protocol">,
  isProduction = process.env.NODE_ENV === "production",
): string {
  const value = configuredUrl?.trim();
  if (!value) return SAME_ORIGIN_SIGNALR_HUB;
  if (!browserLocation) return value;

  // Development is intentionally same-origin. It avoids mixed-content/CORS/
  // local-certificate failures and exercises the BFF transport that exists for
  // exactly this purpose, regardless of which local backend hostname is used.
  if (!isProduction) return SAME_ORIGIN_SIGNALR_HUB;

  try {
    const target = new URL(value, `${browserLocation.protocol}//${browserLocation.hostname}`);

    // Local HTTPS development must not send the browser directly to the API
    // HTTP endpoint (mixed content) or an independently trusted backend HTTPS
    // certificate. The same-origin BFF already owns that transport and can use
    // the backend's local launch URL server-side.
    if (isLoopbackHost(browserLocation.hostname) && isLoopbackHost(target.hostname)) {
      return SAME_ORIGIN_SIGNALR_HUB;
    }
    if (browserLocation.protocol === "https:" && target.protocol === "http:") {
      return SAME_ORIGIN_SIGNALR_HUB;
    }

    return value;
  } catch {
    return SAME_ORIGIN_SIGNALR_HUB;
  }
}
