import type { TFunction } from "i18next";
import { z } from "zod";

export const getWorkforcePlanSchema = (t: TFunction) => {
  const periodTarget = z.object({
    fiscalPeriodId: z.coerce.number().int().positive(t("workforcePlanning.validation.period")),
    newHireSlots: z.coerce.number().int().nonnegative(t("workforcePlanning.validation.nonNegative")),
    replacementSlots: z.coerce.number().int().nonnegative(t("workforcePlanning.validation.nonNegative")),
  });
  const line = z.object({
    positionId: z.coerce.number().int().positive(t("workforcePlanning.validation.position")),
    targetBranchId: z.preprocess(value => value === "" || value === null || value === undefined ? null : value, z.coerce.number().int().positive().nullable()),
    newHireSlots: z.coerce.number().int().nonnegative(t("workforcePlanning.validation.nonNegative")),
    replacementSlots: z.coerce.number().int().nonnegative(t("workforcePlanning.validation.nonNegative")),
    justification: z.string().max(2000, t("workforcePlanning.validation.description")).optional().nullable(),
    periodTargets: z.array(periodTarget).min(1, t("workforcePlanning.validation.period")),
  }).superRefine((value, context) => {
    const seen = new Set<number>();
    value.periodTargets.forEach((target, index) => {
      if (seen.has(target.fiscalPeriodId)) context.addIssue({ code: "custom", path: ["periodTargets", index, "fiscalPeriodId"], message: t("workforcePlanning.validation.duplicatePeriod") });
      seen.add(target.fiscalPeriodId);
    });
    const newHireTotal = value.periodTargets.reduce((sum, target) => sum + target.newHireSlots, 0);
    const replacementTotal = value.periodTargets.reduce((sum, target) => sum + target.replacementSlots, 0);
    if (newHireTotal !== value.newHireSlots) context.addIssue({ code: "custom", path: ["periodTargets"], message: t("workforcePlanning.validation.newHirePeriodTotals") });
    if (replacementTotal !== value.replacementSlots) context.addIssue({ code: "custom", path: ["periodTargets"], message: t("workforcePlanning.validation.replacementPeriodTotals") });
  });
  return z.object({
  planCode: z.string().trim().min(2, t("workforcePlanning.validation.planCode")).max(50, t("workforcePlanning.validation.planCode")),
  fiscalYearId: z.coerce.number().int().positive(t("workforcePlanning.validation.fiscalYear")),
  titleEn: z.string().trim().min(2, t("workforcePlanning.validation.title")).max(200, t("workforcePlanning.validation.title")),
  titleAr: z.string().trim().min(2, t("workforcePlanning.validation.title")).max(200, t("workforcePlanning.validation.title")),
  description: z.string().max(2000, t("workforcePlanning.validation.description")).optional().nullable(),
  lines: z.array(line).min(1, t("workforcePlanning.validation.lines")),
  });
};

export type WorkforcePlanFormValues = z.infer<ReturnType<typeof getWorkforcePlanSchema>>;
