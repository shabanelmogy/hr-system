import { z } from "zod";

const imageTypes = ["image/jpeg", "image/jpg", "image/png"] as const;

export const createImageFileValidationSchema = (
  messages: { required: string; tooLarge: string; invalidType: string },
  maxSizeInBytes = 10 * 1024 * 1024,
) =>
  z.object({
    file: z
      .custom<File>(
        (value) => typeof File !== "undefined" && value instanceof File,
        messages.required,
      )
      .superRefine((file, ctx) => {
        if (typeof File === "undefined" || !(file instanceof File)) return;
        if (file.size > maxSizeInBytes) {
          ctx.addIssue({ code: "custom", message: messages.tooLarge });
        }
        if (!imageTypes.includes(file.type as (typeof imageTypes)[number])) {
          ctx.addIssue({ code: "custom", message: messages.invalidType });
        }
      }),
  });
