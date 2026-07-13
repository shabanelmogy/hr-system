export type FileTypeGroup =
  | "Images"
  | "Documents"
  | "Spreadsheets"
  | "Presentations"
  | "PDFs"
  | "Audio"
  | "Video"
  | "Archives"
  | "Code"
  | "Others";

export interface FileItem {
  id: string;
  name: string;
  size?: number;
  mimeType?: string;
  extension?: string;
  url?: string;
  updatedAt?: string | number | Date;
}

const imageExt = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp", "tiff"];
const docExt = ["doc", "docx", "rtf", "odt", "txt", "md" ];
const sheetExt = ["xls", "xlsx", "ods", "csv"]; 
const presExt = ["ppt", "pptx", "odp"]; 
const pdfExt = ["pdf"]; 
const audioExt = ["mp3", "wav", "ogg", "m4a", "aac", "flac"]; 
const videoExt = ["mp4", "avi", "mkv", "mov", "webm", "wmv"]; 
const archiveExt = ["zip", "rar", "7z", "tar", "gz", "bz2"]; 
const codeExt = ["js", "ts", "jsx", "tsx", "py", "java", "c", "cpp", "cs", "go", "rb", "php", "html", "css", "json", "yml", "yaml", "xml"]; 

function getExtension(name: string): string | undefined {
  if (!name) return undefined;
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : undefined;
}

export function classifyFileType(file: FileItem): FileTypeGroup {
  // Support both mapped and unmapped file properties
  const extension = file.extension || (file as any).fileExtension?.replace(".", "") || getExtension(file.name) || "";
  const mimeType = file.mimeType || (file as any).contentType || "";
  
  const ext = extension.toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.startsWith("image/") || imageExt.includes(ext)) return "Images";
  if (mime === "application/pdf" || pdfExt.includes(ext)) return "PDFs";
  if (mime.includes("spreadsheet") || sheetExt.includes(ext)) return "Spreadsheets";
  if (mime.includes("presentation") || presExt.includes(ext)) return "Presentations";
  if (mime.includes("audio") || audioExt.includes(ext)) return "Audio";
  if (mime.includes("video") || videoExt.includes(ext)) return "Video";
  if (archiveExt.includes(ext)) return "Archives";
  if (codeExt.includes(ext)) return "Code";
  if (docExt.includes(ext)) return "Documents";
  return "Others";
}
