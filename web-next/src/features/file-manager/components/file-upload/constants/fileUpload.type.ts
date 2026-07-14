import { z } from "zod";

export const FILE_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_UPLOAD: 10,
  ALLOWED_TYPES: [
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
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
    // Text
    "text/plain",
    "text/csv",
  ],
} as const;

export const createFileValidationSchema = (messages: {
  required: string;
  tooLarge: string;
  invalidType: string;
  invalidName: string;
}) =>
  z.object({
    file: z
      .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        messages.required,
      )
      .superRefine((file, ctx) => {
        if (typeof File === "undefined" || !(file instanceof File)) return;
        if (file.size > FILE_CONFIG.MAX_FILE_SIZE) {
          ctx.addIssue({ code: "custom", message: messages.tooLarge });
        }
        if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type as (typeof FILE_CONFIG.ALLOWED_TYPES)[number])) {
          ctx.addIssue({ code: "custom", message: messages.invalidType });
        }
        if (!/^[A-Za-z0-9_\-. ]*$/.test(file.name)) {
          ctx.addIssue({ code: "custom", message: messages.invalidName });
        }
      }),
  });
