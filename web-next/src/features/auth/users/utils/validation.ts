import { passwordPolicyPattern } from "@/features/auth/validation/passwordPolicy";
import { z } from "zod";

export const getUserValidationSchema = (t: (key: string, options?: any) => string, isAddMode = false) =>
  z
    .object({
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
        .min(2, t("validation.minLength", { count: 2 }))
        .max(50, t("validation.maxLength", { count: 50 })),
      email: z
        .string()
        .trim()
        .min(1, t("validation.required"))
        .max(100, t("validation.maxLength", { count: 100 }))
        .email(t("validation.invalidEmail")),
      password: z.string().nullable().optional(),
      confirmPassword: z.string().nullable().optional(),
      roles: z.array(z.string()).min(1, t("users.atLeastOneRole")).max(10, t("users.maxRoles", { count: 10 })),
      isDisabled: z.boolean(),
      profilePicture: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const password = data.password ?? "";
      const confirmPassword = data.confirmPassword ?? "";

      if (isAddMode && !password) {
        ctx.addIssue({ code: "custom", path: ["password"], message: t("validation.required") });
      }

      if (password) {
        if (password.length < 8) {
          ctx.addIssue({ code: "custom", path: ["password"], message: t("validation.minLength", { count: 8 }) });
        }
        if (password.length > 50) {
          ctx.addIssue({ code: "custom", path: ["password"], message: t("validation.maxLength", { count: 50 }) });
        }
        if (!passwordPolicyPattern.test(password)) {
          ctx.addIssue({ code: "custom", path: ["password"], message: t("users.passwordRequirements") });
        }
        if (!confirmPassword) {
          ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: t("validation.required") });
        } else if (password !== confirmPassword) {
          ctx.addIssue({
            code: "custom",
            path: ["confirmPassword"],
            message: t("validation.passwordsMustMatch") || "Passwords must match",
          });
        }
      }
    });

export default getUserValidationSchema;
