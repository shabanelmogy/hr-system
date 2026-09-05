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

export enum JobOfferStatus {
  Draft = 1,
  Issued = 2,
  Accepted = 3,
  Declined = 4,
  Withdrawn = 5,
  Expired = 6,
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

export enum PayFrequency {
  Hourly = 1,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
  Annual = 5,
}

export interface JobOpeningDto {
  id: number;
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
  divisionId?: number;
  positionCount: number;
  hiredCount: number;
  activeApplicationsCount: number;
  status: JobOpeningStatus;
  openedOn?: string;
  closedOn?: string;
  targetDate?: string;
  createdOn: string;
}

export interface CandidateDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  highestDegree?: string;
  yearsOfExperience?: number;
  currentCompany?: string;
  currentJobTitle?: string;
  createdOn: string;
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

export interface SubmitInterviewEvaluationMutation {
  score: number;
  recommendation: InterviewEvaluationRecommendation;
  comments?: string;
  skillEvaluations?: InterviewSkillEvaluationDto[];
}

export interface InterviewEvaluationDto {
  id: number;
  interviewId?: number;
  interviewerEmployeeId?: number;
  interviewerName?: string;
  evaluatorEmployeeId?: number;
  evaluatorName?: string;
  score?: number;
  overallScore?: number;
  technicalScore?: number;
  culturalFitScore?: number;
  communicationScore?: number;
  recommendation: InterviewEvaluationRecommendation;
  comments?: string;
  notes?: string;
  strengthsSummary?: string;
  weaknessesSummary?: string;
  submittedOn?: string;
  evaluatedOn?: string;
  skillEvaluations?: InterviewSkillEvaluationDto[];
}

export interface InterviewDto {
  id: number;
  interviewNumber: string;
  employmentApplicationId: number;
  type: InterviewType;
  status: InterviewStatus;
  startsOn: string;
  endsOn: string;
  locationOrMeetingUrl?: string;
  leadEmployeeId: number;
  leadEmployeeName: string;
  scheduledOn: string;
  completedOn?: string;
  evaluations: InterviewEvaluationDto[];
}

export interface JobOfferDto {
  id: number;
  offerNumber: string;
  employmentApplicationId: number;
  positionId: number;
  positionTitleAr: string;
  positionTitleEn: string;
  branchId: number;
  departmentId: number;
  status: JobOfferStatus;
  baseSalary: number;
  currencyCode: string;
  payFrequency: number;
  employmentType: number;
  workArrangement: number;
  proposedStartDate: string;
  expiryDate?: string;
  termsAndConditions?: string;
  issuedOn?: string;
  createdOn: string;
}

export interface ApplicationTimelineDto {
  id: number;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  changedOn: string;
  changedByUserId?: string;
  reason?: string;
  notes?: string;
}

export interface EmploymentApplicationDto {
  id: number;
  applicationNumber: string;
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  jobOpeningId: number;
  openingNumber: string;
  positionTitleAr: string;
  positionTitleEn: string;
  branchNameAr: string;
  branchNameEn: string;
  source: ApplicationSource;
  status: ApplicationStatus;
  stage: ApplicationStage;
  expectedSalary?: number;
  expectedSalaryCurrencyCode?: string;
  availableFrom?: string;
  coverLetter?: string;
  resumeFileId?: string;
  appliedOn: string;
  interviewsCount: number;
  averageEvaluationScore?: number;
  activeOfferId?: number;
  timeline: ApplicationTimelineDto[];
  interviews: InterviewDto[];
  offers: JobOfferDto[];
}

export interface RecruitmentSummaryDto {
  totalOpenings: number;
  openJobOpeningsCount: number;
  totalActiveCandidates: number;
  scheduledInterviewsCount: number;
  pendingOffersCount: number;
  totalHiredCount: number;
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

export interface RecruitmentStageConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  sequence: number;
  color: string;
  foldedInKanban: boolean;
  isDefault: boolean;
  sendEmailNotification: boolean;
}

export interface RejectionReasonConfig {
  id: string;
  reasonAr: string;
  reasonEn: string;
  category: string;
  sendAutoEmail: boolean;
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
}

export interface RecruitmentGeneralSettings {
  defaultCurrency: string;
  offerExpiryDays: number;
  autoPublishOpening: boolean;
  enforceHeadcountCapacity: boolean;
  defaultProbationMonths: number;
  enablePublicPortal: boolean;
  inboundEmailAlias?: string;
}

export interface RecruitmentSettingsDto {
  stages: RecruitmentStageConfig[];
  rejectionReasons: RejectionReasonConfig[];
  sources: RecruitmentSourceConfig[];
  evaluationCriteria: EvaluationCriterionConfig[];
  general: RecruitmentGeneralSettings;
}
