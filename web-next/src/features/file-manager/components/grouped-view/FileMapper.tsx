import type { FileItem } from "../../types/File";

export interface MappedFile {
  id: string;
  name: string;
  size?: number;
  mimeType: string;
  extension?: string;
  updatedAt: string;
}

export const mapFiles = (files: FileItem[]): MappedFile[] => {
  return files.map((file) => ({
    id: file.id.toString(),
    name: file.fileName || file.storedFileName || `File ${file.id}`,
    mimeType: file.contentType ?? "",
    extension: file.fileExtension.replace(".", ""),
    updatedAt: file.updatedOn ?? "",
  }));
};
