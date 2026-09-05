import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, type PageResponse } from '@/src/core/api';
import { recruitmentEndpoints } from './recruitment-endpoints';
import { DEFAULT_RECRUITMENT_SETTINGS } from '../constants/recruitmentDefaults';
import type {
  CandidateDto,
  EmploymentApplicationDto,
  InterviewDto,
  InterviewEvaluationDto,
  InterviewScorecardTemplateDto,
  InterviewSkillEvaluationDto,
  JobOfferDto,
  JobOpeningDto,
  JobRequisitionDto,
  JobRequisitionMutation,
  PositionHeadcountSummaryDto,
  RecruitmentSettingsDto,
  RecruitmentSummaryDto,
  SubmitInterviewEvaluationMutation,
} from '../types';
import {
  ApplicationStage,
  ApplicationStatus,
  JobOpeningStatus,
  JobRequisitionStatus,
} from '../types';

export const recruitmentApi = {
  async getSummary(): Promise<RecruitmentSummaryDto> {
    return apiService.get<RecruitmentSummaryDto>(recruitmentEndpoints.dashboard.summary);
  },

  async getOpenings(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: JobOpeningStatus;
  }): Promise<PageResponse<JobOpeningDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.status !== undefined) query.set('status', String(params.status));

    const qs = query.toString();
    return apiService.get<PageResponse<JobOpeningDto>>(
      `${recruitmentEndpoints.openings.base}${qs ? `?${qs}` : ''}`
    );
  },

  async getOpeningById(id: number): Promise<JobOpeningDto> {
    return apiService.get<JobOpeningDto>(recruitmentEndpoints.openings.byId(id));
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

  async getApplications(params?: {
    pageNumber?: number;
    pageSize?: number;
    jobOpeningId?: number;
    status?: ApplicationStatus;
    stage?: ApplicationStage;
    search?: string;
  }): Promise<PageResponse<EmploymentApplicationDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.jobOpeningId) query.set('jobOpeningId', String(params.jobOpeningId));
    if (params?.status !== undefined) query.set('status', String(params.status));
    if (params?.stage !== undefined) query.set('stage', String(params.stage));
    if (params?.search?.trim()) query.set('search', params.search.trim());

    const qs = query.toString();
    return apiService.get<PageResponse<EmploymentApplicationDto>>(
      `${recruitmentEndpoints.applications.base}${qs ? `?${qs}` : ''}`
    );
  },

  async getApplicationById(id: number): Promise<EmploymentApplicationDto> {
    return apiService.get<EmploymentApplicationDto>(recruitmentEndpoints.applications.byId(id));
  },

  async changeStage(
    id: number,
    request: { stage?: ApplicationStage; targetStatus?: ApplicationStatus; reason?: string; notes?: string }
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

  async createCandidate(request: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  }): Promise<CandidateDto> {
    return apiService.post<CandidateDto, typeof request>(
      recruitmentEndpoints.candidates.base,
      request
    );
  },

  async submitApplication(request: {
    candidateId: number;
    jobOpeningId: number;
    source: number;
    expectedSalary?: number;
    expectedSalaryCurrencyCode?: string;
    availableFrom?: string;
    coverLetter?: string;
  }): Promise<EmploymentApplicationDto> {
    return apiService.post<EmploymentApplicationDto, typeof request>(
      recruitmentEndpoints.applications.base,
      request
    );
  },

  async scheduleInterview(request: {
    employmentApplicationId: number;
    type: number;
    startsOn: string;
    endsOn: string;
    locationOrMeetingUrl?: string;
    leadEmployeeId: number;
  }): Promise<InterviewDto> {
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

  async createOffer(request: {
    employmentApplicationId: number;
    positionId: number;
    branchId: number;
    departmentId: number;
    baseSalary: number;
    currencyCode: string;
    payFrequency: number;
    employmentType: number;
    workArrangement: number;
    proposedStartDate: string;
    termsAndConditions?: string;
  }): Promise<JobOfferDto> {
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

  async hireCandidate(
    id: number,
    request: { hireDate?: string; notes?: string }
  ): Promise<void> {
    return apiService.post<void, typeof request>(
      recruitmentEndpoints.applications.hire(id),
      request
    );
  },

  async getRequisitions(params?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    status?: JobRequisitionStatus;
  }): Promise<PageResponse<JobRequisitionDto>> {
    const query = new URLSearchParams();
    if (params?.pageNumber) query.set('pageNumber', String(params.pageNumber));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    if (params?.search?.trim()) query.set('search', params.search.trim());
    if (params?.status !== undefined) query.set('status', String(params.status));

    const qs = query.toString();
    return apiService.get<PageResponse<JobRequisitionDto>>(
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

  async createRequisition(request: JobRequisitionMutation): Promise<JobRequisitionDto> {
    return apiService.post<JobRequisitionDto, JobRequisitionMutation>(
      recruitmentEndpoints.requisitions.base,
      request
    );
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

  async getSettings(): Promise<RecruitmentSettingsDto> {
    try {
      const apiData = await apiService.get<RecruitmentSettingsDto>(recruitmentEndpoints.settings.base);
      if (apiData && apiData.stages && apiData.stages.length > 0) {
        await AsyncStorage.setItem('recruitment_settings', JSON.stringify(apiData));
        return apiData;
      }
    } catch {
      // Remote API may not have settings endpoint deployed yet or network error
    }

    try {
      const cached = await AsyncStorage.getItem('recruitment_settings');
      if (cached) {
        const parsed = JSON.parse(cached) as RecruitmentSettingsDto;
        if (parsed?.stages?.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }

    return DEFAULT_RECRUITMENT_SETTINGS;
  },

  async updateSettings(settings: RecruitmentSettingsDto): Promise<RecruitmentSettingsDto> {
    try {
      await AsyncStorage.setItem('recruitment_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
    try {
      return await apiService.put<RecruitmentSettingsDto, RecruitmentSettingsDto>(
        recruitmentEndpoints.settings.base,
        settings
      );
    } catch {
      return settings;
    }
  },
};
