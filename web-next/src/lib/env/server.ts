import "server-only";

const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export function getBackendUrl() {
  const value =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL;

  if (!value) {
    throw new Error("BACKEND_URL is required");
  }

  return trimTrailingSlash(value);
}
