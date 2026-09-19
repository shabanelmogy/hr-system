import { apiService } from '@/src/core/api';
import { requireApiRootUrl } from '@/src/core/config/env';

import type { OperationsRepository } from '../../domain/repositories/operations-repository';
import { operationsEndpoints } from './operations-endpoints';
import { backgroundJobDashboardSchema, healthCheckSchema } from './operations-schemas';

export const operationsRemoteDataSource: OperationsRepository = {
  async getHealthCheck() {
    const response = await apiService.get<unknown>(
      `${requireApiRootUrl()}/${operationsEndpoints.health}`,
    );
    const healthCheck = healthCheckSchema.parse(response);
    return {
      ...healthCheck,
      entries: Object.entries(healthCheck.entries).map(([name, entry]) => ({ name, ...entry })),
    };
  },

  async getBackgroundJobs() {
    const response = await apiService.get<unknown>(operationsEndpoints.backgroundJobs);
    return backgroundJobDashboardSchema.parse(response);
  },

  getSwaggerUrl() {
    return `${requireApiRootUrl()}/${operationsEndpoints.swagger}`;
  },

  getHangfireUrl() {
    return `${requireApiRootUrl()}/${operationsEndpoints.hangfireDashboard}`;
  },
};
