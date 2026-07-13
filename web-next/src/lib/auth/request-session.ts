import "server-only";

import { Buffer } from "node:buffer";
import { isSessionClaims, type SessionClaims } from "./session";

const maxEncodedSessionLength = 32_768;

export function encodeRequestSession(session: SessionClaims): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

export function decodeRequestSession(value: string | null): SessionClaims | null {
  if (!value || value.length > maxEncodedSessionLength) return null;

  try {
    const decoded: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    return isSessionClaims(decoded) ? decoded : null;
  } catch {
    return null;
  }
}
