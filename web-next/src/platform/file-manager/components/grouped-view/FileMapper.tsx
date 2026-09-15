import type { FileItem } from "../../types/File";

export interface MappedFile {
  id: string;
  name: string;
  size?: number;
  mimeType: string;
  extension?: string;
  createdAt: string;
}

export const mapFiles = (files: FileItem[]): MappedFile[] => {
  return files.map((file) => ({
    id: file.id,
    name: file.fileName,
    mimeType: file.contentType,
    extension: file.fileExtension.replace(".", ""),
    createdAt: file.createdOn,
  }));
};
