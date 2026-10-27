import { apiService } from "@/shared/services";
import { version } from "@/config/api/constants";
import type { ErrorLogReport } from "@/lib/observability/errorLogReporter";

export async function sendClientErrorLog(report: ErrorLogReport): Promise<void> {
  await apiService.post(`${version}/error-logs/client`, report, {}, { allowWhenReadOnly: true });
}
