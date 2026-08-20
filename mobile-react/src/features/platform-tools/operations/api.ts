import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';

export const operationsApi = {
  getBackgroundJobs: platformToolsApi.getBackgroundJobs,
  getHangfireUrl: platformToolsApi.getHangfireUrl,
  getHealthCheck: platformToolsApi.getHealthCheck,
  getSwaggerUrl: platformToolsApi.getSwaggerUrl,
};
