import { z } from "zod";
import type { TFunction } from "i18next";

const required = (t: TFunction) => t("ledgerSetup.validation.required");

export const getAccountSchema = (t: TFunction) =>
  z.object({
    code: z.string().trim().min(1, required(t)).max(50),
    nameAr: z.string().trim().min(1, required(t)).max(200),
    nameEn: z.string().trim().min(1, required(t)).max(200),
    accountHierarchyLevelId: z.number().int().positive(required(t)),
    parentAccountId: z.number().int().positive().nullable().optional(),
    allowPosting: z.boolean(),
    manualPostingPolicy: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    currencyPolicy: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    specificCurrencyId: z.number().int().positive().nullable().optional(),
  }).superRefine((values, context) => {
    if (values.currencyPolicy === 3 && !values.specificCurrencyId) {
      context.addIssue({
        code: "custom",
        path: ["specificCurrencyId"],
        message: required(t),
      });
    }
  });

export type AccountFormValues = z.infer<ReturnType<typeof getAccountSchema>>;

export const getHierarchyLevelSchema = (t: TFunction) =>
  z.object({
    levelNumber: z.coerce.number().int().positive(required(t)),
    nameAr: z.string().trim().min(1, required(t)).max(150),
    nameEn: z.string().trim().min(1, required(t)).max(150),
    canPost: z.boolean(),
  });

export type HierarchyLevelFormValues = z.infer<
  ReturnType<typeof getHierarchyLevelSchema>
>;
