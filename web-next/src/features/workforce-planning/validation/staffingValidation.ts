import { z } from "zod";

type Translate = (key: string) => string;

export const getEnvelopeAmendmentSchema = (t: Translate) => z.object({
  envelopeId: z.coerce.number().int().positive(t("staffing.validation.envelope")),
  additionalHeadcount: z.coerce.number().int().positive(t("staffing.validation.positiveHeadcount")),
  additionalSalaryCost: z.coerce.number().positive(t("staffing.validation.positiveCost")),
  justification: z.string().trim().min(1, t("staffing.validation.justification")).max(2000),
});

export const getStaffingRequestSchema = (t: Translate) => z.object({
  envelopeId: z.coerce.number().int().positive(t("staffing.validation.envelope")),
  requestedHeadcount: z.coerce.number().int().positive(t("staffing.validation.positiveHeadcount")).max(10000),
  estimatedAnnualSalaryPerSlot: z.coerce.number().min(0, t("staffing.validation.nonNegativeSalary")),
  targetStartDate: z.string().min(1, t("staffing.validation.targetStartDate")),
  requestType: z.coerce.number().int().min(1).max(2),
  priority: z.coerce.number().int().min(1).max(4),
  justification: z.string().trim().min(1, t("staffing.validation.justification")).max(2000),
});

export type EnvelopeAmendmentFormValues = z.infer<ReturnType<typeof getEnvelopeAmendmentSchema>>;
export type StaffingRequestFormValues = z.infer<ReturnType<typeof getStaffingRequestSchema>>;
