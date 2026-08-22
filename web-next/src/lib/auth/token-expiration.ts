import "server-only";

import { Buffer } from "node:buffer";

const refreshBufferMs = 60_000;

export function shouldRefreshAccessToken(
  token: string,
  nowMs = Date.now(),
): boolean {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return true;

    const payload: unknown = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
    if (!payload || typeof payload !== "object") return true;

    const expiresAtSeconds = (payload as { exp?: unknown }).exp;
    return typeof expiresAtSeconds !== "number" ||
      !Number.isFinite(expiresAtSeconds) ||
      expiresAtSeconds * 1_000 <= nowMs + refreshBufferMs;
  } catch {
    return true;
  }
}
