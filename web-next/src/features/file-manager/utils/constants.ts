/**
 * FileManager Feature Constants
 * 
 * Centralized configuration for file management
 */

/**
 * File upload configuration
 */
export const FILE_UPLOAD_CONFIG = {
  /** Maximum file size in bytes (50MB) */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  
  /** Maximum number of files per upload */
  MAX_FILES_PER_UPLOAD: 10,
  
  /** Allowed MIME types */
  ALLOWED_MIME_TYPES: [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
    // Videos
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "audio/mp4",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    // Text
    "text/plain",
    "text/csv",
    "text/html",
    "text/css",
    "text/javascript",
    "application/json",
  ],
} as const;

/**
 * Media viewer configuration
 */
export const MEDIA_VIEWER_CONFIG = {
  /** File extensions that can be viewed in iframe */
  IFRAME_EXTENSIONS: ["pdf"],
  
  /** Image file extensions */
  IMAGE_EXTENSIONS: ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"],
  
  /** Video file extensions */
  VIDEO_EXTENSIONS: ["mp4", "webm", "mov", "avi", "mkv"],
  
  /** Audio file extensions */
  AUDIO_EXTENSIONS: ["mp3", "wav", "ogg", "m4a"],
  
  /** All viewable extensions */
  get VIEWABLE_EXTENSIONS() {
    return [
      ...this.IFRAME_EXTENSIONS,
      ...this.IMAGE_EXTENSIONS,
      ...this.VIDEO_EXTENSIONS,
      ...this.AUDIO_EXTENSIONS,
    ];
  },
} as const;

/**
 * API endpoints
 */
export const FILE_API_ENDPOINTS = {
  BASE: "/v1/api/Files",
  GET_ALL: "/v1/api/Files/GetAll",
  GET_BY_ID: (id: number) => `/v1/api/Files/GetByID/${id}`,
  UPLOAD_MANY: "/v1/api/Files/UploadMany",
  DELETE: (storedFileName: string) => `/v1/api/Files/Delete/${storedFileName}`,
  DOWNLOAD: (storedFileName: string) => `/v1/api/Files/Download/${storedFileName}`,
  STREAM: (id: number) => `/v1/api/Files/Stream/${id}`,
} as const;

/**
 * Error messages
 */
export const FILE_ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "File type not allowed",
  FILE_TOO_LARGE: "File size exceeds maximum limit",
  TOO_MANY_FILES: "Too many files selected",
  UPLOAD_FAILED: "Failed to upload file(s)",
  DOWNLOAD_FAILED: "Failed to download file",
  DELETE_FAILED: "Failed to delete file",
  FETCH_FAILED: "Failed to fetch files",
  INVALID_FILE_ID: "Invalid file ID",
  NETWORK_ERROR: "Network error occurred",
} as const;

/**
 * Success messages
 */
export const FILE_SUCCESS_MESSAGES = {
  UPLOAD_SUCCESS: "File(s) uploaded successfully",
  DOWNLOAD_SUCCESS: "File downloaded successfully",
  DELETE_SUCCESS: "File deleted successfully",
  FETCH_SUCCESS: "Files loaded successfully",
} as const;

/**
 * File status types
 */
export const FILE_STATUS = {
  PENDING: "pending",
  UPLOADING: "uploading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

/**
 * Dialog types
 */
export const DIALOG_TYPES = {
  UPLOAD: "upload",
  DELETE: "delete",
  VIEW: "view",
} as const;

/**
 * Grid action types
 */
export const GRID_ACTION_TYPES = {
  ADD: "add",
  EDIT: "edit",
  DELETE: "delete",
} as const;

/**
 * Query cache configuration
 */
export const QUERY_CONFIG = {
  STALE_TIME: 5 * 60 * 1000, // 5 minutes
  GC_TIME: 10 * 60 * 1000, // 10 minutes
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;
