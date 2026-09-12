import type { FileManagerRepository } from '../../domain/repositories/file-manager-repository';
import { fileManagerRemoteDataSource } from '../remote/file-manager-remote-data-source';

export class DefaultFileManagerRepository implements FileManagerRepository {
  constructor(private readonly remote: FileManagerRepository = fileManagerRemoteDataSource) {}

  getFiles = () => this.remote.getFiles();
  uploadFiles = (files: Parameters<FileManagerRepository['uploadFiles']>[0]) => this.remote.uploadFiles(files);
  deleteFile = (storedFileName: string) => this.remote.deleteFile(storedFileName);
  downloadFile = (file: Parameters<FileManagerRepository['downloadFile']>[0]) => this.remote.downloadFile(file);
  prepareFilePreview = (file: Parameters<FileManagerRepository['prepareFilePreview']>[0]) => this.remote.prepareFilePreview(file);
  getAuthenticatedFileSource = (file: Parameters<FileManagerRepository['getAuthenticatedFileSource']>[0]) => this.remote.getAuthenticatedFileSource(file);
  openPreparedFile = (...args: Parameters<FileManagerRepository['openPreparedFile']>) => this.remote.openPreparedFile(...args);
}
