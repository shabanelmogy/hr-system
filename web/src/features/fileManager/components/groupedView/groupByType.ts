import { classifyFileType, FileItem, FileTypeGroup } from "./FileTypeClassifier";

export type GroupedFiles = Record<FileTypeGroup, FileItem[]>;

export function groupByType(files: FileItem[]): GroupedFiles {
  const groups: GroupedFiles = {
    Images: [], Documents: [], Spreadsheets: [], Presentations: [], PDFs: [], Audio: [], Video: [], Archives: [], Code: [], Others: []
  };
  files.forEach((f) => {
    const group = classifyFileType(f);
    groups[group].push(f);
  });
  return groups;
}
