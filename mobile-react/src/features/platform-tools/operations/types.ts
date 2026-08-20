export type HealthStatus = 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';

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

export interface BackgroundJobDashboard {
  servers: number;
  queues: number;
  enqueued: number;
  scheduled: number;
  processing: number;
  succeeded: number;
  failed: number;
  generatedAt: string;
}
