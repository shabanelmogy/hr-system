const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

export const publicApiUrl = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ""
);

export const publicReportApiUrl = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_REPORT_API_URL ?? ""
);
