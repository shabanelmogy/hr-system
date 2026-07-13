import { useState } from "react";
import { apiService } from "@/shared/services";
import { useSnackbar } from "@/shared/hooks";
import HandleApiError from "@/shared/services/apiError";
import { FILE_CONFIG } from "../constants/fileUpload.type";
import { FileUploadItem, UseFileUploadArgs } from "../types/fileUpload.type";
import { useTranslation } from "react-i18next";
import { apiRoutes } from "@/routes";

export default function useFileUpload({
  onSuccess,
  onClose,
  multiple = true,
}: UseFileUploadArgs) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { t } = useTranslation();

  const validateFileSize = (file: File): boolean => {
    if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
      const sizeMB = (FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      // const errorMessage = `File "${file.name}" exceeds maximum size of ${sizeMB}MB`;
      const errorMessage = t("files.fileTooLarge", {
        fileName: file.name,
        size: sizeMB,
      });
      setGlobalError(errorMessage);
      return false;
    }
    return true;
  };

  const validateFileType = (file: File): boolean => {
    if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type as any)) {
      const errorMessage = t('files.fileTypeNotAllowed', { type: file.type, fileName: file.name });
      setGlobalError(errorMessage);
      return false;
    }
    return true;
  };

  const validateFiles = (fileList: File[]): File[] => {
    return fileList.filter(
      (file) => validateFileSize(file) && validateFileType(file)
    );
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const fileArray = Array.from(fileList);

    // Validate files
    const validFiles = validateFiles(fileArray);
    if (validFiles.length === 0) return;

    const newFiles: FileUploadItem[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    if (!multiple && newFiles.length > 1) {
      setGlobalError(t('files.onlyOneAllowed'));
      showSnackbar(
        "error",
        [t('files.onlyOneAtATime')],
        t('messages.error')
      );
      return;
    }

    setFiles((prevFiles) =>
      multiple ? [...prevFiles, ...newFiles] : newFiles
    );
    setGlobalError(null);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    const uploadUrl = apiRoutes.files.uploadMany;

    // Update all files to uploading status
    setFiles((prevFiles) =>
      prevFiles.map((f) => ({ ...f, status: "uploading", progress: 0 }))
    );

    try {
      const formData = new FormData();

      // Append all files to FormData
      files.forEach((fileItem) => {
        formData.append("files", fileItem.file);
      });

      await apiService.post(uploadUrl, formData, {
        "Content-Type": "multipart/form-data",
      });

      // Update all files to success status
      setFiles((prevFiles) =>
        prevFiles.map((f) => ({ ...f, status: "success", progress: 100 }))
      );

      // Call onSuccess for each file
      files.forEach((fileItem) => {
        onSuccess?.(fileItem.file.name);
      });

      showSnackbar(
        "success",
        [t('files.uploadSuccess', { count: files.length })],
        t('messages.success')
      );

      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error: any) {
      // Update all files to error status
      const errorMessage =
        error instanceof Error ? error.message : t('files.uploadFailed');
      setFiles((prevFiles) =>
        prevFiles.map((f) => ({ ...f, status: "error", error: errorMessage }))
      );

      HandleApiError(error, (updatedState: any) => {
        showSnackbar("error", updatedState.messages, error?.title || t('messages.error'));
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    files,
    isUploading,
    dragActive,
    globalError,
    setGlobalError,
    handleDrag,
    handleDrop,
    handleFileInput,
    removeFile,
    uploadFiles,
    SnackbarComponent,
    accept: FILE_CONFIG.ALLOWED_TYPES.join(","),
    multiple,
  };
}
