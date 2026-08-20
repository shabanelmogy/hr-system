import { platformToolsApi } from '@/src/features/platform-tools/api/platform-tools-api';

/** File-manager boundary; preserves the existing transport implementation during migration. */
export const fileManagerApi = {
  getFiles: platformToolsApi.getFiles,
  uploadFiles: platformToolsApi.uploadFiles,
  deleteFile: platformToolsApi.deleteFile,
  downloadFile: platformToolsApi.downloadFile,
  prepareFilePreview: platformToolsApi.prepareFilePreview,
  getAuthenticatedFileSource: platformToolsApi.getAuthenticatedFileSource,
  openPreparedFile: platformToolsApi.openPreparedFile,
};
