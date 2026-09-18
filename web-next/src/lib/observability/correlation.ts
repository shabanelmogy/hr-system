import { randomUUID } from "node:crypto";

export const CORRELATION_ID_HEADER = "x-correlation-id";

/**
 * Creates a BFF-owned correlation identifier that satisfies the backend's
 * correlation-id contract (ASCII alpha-numeric, <= 128 characters).
 *
 * Browser-provided correlation headers are intentionally not reused: a browser
 * request starts a new trusted BFF operation boundary, while OpenTelemetry
 * trace context handles distributed trace continuity between trusted services.
 */
export function createCorrelationId(): string {
  return randomUUID().replaceAll("-", "");
}

export function applyCorrelationHeader(headers: Headers, correlationId: string) {
  headers.set(CORRELATION_ID_HEADER, correlationId);
}
