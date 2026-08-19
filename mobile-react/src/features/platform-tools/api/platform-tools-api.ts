import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { apiService, axiosClient } from '@/src/core/api';
import { requireApiRootUrl, requireApiUrl } from '@/src/core/config/env';
import { secureSession } from '@/src/core/storage/secure-storage';
import {
  createSensitiveCacheFile,
  type SensitiveFileCacheArea,
} from '@/src/core/storage/sensitive-file-cache';
import type {
  Appointment,
  AppointmentInput,
  AppointmentRange,
  AuthenticatedFileSource,
  BackgroundJobDashboard,
  HealthCheckEntry,
  HealthCheckReport,
  HealthStatus,
  LocalizationCulture,
  LocalizationEntry,
  PreparedFilePreview,
  StoredFile,
  TrackChangeLog,
  UploadFileAsset,
} from '@/src/features/platform-tools/types/platform-tools';

const MAX_UPLOAD_SIZE_MB = 50;
const MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const MAX_UPLOAD_FILES = 10;
const MAX_TOTAL_UPLOAD_SIZE = MAX_UPLOAD_SIZE * MAX_UPLOAD_FILES;
const FILE_UPLOAD_TIMEOUT_MS = 120_000;

const endpoints = {
  files: {
    getAll: 'files/getAll',
    uploadMany: 'files/uploadMany',
    download: (storedFileName: string) => `files/download/${encodeURIComponent(storedFileName)}`,
    stream: (id: string) => `files/stream/${encodeURIComponent(id)}`,
    delete: (storedFileName: string) => `files/delete/${encodeURIComponent(storedFileName)}`,
  },
  appointments: {
    getAll: 'appointments/getAll',
    add: 'appointments/add',
    update: 'appointments/update',
    delete: (id: number) => `appointments/delete?id=${id}`,
  },
  trackChanges: 'entityChangeLogs/getAllChangesLogs',
  localization: {
    get: (culture: LocalizationCulture) => `localization/getLocalization/${culture}`,
    update: 'localization/updateLocalizationKey',
  },
  backgroundJobs: 'backgroundJobs/getDashboard',
} as const;

export const platformToolsApi = {
  async getFiles(): Promise<StoredFile[]> {
    const response = await apiService.get<unknown>(endpoints.files.getAll);
    return unwrapList(response).map(parseStoredFile).filter((file) => !file.isDeleted);
  },

  async uploadFiles(files: readonly UploadFileAsset[]): Promise<void> {
    if (files.length === 0) throw new Error('Select at least one file.');
    if (files.length > MAX_UPLOAD_FILES) {
      throw new Error(`Cannot upload more than ${MAX_UPLOAD_FILES} files at once.`);
    }

    const oversized = files.filter((file) => (file.size ?? 0) > MAX_UPLOAD_SIZE);
    if (oversized.length > 0) {
      throw new Error(
        `Files must not exceed ${MAX_UPLOAD_SIZE_MB} MB: ${oversized.map((file) => file.name).join(', ')}`,
      );
    }

    const totalUploadSize = files.reduce((total, file) => total + (file.size ?? 0), 0);
    if (totalUploadSize > MAX_TOTAL_UPLOAD_SIZE) {
      throw new Error(`The selected files must not exceed ${MAX_UPLOAD_SIZE_MB * MAX_UPLOAD_FILES} MB in total.`);
    }

    const formData = new FormData();
    files.forEach((file) => {
      const payload = file.webFile ?? ({
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as unknown as Blob);
      formData.append('files', payload, file.name);
    });

    await apiService.upload<unknown>(endpoints.files.uploadMany, formData, {
      timeout: FILE_UPLOAD_TIMEOUT_MS,
    });
  },

  async deleteFile(storedFileName: string): Promise<void> {
    await apiService.delete<unknown>(endpoints.files.delete(storedFileName));
  },

  async downloadFile(file: StoredFile): Promise<void> {
    const preview = await platformToolsApi.prepareFilePreview(file, 'download');
    try {
      await platformToolsApi.openPreparedFile(file, preview);
    } finally {
      preview.dispose();
    }
  },

  async prepareFilePreview(
    file: StoredFile,
    cacheArea: SensitiveFileCacheArea = 'preview',
  ): Promise<PreparedFilePreview> {
    const url = `${requireApiUrl()}/${endpoints.files.download(file.storedFileName)}`;

    if (Platform.OS === 'web') {
      const response = await axiosClient.get<Blob>(url, { responseType: 'blob' });
      const blob = response.data;
      const objectUrl = URL.createObjectURL(blob);
      return {
        uri: objectUrl,
        size: blob.size,
        contentType: blob.type || file.contentType,
        readText: () => blob.text(),
        dispose: () => URL.revokeObjectURL(objectUrl),
      };
    }

    const destination = createSensitiveCacheFile(
      cacheArea,
      `${sanitizeFileName(file.id || file.storedFileName)}-${sanitizeFileName(file.fileName)}`,
    );
    const accessToken = await secureSession.getAccessToken();
    const downloaded = await File.downloadFileAsync(url, destination, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      idempotent: true,
    });

    return {
      uri: downloaded.uri,
      size: downloaded.size,
      contentType: downloaded.type || file.contentType,
      readText: () => downloaded.text(),
      dispose: () => {
        try {
          if (downloaded.exists) downloaded.delete();
        } catch {
          // Cache cleanup is best-effort and must not interrupt closing the viewer.
        }
      },
    };
  },

  async getAuthenticatedFileSource(file: StoredFile): Promise<AuthenticatedFileSource> {
    const accessToken = await secureSession.getAccessToken();
    return {
      uri: `${requireApiUrl()}/${endpoints.files.stream(file.id)}`,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    };
  },

  async openPreparedFile(file: StoredFile, preview: PreparedFilePreview): Promise<void> {
    if (Platform.OS === 'web') {
      const anchor = document.createElement('a');
      anchor.href = preview.uri;
      anchor.download = file.fileName;
      anchor.click();
      return;
    }

    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('File sharing is not available on this device.');
    }

    await Sharing.shareAsync(preview.uri, {
      dialogTitle: file.fileName,
      mimeType: preview.contentType || file.contentType || undefined,
    });
  },

  async getAppointments(range: AppointmentRange): Promise<Appointment[]> {
    const response = await apiService.get<unknown>(endpoints.appointments.getAll, {
      params: { rangeStart: range.start, rangeEnd: range.end },
    });
    return unwrapList(response).map(parseAppointment);
  },

  async saveAppointment(input: AppointmentInput): Promise<Appointment> {
    const request = {
      id: input.id ?? 0,
      start: input.start,
      end: input.end,
      text: input.text,
      isAllDay: input.isAllDay,
    };
    const response = input.id == null
      ? await apiService.post<unknown, typeof request>(endpoints.appointments.add, request)
      : await apiService.put<unknown, typeof request>(endpoints.appointments.update, request);
    return parseAppointment(unwrapValue(response));
  },

  async deleteAppointment(id: number): Promise<void> {
    await apiService.delete<unknown>(endpoints.appointments.delete(id));
  },

  async getTrackChanges(): Promise<TrackChangeLog[]> {
    const response = await apiService.get<unknown>(endpoints.trackChanges);
    return parseTrackChanges(unwrapList(response));
  },

  async getLocalization(culture: LocalizationCulture): Promise<LocalizationEntry[]> {
    const response = await apiService.get<unknown>(endpoints.localization.get(culture));
    const data = asRecord(unwrapValue(response));
    if (!data) return [];
    return Object.entries(data).map(([key, value]) => ({
      id: key,
      key,
      value: typeof value === 'string' ? value : String(value ?? ''),
    }));
  },

  async updateLocalization(request: {
    culture: LocalizationCulture;
    key: string;
    value: string;
  }): Promise<void> {
    await apiService.put<unknown, { Language: string; Key: string; Value: string }>(
      endpoints.localization.update,
      { Language: request.culture, Key: request.key, Value: request.value },
    );
  },

  async getHealthCheck(): Promise<HealthCheckReport> {
    const response = await apiService.get<unknown>(`${requireApiRootUrl()}/health`);
    return parseHealthCheck(response);
  },

  async getBackgroundJobs(): Promise<BackgroundJobDashboard> {
    const response = await apiService.get<unknown>(endpoints.backgroundJobs);
    return parseBackgroundJobs(unwrapValue(response));
  },

  getSwaggerUrl(): string {
    return `${requireApiRootUrl()}/swagger/index.html`;
  },

  getHangfireUrl(): string {
    return `${requireApiUrl()}/backgroundJobs/openDashboard`;
  },
};

function unwrapValue(value: unknown): unknown {
  const record = asRecord(value);
  if (!record) return value;
  if (record.isSuccess === true && 'value' in record) return record.value;
  return record.value ?? record.data ?? value;
}

function unwrapList(value: unknown): unknown[] {
  const unwrapped = unwrapValue(value);
  if (Array.isArray(unwrapped)) return unwrapped.map(unwrapValue);
  const record = asRecord(unwrapped);
  const values = record?.values ?? record?.items;
  return Array.isArray(values) ? values.map(unwrapValue) : [];
}

function parseStoredFile(value: unknown): StoredFile {
  const record = asRecord(value) ?? {};
  return {
    id: asString(record.id ?? record.Id),
    fileName: asString(record.fileName ?? record.FileName),
    storedFileName: asString(record.storedFileName ?? record.StoredFileName),
    contentType: asString(record.contentType ?? record.ContentType),
    fileExtension: asString(record.fileExtension ?? record.FileExtension),
    createdOn: asString(record.createdOn ?? record.CreatedOn),
    createdByPc: asString(record.createdByPc ?? record.CreatedByPc),
    createdById: asString(record.createdById ?? record.CreatedById),
    isDeleted: Boolean(record.isDeleted ?? record.IsDeleted),
  };
}

function parseAppointment(value: unknown): Appointment {
  const record = asRecord(value) ?? {};
  return {
    id: asNumber(record.id ?? record.Id),
    start: asString(record.start ?? record.Start),
    end: asString(record.end ?? record.End),
    text: asString(record.text ?? record.Text),
    isAllDay: Boolean(record.isAllDay ?? record.IsAllDay),
  };
}

function parseTrackChanges(values: readonly unknown[]): TrackChangeLog[] {
  const occurrences = new Map<string, number>();
  return values.map((value) => {
    const record = asRecord(value) ?? {};
    const changeLogId = asStringOrNumber(record.changeLogId ?? record.ChangeLogId);
    const entityName = asString(record.entityName ?? record.EntityName);
    const key = asString(record.key ?? record.Key);
    const oldValue = asString(record.oldValue ?? record.OldValue);
    const newValue = asString(record.newValue ?? record.NewValue);
    const changedBy = asString(record.changedBy ?? record.ChangedBy);
    const changedAt = asString(record.changedAt ?? record.ChangedAt);
    const changedByPc = asString(record.changedByPc ?? record.ChangedByPc);
    const fingerprint = [changeLogId, entityName, key, changedBy, changedAt]
      .map((part) => encodeURIComponent(String(part)))
      .join('|');
    const occurrence = occurrences.get(fingerprint) ?? 0;
    occurrences.set(fingerprint, occurrence + 1);
    return {
      id: occurrence === 0 ? fingerprint : `${fingerprint}|${occurrence}`,
      changeLogId,
      entityName,
      key,
      oldValue,
      newValue,
      changedBy,
      changedAt,
      changedByPc,
    };
  });
}

function parseHealthCheck(value: unknown): HealthCheckReport {
  const record = asRecord(value);
  const entries = asRecord(record?.entries);
  if (!record || !entries) throw new Error('The health check returned an invalid response.');
  return {
    status: normalizeHealthStatus(record.status),
    totalDuration: asString(record.totalDuration),
    entries: Object.entries(entries).map(([name, entryValue]): HealthCheckEntry => {
      const entry = asRecord(entryValue) ?? {};
      return {
        name,
        status: normalizeHealthStatus(entry.status),
        duration: asString(entry.duration),
        description: asOptionalString(entry.description),
      };
    }),
  };
}

function parseBackgroundJobs(value: unknown): BackgroundJobDashboard {
  const record = asRecord(value) ?? {};
  return {
    servers: asNumber(record.servers ?? record.Servers),
    queues: asNumber(record.queues ?? record.Queues),
    enqueued: asNumber(record.enqueued ?? record.Enqueued),
    scheduled: asNumber(record.scheduled ?? record.Scheduled),
    processing: asNumber(record.processing ?? record.Processing),
    succeeded: asNumber(record.succeeded ?? record.Succeeded),
    failed: asNumber(record.failed ?? record.Failed),
    generatedAt: asString(record.generatedAt ?? record.GeneratedAt),
  };
}

function normalizeHealthStatus(value: unknown): HealthStatus {
  return value === 'Healthy' || value === 'Degraded' || value === 'Unhealthy'
    ? value
    : 'Unknown';
}

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || 'download';
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function asStringOrNumber(value: unknown): string | number {
  return typeof value === 'string' || typeof value === 'number' ? value : '';
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}
