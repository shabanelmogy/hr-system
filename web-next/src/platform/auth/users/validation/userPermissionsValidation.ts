import { z } from "zod";

export const userCompanyPermissionsSchema = z.object({
  userId: z.string().min(1), userName: z.string(), companyId: z.number().int().positive(),
  companyName: z.string(), revision: z.number().int().nonnegative(),
  permissions: z.array(z.object({
    permission: z.string().min(1), moduleCode: z.string(), submoduleCode: z.string(),
    isDirect: z.boolean(), inheritedFrom: z.array(z.string()),
    isEffective: z.boolean(), canGrant: z.boolean(),
  })),
});
export const createUserPermissionsFormSchema = (message: string) => z.object({
  permissions: z.array(z.string().min(1)).max(2000, message),
});
export type UserPermissionsFormValues = z.infer<ReturnType<typeof createUserPermissionsFormSchema>>;