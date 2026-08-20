import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { z } from 'zod';

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
  HealthCheckReport,
  LocalizationCulture,
  LocalizationEntry,
  PreparedFilePreview,
  StoredFile,
  TrackChangeLog,
  UploadFileAsset,
} from '@/src/features/platform-tools/types/platform-tools';
import { storedFileSchema } from '@/src/features/platform-tools/file-manager/api-schemas';
import { appointmentSchema } from '@/src/features/platform-tools/appointments/api-schemas';
import { trackChangeLogSchema } from '@/src/features/platform-tools/track-changes/api-schemas';
import { localizationSchema } from '@/src/features/platform-tools/localization/api-schemas';
import {
  backgroundJobDashboardSchema,
  healthCheckSchema,
} from '@/src/features/platform-tools/operations/api-schemas';

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
    return z.array(storedFileSchema).parse(response).filter((file) => !file.isDeleted);
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

    z.array(z.string().uuid()).parse(await apiService.upload<unknown>(endpoints.files.uploadMany, formData, {
      timeout: FILE_UPLOAD_TIMEOUT_MS,
    }));
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
    return z.array(appointmentSchema).parse(response);
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
    return appointmentSchema.parse(response);
  },

  async deleteAppointment(id: number): Promise<void> {
    await apiService.delete<unknown>(endpoints.appointments.delete(id));
  },

  async getTrackChanges(): Promise<TrackChangeLog[]> {
    const response = await apiService.get<unknown>(endpoints.trackChanges);
    return toTrackChangeLogs(z.array(trackChangeLogSchema).parse(response));
  },

  async getLocalization(culture: LocalizationCulture): Promise<LocalizationEntry[]> {
    const response = await apiService.get<unknown>(endpoints.localization.get(culture));
    return Object.entries(localizationSchema.parse(response)).map(([key, value]) => ({
      id: key,
      key,
      value,
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
    const healthCheck = healthCheckSchema.parse(response);
    return {
      ...healthCheck,
      entries: Object.entries(healthCheck.entries).map(([name, entry]) => ({ name, ...entry })),
    };
  },

  async getBackgroundJobs(): Promise<BackgroundJobDashboard> {
    const response = await apiService.get<unknown>(endpoints.backgroundJobs);
    return backgroundJobDashboardSchema.parse(response);
  },

  getSwaggerUrl(): string {
    return `${requireApiRootUrl()}/swagger/index.html`;
  },

  getHangfireUrl(): string {
    return `${requireApiUrl()}/backgroundJobs/openDashboard`;
  },
};

function toTrackChangeLogs(values: readonly z.infer<typeof trackChangeLogSchema>[]): TrackChangeLog[] {
  const occurrences = new Map<string, number>();
  return values.map((change) => {
    const fingerprint = [change.changeLogId, change.entityName, change.key, change.changedBy, change.changedAt]
      .map((part) => encodeURIComponent(part))
      .join('|');
    const occurrence = occurrences.get(fingerprint) ?? 0;
    occurrences.set(fingerprint, occurrence + 1);
    return {
      ...change,
      id: occurrence === 0 ? fingerprint : `${fingerprint}|${occurrence}`,
    };
  });
}

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || 'download';
}
