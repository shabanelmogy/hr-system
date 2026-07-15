import axios, { type AxiosInstance } from "axios";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { FileItem, UploadResult } from "../types/File";

const BASE = "/api/v1/Files";

const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_FILES_PER_UPLOAD: 10,
} as const;

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
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: "",
      withCredentials: true,
    });
  }

  private processError(error: unknown): ProcessedFileError {
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
    const response = await apiService.get<unknown>(`${BASE}/GetAll`);
    const files = extractValues<FileItem>(response);
    return files.filter((file) => !file.isDeleted);
  }

  static async getById(id: number): Promise<FileItem> {
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error("Invalid file ID");
    }
    const response = await apiService.get<unknown>(`${BASE}/GetByID/${id}`);
    return extractValue<FileItem>(response);
  }

  async downloadFile(storedFileName: string, fileName: string): Promise<DownloadResult> {
    try {
      const response = await this.client.get<Blob>(
        `${BASE}/download/${storedFileName}`,
        { responseType: "blob" },
      );
      const url = window.URL.createObjectURL(response.data);
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

  async downloadStream(idOrPath: string | number): Promise<DownloadStreamResult> {
    try {
      const response = await this.client.get<Blob>(
        `${BASE}/stream/${idOrPath}`,
        { responseType: "blob" },
      );
      const objectUrl = window.URL.createObjectURL(response.data);
      return {
        success: true,
        data: {
          url: objectUrl,
          blob: response.data,
          cleanup: () => window.URL.revokeObjectURL(objectUrl),
        },
      };
    } catch (error) {
      return { success: false, errorResponse: this.toErrorResponse(error) };
    }
  }

  static async delete(storedFileName: string): Promise<string> {
    if (!storedFileName.trim()) throw new Error("Invalid stored filename");
    await apiService.delete(`${BASE}/Delete/${storedFileName}`);
    return storedFileName;
  }

  static async uploadMany(files: File[]): Promise<UploadResult> {
    try {
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

      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      await apiService.post(`${BASE}/UploadMany`, formData, {
        "Content-Type": "multipart/form-data",
      });
      return { success: true, message: "Files uploaded successfully" };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
      };
    }
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

const fileService = new FileService();
export default fileService;
export { FileService };
