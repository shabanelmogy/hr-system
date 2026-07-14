import { passwordPolicyPattern } from "@/features/auth/validation/passwordPolicy";
import { z } from "zod";

const getPasswordChangeSchema = (t: (key: string, options?: Record<string, unknown>) => string) =>
  z
    .object({
      currentPassword: z.string().min(1, t("validation.required")),
      newPassword: z
        .string()
        .min(1, t("validation.required"))
        .min(8, t("validation.minLength", { count: 8 }))
        .regex(passwordPolicyPattern, t("validation.invalidPassword")),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      path: ["newPassword"],
      message: t("validation.passwordMustNotBeCurrent"),
    });

export default getPasswordChangeSchema;
