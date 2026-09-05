import { z } from "zod";
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

export const jobRequisitionSchema = z.object({
  positionId: z.coerce.number().min(1, "Position is required"),
  branchId: z.coerce.number().min(1, "Branch is required"),
  departmentId: z.coerce.number().min(1, "Department is required"),
  divisionId: z.coerce.number().optional(),
  requestedPositions: z.coerce.number().min(1, "Must request at least 1 position"),
  businessReason: z.string().trim().min(3, "Business reason is required"),
  employmentType: z.coerce.number().default(EmploymentType.FullTime),
  workArrangement: z.coerce.number().default(WorkArrangement.OnSite),
  targetHireDate: z.string().optional(),
  type: z.coerce.number().default(RequisitionType.NewPosition),
  replacementEmployeeId: z.coerce.number().optional(),
  isBudgeted: z.boolean().default(true),
  budgetJustification: z.string().trim().optional(),
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

export const scheduleInterviewSchema = z.object({
  type: z.coerce.number().default(InterviewType.Technical),
  startsOn: z.string().min(1, "Start time is required"),
  endsOn: z.string().min(1, "End time is required"),
  locationOrMeetingUrl: z.string().trim().optional(),
  leadEmployeeId: z.coerce.number().default(1),
});

export type ScheduleInterviewFormData = z.infer<typeof scheduleInterviewSchema>;

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
