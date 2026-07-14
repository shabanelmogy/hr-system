import { z } from "zod";

type Translator = (key: string, options?: Record<string, unknown>) => string;

export const getRoleValidationSchema = (t: Translator) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("validation.required"))
      .min(3, t("validation.minLength", { count: 3 }))
      .max(50, t("validation.maxLength", { count: 50 }))
  });

export const getRoleClaimsValidationSchema = (t?: Translator) =>
  z.object({
    id: z.string().min(1, t?.("validation.required") ?? "Required"),
    name: z
      .string()
      .trim()
      .min(3, t?.("validation.minLength", { count: 3 }) ?? "Minimum 3 characters")
      .max(50, t?.("validation.maxLength", { count: 50 }) ?? "Maximum 50 characters"),
    roleClaims: z.array(
      z.object({
        displayValue: z.string().min(1, t?.("validation.required") ?? "Required"),
        isSelected: z.boolean(),
      }),
    ),
  });

export type RoleClaimsFormData = z.infer<ReturnType<typeof getRoleClaimsValidationSchema>>;

export default getRoleValidationSchema;
