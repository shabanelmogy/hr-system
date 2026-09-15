import { z } from "zod";
import type { Translator } from "@/platform/auth/types";

export const getInvitationValidationSchema = (t: Translator) => z.object({
  firstName: z.string().trim().min(1, t("validation.required")).min(3, t("validation.minLength", { count: 3 })).max(50, t("validation.maxLength", { count: 50 })),
  lastName: z.string().trim().min(1, t("validation.required")).min(3, t("validation.minLength", { count: 3 })).max(50, t("validation.maxLength", { count: 50 })),
  userName: z.string().trim().min(1, t("validation.required")).min(2, t("validation.minLength", { count: 2 })).max(50, t("validation.maxLength", { count: 50 })),
  email: z.string().trim().min(1, t("validation.required")).email(t("validation.invalidEmail")),
  roles: z.array(z.string()).min(1, t("users.atLeastOneRole")).refine(
    (roles) => new Set(roles.map((role) => role.trim().toLowerCase())).size === roles.length,
    t("validation.duplicateValues"),
  ),
  companyIds: z.array(z.number().int().positive()).min(1, t("users.atLeastOneCompany")).refine(
    (companyIds) => new Set(companyIds).size === companyIds.length,
    t("validation.duplicateValues"),
  ),
  defaultCompanyId: z.number().int().positive(t("users.defaultCompanyRequired")),
}).superRefine((data, context) => {
  if (!data.companyIds.includes(data.defaultCompanyId)) {
    context.addIssue({
      code: "custom",
      path: ["defaultCompanyId"],
      message: t("users.defaultCompanyMustBeSelected"),
    });
  }
});

export type InvitationFormData = z.infer<ReturnType<typeof getInvitationValidationSchema>>;
