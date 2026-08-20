export interface StoredFile {
  id: string;
  fileName: string;
  storedFileName: string;
  contentType: string;
  fileExtension: string;
  createdOn: string;
  createdByPc: string;
  createdById: string;
  isDeleted: boolean;
}

export interface PreparedFilePreview {
  uri: string;
  size: number;
  contentType: string;
  readText: () => Promise<string>;
  dispose: () => void;
}

export interface AuthenticatedFileSource {
  uri: string;
  headers?: Record<string, string>;
}

export interface UploadFileAsset {
  uri: string;
  name: string;
  mimeType: string;
  size: number | null;
  webFile?: Blob;
}
