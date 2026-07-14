import { passwordPolicyPattern } from "@/features/auth/validation/passwordPolicy";
import { z } from "zod";

const personalDetailsSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    firstName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 })),
    lastName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 })),
    userName: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 })),
  });

const accountSecuritySchema = (t: (key: string, options?: any) => string) =>
  z
    .object({
      email: z.string().trim().min(1, t("validation.required")).email(t("validation.invalidEmail")),
      password: z
        .string()
        .min(1, t("validation.required"))
        .min(8, t("validation.invalidPassword", { count: 8 }))
        .regex(passwordPolicyPattern, t("validation.invalidPassword")),
      confirmPassword: z.string().min(1, t("validation.invalidPassword")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: t("validation.passwordsMustMatch"),
    });

export const getRegistrationValidationSchema = (t: (key: string, options?: any) => string) =>
  personalDetailsSchema(t).merge(accountSecuritySchema(t));

export const getValidationSchema = (activeStep: number, t: (key: string, options?: any) => string) => {
  if (activeStep === 0) return personalDetailsSchema(t);
  if (activeStep === 1) return accountSecuritySchema(t);

  // The final step contains no text fields, but the complete form must still be validated.
  return getRegistrationValidationSchema(t);
};
