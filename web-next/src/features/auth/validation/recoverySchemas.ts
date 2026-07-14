import { passwordPolicyPattern } from "@/features/auth/validation/passwordPolicy";
import { z } from "zod";

type Translator = (key: string, options?: Record<string, unknown>) => string;

export const getEmailRecoverySchema = (t: Translator) =>
  z.object({
    email: z.string().trim().min(1, t("validation.required")).email(t("validation.invalidEmail")),
  });

export type EmailRecoveryFormData = z.infer<ReturnType<typeof getEmailRecoverySchema>>;

export const getResetPasswordLinkSchema = (t: Translator) =>
  z.object({
    email: z.string().trim().min(1, t("validation.required")).email(t("validation.invalidEmail")),
    code: z.string().trim().min(1, t("validation.required")),
  });

export const getResetPasswordSchema = (t: Translator) =>
  getResetPasswordLinkSchema(t).extend({
    newPassword: z
      .string()
      .min(1, t("validation.required"))
      .min(8, t("validation.invalidPassword", { count: 8 }))
      .regex(passwordPolicyPattern, t("validation.invalidPassword")),
  });

export type ResetPasswordLinkData = z.infer<ReturnType<typeof getResetPasswordLinkSchema>>;
export type ResetPasswordFormData = z.infer<ReturnType<typeof getResetPasswordSchema>>;
