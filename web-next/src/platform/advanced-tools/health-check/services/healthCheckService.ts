import { apiRoutes } from "@/config";
import type {
  HealthCheckEntry,
  HealthCheckReport,
  HealthStatus,
} from "../types/healthCheck";

export async function getHealthCheckReport(): Promise<HealthCheckReport> {
  const response = await fetch(apiRoutes.advancedTools.healthCheck, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { accept: "application/json" },
  });
  const payload: unknown = await response.json().catch(() => null);

  if (isHealthCheckPayload(payload)) {
    return normalizeHealthCheckReport(payload);
  }

  throw new Error(
    response.status === 401
      ? "The health check session is no longer authorized."
      : "The health check service returned an invalid response.",
  );
}

export function normalizeHealthCheckReport(payload: unknown): HealthCheckReport {
  if (!isHealthCheckPayload(payload)) {
    throw new TypeError("Invalid health check response.");
  }

  return {
    status: normalizeStatus(payload.status),
    totalDuration: asString(payload.totalDuration),
    entries: Object.entries(payload.entries).map(([name, value]) =>
      normalizeEntry(name, value),
    ),
  };
}

function normalizeEntry(name: string, value: unknown): HealthCheckEntry {
  const entry = isRecord(value) ? value : {};
  return {
    name,
    status: normalizeStatus(entry.status),
    duration: asString(entry.duration),
    description: asOptionalString(entry.description),
  };
}

function isHealthCheckPayload(
  value: unknown,
): value is Record<string, unknown> & { entries: Record<string, unknown> } {
  return isRecord(value) && isRecord(value.entries);
}

function normalizeStatus(value: unknown): HealthStatus {
  return value === "Healthy" || value === "Degraded" || value === "Unhealthy"
    ? value
    : "Unknown";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
