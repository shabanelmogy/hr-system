import type {
  ApprovedStaffingRequestOptionDto,
  ApplicationQuery,
  CandidateDto,
  ChangeApplicationStageMutation,
  CreateCandidateMutation,
  CreateJobOfferMutation,
  EmploymentApplicationDto,
  HireCandidateMutation,
  InterviewDto,
  InterviewScorecardTemplateDto,
  JobOfferDto,
  JobOfferQuery,
  JobOpeningDto,
  JobOpeningQuery,
  JobRequisitionDto,
  JobRequisitionMutation,
  JobRequisitionQuery,
  PositionHeadcountSummaryDto,
  RecruitmentPage,
  RecruitmentSettingsDto,
  RecruitmentSummaryDto,
  ScheduleInterviewMutation,
  SubmitApplicationMutation,
  SubmitInterviewEvaluationMutation,
} from '../models/recruitment';

export interface RecruitmentRepository {
  getSummary(): Promise<RecruitmentSummaryDto>;
  getOpenings(params?: JobOpeningQuery): Promise<RecruitmentPage<JobOpeningDto>>;
  getOpeningById(id: number): Promise<JobOpeningDto>;
  openOpening(id: number): Promise<JobOpeningDto>;
  pauseOpening(id: number, reason?: string): Promise<JobOpeningDto>;
  closeOpening(id: number, reason?: string): Promise<JobOpeningDto>;

  getApplications(params?: ApplicationQuery): Promise<RecruitmentPage<EmploymentApplicationDto>>;
  getApplicationById(id: number): Promise<EmploymentApplicationDto>;
  changeStage(id: number, request: ChangeApplicationStageMutation): Promise<EmploymentApplicationDto>;
  createCandidate(request: CreateCandidateMutation): Promise<CandidateDto>;
  submitApplication(request: SubmitApplicationMutation): Promise<EmploymentApplicationDto>;
  hireCandidate(id: number, request: HireCandidateMutation): Promise<void>;

  scheduleInterview(request: ScheduleInterviewMutation): Promise<InterviewDto>;
  completeInterview(id: number): Promise<InterviewDto>;
  evaluateInterview(id: number, request: SubmitInterviewEvaluationMutation): Promise<InterviewDto>;
  getScorecardTemplate(interviewId: number): Promise<InterviewScorecardTemplateDto>;

  getOffers(params?: JobOfferQuery): Promise<RecruitmentPage<JobOfferDto>>;
  createOffer(request: CreateJobOfferMutation): Promise<JobOfferDto>;
  issueOffer(id: number): Promise<JobOfferDto>;
  submitOffer(id: number): Promise<JobOfferDto>;
  approveOffer(id: number): Promise<JobOfferDto>;
  rejectOffer(id: number, reason: string): Promise<JobOfferDto>;

  getRequisitions(params?: JobRequisitionQuery): Promise<RecruitmentPage<JobRequisitionDto>>;
  getRequisitionById(id: number): Promise<JobRequisitionDto>;
  getPositionHeadcountSummary(positionId: number): Promise<PositionHeadcountSummaryDto>;
  getApprovedStaffingRequestOptions(): Promise<ApprovedStaffingRequestOptionDto[]>;
  createRequisition(request: JobRequisitionMutation): Promise<JobRequisitionDto>;
  submitRequisition(id: number): Promise<JobRequisitionDto>;
  approveRequisition(id: number): Promise<JobRequisitionDto>;
  rejectRequisition(id: number, reason: string): Promise<JobRequisitionDto>;
  cancelRequisition(id: number, reason: string): Promise<JobRequisitionDto>;

  getSettings(): Promise<RecruitmentSettingsDto>;
  updateSettings(settings: RecruitmentSettingsDto): Promise<RecruitmentSettingsDto>;
}
