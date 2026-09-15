const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const normalizePublicOrigin = (value: unknown): string | null => {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
};

const parsePublicOrigins = (value: unknown) => typeof value === "string"
  ? value.split(/[;,]/).map(normalizePublicOrigin).filter((item): item is string => item !== null)
  : [];

export const publicApiUrl = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ""
);

export const publicReportApiUrl = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_REPORT_API_URL ?? ""
);

// Public account creation is disabled for the HR application by default.
// Keep this flag so another business can opt in without restoring removed UI.
export const publicSelfRegistrationEnabled =
  process.env.NEXT_PUBLIC_ENABLE_SELF_REGISTRATION === "true";

export const publicBackendOverrideEnabled =
  process.env.NEXT_PUBLIC_BACKEND_OVERRIDE_ENABLED === "true";

export const publicBackendAllowedOrigins = parsePublicOrigins(
  process.env.NEXT_PUBLIC_BACKEND_ALLOWED_ORIGINS,
);

export const publicDefaultBackendOrigin = normalizePublicOrigin(publicApiUrl);
