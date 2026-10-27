export type ErrorLogScope = 'company' | 'system';
export type ErrorLogSource = 'api' | 'job' | 'web' | 'mobile';
export type ErrorLogSeverity = 'warning' | 'error';

export interface ErrorLogRow {
  id: string;
  occurredOnUtc: string;
  source: ErrorLogSource;
  severity: ErrorLogSeverity;
  userName: string | null;
  service: string | null;
  action: string | null;
  statusCode: number | null;
  durationMs: number | null;
  correlationId: string | null;
  summary: string;
  client: string | null;
  browser: string | null;
  ipAddress: string | null;
}

export interface ErrorLogCriteria {
  fromUtc?: string;
  toUtc?: string;
  userName?: string;
  source?: ErrorLogSource;
  statusCode?: number;
  search?: string;
  page: number;
  pageSize: number;
}

export interface ErrorLogPage { items: ErrorLogRow[]; totalCount: number; page: number; pageSize: number }
export interface ErrorLogDetail { entry: ErrorLogRow; diagnostics: string[] }
export interface ErrorLogSettings { retentionDays: number; revision: number; queueDepth: number; droppedCount: number; failedWrites: number }
