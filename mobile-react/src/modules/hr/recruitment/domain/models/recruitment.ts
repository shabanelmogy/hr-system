export enum RequisitionType {
  NewPosition = 1,
  Replacement = 2,
}

export enum JobRequisitionStatus {
  Draft = 1,
  PendingApproval = 2,
  Approved = 3,
  Rejected = 4,
  Cancelled = 5,
  Fulfilled = 6,
}

export enum JobOpeningStatus {
  Draft = 1,
  Open = 2,
  Paused = 3,
  Filled = 4,
  Closed = 5,
  Cancelled = 6,
}

export enum ApplicationStatus {
  Draft = 1,
  Submitted = 2,
  UnderReview = 3,
  Shortlisted = 4,
  InterviewScheduled = 5,
  Interviewed = 6,
  OfferIssued = 7,
  OfferAccepted = 8,
  OfferDeclined = 9,
  Rejected = 10,
  Withdrawn = 11,
  Hired = 12,
}

export enum ApplicationStage {
  Applied = 1,
  Shortlisted = 2,
  Interview = 3,
  Offer = 4,
  Hired = 5,
  Rejected = 6,
  Withdrawn = 7,
}

export enum InterviewType {
  Phone = 1,
  Video = 2,
  OnSite = 3,
  HumanResources = 4,
  Technical = 5,
  Panel = 6,
}

export enum InterviewStatus {
  Scheduled = 1,
  Completed = 2,
  Cancelled = 3,
  NoShow = 4,
}

export enum InterviewEvaluationRecommendation {
  StrongHire = 1,
  Hire = 2,
  Hold = 3,
  NoHire = 4,
  StrongNoHire = 5,
}

export enum JobOfferStatus {Draft = 1,Issued = 2,Accepted = 3,Declined = 4,Withdrawn = 5,Expired = 6,PendingApproval = 7,Approved = 8,}

export enum EmploymentType {
  FullTime = 1,
  PartTime = 2,
  Temporary = 3,
  Contract = 4,
  Internship = 5,
}

export enum WorkArrangement {
  OnSite = 1,
  Remote = 2,
  Hybrid = 3,
}

export enum ApplicationSource {
  CareersPortal = 1,
  Internal = 2,
  EmployeeReferral = 3,
  RecruitmentAgency = 4,
  Manual = 5,
  Other = 6,
}

export enum PayFrequency {
  Hourly = 1,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
  Annual = 5,
}

export interface JobOpeningDto {
  id: number;
  publicId: string;
  openingNumber: string;
  jobRequisitionId: number;
  positionId: number;
  positionTitleAr: string;
  positionTitleEn: string;
  branchId: number;
  branchNameAr: string;
  branchNameEn: string;
  departmentId: number;
  departmentNameAr: string;
  departmentNameEn: string;
  divisionId: number | null;
  divisionNameEn: string | null;
  divisionNameAr: string | null;
  positionCount: number;
  hiredCount: number;
  availablePositions: number;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  status: JobOpeningStatus;
  openedOn: string | null;
  closedOn: string | null;
  closureReason: string | null;
  createdOn: string;
  activeApplicationsCount: number;
  jobDescriptionId: number | null;
  skills: JobSkillDto[];
}

export interface CandidateDto {
  id: number;
  publicId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  nationalityCountryId: number | null;
  nationalityCountryNameEn: string | null;
  nationalityCountryNameAr: string | null;
  currentCountryId: number | null;
  currentStateId: number | null;
  city: string | null;
  linkedInUrl: string | null;
  portfolioUrl: string | null;
  resumeFileId: number | null;
  isActive: boolean;
  createdOn: string;
}

export interface JobSkillDto {
  skillName: string;
  proficiencyLevel: string;
  isMandatory: boolean;
  defaultWeightPercentage: number;
}

export interface InterviewSkillEvaluationDto {
  skillName: string;
  score: number;
  weightPercentage: number | null;
  isMandatory: boolean;
  notes: string | null;
}

export interface InterviewScorecardTemplateDto {
  interviewId: number;
  employmentApplicationId: number;
  candidateName: string;
  positionTitleEn: string;
  positionTitleAr: string;
  jobDescriptionId: number | null;
  skills: JobSkillDto[];
}

export interface SubmitInterviewEvaluationMutation {
  score: number;
  recommendation: InterviewEvaluationRecommendation;
  comments?: string;
  skillEvaluations?: InterviewSkillEvaluationDto[];
}

export interface InterviewEvaluationDto {
  id: number;
  interviewerEmployeeId: number;
  interviewerName: string;
  score: number;
  recommendation: InterviewEvaluationRecommendation;
  comments: string | null;
  submittedOn: string;
  skillEvaluationsJson: string | null;
  skillEvaluations: InterviewSkillEvaluationDto[];
}

export interface InterviewParticipantDto {
  id: number;
  employeeId: number;
  employeeName: string;
  isLead: boolean;
}

export interface InterviewDto {
  id: number;
  employmentApplicationId: number;
  candidateName: string;
  openingNumber: string;
  positionTitleEn: string;
  positionTitleAr: string;
  type: InterviewType;
  status: InterviewStatus;
  startsOn: string;
  endsOn: string;
  completedOn: string | null;
  locationOrMeetingUrl: string | null;
  cancellationReason: string | null;
  participants: InterviewParticipantDto[];
  evaluations: InterviewEvaluationDto[];
}

export interface JobOfferDto {
  id: number;
  publicId: string;
  offerNumber: string;
  employmentApplicationId: number;
  candidateName: string;
  positionId: number;
  positionTitleAr: string;
  positionTitleEn: string;
  branchId: number;
  branchNameAr: string;
  branchNameEn: string;
  departmentId: number;
  departmentNameAr: string;
  departmentNameEn: string;
  divisionId: number | null;
  baseSalary: number;
  currencyCode: string;
  payFrequency: PayFrequency;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  proposedStartDate: string;
  termsAndConditions: string | null;
  status: JobOfferStatus;
  issuedOn: string | null;
  expiresOn: string | null;
  respondedOn: string | null;
  responseReason: string | null;
  annualSalarySnapshot: number;
  fiscalYearCostSnapshot: number;
  reservationDelta: number;
  calculationPolicyVersion: string | null;
  approvalSubmittedOn: string | null;
  approvalSubmittedById: string | null;
  approvedOn: string | null;
  approvedById: string | null;
  approvalDecisionReason: string | null;
  approvalHistory: JobOfferApprovalHistoryDto[];
  createdOn: string;
}

export interface JobOfferApprovalHistoryDto {
  id: number;
  action: string;
  actorUserId: string;
  occurredOn: string;
  fromStatus: JobOfferStatus;
  toStatus: JobOfferStatus;
  reason: string | null;
}

export interface ApplicationStatusHistoryDto {
  id: number;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  changedOn: string;
  reason: string | null;
  changedByEmployeeId: number | null;
}

export interface EmploymentApplicationDto {
  id: number;
  publicId: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string | null;
  jobOpeningId: number;
  openingNumber: string;
  positionTitleAr: string;
  positionTitleEn: string;
  departmentNameEn: string;
  departmentNameAr: string;
  branchNameAr: string;
  branchNameEn: string;
  jobPostingId: number | null;
  source: ApplicationSource;
  status: ApplicationStatus;
  coverLetter: string | null;
  resumeFileId: number | null;
  expectedSalary: number | null;
  expectedSalaryCurrencyCode: string | null;
  availableFrom: string | null;
  submittedOn: string | null;
  lastStatusChangedOn: string;
  employeeId: number | null;
  interviewsCount: number;
  averageEvaluationScore: number | null;
  statusHistory: ApplicationStatusHistoryDto[];
}

export interface RecruitmentSummaryDto {
  totalOpenings: number;
  totalActiveCandidates: number;
  totalScheduledInterviews: number;
  totalPendingOffers: number;
  totalHiredCount: number;
  stageCounts: Record<string, number>;
}

export interface PositionHeadcountSummaryDto {
  positionId: number;
  positionCode: string;
  jobTitleEn: string;
  jobTitleAr: string;
  targetHeadcount: number;
  activeHeadcount: number;
  pendingRequisitionsCount: number;
  availableHeadcount: number;
  exceedsHeadcount: boolean;
}

export interface JobRequisitionDto {
  id: number;
  requisitionNumber: string;
  positionId: number;
  positionTitleEn: string;
  positionTitleAr: string;
  branchId: number;
  branchNameEn: string;
  branchNameAr: string;
  departmentId: number;
  departmentNameEn: string;
  departmentNameAr: string;
  divisionId: number | null;
  divisionNameEn: string | null;
  divisionNameAr: string | null;
  requestedByEmployeeId: number;
  requestedPositions: number;
  staffingRequestId: number | null;
  planningSource: PlanningSource;
  hiredPositions: number;
  remainingPositions: number;
  businessReason: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  targetHireDate: string | null;
  type: RequisitionType;
  replacementEmployeeId: number | null;
  replacementEmployeeName: string | null;
  isBudgeted: boolean;
  budgetJustification: string | null;
  status: JobRequisitionStatus;
  submittedOn: string | null;
  reviewedByEmployeeId: number | null;
  reviewedOn: string | null;
  decisionReason: string | null;
  createdOn: string;
}

export interface JobRequisitionMutation {
  positionId?: number;
  branchId?: number;
  departmentId?: number;
  divisionId?: number | null;
  requestedPositions: number;
  businessReason: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  targetHireDate?: string | null;
  type?: RequisitionType;
  replacementEmployeeId?: number | null;
  isBudgeted?: boolean;
  budgetJustification?: string | null;
  staffingRequestId?: number | null;
}

export enum PlanningSource {
  Planned = 1,
  Legacy = 2,
}

export interface ApprovedStaffingRequestOptionDto {
  id: number;
  envelopeCode: string;
  positionId: number;
  branchId: number | null;
  departmentId: number;
  divisionId: number;
  remainingAllocatable: number;
  remainingToHire: number;
  estimatedFiscalYearCostPerSlot: number;
  currencyCode: string;
  targetStartDate: string;
}

export interface RecruitmentStageConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  sequence: number;
  color: string;
  foldedInKanban: boolean;
  isDefault: boolean;
  sendEmailNotification: boolean;
  mappedStatus: number;
  emailTemplate: string | null;
}

export interface RejectionReasonConfig {
  id: string;
  reasonAr: string;
  reasonEn: string;
  category: string;
  sendAutoEmail: boolean;
  emailSubjectAr: string | null;
  emailSubjectEn: string | null;
  emailBodyAr: string | null;
  emailBodyEn: string | null;
}

export interface RecruitmentSourceConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  type: string;
  isActive: boolean;
  applicationsCount: number;
  hiredCount: number;
}

export interface EvaluationCriterionConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  category: string;
  maxScore: number;
  weight: number;
  isMandatory: boolean;
  descriptionAr: string | null;
  descriptionEn: string | null;
}

export interface RecruitmentGeneralSettings {
  defaultCurrency: string;
  offerExpiryDays: number;
  autoPublishOpening: boolean;
  enforceHeadcountCapacity: boolean;
  defaultProbationMonths: number;
  enablePublicPortal: boolean;
  inboundEmailAlias: string;
}

export interface RecruitmentSettingsDto {
  stages: RecruitmentStageConfig[];
  rejectionReasons: RejectionReasonConfig[];
  sources: RecruitmentSourceConfig[];
  evaluationCriteria: EvaluationCriterionConfig[];
  general: RecruitmentGeneralSettings;
}

export interface RecruitmentPageMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
  totalCount: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface RecruitmentPage<T> {
  items: T[];
  metaData: RecruitmentPageMetadata;
}

export interface JobOpeningQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: JobOpeningStatus;
}

export interface JobOfferQuery {
  pageNumber?: number;
  pageSize?: number;
  applicationId?: number;
  status?: JobOfferStatus;
}

export interface InterviewQuery {
  pageNumber?: number;
  pageSize?: number;
  applicationId?: number;
  status?: InterviewStatus;
}

export interface ApplicationQuery {
  pageNumber?: number;
  pageSize?: number;
  jobOpeningId?: number;
  status?: ApplicationStatus;
  search?: string;
}

export interface JobRequisitionQuery {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: JobRequisitionStatus;
}

export interface ChangeApplicationStageMutation {
  targetStatus: ApplicationStatus;
  reason?: string;
}

export interface CreateCandidateMutation {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface SubmitApplicationMutation {
  candidateId: number;
  jobOpeningId: number;
  source: ApplicationSource;
  jobPostingId?: number;
  expectedSalary?: number;
  expectedSalaryCurrencyCode?: string;
  availableFrom?: string;
  coverLetter?: string;
  resumeFileId?: number;
}

export interface ScheduleInterviewMutation {
  employmentApplicationId: number;
  type: InterviewType;
  startsOn: string;
  endsOn: string;
  locationOrMeetingUrl?: string;
  leadEmployeeId?: number;
  participantEmployeeIds?: number[];
}

export interface CreateJobOfferMutation {
  employmentApplicationId: number;
  baseSalary: number;
  currencyCode: string;
  payFrequency: PayFrequency;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  proposedStartDate: string;
  termsAndConditions?: string;
  expiresOn?: string;
}

/** Server-owned deduplication key for retries of one intentional hire request. */
export interface HireCandidateMutation {
  employeeNumber: string;
  hireDate: string;
  idempotencyKey?: string;
}
