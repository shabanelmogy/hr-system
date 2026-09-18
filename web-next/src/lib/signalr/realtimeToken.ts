export function parseRealtimeTokenPayload(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const token = (value as Record<string, unknown>).token;
  return typeof token === "string" && token.trim().length > 0 ? token : null;
}

export function getJwtExpiration(token: string): number {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return 0;

    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload: unknown = JSON.parse(atob(normalized + padding));
    if (!payload || typeof payload !== "object") return 0;
    const exp = (payload as Record<string, unknown>).exp;
    return typeof exp === "number" && Number.isFinite(exp) ? exp * 1_000 : 0;
  } catch {
    return 0;
  }
}
