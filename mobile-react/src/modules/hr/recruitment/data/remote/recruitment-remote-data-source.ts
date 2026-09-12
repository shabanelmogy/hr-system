import { apiService } from '@/src/core/api';
import { recruitmentEndpoints } from './recruitment-endpoints';
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
} from '../../domain/models/recruitment';
import { ApplicationStatus } from '../../domain/models/recruitment';
import type { RecruitmentRepository } from '../../domain/repositories/recruitment-repository';

export type RecruitmentRemoteDataSource = RecruitmentRepository;

export const recruitmentRemoteDataSource: RecruitmentRemoteDataSource = {
  async getSummary(): Promise<RecruitmentSummaryDto> {
    return apiService.get<RecruitmentSummaryDto>(recruitmentEndpoints.dashboard.summary);
  },

  async getOpenings(params?: JobOpeningQuery): Promise<RecruitmentPage<JobOpeningDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.status !== undefined) query.set('status', String(params.status));

    const qs = query.toString();
    return apiService.get<RecruitmentPage<JobOpeningDto>>(
      `${recruitmentEndpoints.openings.base}${qs ? `?${qs}` : ''}`
    );
  },

  async getOpeningById(id: number): Promise<JobOpeningDto> {
    return apiService.get<JobOpeningDto>(recruitmentEndpoints.openings.byId(id));
  },

  async getOffers(params?: JobOfferQuery): Promise<RecruitmentPage<JobOfferDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.applicationId) query.set('applicationId', String(params.applicationId));
    if (params?.status !== undefined) query.set('status', String(params.status));
    const qs = query.toString();
    return apiService.get<RecruitmentPage<JobOfferDto>>(`${recruitmentEndpoints.offers.base}${qs ? `?${qs}` : ''}`);
  },

  async openOpening(id: number): Promise<JobOpeningDto> {
    return apiService.post<JobOpeningDto, undefined>(recruitmentEndpoints.openings.open(id), undefined);
  },

  async pauseOpening(id: number, reason: string = 'إيقاف مؤقت للشاغر'): Promise<JobOpeningDto> {
    return apiService.post<JobOpeningDto, { reason: string }>(recruitmentEndpoints.openings.pause(id), { reason });
  },

  async closeOpening(id: number, reason: string = 'إغلاق الشاغر'): Promise<JobOpeningDto> {
    return apiService.post<JobOpeningDto, { reason: string }>(recruitmentEndpoints.openings.close(id), { reason });
  },

  async getApplications(params?: ApplicationQuery): Promise<RecruitmentPage<EmploymentApplicationDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.jobOpeningId) query.set('jobOpeningId', String(params.jobOpeningId));
    if (params?.status !== undefined) query.set('status', String(params.status));
    if (params?.stage !== undefined) query.set('stage', String(params.stage));
    if (params?.search?.trim()) query.set('search', params.search.trim());

    const qs = query.toString();
    return apiService.get<RecruitmentPage<EmploymentApplicationDto>>(
      `${recruitmentEndpoints.applications.base}${qs ? `?${qs}` : ''}`
    );
  },

  async getApplicationById(id: number): Promise<EmploymentApplicationDto> {
    return apiService.get<EmploymentApplicationDto>(recruitmentEndpoints.applications.byId(id));
  },

  async changeStage(
    id: number,
    request: ChangeApplicationStageMutation
  ): Promise<EmploymentApplicationDto> {
    const targetStatus = request.targetStatus ?? ((request.stage as number) || ApplicationStatus.UnderReview);
    return apiService.post<EmploymentApplicationDto, { targetStatus: number; reason?: string }>(
      recruitmentEndpoints.applications.moveStage(id),
      {
        targetStatus,
        reason: request.reason ?? request.notes,
      }
    );
  },

  async createCandidate(request: CreateCandidateMutation): Promise<CandidateDto> {
    return apiService.post<CandidateDto, typeof request>(
      recruitmentEndpoints.candidates.base,
      request
    );
  },

  async submitApplication(request: SubmitApplicationMutation): Promise<EmploymentApplicationDto> {
    return apiService.post<EmploymentApplicationDto, typeof request>(
      recruitmentEndpoints.applications.base,
      request
    );
  },

  async scheduleInterview(request: ScheduleInterviewMutation): Promise<InterviewDto> {
    return apiService.post<InterviewDto, typeof request>(
      recruitmentEndpoints.interviews.base,
      request
    );
  },

  async completeInterview(id: number): Promise<InterviewDto> {
    return apiService.post<InterviewDto, undefined>(
      recruitmentEndpoints.interviews.complete(id),
      undefined
    );
  },

  async evaluateInterview(
    id: number,
    request: SubmitInterviewEvaluationMutation
  ): Promise<InterviewDto> {
    return apiService.post<InterviewDto, typeof request>(
      recruitmentEndpoints.interviews.evaluations(id),
      request
    );
  },

  async getScorecardTemplate(interviewId: number): Promise<InterviewScorecardTemplateDto> {
    return apiService.get<InterviewScorecardTemplateDto>(
      recruitmentEndpoints.interviews.scorecardTemplate(interviewId)
    );
  },

  async createOffer(request: CreateJobOfferMutation): Promise<JobOfferDto> {
    return apiService.post<JobOfferDto, typeof request>(
      recruitmentEndpoints.offers.base,
      request
    );
  },

  async issueOffer(id: number): Promise<JobOfferDto> {
    return apiService.post<JobOfferDto, undefined>(
      recruitmentEndpoints.offers.issue(id),
      undefined
    );
  },

  async submitOffer(id: number): Promise<JobOfferDto> {
    return apiService.post<JobOfferDto, undefined>(
      recruitmentEndpoints.offers.submit(id),
      undefined
    );
  },

  async approveOffer(id: number): Promise<JobOfferDto> {
    return apiService.post<JobOfferDto, undefined>(
      recruitmentEndpoints.offers.approve(id),
      undefined
    );
  },

  async rejectOffer(id: number, reason: string): Promise<JobOfferDto> {
    return apiService.post<JobOfferDto, { reason: string }>(
      recruitmentEndpoints.offers.reject(id),
      { reason }
    );
  },

  async hireCandidate(
    id: number,
    request: HireCandidateMutation
  ): Promise<void> {
    return apiService.post<void, typeof request>(
      recruitmentEndpoints.applications.hire(id),
      request
    );
  },

  async getRequisitions(params?: JobRequisitionQuery): Promise<RecruitmentPage<JobRequisitionDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.status !== undefined) query.set('status', String(params.status));

    const qs = query.toString();
    return apiService.get<RecruitmentPage<JobRequisitionDto>>(
      `${recruitmentEndpoints.requisitions.base}${qs ? `?${qs}` : ''}`
    );
  },

  async getRequisitionById(id: number): Promise<JobRequisitionDto> {
    return apiService.get<JobRequisitionDto>(recruitmentEndpoints.requisitions.byId(id));
  },

  async getPositionHeadcountSummary(positionId: number): Promise<PositionHeadcountSummaryDto> {
    return apiService.get<PositionHeadcountSummaryDto>(
      recruitmentEndpoints.requisitions.headcountSummary(positionId)
    );
  },

  async getApprovedStaffingRequestOptions(): Promise<ApprovedStaffingRequestOptionDto[]> {
    return apiService.get<ApprovedStaffingRequestOptionDto[]>(
      recruitmentEndpoints.requisitions.staffingRequestOptions
    );
  },

  async createRequisition(request: JobRequisitionMutation): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, JobRequisitionMutation>(
      recruitmentEndpoints.requisitions.base,
      request
    );
  },

  async submitRequisition(id: number): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, undefined>(recruitmentEndpoints.requisitions.submit(id), undefined);
  },

  async approveRequisition(id: number): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, undefined>(
      recruitmentEndpoints.requisitions.approve(id),
      undefined
    );
  },

  async rejectRequisition(id: number, reason: string): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, { reason: string }>(
      recruitmentEndpoints.requisitions.reject(id),
      { reason }
    );
  },

  async cancelRequisition(id: number, reason: string): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, { reason: string }>(
      recruitmentEndpoints.requisitions.cancel(id), { reason }
    );
  },

  async getSettings(): Promise<RecruitmentSettingsDto> {
    return apiService.get<RecruitmentSettingsDto>(recruitmentEndpoints.settings.base);
  },

  async updateSettings(settings: RecruitmentSettingsDto): Promise<RecruitmentSettingsDto> {
    return apiService.put<RecruitmentSettingsDto, RecruitmentSettingsDto>(
      recruitmentEndpoints.settings.base,
      settings
    );
  },
};
