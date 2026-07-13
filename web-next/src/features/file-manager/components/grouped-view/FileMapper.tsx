import { FileItem } from "./FileTypeClassifier";

export interface MappedFile {
  id: string;
  name: string;
  size: number | undefined;
  mimeType: string;
  extension: string | undefined;
  updatedAt: string;
}

export const mapFiles = (files: FileItem[]): MappedFile[] => {
  return files.map((file) => ({
    id: file.id.toString(),
    name:
      (file as any).fileName ||
      (file as any).storedFileName ||
      `File ${file.id}`,
    size: undefined as number | undefined, // Not available in current FileItem
    mimeType: (file as any).contentType,
    extension: (file as any).fileExtension?.replace(".", ""),
    updatedAt: (file as any).updatedOn,
  }));
};
