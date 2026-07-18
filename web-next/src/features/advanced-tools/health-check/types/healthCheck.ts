export type HealthStatus = "Healthy" | "Degraded" | "Unhealthy" | "Unknown";

export interface HealthCheckEntry {
  name: string;
  status: HealthStatus;
  duration: string;
  description: string | null;
}

export interface HealthCheckReport {
  status: HealthStatus;
  totalDuration: string;
  entries: HealthCheckEntry[];
}
