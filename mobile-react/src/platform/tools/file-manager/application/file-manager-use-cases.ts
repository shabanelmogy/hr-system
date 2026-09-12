import type {
  PreparedFilePreview,
  StoredFile,
  UploadFileAsset,
} from '../domain/models/file-manager';
import type { FileManagerRepository } from '../domain/repositories/file-manager-repository';

export interface FileManagerUseCases {
  getFiles: FileManagerRepository['getFiles'];
  uploadFiles(files: readonly UploadFileAsset[]): Promise<void>;
  deleteFile(storedFileName: string): Promise<void>;
  downloadFile(file: StoredFile): Promise<void>;
  prepareFilePreview(file: StoredFile): Promise<PreparedFilePreview>;
  getAuthenticatedFileSource: FileManagerRepository['getAuthenticatedFileSource'];
  openPreparedFile(file: StoredFile, preview: PreparedFilePreview): Promise<void>;
}

export function createFileManagerUseCases(repository: FileManagerRepository): FileManagerUseCases {
  return {
    getFiles: () => repository.getFiles(),
    uploadFiles: (files) => repository.uploadFiles(files),
    deleteFile: (storedFileName) => repository.deleteFile(storedFileName),
    downloadFile: (file) => repository.downloadFile(file),
    prepareFilePreview: (file) => repository.prepareFilePreview(file),
    getAuthenticatedFileSource: (file) => repository.getAuthenticatedFileSource(file),
    openPreparedFile: (file, preview) => repository.openPreparedFile(file, preview),
  };
}
