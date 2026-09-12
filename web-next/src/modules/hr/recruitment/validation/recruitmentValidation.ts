import { z } from "zod";
import type { TFunction } from "i18next";
import {
  EmploymentType,
  WorkArrangement,
  ApplicationSource,
  InterviewType,
  InterviewRecommendation,
  PayFrequency,
  RequisitionType,
} from "../types";

export const jobOpeningSchema = z.object({
  jobRequisitionId: z.coerce.number().optional().default(0),
  positionId: z.coerce.number().min(1, "Position is required"),
  branchId: z.coerce.number().min(1, "Branch is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  divisionId: z.coerce.number().optional(),
  positionCount: z.coerce.number().min(1, "Must request at least 1 opening"),
  employmentType: z.coerce.number().default(EmploymentType.FullTime),
  workArrangement: z.coerce.number().default(WorkArrangement.OnSite),
});

export type JobOpeningFormData = z.infer<typeof jobOpeningSchema>;
export type JobOpeningFormInput = z.input<typeof jobOpeningSchema>;

export const jobRequisitionSchema = z.object({
  staffingRequestId: z.coerce.number().min(1, "Select an approved staffing request"),
  requestedPositions: z.coerce.number().min(1, "Must request at least 1 position"),
  businessReason: z.string().trim().min(3, "Business reason is required"),
  employmentType: z.coerce.number().default(EmploymentType.FullTime),
  workArrangement: z.coerce.number().default(WorkArrangement.OnSite),
  targetHireDate: z.string().optional(),
  type: z.coerce.number().default(RequisitionType.NewPosition),
  replacementEmployeeId: z.coerce.number().optional(),
});

export type JobRequisitionFormData = z.infer<typeof jobRequisitionSchema>;

export const newApplicationSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Please provide a valid email address"),
  phoneNumber: z.string().trim().optional(),
  jobOpeningId: z.coerce.number().min(1, "Job opening is required"),
  source: z.coerce.number().default(ApplicationSource.CareersPortal),
  expectedSalary: z.coerce.number().optional(),
  expectedSalaryCurrencyCode: z.string().default("EGP"),
  availableFrom: z.string().optional(),
  coverLetter: z.string().trim().optional(),
});

export type NewApplicationFormData = z.infer<typeof newApplicationSchema>;
export type NewApplicationFormInput = z.input<typeof newApplicationSchema>;

export const scheduleInterviewSchema = z.object({
  type: z.coerce.number().default(InterviewType.Technical),
  startsOn: z.string().min(1, "Start time is required"),
  endsOn: z.string().min(1, "End time is required"),
  locationOrMeetingUrl: z.string().trim().optional(),
  leadEmployeeId: z.coerce.number().positive().optional(),
});

export type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>;
export type ScheduleInterviewFormInput = z.input<typeof scheduleInterviewSchema>;

export const interviewEvaluationSchema = z.object({
  score: z.coerce.number().min(1, "Score must be at least 1").max(5, "Score cannot exceed 5"),
  recommendation: z.coerce.number().default(InterviewRecommendation.Hire),
  comments: z.string().trim().optional(),
});

export type InterviewEvaluationFormData = z.infer<typeof interviewEvaluationSchema>;

export const jobOfferSchema = z.object({
  baseSalary: z.coerce.number().min(100, "Base salary must be positive"),
  currencyCode: z.string().default("EGP"),
  payFrequency: z.coerce.number().default(PayFrequency.Monthly),
  proposedStartDate: z.string().min(1, "Start date is required"),
  termsAndConditions: z.string().trim().optional(),
});

export type JobOfferFormData = z.infer<typeof jobOfferSchema>;
export type JobOfferFormInput = z.input<typeof jobOfferSchema>;

const requiredSettingText = (t: TFunction) =>
  z.string().trim().min(1, t("recruitment.settings.validation.required"));

export const createStageSettingsSchema = (t: TFunction) => z.object({
  nameAr: requiredSettingText(t),
  nameEn: requiredSettingText(t),
  sequence: z.coerce.number().int().min(1, t("recruitment.settings.validation.sequence")),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  foldedInKanban: z.boolean(),
  sendEmailNotification: z.boolean(),
  emailTemplate: z.string().trim().max(2000).optional(),
});
export type StageSettingsFormData = z.infer<ReturnType<typeof createStageSettingsSchema>>;
export type StageSettingsFormInput = z.input<ReturnType<typeof createStageSettingsSchema>>;

export const createSourceSettingsSchema = (t: TFunction) => z.object({
  nameAr: requiredSettingText(t),
  nameEn: requiredSettingText(t),
  type: z.enum(["portal", "social", "referral", "agency", "fair", "other"]),
  isActive: z.boolean(),
});
export type SourceSettingsFormData = z.infer<ReturnType<typeof createSourceSettingsSchema>>;

export const createCriterionSettingsSchema = (t: TFunction) => z.object({
  titleAr: requiredSettingText(t),
  titleEn: requiredSettingText(t),
  descriptionAr: z.string().trim().max(2000).optional(),
  descriptionEn: z.string().trim().max(2000).optional(),
  category: z.enum(["technical", "communication", "problem_solving", "culture", "leadership"]),
  weight: z.coerce.number().min(1, t("recruitment.settings.validation.weight")).max(100),
  isMandatory: z.boolean(),
});
export type CriterionSettingsFormData = z.infer<ReturnType<typeof createCriterionSettingsSchema>>;
export type CriterionSettingsFormInput = z.input<ReturnType<typeof createCriterionSettingsSchema>>;

export const createRejectionReasonSettingsSchema = (t: TFunction) => z.object({
  reasonAr: requiredSettingText(t),
  reasonEn: requiredSettingText(t),
  category: z.enum(["qualifications", "salary", "behavioral", "candidate_withdrew", "other"]),
  sendAutoEmail: z.boolean(),
  emailSubjectAr: z.string().trim().max(500).optional(),
  emailSubjectEn: z.string().trim().max(500).optional(),
  emailBodyAr: z.string().trim().max(4000).optional(),
  emailBodyEn: z.string().trim().max(4000).optional(),
});
export type RejectionReasonSettingsFormData = z.infer<ReturnType<typeof createRejectionReasonSettingsSchema>>;

export const createGeneralSettingsSchema = (t: TFunction) => z.object({
  defaultCurrency: z.string().refine(
    (value) => ["EGP", "SAR", "AED", "USD", "EUR"].includes(value),
    t("recruitment.settings.validation.required"),
  ),
  offerExpiryDays: z.coerce
    .number()
    .int()
    .min(1, t("recruitment.settings.validation.offerExpiry"))
    .max(365, t("recruitment.settings.validation.offerExpiry")),
  defaultProbationMonths: z.coerce
    .number()
    .refine((value) => [1, 3, 6].includes(value), {
      message: t("recruitment.settings.validation.probation"),
    }),
  inboundEmailAlias: z.string().trim().refine(
    (value) => value.length === 0 || z.string().email().safeParse(value).success,
    t("recruitment.settings.validation.email"),
  ),
  autoPublishOpening: z.boolean(),
  enforceHeadcountCapacity: z.boolean(),
  enablePublicPortal: z.boolean(),
});
export type GeneralSettingsFormData = z.infer<ReturnType<typeof createGeneralSettingsSchema>>;
export type GeneralSettingsFormInput = z.input<ReturnType<typeof createGeneralSettingsSchema>>;
