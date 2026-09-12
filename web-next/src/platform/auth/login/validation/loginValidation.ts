import { z } from "zod";
import type { Translator } from "../../types";

export const createLoginValidationSchema = (t: Translator) =>
  z.object({
    username: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 })),
    password: z.string().trim().min(1, t("validation.required")),
  });

export type LoginFormData = z.infer<ReturnType<typeof createLoginValidationSchema>>;
