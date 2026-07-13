import axios from "axios";
import { apiService } from "@/shared/services";
import { extractValue, extractValues } from "@/shared/utils/ApiHelper";
import type { FileItem, UploadResult } from "../types/File";

const BASE = "api/v1/Files";

const FILE_CONFIG = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10,
} as const;

class FileService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: this.getBaseURL(),
    });
    
    // Add request interceptor for auth headers
    this.client.interceptors.request.use((config) => {
      const token = sessionStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private processError(error: any) {
    if (!error?.response) {
      return {
        status: 0,
        title: "Network Error",
        message: "Failed to connect to the server",
        errors: null,
      };
    }
    const { status, data } = error.response;
    return {
      status,
      title: data?.title || "Error",
      errors: data?.errors ? Object.values(data.errors).flat() : null,
      message: data?.title || `Request failed with status ${status}`,
    };
  }

  private getBaseURL() {
    const envUrl = import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim();
    const lsUrl = localStorage.getItem("baseApiUrl");
    if (lsUrl) return lsUrl;
    if (envUrl) return envUrl;
    console.warn("No API URL configured. Please set VITE_API_URL environment variable.");
    return window.location.origin;
  }

  static async getAll(): Promise<FileItem[]> {
    const response = await apiService.get(`${BASE}/GetAll`);
    const files = extractValues<FileItem>(response);
    return files.filter((file) => !file.isDeleted);
  }

  static async getById(id: number): Promise<FileItem> {
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error("Invalid file ID");
    }
    const response = await apiService.get(`${BASE}/GetByID/${id}`);
    return extractValue<FileItem>(response);
  }

  async downloadFile(storedFileName: string, fileName: string): Promise<{ success: boolean; errorResponse?: any }> {
    try {
      const response = await this.client.get(`${BASE}/download/${storedFileName}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    } catch (error: any) {
      const processedError = this.processError(error);
      return {
        success: false,
        errorResponse: {
          errors: processedError.errors || { general: [processedError.message] },
        },
      };
    }
  }

  async downloadStream(idOrPath: string | number): Promise<{ success: boolean; data?: any; errorResponse?: any }> {
    try {
      const response = await this.client.get(`${BASE}/stream/${idOrPath}`, { responseType: "blob" });
      const objectUrl = window.URL.createObjectURL(new Blob([response.data]));
      return {
        success: true,
        data: { url: objectUrl, blob: response.data, cleanup: () => window.URL.revokeObjectURL(objectUrl) },
      };
    } catch (error: any) {
      const processedError = this.processError(error);
      return {
        success: false,
        errorResponse: {
          errors: processedError.errors || { general: [processedError.message] },
        },
      };
    }
  }

  static async delete(storedFileName: string): Promise<string> {
    if (!storedFileName || typeof storedFileName !== "string") {
      throw new Error("Invalid stored filename");
    }
    await apiService.delete(`${BASE}/Delete/${storedFileName}`);
    return storedFileName;
  }

  static async uploadMany(files: File[]): Promise<UploadResult> {
    try {
      if (!Array.isArray(files) || files.length === 0) {
        throw new Error("No files provided");
      }
      if (files.length > FILE_CONFIG.MAX_FILES_PER_UPLOAD) {
        throw new Error(`Cannot upload more than ${FILE_CONFIG.MAX_FILES_PER_UPLOAD} files at once`);
      }
      const oversizedFiles = files.filter((f) => f.size > FILE_CONFIG.MAX_FILE_SIZE);
      if (oversizedFiles.length > 0) {
        const sizeMB = (FILE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
        const fileNames = oversizedFiles.map((f) => f.name).join(", ");
        throw new Error(`Files exceed maximum size of ${sizeMB}MB: ${fileNames}`);
      }
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      await apiService.post(`${BASE}/UploadMany`, formData, { "Content-Type": "multipart/form-data" });
      return { success: true, message: "Files uploaded successfully" };
    } catch (error: any) {
      return { success: false, message: error?.message || "Upload failed" };
    }
  }
}

const fileService = new FileService();
export default fileService;
export { FileService };
