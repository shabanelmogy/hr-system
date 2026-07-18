import { useState } from "react";
import { apiService } from "@/shared/services";
import useSnackbar from "@/shared/hooks/useSnackbar";
import HandleApiError from "@/shared/services/apiError";
import {
  createFileValidationSchema,
  FILE_CONFIG,
} from "../constants/fileUpload.type";
import { FileUploadItem, UseFileUploadArgs } from "../types/fileUpload.type";
import { useTranslation } from "react-i18next";
import { apiRoutes } from "@/config";

export default function useFileUpload({
  onSuccess,
  onClose,
  multiple = true,
}: UseFileUploadArgs) {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const { showSnackbar, SnackbarComponent } = useSnackbar();
  const { t } = useTranslation();

  const validateFiles = (fileList: File[]) => {
    const validationErrors: string[] = [];
    const fileSchema = createFileValidationSchema({
      required: t("files.fileRequired"),
      tooLarge: t("files.fileTooLarge", {
        size: (FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0),
      }),
      invalidType: t("files.fileTypeNotAllowed"),
      invalidName: t("files.invalidFileName"),
    });

    const validFiles = fileList.filter((file) => {
      const result = fileSchema.safeParse({ file });
      if (!result.success) {
        validationErrors.push(...result.error.issues.map((issue) => `${file.name}: ${issue.message}`));
        return false;
      }
      return true;
    });

    return { validFiles, validationErrors };
  };

  const selectFiles = (selectedFiles: File[]) => {
    const { validFiles, validationErrors } = validateFiles(selectedFiles);
    if (validFiles.length === 0) {
      if (validationErrors.length > 0) setGlobalError(validationErrors.join("\n"));
      return;
    }

    const newFiles: FileUploadItem[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));

    if (!multiple && newFiles.length > 1) {
      validationErrors.push(t('files.onlyOneAllowed'));
      showSnackbar(
        "error",
        [t('files.onlyOneAtATime')],
        t('messages.error')
      );
      setGlobalError(validationErrors.join("\n"));
      return;
    }

    if (multiple && files.length + newFiles.length > FILE_CONFIG.MAX_FILES_PER_UPLOAD) {
      validationErrors.push(
        t("files.tooManyFiles", { count: FILE_CONFIG.MAX_FILES_PER_UPLOAD }),
      );
      setGlobalError(validationErrors.join("\n"));
      return;
    }

    setFiles((prevFiles) =>
      multiple ? [...prevFiles, ...newFiles] : newFiles
    );
    if (validationErrors.length > 0) {
      // Keep invalid-selection feedback visible even when valid files from
      // the same selection are accepted.
      setGlobalError(validationErrors.join("\n"));
    } else {
      setGlobalError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    if (files.length > FILE_CONFIG.MAX_FILES_PER_UPLOAD) {
      setGlobalError(t("files.tooManyFiles", { count: FILE_CONFIG.MAX_FILES_PER_UPLOAD }));
      return;
    }

    setIsUploading(true);
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
      setGlobalError(null);

      setTimeout(() => {
        onClose?.();
      }, 1000);
    } catch (error: unknown) {
      // Update all files to error status
      const errorMessage =
        error instanceof Error ? error.message : t('files.uploadFailed');
      setFiles((prevFiles) =>
        prevFiles.map((f) => ({ ...f, status: "error", error: errorMessage }))
      );

      HandleApiError(error, (updatedState) => {
        showSnackbar("error", updatedState.messages, updatedState.title || t('messages.error'));
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    files,
    isUploading,
    globalError,
    setGlobalError,
    selectFiles,
    removeFile,
    uploadFiles,
    SnackbarComponent,
    accept: FILE_CONFIG.ALLOWED_TYPES.join(","),
    multiple,
  };
}
