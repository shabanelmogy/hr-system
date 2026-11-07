import type { ErrorLogDetail, ErrorLogPage, ErrorLogSettings } from './types/error-log';

const row = {
  id: '2b92450e-c383-feee-339f-77cae87a7ad6',
  occurredOnUtc: '2026-10-17T12:00:00Z',
  source: 'web',
  severity: 'error',
  userName: null,
  service: 'ClientError',
  action: null,
  statusCode: null,
  durationMs: null,
  correlationId: null,
  summary: 'Synthetic browser error',
  client: 'browser',
  browser: null,
  ipAddress: '127.0.0.1',
} as const;

export const systemErrorLogPageFixture: ErrorLogPage = {
  items: [row],
  totalCount: 1,
  page: 1,
  pageSize: 25,
};
export const systemErrorLogDetailFixture: ErrorLogDetail = { entry: row, diagnostics: [] };
export const systemErrorLogSettingsFixture: ErrorLogSettings = {
  retentionDays: 90,
  revision: 4,
  queueDepth: 0,
  droppedCount: 0,
  failedWrites: 0,
};
