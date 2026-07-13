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

export interface UploadDropAreaProps {
  dragActive: boolean;
  isUploading: boolean;
  multiple: boolean;
  accept: string;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface UploadHeaderProps {
  globalError: string | null;
}

export interface UploadListProps {
  files: FileUploadItem[];
  isUploading: boolean;
  onRemoveFile: (index: number) => void;
}



