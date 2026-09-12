import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { z } from 'zod';

import { apiService, axiosClient } from '@/src/core/api';
import { requireApiUrl } from '@/src/core/config/env';
import { secureSession } from '@/src/core/storage/secure-storage';
import { createSensitiveCacheFile } from '@/src/core/storage/sensitive-file-cache';

import type {
  AuthenticatedFileSource,
  PreparedFilePreview,
  StoredFile,
  UploadFileAsset,
} from '../../domain/models/file-manager';
import type { FileManagerRepository } from '../../domain/repositories/file-manager-repository';
import { fileManagerEndpoints } from './file-manager-endpoints';
import { storedFileSchema } from './file-manager-schemas';

const MAX_UPLOAD_SIZE_MB = 50;
const MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024;
const MAX_UPLOAD_FILES = 10;
const MAX_TOTAL_UPLOAD_SIZE = MAX_UPLOAD_SIZE * MAX_UPLOAD_FILES;
const FILE_UPLOAD_TIMEOUT_MS = 120_000;

function sanitizeFileName(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_') || 'download';
}

async function prepareFilePreview(
  file: StoredFile,
  cacheArea: 'preview' | 'download' = 'preview',
): Promise<PreparedFilePreview> {
  const url = `${requireApiUrl()}/${fileManagerEndpoints.download(file.storedFileName)}`;

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
        // Sensitive cache cleanup is best-effort when the viewer closes.
      }
    },
  };
}

async function openPreparedFile(file: StoredFile, preview: PreparedFilePreview): Promise<void> {
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
}

export const fileManagerRemoteDataSource: FileManagerRepository = {
  async getFiles() {
    const response = await apiService.get<unknown>(fileManagerEndpoints.getAll);
    return z.array(storedFileSchema).parse(response).filter((file) => !file.isDeleted);
  },

  async uploadFiles(files: readonly UploadFileAsset[]) {
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

    z.array(z.string().uuid()).parse(await apiService.upload<unknown>(
      fileManagerEndpoints.uploadMany,
      formData,
      { timeout: FILE_UPLOAD_TIMEOUT_MS },
    ));
  },

  async deleteFile(storedFileName) {
    await apiService.delete<unknown>(fileManagerEndpoints.delete(storedFileName));
  },

  async downloadFile(file) {
    const preview = await prepareFilePreview(file, 'download');
    try {
      await openPreparedFile(file, preview);
    } finally {
      preview.dispose();
    }
  },

  prepareFilePreview,

  async getAuthenticatedFileSource(file): Promise<AuthenticatedFileSource> {
    const accessToken = await secureSession.getAccessToken();
    return {
      uri: `${requireApiUrl()}/${fileManagerEndpoints.stream(file.id)}`,
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    };
  },

  openPreparedFile,
};
