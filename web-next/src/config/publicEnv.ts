const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

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
