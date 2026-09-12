import type { BackgroundJobDashboard, HealthCheckReport } from '../models/operations';

export interface OperationsRepository {
  getHealthCheck(): Promise<HealthCheckReport>;
  getBackgroundJobs(): Promise<BackgroundJobDashboard>;
  getSwaggerUrl(): string;
  getHangfireUrl(): string;
}
