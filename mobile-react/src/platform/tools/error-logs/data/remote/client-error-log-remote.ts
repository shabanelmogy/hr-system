import { apiService } from '@/src/core/api';
import type { ClientErrorLogReport } from '@/src/core/observability/error-log-reporter';
import { errorLogEndpoints } from './error-log-endpoints';

export async function sendClientErrorLog(report: ClientErrorLogReport): Promise<void> {
  await apiService.post<unknown, ClientErrorLogReport>(errorLogEndpoints.clientReport, report, {
    allowWhenReadOnly: true, skipAuthRefresh: true,
  });
}
