import type { GridApi } from "@mui/x-data-grid";
import type { RefObject } from "react";
export type FileDialogType = "upload" | "delete" | null;

export interface FileItem {
  id: number;
  fileName: string;
  storedFileName: string;
  fileExtension: string; // e.g. ".pdf"
  contentType?: string;
  isDeleted?: boolean;
  createdOn?: string; // ISO string
  updatedOn?: string; // ISO string
}

export interface UploadResult {
  success: boolean;
  message?: string;
}

export interface UseFileGridLogicReturn {
  // State
  dialogType: FileDialogType;
  selectedFile: FileItem | null;
  loading: boolean;
  files: FileItem[];
  apiRef: RefObject<GridApi | null>;
  error: Error | null;
  isFetching: boolean;

  // Dialog methods
  openDialog: (type: FileDialogType, file?: FileItem | null) => void;
  closeDialog: () => void;

  // Form and action handlers
  handleDelete: () => Promise<void>;
  handleRefresh: () => void;

  // Action methods
  onDelete: (file: FileItem) => void;
  onUpload: () => void;
  handleDownload: (file: FileItem) => Promise<void>;
  handleView: (file: FileItem) => void;

  // Mutation states for advanced UI feedback
  isUploading: boolean;
  isDeleting: boolean;

  // Highlighting/Navigation state for card view
  lastDeletedIndex: number | null;

  // Upload success handler
  handleUploadSuccess: (fileName: string) => void;
}
