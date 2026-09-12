import type {
  AuthenticatedFileSource,
  PreparedFilePreview,
  StoredFile,
  UploadFileAsset,
} from '../models/file-manager';

export interface FileManagerRepository {
  getFiles(): Promise<StoredFile[]>;
  uploadFiles(files: readonly UploadFileAsset[]): Promise<void>;
  deleteFile(storedFileName: string): Promise<void>;
  downloadFile(file: StoredFile): Promise<void>;
  prepareFilePreview(file: StoredFile): Promise<PreparedFilePreview>;
  getAuthenticatedFileSource(file: StoredFile): Promise<AuthenticatedFileSource>;
  openPreparedFile(file: StoredFile, preview: PreparedFilePreview): Promise<void>;
}
