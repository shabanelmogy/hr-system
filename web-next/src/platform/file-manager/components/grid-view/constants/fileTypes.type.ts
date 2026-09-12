import {
  InsertDriveFile,
  Description,
  PictureAsPdf,
  Image as ImageIcon,
  Movie,
  MusicNote,
  Archive,
  Code,
  TableChart,
  Slideshow,
} from "@mui/icons-material";
export const VIEWABLE_EXTENSIONS = [
  "mp4",
  "webm",
  "pdf",
  "mp3",
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "xlsx",
  "xls",
  "csv",
  "docx",
  "doc",
  "txt",
] as const;

// Map extension to icon and colors
export const getFileTypeMeta = (
  ext: string
): { Icon: React.ElementType; fg: string; bg: string } => {
  const images = new Set(["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp"]);
  const videos = new Set(["mp4", "webm", "avi", "mkv", "mov"]);
  const audios = new Set(["mp3", "wav", "ogg", "m4a", "flac"]);
  const excels = new Set(["xls", "xlsx", "csv"]);
  const ppts = new Set(["ppt", "pptx"]);
  const words = new Set(["doc", "docx"]);
  const archives = new Set(["zip", "rar", "7z", "tar", "gz"]);
  const codes = new Set([
    "js",
    "ts",
    "jsx",
    "tsx",
    "json",
    "html",
    "css",
    "xml",
    "yml",
    "yaml",
  ]);

  if (ext === "pdf") return { Icon: PictureAsPdf, fg: "#B71C1C", bg: "#FFEBEE" };
  if (images.has(ext)) return { Icon: ImageIcon, fg: "#1B5E20", bg: "#E8F5E9" };
  if (videos.has(ext)) return { Icon: Movie, fg: "#4A148C", bg: "#F3E5F5" };
  if (audios.has(ext)) return { Icon: MusicNote, fg: "#004D40", bg: "#E0F2F1" };
  if (excels.has(ext)) return { Icon: TableChart, fg: "#1B5E20", bg: "#E8F5E9" };
  if (ppts.has(ext)) return { Icon: Slideshow, fg: "#E65100", bg: "#FFF3E0" };
  if (words.has(ext)) return { Icon: Description, fg: "#0D47A1", bg: "#E3F2FD" };
  if (archives.has(ext)) return { Icon: Archive, fg: "#4E342E", bg: "#EFEBE9" };
  if (codes.has(ext)) return { Icon: Code, fg: "#1A237E", bg: "#E8EAF6" };
  return { Icon: InsertDriveFile, fg: "#37474F", bg: "#ECEFF1" };
};