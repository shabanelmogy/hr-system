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

export enum JobPostingStatus {
  Draft = 1,
  Scheduled = 2,
  Published = 3,
  Closed = 4,
  Archived = 5,
}

export enum JobPostingAudience {
  Internal = 1,
  External = 2,
  InternalAndExternal = 3,
}

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

export enum InterviewRecommendation {
  StrongHire = 1,
  Hire = 2,
  Hold = 3,
  NoHire = 4,
  StrongNoHire = 5,
}

export enum JobOfferStatus {
  Draft = 1,
  Issued = 2,
  Accepted = 3,
  Declined = 4,
  Withdrawn = 5,
  Expired = 6,
}

export enum PayFrequency {
  Hourly = 1,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
  Annual = 5,
}

// --- DTOs ---

export interface CandidateDto {
  id: number;
  publicId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationalityCountryId?: number;
  nationalityCountryNameEn?: string;
  nationalityCountryNameAr?: string;
  currentCountryId?: number;
  currentStateId?: number;
  city?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  resumeFileId?: number;
  isActive: boolean;
  createdOn: string;
}

export interface CandidateMutation {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  nationalityCountryId?: number;
  currentCountryId?: number;
  currentStateId?: number;
  city?: string;
  linkedInUrl?: string;
  portfolioUrl?: string;
  resumeFileId?: number;
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
  divisionId?: number;
  divisionNameEn?: string;
  divisionNameAr?: string;
  requestedByEmployeeId: number;
  requestedPositions: number;
  businessReason: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  targetHireDate?: string;
  type: RequisitionType;
  replacementEmployeeId?: number | null;
  replacementEmployeeName?: string | null;
  isBudgeted: boolean;
  budgetJustification?: string | null;
  status: JobRequisitionStatus;
  submittedOn?: string;
  reviewedByEmployeeId?: number;
  reviewedOn?: string;
  decisionReason?: string;
  createdOn: string;
}

export interface JobRequisitionMutation {
  positionId: number;
  branchId: number;
  departmentId: number;
  divisionId?: number;
  requestedPositions: number;
  businessReason: string;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  targetHireDate?: string;
  type?: RequisitionType;
  replacementEmployeeId?: number | null;
  isBudgeted?: boolean;
  budgetJustification?: string | null;
}

export interface JobOpeningDto {
  id: number;
  publicId: string;
  openingNumber: string;
  jobRequisitionId: number;
  positionId: number;
  positionTitleEn: string;
  positionTitleAr: string;
  branchId: number;
  branchNameEn: string;
  branchNameAr: string;
  departmentId: number;
  departmentNameEn: string;
  departmentNameAr: string;
  divisionId?: number;
  divisionNameEn?: string;
  divisionNameAr?: string;
  positionCount: number;
  hiredCount: number;
  availablePositions: number;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  status: JobOpeningStatus;
  openedOn?: string;
  closedOn?: string;
  closureReason?: string;
  createdOn: string;
  activeApplicationsCount: number;
  jobDescriptionId?: number;
  skills?: JobSkillDto[];
}

export interface JobOpeningMutation {
  jobRequisitionId: number;
  positionId: number;
  branchId: number;
  departmentId: number;
  divisionId?: number;
  positionCount: number;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
}

export interface JobPostingDto {
  id: number;
  publicId: string;
  jobOpeningId: number;
  openingNumber: string;
  positionTitleEn: string;
  positionTitleAr: string;
  slug: string;
  audience: JobPostingAudience;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  responsibilitiesEn?: string;
  responsibilitiesAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  locationTextEn?: string;
  locationTextAr?: string;
  status: JobPostingStatus;
  scheduledPublishOn?: string;
  publishedOn?: string;
  closesOn?: string;
  closedOn?: string;
  createdOn: string;
}

export interface JobPostingMutation {
  jobOpeningId: number;
  slug: string;
  audience: JobPostingAudience;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  responsibilitiesEn?: string;
  responsibilitiesAr?: string;
  requirementsEn?: string;
  requirementsAr?: string;
  locationTextEn?: string;
  locationTextAr?: string;
  scheduledPublishOn?: string;
  closesOn?: string;
}

export interface ApplicationStatusHistoryDto {
  id: number;
  fromStatus?: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedOn: string;
  reason?: string;
  changedByEmployeeId?: number;
}

export interface EmploymentApplicationDto {
  id: number;
  publicId: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobOpeningId: number;
  openingNumber: string;
  positionTitleEn: string;
  positionTitleAr: string;
  departmentNameEn: string;
  departmentNameAr: string;
  branchNameEn: string;
  branchNameAr: string;
  jobPostingId?: number;
  source: ApplicationSource;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeFileId?: number;
  expectedSalary?: number;
  expectedSalaryCurrencyCode?: string;
  availableFrom?: string;
  submittedOn?: string;
  lastStatusChangedOn: string;
  employeeId?: number;
  interviewsCount: number;
  averageEvaluationScore?: number;
  statusHistory: ApplicationStatusHistoryDto[];
}

export interface SubmitApplicationMutation {
  candidateId: number;
  jobOpeningId: number;
  source: ApplicationSource;
  jobPostingId?: number;
  coverLetter?: string;
  resumeFileId?: number;
  expectedSalary?: number;
  expectedSalaryCurrencyCode?: string;
  availableFrom?: string;
}

export interface InterviewParticipantDto {
  id: number;
  employeeId: number;
  employeeName: string;
  isLead: boolean;
}

export interface JobSkillDto {
  skillName: string;
  proficiencyLevel: string;
  isMandatory: boolean;
  defaultWeightPercentage?: number;
}

export interface InterviewSkillEvaluationDto {
  skillName: string;
  score: number;
  weightPercentage?: number;
  isMandatory: boolean;
  notes?: string;
}

export interface InterviewScorecardTemplateDto {
  interviewId: number;
  employmentApplicationId: number;
  candidateName: string;
  positionTitleEn: string;
  positionTitleAr: string;
  jobDescriptionId?: number;
  skills: JobSkillDto[];
}

export interface InterviewEvaluationDto {
  id: number;
  interviewerEmployeeId: number;
  interviewerName: string;
  score: number;
  recommendation: InterviewRecommendation;
  comments?: string;
  submittedOn: string;
  skillEvaluationsJson?: string;
  skillEvaluations?: InterviewSkillEvaluationDto[];
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
  completedOn?: string;
  locationOrMeetingUrl?: string;
  cancellationReason?: string;
  participants: InterviewParticipantDto[];
  evaluations: InterviewEvaluationDto[];
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

export interface SubmitInterviewEvaluationMutation {
  score: number;
  recommendation: InterviewRecommendation;
  comments?: string;
  skillEvaluations?: InterviewSkillEvaluationDto[];
}

export interface JobOfferDto {
  id: number;
  publicId: string;
  offerNumber: string;
  employmentApplicationId: number;
  candidateName: string;
  positionId: number;
  positionTitleEn: string;
  positionTitleAr: string;
  branchId: number;
  branchNameEn: string;
  branchNameAr: string;
  departmentId: number;
  departmentNameEn: string;
  departmentNameAr: string;
  divisionId?: number;
  baseSalary: number;
  currencyCode: string;
  payFrequency: PayFrequency;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  proposedStartDate: string;
  termsAndConditions?: string;
  status: JobOfferStatus;
  issuedOn?: string;
  expiresOn?: string;
  respondedOn?: string;
  responseReason?: string;
  createdOn: string;
}

export interface JobOfferMutation {
  employmentApplicationId: number;
  positionId: number;
  branchId: number;
  departmentId: number;
  divisionId?: number;
  baseSalary: number;
  currencyCode: string;
  payFrequency: PayFrequency;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  proposedStartDate: string;
  termsAndConditions?: string;
  expiresOn?: string;
}

export interface RecruitmentDashboardSummaryDto {
  totalOpenings: number;
  totalActiveCandidates: number;
  totalScheduledInterviews: number;
  totalPendingOffers: number;
  totalHiredCount: number;
  stageCounts: Record<string, number>;
}

export interface HireCandidateMutation {
  employeeNumber: string;
  hireDate: string;
}

export * from "./recruitmentSettingsTypes";
