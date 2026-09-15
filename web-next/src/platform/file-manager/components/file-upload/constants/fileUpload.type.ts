import { z } from "zod";

const FILE_LIMITS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_FILES_PER_UPLOAD: 10,
} as const;

export const FILE_EXTENSION_TYPES: Readonly<Record<string, readonly string[]>> = {
  jpg: ["image/jpeg", "image/jpg"], jpeg: ["image/jpeg", "image/jpg"], png: ["image/png"],
  gif: ["image/gif"], bmp: ["image/bmp", "image/x-ms-bmp"], webp: ["image/webp"],
  mp4: ["video/mp4"], webm: ["video/webm"], mov: ["video/quicktime"], qt: ["video/quicktime"],
  avi: ["video/x-msvideo", "video/avi"], pdf: ["application/pdf"], doc: ["application/msword"],
  xls: ["application/vnd.ms-excel"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  zip: ["application/zip", "application/x-zip-compressed"], mp3: ["audio/mpeg", "audio/mp3"],
  wav: ["audio/wav", "audio/x-wav"], ogg: ["audio/ogg", "application/ogg"],
  rar: ["application/vnd.rar", "application/x-rar-compressed", "application/x-rar"], txt: ["text/plain"],
  csv: ["text/csv", "application/csv", "text/plain"],
};

export const FILE_CONFIG = {
  ...FILE_LIMITS,
  ALLOWED_TYPES: Array.from(new Set(Object.values(FILE_EXTENSION_TYPES).flat())),
} as const;

export type FilePolicyError = "required" | "tooLarge" | "invalidType" | "invalidName";

export function validateFilePolicy(file: File): FilePolicyError | null {
  if (file.size > FILE_CONFIG.MAX_FILE_SIZE) return "tooLarge";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const acceptedTypes = FILE_EXTENSION_TYPES[extension];
  if (!acceptedTypes || !acceptedTypes.includes(file.type)) return "invalidType";
  if (!/^[A-Za-z0-9_\-. ]*$/.test(file.name)) return "invalidName";
  return null;
}

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
        const error = validateFilePolicy(file);
        if (error === "tooLarge") ctx.addIssue({ code: "custom", message: messages.tooLarge });
        if (error === "invalidType") ctx.addIssue({ code: "custom", message: messages.invalidType });
        if (error === "invalidName") ctx.addIssue({ code: "custom", message: messages.invalidName });
      }),
  });
