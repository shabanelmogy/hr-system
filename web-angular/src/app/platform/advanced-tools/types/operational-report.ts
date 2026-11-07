import * as z from 'zod/mini';

const status = z.string();
const healthEntry = z.object({
  status,
  duration: z.string(),
  description: z.optional(z.nullable(z.string())),
});
const healthSchema = z.object({
  status,
  totalDuration: z.string(),
  entries: z.record(z.string(), healthEntry),
});
export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';
export interface HealthEntry {
  readonly name: string;
  readonly status: HealthStatus;
  readonly duration: string;
  readonly description: string | null;
}
export interface HealthReport {
  readonly status: HealthStatus;
  readonly totalDuration: string;
  readonly entries: readonly HealthEntry[];
}
function normalizeStatus(value: string): HealthStatus {
  return value === 'Healthy' || value === 'Degraded' || value === 'Unhealthy' ? value : 'Unknown';
}
export function parseHealthReport(value: unknown): HealthReport {
  const report = healthSchema.parse(value);
  return {
    status: normalizeStatus(report.status),
    totalDuration: report.totalDuration,
    entries: Object.entries(report.entries).map(([name, entry]) => ({
      name,
      status: normalizeStatus(entry.status),
      duration: entry.duration,
      description: entry.description?.trim() || null,
    })),
  };
}
