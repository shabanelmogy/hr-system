import * as Sharing from 'expo-sharing';

import { apiService } from '@/src/core/api';
import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';

import type { ErrorLogCriteria, ErrorLogScope } from '../../domain/models/error-log';
import type { ErrorLogRepository } from '../../domain/repositories/error-log-repository';
import { errorLogEndpoints } from './error-log-endpoints';
import { errorLogDetailSchema, errorLogPageSchema, errorLogSettingsSchema } from './error-log-schemas';

export function errorLogParams(criteria: ErrorLogCriteria): Record<string, string | number> {
  const params: Record<string, string | number> = { page: criteria.page, pageSize: criteria.pageSize };
  for (const key of ['fromUtc', 'toUtc', 'userName', 'source', 'statusCode', 'search'] as const) {
    const value = criteria[key];
    if (value !== undefined && value !== '') params[key] = value;
  }
  return params;
}

export const errorLogRemoteDataSource: ErrorLogRepository = {
  async list(scope, criteria) {
    return errorLogPageSchema.parse(await apiService.get<unknown>(errorLogEndpoints.list(scope), { params: errorLogParams(criteria) }));
  },
  async detail(scope, id) {
    return errorLogDetailSchema.parse(await apiService.get<unknown>(errorLogEndpoints.detail(scope, id)));
  },
  async export(scope: ErrorLogScope, criteria: ErrorLogCriteria) {
    const bytes = await apiService.get<unknown>(errorLogEndpoints.export(scope), {
      params: errorLogParams(criteria), responseType: 'arraybuffer',
    });
    if (!(bytes instanceof ArrayBuffer) || bytes.byteLength < 4) throw new Error('Invalid XLSX response');
    const content = new Uint8Array(bytes);
    if (content[0] !== 0x50 || content[1] !== 0x4b) throw new Error('Invalid XLSX response');
    if (!await Sharing.isAvailableAsync()) throw new Error('File sharing unavailable');
    const file = createSensitiveCacheFile('download', `error-logs-${scope}.xlsx`);
    try {
      file.write(content);
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        UTI: 'org.openxmlformats.spreadsheetml.sheet',
      });
    } finally {
      if (file.exists) file.delete();
    }
  },
  async settings() {
    return errorLogSettingsSchema.parse(await apiService.get<unknown>(errorLogEndpoints.settings));
  },
  async saveSettings(retentionDays, expectedRevision) {
    return errorLogSettingsSchema.parse(await apiService.put<unknown, { retentionDays: number; expectedRevision: number }>(errorLogEndpoints.settings, { retentionDays, expectedRevision }));
  },
};
