import { z } from 'zod';

import {
  ApplicationSource,
  ApplicationStatus,
  EmploymentType,
  InterviewEvaluationRecommendation,
  InterviewStatus,
  InterviewType,
  JobOfferStatus,
  JobOpeningStatus,
  JobRequisitionStatus,
  PayFrequency,
  PlanningSource,
  RequisitionType,
  WorkArrangement,
} from '../../domain/models/recruitment';
import type {
  ApprovedStaffingRequestOptionDto,
  ApplicationStatusHistoryDto,
  CandidateDto,
  EmploymentApplicationDto,
  EvaluationCriterionConfig,
  InterviewDto,
  InterviewEvaluationDto,
  InterviewParticipantDto,
  InterviewScorecardTemplateDto,
  InterviewSkillEvaluationDto,
  JobOfferApprovalHistoryDto,
  JobOfferDto,
  JobOpeningDto,
  JobRequisitionDto,
  JobSkillDto,
  PositionHeadcountSummaryDto,
  RecruitmentPage,
  RecruitmentPageMetadata,
  RecruitmentSettingsDto,
  RecruitmentSourceConfig,
  RecruitmentStageConfig,
  RecruitmentSummaryDto,
  RejectionReasonConfig,
  RecruitmentGeneralSettings,
} from '../../domain/models/recruitment';

const id = z.number().int();
const count = z.number().int().nonnegative();
const amount = z.number().finite();
const text = z.string();
const nonEmptyText = z.string().min(1);
const nullableText = text.nullable();
const nullableId = id.nullable();
const nullableAmount = amount.nullable();
const dateTime = z.string().datetime({ offset: true, local: true });
const nullableDateTime = dateTime.nullable();
const dateOnly = z.string().date();
const nullableDateOnly = dateOnly.nullable();
const guid = z.string().uuid();

export const jobSkillSchema: z.ZodType<JobSkillDto> = z.object({
  skillName: text,
  proficiencyLevel: text,
  isMandatory: z.boolean(),
  defaultWeightPercentage: count,
}).passthrough();

export const candidateSchema: z.ZodType<CandidateDto> = z.object({
  id,
  publicId: guid,
  firstName: text,
  middleName: nullableText,
  lastName: text,
  fullName: text,
  email: text,
  phoneNumber: nullableText,
  dateOfBirth: nullableDateOnly,
  nationalityCountryId: nullableId,
  nationalityCountryNameEn: nullableText,
  nationalityCountryNameAr: nullableText,
  currentCountryId: nullableId,
  currentStateId: nullableId,
  city: nullableText,
  linkedInUrl: nullableText,
  portfolioUrl: nullableText,
  resumeFileId: nullableId,
  isActive: z.boolean(),
  createdOn: dateTime,
}).passthrough();

export const jobOpeningSchema: z.ZodType<JobOpeningDto> = z.object({
  id,
  publicId: guid,
  openingNumber: nonEmptyText,
  jobRequisitionId: id,
  positionId: id,
  positionTitleEn: text,
  positionTitleAr: text,
  branchId: id,
  branchNameEn: text,
  branchNameAr: text,
  departmentId: id,
  departmentNameEn: text,
  departmentNameAr: text,
  divisionId: nullableId,
  divisionNameEn: nullableText,
  divisionNameAr: nullableText,
  positionCount: count,
  hiredCount: count,
  availablePositions: count,
  employmentType: z.nativeEnum(EmploymentType),
  workArrangement: z.nativeEnum(WorkArrangement),
  status: z.nativeEnum(JobOpeningStatus),
  openedOn: nullableDateTime,
  closedOn: nullableDateTime,
  closureReason: nullableText,
  createdOn: dateTime,
  activeApplicationsCount: count,
  jobDescriptionId: nullableId,
  skills: z.array(jobSkillSchema),
}).passthrough();

export const interviewSkillEvaluationSchema: z.ZodType<InterviewSkillEvaluationDto> = z.object({
  skillName: text,
  score: z.number().int(),
  weightPercentage: id.nullable(),
  isMandatory: z.boolean(),
  notes: nullableText,
}).passthrough();

export const interviewParticipantSchema: z.ZodType<InterviewParticipantDto> = z.object({
  id: z.number().int().nonnegative(),
  employeeId: id,
  employeeName: text,
  isLead: z.boolean(),
}).passthrough();

export const interviewEvaluationSchema: z.ZodType<InterviewEvaluationDto> = z.object({
  id: z.number().int().nonnegative(),
  interviewerEmployeeId: id,
  interviewerName: text,
  score: amount,
  recommendation: z.nativeEnum(InterviewEvaluationRecommendation),
  comments: nullableText,
  submittedOn: dateTime,
  skillEvaluationsJson: nullableText,
  skillEvaluations: z.array(interviewSkillEvaluationSchema),
}).passthrough();

export const interviewScorecardTemplateSchema: z.ZodType<InterviewScorecardTemplateDto> = z.object({
  interviewId: id,
  employmentApplicationId: id,
  candidateName: text,
  positionTitleEn: text,
  positionTitleAr: text,
  jobDescriptionId: nullableId,
  skills: z.array(jobSkillSchema),
}).passthrough();

export const interviewSchema: z.ZodType<InterviewDto> = z.object({
  id,
  employmentApplicationId: id,
  candidateName: text,
  openingNumber: nonEmptyText,
  positionTitleEn: text,
  positionTitleAr: text,
  type: z.nativeEnum(InterviewType),
  status: z.nativeEnum(InterviewStatus),
  startsOn: dateTime,
  endsOn: dateTime,
  completedOn: nullableDateTime,
  locationOrMeetingUrl: nullableText,
  cancellationReason: nullableText,
  participants: z.array(interviewParticipantSchema),
  evaluations: z.array(interviewEvaluationSchema),
}).passthrough();

export const jobOfferApprovalHistorySchema: z.ZodType<JobOfferApprovalHistoryDto> = z.object({
  id: z.number().int().nonnegative(),
  action: nonEmptyText,
  actorUserId: nonEmptyText,
  occurredOn: dateTime,
  fromStatus: z.nativeEnum(JobOfferStatus),
  toStatus: z.nativeEnum(JobOfferStatus),
  reason: nullableText,
}).passthrough();

export const jobOfferSchema: z.ZodType<JobOfferDto> = z.object({
  id,
  publicId: guid,
  offerNumber: nonEmptyText,
  employmentApplicationId: id,
  candidateName: text,
  positionId: id,
  positionTitleEn: text,
  positionTitleAr: text,
  branchId: id,
  branchNameEn: text,
  branchNameAr: text,
  departmentId: id,
  departmentNameEn: text,
  departmentNameAr: text,
  divisionId: nullableId,
  baseSalary: amount,
  currencyCode: nonEmptyText,
  payFrequency: z.nativeEnum(PayFrequency),
  employmentType: z.nativeEnum(EmploymentType),
  workArrangement: z.nativeEnum(WorkArrangement),
  proposedStartDate: dateOnly,
  termsAndConditions: nullableText,
  status: z.nativeEnum(JobOfferStatus),
  issuedOn: nullableDateTime,
  expiresOn: nullableDateTime,
  respondedOn: nullableDateTime,
  responseReason: nullableText,
  annualSalarySnapshot: amount,
  fiscalYearCostSnapshot: amount,
  reservationDelta: amount,
  calculationPolicyVersion: nullableText,
  approvalSubmittedOn: nullableDateTime,
  approvalSubmittedById: nullableText,
  approvedOn: nullableDateTime,
  approvedById: nullableText,
  approvalDecisionReason: nullableText,
  approvalHistory: z.array(jobOfferApprovalHistorySchema),
  createdOn: dateTime,
}).passthrough();

export const applicationStatusHistorySchema: z.ZodType<ApplicationStatusHistoryDto> = z.object({
  id: z.number().int().nonnegative(),
  fromStatus: z.nativeEnum(ApplicationStatus).nullable(),
  toStatus: z.nativeEnum(ApplicationStatus),
  changedOn: dateTime,
  reason: nullableText,
  changedByEmployeeId: nullableId,
}).passthrough();

export const employmentApplicationSchema: z.ZodType<EmploymentApplicationDto> = z.object({
  id,
  publicId: guid,
  candidateId: id,
  candidateName: text,
  candidateEmail: text,
  candidatePhone: nullableText,
  jobOpeningId: id,
  openingNumber: nonEmptyText,
  positionTitleEn: text,
  positionTitleAr: text,
  departmentNameEn: text,
  departmentNameAr: text,
  branchNameEn: text,
  branchNameAr: text,
  jobPostingId: nullableId,
  source: z.nativeEnum(ApplicationSource),
  status: z.nativeEnum(ApplicationStatus),
  coverLetter: nullableText,
  resumeFileId: nullableId,
  expectedSalary: nullableAmount,
  expectedSalaryCurrencyCode: nullableText,
  availableFrom: nullableDateOnly,
  submittedOn: nullableDateTime,
  lastStatusChangedOn: dateTime,
  employeeId: nullableId,
  interviewsCount: count,
  averageEvaluationScore: nullableAmount,
  statusHistory: z.array(applicationStatusHistorySchema),
}).passthrough();

export const recruitmentSummarySchema: z.ZodType<RecruitmentSummaryDto> = z.object({
  totalOpenings: count,
  totalActiveCandidates: count,
  totalScheduledInterviews: count,
  totalPendingOffers: count,
  totalHiredCount: count,
  stageCounts: z.record(text, count),
}).passthrough();

export const positionHeadcountSummarySchema: z.ZodType<PositionHeadcountSummaryDto> = z.object({
  positionId: id,
  positionCode: nonEmptyText,
  jobTitleEn: text,
  jobTitleAr: text,
  targetHeadcount: count,
  activeHeadcount: count,
  pendingRequisitionsCount: count,
  availableHeadcount: count,
  exceedsHeadcount: z.boolean(),
}).passthrough();

export const jobRequisitionSchema: z.ZodType<JobRequisitionDto> = z.object({
  id,
  requisitionNumber: nonEmptyText,
  positionId: id,
  positionTitleEn: text,
  positionTitleAr: text,
  branchId: id,
  branchNameEn: text,
  branchNameAr: text,
  departmentId: id,
  departmentNameEn: text,
  departmentNameAr: text,
  divisionId: nullableId,
  divisionNameEn: nullableText,
  divisionNameAr: nullableText,
  requestedByEmployeeId: id,
  requestedPositions: count,
  staffingRequestId: nullableId,
  planningSource: z.nativeEnum(PlanningSource),
  hiredPositions: count,
  remainingPositions: count,
  businessReason: text,
  employmentType: z.nativeEnum(EmploymentType),
  workArrangement: z.nativeEnum(WorkArrangement),
  targetHireDate: nullableDateOnly,
  type: z.nativeEnum(RequisitionType),
  replacementEmployeeId: nullableId,
  replacementEmployeeName: nullableText,
  isBudgeted: z.boolean(),
  budgetJustification: nullableText,
  status: z.nativeEnum(JobRequisitionStatus),
  submittedOn: nullableDateTime,
  reviewedByEmployeeId: nullableId,
  reviewedOn: nullableDateTime,
  decisionReason: nullableText,
  createdOn: dateTime,
}).passthrough();

export const approvedStaffingRequestOptionSchema: z.ZodType<ApprovedStaffingRequestOptionDto> = z.object({
  id,
  envelopeCode: nonEmptyText,
  positionId: id,
  branchId: nullableId,
  departmentId: id,
  divisionId: id,
  remainingAllocatable: count,
  remainingToHire: count,
  estimatedFiscalYearCostPerSlot: amount,
  currencyCode: nonEmptyText,
  targetStartDate: dateOnly,
}).passthrough();

export const recruitmentStageConfigSchema: z.ZodType<RecruitmentStageConfig> = z.object({
  id: nonEmptyText,
  nameAr: text,
  nameEn: text,
  sequence: count,
  color: nonEmptyText,
  foldedInKanban: z.boolean(),
  isDefault: z.boolean(),
  sendEmailNotification: z.boolean(),
  mappedStatus: id,
  emailTemplate: nullableText,
}).passthrough();

export const rejectionReasonConfigSchema: z.ZodType<RejectionReasonConfig> = z.object({
  id: nonEmptyText,
  reasonAr: nonEmptyText,
  reasonEn: nonEmptyText,
  category: nonEmptyText,
  sendAutoEmail: z.boolean(),
  emailSubjectAr: nullableText,
  emailSubjectEn: nullableText,
  emailBodyAr: nullableText,
  emailBodyEn: nullableText,
}).passthrough();

export const recruitmentSourceConfigSchema: z.ZodType<RecruitmentSourceConfig> = z.object({
  id: nonEmptyText,
  nameAr: text,
  nameEn: text,
  type: nonEmptyText,
  isActive: z.boolean(),
  applicationsCount: count,
  hiredCount: count,
}).passthrough();

export const evaluationCriterionConfigSchema: z.ZodType<EvaluationCriterionConfig> = z.object({
  id: nonEmptyText,
  titleAr: nonEmptyText,
  titleEn: nonEmptyText,
  category: nonEmptyText,
  maxScore: amount,
  weight: amount,
  isMandatory: z.boolean(),
  descriptionAr: nullableText,
  descriptionEn: nullableText,
}).passthrough();

export const recruitmentGeneralSettingsSchema: z.ZodType<RecruitmentGeneralSettings> = z.object({
  defaultCurrency: nonEmptyText,
  offerExpiryDays: count,
  autoPublishOpening: z.boolean(),
  enforceHeadcountCapacity: z.boolean(),
  defaultProbationMonths: count,
  enablePublicPortal: z.boolean(),
  inboundEmailAlias: text,
}).passthrough();

export const recruitmentSettingsSchema: z.ZodType<RecruitmentSettingsDto> = z.object({
  stages: z.array(recruitmentStageConfigSchema),
  rejectionReasons: z.array(rejectionReasonConfigSchema),
  sources: z.array(recruitmentSourceConfigSchema),
  evaluationCriteria: z.array(evaluationCriterionConfigSchema),
  general: recruitmentGeneralSettingsSchema,
}).passthrough();

export const recruitmentPageMetadataSchema: z.ZodType<RecruitmentPageMetadata> = z.object({
  currentPage: count,
  totalPages: count,
  pageSize: count,
  pageNumber: count,
  totalCount: count,
  hasPrev: z.boolean(),
  hasNext: z.boolean(),
}).passthrough();

export function recruitmentPageSchema<T>(itemSchema: z.ZodType<T>): z.ZodType<RecruitmentPage<T>> {
  return z.object({
    items: z.array(itemSchema),
    metaData: recruitmentPageMetadataSchema,
  }).passthrough();
}
