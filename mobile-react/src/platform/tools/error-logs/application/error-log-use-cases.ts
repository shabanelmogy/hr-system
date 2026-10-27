import type { ErrorLogRepository } from '../domain/repositories/error-log-repository';
import type { ErrorLogCriteria, ErrorLogScope } from '../domain/models/error-log';

export function createErrorLogUseCases(repository: ErrorLogRepository) {
  return {
    list: (scope: ErrorLogScope, criteria: ErrorLogCriteria) => repository.list(scope, criteria),
    detail: (scope: ErrorLogScope, id: string) => repository.detail(scope, id),
    export: (scope: ErrorLogScope, criteria: ErrorLogCriteria) => repository.export(scope, criteria),
    settings: () => repository.settings(),
    saveSettings: (retentionDays: number, expectedRevision: number) => {
      if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650 || !Number.isInteger(expectedRevision) || expectedRevision < 0) throw new Error('Invalid retention settings');
      return repository.saveSettings(retentionDays, expectedRevision);
    },
  };
}
