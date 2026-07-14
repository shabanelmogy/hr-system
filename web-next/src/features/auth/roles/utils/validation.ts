import { z } from "zod";

export const getRoleValidationSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(2, t("validation.minLength", { count: 2 }))
      .max(50, t("validation.maxLength", { count: 50 }))
      .regex(
        /^[a-zA-Z\s]+$/,
        t("validation.englishOnly") || "Role name can only contain letters and spaces",
      ),
  });

export const getRoleClaimsValidationSchema = (t?: (key: string) => string) =>
  z.object({
    id: z.string().min(1, t?.("validation.required") ?? "Required"),
    name: z.string().min(1, t?.("validation.required") ?? "Required"),
    roleClaims: z.array(
      z.object({
        displayValue: z.string().min(1, t?.("validation.required") ?? "Required"),
        isSelected: z.boolean(),
      }),
    ),
  });

export type RoleClaimsFormData = z.infer<ReturnType<typeof getRoleClaimsValidationSchema>>;

export default getRoleValidationSchema;
