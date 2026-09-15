import axios from "axios";
import apiClient, { ApiClientError } from "@/lib/api/client";
import { apiService } from "@/shared/services";
import { apiRoutes } from "@/config";
import { FILE_CONFIG, validateFilePolicy } from "../components/file-upload/constants/fileUpload.type";
import type { FileItem } from "../types/File";

type FileErrorCollection = string[] | Record<string, string[]>;

export interface FileErrorResponse {
  errors: FileErrorCollection;
}

export interface DownloadResult {
  success: boolean;
  errorResponse?: FileErrorResponse;
}

export interface DownloadStreamData {
  url: string;
  blob: Blob;
  cleanup: () => void;
}

export interface DownloadStreamResult {
  success: boolean;
  data?: DownloadStreamData;
  errorResponse?: FileErrorResponse;
}

interface ProcessedFileError {
  status: number;
  title: string;
  message: string;
  errors: string[] | null;
}

class FileService {
  private processError(error: unknown): ProcessedFileError {
    if (error instanceof ApiClientError) return error;
    if (!axios.isAxiosError(error) || !error.response) {
      return {
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
        errors: null,
      };
    }

    const data = asRecord(error.response.data);
    const status = error.response.status;
    const errors = normalizeErrors(data?.errors);
    return {
      status,
      title: asString(data?.title) ?? "Error",
      errors,
      message: asString(data?.title) ?? `Request failed with status ${status}`,
    };
  }

  static async getAll(): Promise<FileItem[]> {
    const files = parseFileItems(await apiService.get<unknown>(apiRoutes.files.getAll));
    return files.filter((file) => !file.isDeleted);
  }

  async downloadFile(storedFileName: string, fileName: string): Promise<DownloadResult> {
    try {
      const blob = await apiClient.getBlob(
        apiRoutes.files.download(storedFileName),
      );
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(anchor);
      return { success: true };
    } catch (error) {
      return { success: false, errorResponse: this.toErrorResponse(error) };
    }
  }

  async downloadStream(id: string): Promise<DownloadStreamResult> {
    try {
      const blob = await apiClient.getBlob(
        apiRoutes.files.stream(requireGuid(id)),
      );
      const objectUrl = window.URL.createObjectURL(blob);
      return {
        success: true,
        data: {
          url: objectUrl,
          blob,
          cleanup: () => window.URL.revokeObjectURL(objectUrl),
        },
      };
    } catch (error) {
      return { success: false, errorResponse: this.toErrorResponse(error) };
    }
  }

  getStreamUrl(id: string): string {
    return apiRoutes.files.stream(requireGuid(id));
  }

  static async delete(storedFileName: string): Promise<string> {
    if (!storedFileName.trim()) throw new Error("Invalid stored filename");
    await apiService.delete(apiRoutes.files.delete(storedFileName));
    return storedFileName;
  }

  static async uploadMany(files: File[]): Promise<void> {
    if (files.length === 0) throw new Error("No files provided");
    if (files.length > FILE_CONFIG.MAX_FILES_PER_UPLOAD) {
      throw new Error(
        `Cannot upload more than ${FILE_CONFIG.MAX_FILES_PER_UPLOAD} files at once`,
      );
    }

    const oversizedFiles = files.filter((file) => file.size > FILE_CONFIG.MAX_FILE_SIZE);
    if (oversizedFiles.length > 0) {
      const sizeMB = (FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      const fileNames = oversizedFiles.map((file) => file.name).join(", ");
      throw new Error(`Files exceed maximum size of ${sizeMB}MB: ${fileNames}`);
    }

    const invalidFiles = files.filter((file) => validateFilePolicy(file) !== null);
    if (invalidFiles.length > 0) {
      throw new Error(`File type or name is not allowed: ${invalidFiles.map((file) => file.name).join(", ")}`);
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    await apiService.post(apiRoutes.files.uploadMany, formData, {
      "Content-Type": "multipart/form-data",
    });
  }

  private toErrorResponse(error: unknown): FileErrorResponse {
    const processedError = this.processError(error);
    return {
      errors: processedError.errors ?? { general: [processedError.message] },
    };
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function normalizeErrors(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const messages = value.filter((item): item is string => typeof item === "string");
    return messages.length > 0 ? messages : null;
  }
  const record = asRecord(value);
  if (!record) return null;
  const messages = Object.values(record).flatMap((items) =>
    Array.isArray(items) ? items.filter((item): item is string => typeof item === "string") : [],
  );
  return messages.length > 0 ? messages : null;
}

const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireGuid(value: string): string {
  const normalized = value.trim();
  if (!guidPattern.test(normalized)) throw new Error("Invalid file stream identifier");
  return normalized;
}

export function parseFileItems(value: unknown): FileItem[] {
  if (!Array.isArray(value)) throw new Error("Invalid files response.");
  return value.map(parseFileItem);
}

function parseFileItem(value: unknown): FileItem {
  const item = asRecord(value);
  if (!item
    || typeof item.id !== "string"
    || !guidPattern.test(item.id)
    || typeof item.fileName !== "string"
    || typeof item.storedFileName !== "string"
    || typeof item.contentType !== "string"
    || typeof item.fileExtension !== "string"
    || typeof item.createdOn !== "string"
    || !Number.isFinite(Date.parse(item.createdOn))
    || typeof item.createdByPc !== "string"
    || typeof item.createdById !== "string"
    || typeof item.isDeleted !== "boolean") {
    throw new Error("Invalid file response.");
  }

  return {
    id: item.id,
    fileName: item.fileName,
    storedFileName: item.storedFileName,
    contentType: item.contentType,
    fileExtension: item.fileExtension,
    createdOn: item.createdOn,
    createdByPc: item.createdByPc,
    createdById: item.createdById,
    isDeleted: item.isDeleted,
  };
}

const fileService = new FileService();
export default fileService;
export { FileService };
