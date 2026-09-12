import type { TFunction } from "i18next";
import { z } from "zod";
import { endOfFiscalYear } from "../utils/fiscalPeriodPreview";

export const getFiscalYearSchema = (t: TFunction) => z.object({
  code: z.string().trim().min(2, t("fiscalYears.validation.code")).max(20, t("fiscalYears.validation.code")).regex(/^[A-Za-z0-9][A-Za-z0-9._/-]{1,19}$/, t("fiscalYears.validation.code")),
  nameAr: z.string().trim().min(2, t("fiscalYears.validation.name")).max(100, t("fiscalYears.validation.name")),
  nameEn: z.string().trim().min(2, t("fiscalYears.validation.name")).max(100, t("fiscalYears.validation.name")),
  startDate: z.string().min(1, t("fiscalYears.validation.startDate")),
  endDate: z.string().min(1, t("fiscalYears.validation.endDate")),
  periodFrequency: z.union([z.literal(1), z.literal(2)]),
}).superRefine((value, context) => {
  const expected = endOfFiscalYear(value.startDate);
  if (expected && expected !== value.endDate) {
    context.addIssue({ code: "custom", path: ["endDate"], message: t("fiscalYears.validation.duration") });
  }
});

export type FiscalYearFormValues = z.infer<ReturnType<typeof getFiscalYearSchema>>;
