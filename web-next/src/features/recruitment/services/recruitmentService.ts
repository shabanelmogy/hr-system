import { apiRoutes } from "@/config";
import apiService from "@/shared/services/apiService";
import type {
  CandidateDto,
  CandidateMutation,
  JobRequisitionDto,
  JobRequisitionMutation,
  JobOpeningDto,
  JobOpeningMutation,
  JobPostingDto,
  JobPostingMutation,
  EmploymentApplicationDto,
  SubmitApplicationMutation,
  InterviewDto,
  InterviewScorecardTemplateDto,
  PositionHeadcountSummaryDto,
  ScheduleInterviewMutation,
  SubmitInterviewEvaluationMutation,
  JobOfferDto,
  JobOfferMutation,
  RecruitmentDashboardSummaryDto,
  HireCandidateMutation,
  ApplicationStatus,
} from "../types";

export interface PageResponse<T> {
  items: T[];
  metaData: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
}

export default class RecruitmentService {
  // Dashboard
  static async getDashboardSummary(): Promise<RecruitmentDashboardSummaryDto> {
    return await apiService.get<RecruitmentDashboardSummaryDto>(apiRoutes.recruitment.dashboard);
  }

  // Job Openings
  static async getJobOpenings(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: number;
    departmentId?: number;
  }): Promise<PageResponse<JobOpeningDto>> {
    return await apiService.get<PageResponse<JobOpeningDto>>(apiRoutes.recruitment.openings.page, params);
  }

  static async getJobOpeningById(id: number): Promise<JobOpeningDto> {
    return await apiService.get<JobOpeningDto>(apiRoutes.recruitment.openings.getById(id));
  }

  static async createJobOpening(data: JobOpeningMutation): Promise<JobOpeningDto> {
    return await apiService.post<JobOpeningDto>(apiRoutes.recruitment.openings.create, data);
  }

  static async openJobOpening(id: number): Promise<JobOpeningDto> {
    return await apiService.post<JobOpeningDto>(apiRoutes.recruitment.openings.open(id));
  }

  static async pauseJobOpening(id: number, reason: string): Promise<JobOpeningDto> {
    return await apiService.post<JobOpeningDto>(apiRoutes.recruitment.openings.pause(id), { reason });
  }

  static async closeJobOpening(id: number, reason: string): Promise<JobOpeningDto> {
    return await apiService.post<JobOpeningDto>(apiRoutes.recruitment.openings.close(id), { reason });
  }

  // Applications
  static async getApplications(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    jobOpeningId?: number;
    status?: number;
  }): Promise<PageResponse<EmploymentApplicationDto>> {
    return await apiService.get<PageResponse<EmploymentApplicationDto>>(apiRoutes.recruitment.applications.page, params);
  }

  static async getApplicationById(id: number): Promise<EmploymentApplicationDto> {
    return await apiService.get<EmploymentApplicationDto>(apiRoutes.recruitment.applications.getById(id));
  }

  static async submitApplication(data: SubmitApplicationMutation): Promise<EmploymentApplicationDto> {
    return await apiService.post<EmploymentApplicationDto>(apiRoutes.recruitment.applications.submit, data);
  }

  static async moveApplicationStage(id: number, targetStatus: ApplicationStatus, reason?: string): Promise<EmploymentApplicationDto> {
    return await apiService.post<EmploymentApplicationDto>(apiRoutes.recruitment.applications.moveStage(id), {
      targetStatus,
      reason,
    });
  }

  static async hireApplication(id: number, data: HireCandidateMutation): Promise<EmploymentApplicationDto> {
    return await apiService.post<EmploymentApplicationDto>(apiRoutes.recruitment.applications.hire(id), data);
  }

  static async rejectApplication(id: number, reason: string): Promise<EmploymentApplicationDto> {
    return await apiService.post<EmploymentApplicationDto>(apiRoutes.recruitment.applications.reject(id), { reason });
  }

  static async withdrawApplication(id: number, reason: string): Promise<EmploymentApplicationDto> {
    return await apiService.post<EmploymentApplicationDto>(apiRoutes.recruitment.applications.withdraw(id), { reason });
  }

  // Candidates
  static async getCandidates(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
  }): Promise<PageResponse<CandidateDto>> {
    return await apiService.get<PageResponse<CandidateDto>>(apiRoutes.recruitment.candidates.page, params);
  }

  static async getCandidateById(id: number): Promise<CandidateDto> {
    return await apiService.get<CandidateDto>(apiRoutes.recruitment.candidates.getById(id));
  }

  static async createCandidate(data: CandidateMutation): Promise<CandidateDto> {
    return await apiService.post<CandidateDto>(apiRoutes.recruitment.candidates.create, data);
  }

  static async updateCandidate(id: number, data: CandidateMutation): Promise<CandidateDto> {
    return await apiService.put<CandidateDto>(apiRoutes.recruitment.candidates.update(id), data);
  }

  // Interviews
  static async getInterviews(params?: {
    pageNumber?: number;
    pageSize?: number;
    applicationId?: number;
    status?: number;
  }): Promise<PageResponse<InterviewDto>> {
    return await apiService.get<PageResponse<InterviewDto>>(apiRoutes.recruitment.interviews.page, params);
  }

  static async scheduleInterview(data: ScheduleInterviewMutation): Promise<InterviewDto> {
    return await apiService.post<InterviewDto>(apiRoutes.recruitment.interviews.schedule, data);
  }

  static async completeInterview(id: number): Promise<InterviewDto> {
    return await apiService.post<InterviewDto>(apiRoutes.recruitment.interviews.complete(id));
  }

  static async cancelInterview(id: number, reason: string): Promise<InterviewDto> {
    return await apiService.post<InterviewDto>(apiRoutes.recruitment.interviews.cancel(id), { reason });
  }

  static async submitInterviewEvaluation(interviewId: number, data: SubmitInterviewEvaluationMutation): Promise<InterviewDto> {
    return await apiService.post<InterviewDto>(apiRoutes.recruitment.interviews.evaluations(interviewId), data);
  }

  static async getInterviewScorecardTemplate(interviewId: number): Promise<InterviewScorecardTemplateDto> {
    return await apiService.get<InterviewScorecardTemplateDto>(apiRoutes.recruitment.interviews.scorecardTemplate(interviewId));
  }

  // Job Offers
  static async getJobOffers(params?: {
    pageNumber?: number;
    pageSize?: number;
    applicationId?: number;
    status?: number;
  }): Promise<PageResponse<JobOfferDto>> {
    return await apiService.get<PageResponse<JobOfferDto>>(apiRoutes.recruitment.offers.page, params);
  }

  static async createJobOffer(data: JobOfferMutation): Promise<JobOfferDto> {
    return await apiService.post<JobOfferDto>(apiRoutes.recruitment.offers.create, data);
  }

  static async issueJobOffer(id: number): Promise<JobOfferDto> {
    return await apiService.post<JobOfferDto>(apiRoutes.recruitment.offers.issue(id));
  }

  static async acceptJobOffer(id: number): Promise<JobOfferDto> {
    return await apiService.post<JobOfferDto>(apiRoutes.recruitment.offers.accept(id));
  }

  static async declineJobOffer(id: number, reason: string): Promise<JobOfferDto> {
    return await apiService.post<JobOfferDto>(apiRoutes.recruitment.offers.decline(id), { reason });
  }

  // Job Requisitions
  static async getJobRequisitions(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: number;
  }): Promise<PageResponse<JobRequisitionDto>> {
    return await apiService.get<PageResponse<JobRequisitionDto>>(apiRoutes.recruitment.requisitions.page, params);
  }

  static async getPositionHeadcountSummary(positionId: number): Promise<PositionHeadcountSummaryDto> {
    return await apiService.get<PositionHeadcountSummaryDto>(
      apiRoutes.recruitment.requisitions.headcountSummary(positionId)
    );
  }

  static async createJobRequisition(data: JobRequisitionMutation): Promise<JobRequisitionDto> {
    return await apiService.post<JobRequisitionDto>(apiRoutes.recruitment.requisitions.create, data);
  }

  static async submitJobRequisition(id: number): Promise<JobRequisitionDto> {
    return await apiService.post<JobRequisitionDto>(apiRoutes.recruitment.requisitions.submit(id));
  }

  static async approveJobRequisition(id: number): Promise<JobRequisitionDto> {
    return await apiService.post<JobRequisitionDto>(apiRoutes.recruitment.requisitions.approve(id));
  }

  static async rejectJobRequisition(id: number, reason: string): Promise<JobRequisitionDto> {
    return await apiService.post<JobRequisitionDto>(apiRoutes.recruitment.requisitions.reject(id), { reason });
  }

  static async getOrgLookup(
    resource: "branches" | "departments" | "positions"
  ): Promise<{ id: number; code: string; nameEn: string; nameAr: string }[]> {
    return await apiService.get<{ id: number; code: string; nameEn: string; nameAr: string }[]>(
      apiRoutes.organizationalStructure.lookup(resource)
    );
  }

  // Recruitment Settings
  static async getSettings(): Promise<import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto> {
    return await apiService.get<import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto>(apiRoutes.recruitment.settings.base);
  }

  static async updateSettings(
    data: import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto
  ): Promise<import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto> {
    return await apiService.put<import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto>(apiRoutes.recruitment.settings.base, data);
  }
}

