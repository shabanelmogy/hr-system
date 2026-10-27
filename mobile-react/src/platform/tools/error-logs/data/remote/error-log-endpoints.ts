import type { ErrorLogScope } from '../../domain/models/error-log';

export const errorLogEndpoints = {
  clientReport: '/api/v1/error-logs/client',
  list: (scope: ErrorLogScope) => scope === 'system' ? 'system-error-logs' : 'error-logs',
  detail: (scope: ErrorLogScope, id: string) => `${errorLogEndpoints.list(scope)}/${encodeURIComponent(id)}`,
  export: (scope: ErrorLogScope) => `${errorLogEndpoints.list(scope)}/export`,
  settings: 'system-error-logs/settings',
} as const;
