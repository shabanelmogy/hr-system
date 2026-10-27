import type { ErrorLogCriteria, ErrorLogDetail, ErrorLogPage, ErrorLogScope, ErrorLogSettings } from '../models/error-log';

export interface ErrorLogRepository {
  list(scope: ErrorLogScope, criteria: ErrorLogCriteria): Promise<ErrorLogPage>;
  detail(scope: ErrorLogScope, id: string): Promise<ErrorLogDetail>;
  export(scope: ErrorLogScope, criteria: ErrorLogCriteria): Promise<void>;
  settings(): Promise<ErrorLogSettings>;
  saveSettings(retentionDays: number, expectedRevision: number): Promise<ErrorLogSettings>;
}
