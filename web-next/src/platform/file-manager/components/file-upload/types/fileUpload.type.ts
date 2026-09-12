export interface UploadActionsProps {
  files: FileUploadItem[];
  isUploading: boolean;
  onUpload: () => void;
  onClose?: () => void;
}

export interface FileUploadItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface UseFileUploadArgs {
  onSuccess?: (fileName: string) => void;
  onClose?: () => void;
  multiple?: boolean;
}

export interface UploadHeaderProps {
  globalError: string | null;
}

export interface UploadListProps {
  files: FileUploadItem[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
}



