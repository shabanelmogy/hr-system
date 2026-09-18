type BrowserSecurityEnvironment = Readonly<Record<string, string | undefined>>;

const CSP_REPORT_ENDPOINT = "/api/security/csp-report";
const GOOGLE_IDENTITY_PARENT = "https://accounts.google.com/gsi/";
const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
const GOOGLE_IDENTITY_STYLE = "https://accounts.google.com/gsi/style";
const SYNCFUSION_CDN_ORIGIN = "https://cdn.syncfusion.com";

export const CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy";
export const CSP_REPORTING_ENDPOINT_NAME = "csp-endpoint";

export function buildContentSecurityPolicy(
  environment: BrowserSecurityEnvironment = process.env,
): string {
  const isDevelopment = environment.NODE_ENV === "development";
  const reportingEndpointConfigured = normalizeSecureHttpOrigin(environment.WEB_PUBLIC_ORIGIN) !== null;
  const publicApiOrigin = normalizeHttpOrigin(
    environment.NEXT_PUBLIC_API_URL ?? environment.NEXT_PUBLIC_BACKEND_URL,
  );
  const reportApiOrigin = normalizeHttpOrigin(environment.NEXT_PUBLIC_REPORT_API_URL);
  const signalRSources = normalizeSignalRSources(environment.NEXT_PUBLIC_SIGNALR_HUB_URL);

  const directives = [
    directive("default-src", ["'self'"]),
    directive("base-uri", ["'self'"]),
    directive("object-src", ["'none'"]),
    directive("form-action", ["'self'"]),
    directive("frame-ancestors", ["'self'"]),
    directive("script-src", compact([
      "'self'",
      "'unsafe-inline'",
      isDevelopment ? "'unsafe-eval'" : null,
      GOOGLE_IDENTITY_SCRIPT,
      SYNCFUSION_CDN_ORIGIN,
    ])),
    directive("script-src-attr", ["'none'"]),
    directive("style-src", [
      "'self'",
      "'unsafe-inline'",
      GOOGLE_IDENTITY_STYLE,
    ]),
    directive("img-src", ["'self'", "data:", "blob:"]),
    directive("font-src", ["'self'", "data:"]),
    directive("media-src", ["'self'", "data:", "blob:"]),
    directive("frame-src", compact([
      "'self'",
      "blob:",
      GOOGLE_IDENTITY_PARENT,
      publicApiOrigin,
      reportApiOrigin,
    ])),
    directive("worker-src", ["'self'", "blob:", SYNCFUSION_CDN_ORIGIN]),
    directive("connect-src", compact([
      "'self'",
      GOOGLE_IDENTITY_PARENT,
      SYNCFUSION_CDN_ORIGIN,
      reportApiOrigin,
      ...signalRSources,
      ...(isDevelopment ? ["ws:", "wss:"] : []),
    ])),
    directive("manifest-src", ["'self'"]),
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
    `report-uri ${CSP_REPORT_ENDPOINT}`,
    ...(reportingEndpointConfigured ? [`report-to ${CSP_REPORTING_ENDPOINT_NAME}`] : []),
  ];

  return directives.join("; ");
}

export function buildReportingEndpointsHeader(
  environment: BrowserSecurityEnvironment = process.env,
): string | null {
  const publicOrigin = normalizeSecureHttpOrigin(environment.WEB_PUBLIC_ORIGIN);
  if (!publicOrigin) return null;

  return `${CSP_REPORTING_ENDPOINT_NAME}="${publicOrigin}${CSP_REPORT_ENDPOINT}"`;
}

function directive(name: string, values: readonly string[]): string {
  return `${name} ${deduplicate(values).join(" ")}`;
}

function compact(values: readonly (string | null | undefined)[]): string[] {
  return values.filter((value): value is string => Boolean(value));
}

function deduplicate(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function normalizeHttpOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

function normalizeSecureHttpOrigin(value: string | undefined): string | null {
  const origin = normalizeHttpOrigin(value);
  return origin?.startsWith("https://") ? origin : null;
}

function normalizeSignalRSources(value: string | undefined): string[] {
  if (!value?.trim()) return [];

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol) || url.username || url.password) {
      return [];
    }

    const sources = new Set<string>([url.origin]);
    if (url.protocol === "https:") {
      sources.add(`wss://${url.host}`);
    } else if (url.protocol === "http:") {
      sources.add(`ws://${url.host}`);
    }
    return [...sources];
  } catch {
    return [];
  }
}
