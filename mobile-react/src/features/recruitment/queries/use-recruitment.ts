import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recruitmentApi } from '../api/recruitment-api';
import { DEFAULT_RECRUITMENT_SETTINGS } from '../constants/recruitmentDefaults';
import type {
  ApplicationStage,
  ApplicationStatus,
  JobOpeningStatus,
  JobRequisitionStatus,
  RecruitmentSettingsDto,
  SubmitInterviewEvaluationMutation,
} from '../types';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  summary: () => [...recruitmentKeys.all, 'summary'] as const,
  openings: (params?: { search?: string; status?: JobOpeningStatus }) =>
    [...recruitmentKeys.all, 'openings', params] as const,
  opening: (id: number) => [...recruitmentKeys.all, 'opening', id] as const,
  requisitions: (params?: { search?: string; status?: JobRequisitionStatus }) =>
    [...recruitmentKeys.all, 'requisitions', params] as const,
  requisition: (id: number) => [...recruitmentKeys.all, 'requisition', id] as const,
  settings: () => [...recruitmentKeys.all, 'settings'] as const,
  applications: (params?: {
    jobOpeningId?: number;
    status?: ApplicationStatus;
    stage?: ApplicationStage;
    search?: string;
  }) => [...recruitmentKeys.all, 'applications', params] as const,
  application: (id: number) => [...recruitmentKeys.all, 'application', id] as const,
};

export function useRecruitmentSummary() {
  return useQuery({
    queryKey: recruitmentKeys.summary(),
    queryFn: () => recruitmentApi.getSummary(),
  });
}

export function useJobOpenings(params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: JobOpeningStatus;
}) {
  return useQuery({
    queryKey: recruitmentKeys.openings(params),
    queryFn: () => recruitmentApi.getOpenings(params),
  });
}

export function useJobOpening(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.opening(id),
    queryFn: () => recruitmentApi.getOpeningById(id),
    enabled: id > 0,
  });
}

export function useOpenJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.openOpening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function usePauseJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.pauseOpening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useCloseJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.closeOpening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useApplications(params?: {
  pageNumber?: number;
  pageSize?: number;
  jobOpeningId?: number;
  status?: ApplicationStatus;
  stage?: ApplicationStage;
  search?: string;
}) {
  return useQuery({
    queryKey: recruitmentKeys.applications(params),
    queryFn: () => recruitmentApi.getApplications(params),
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.application(id),
    queryFn: () => recruitmentApi.getApplicationById(id),
    enabled: id > 0,
  });
}

export function useChangeApplicationStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      stage,
      reason,
      notes,
    }: {
      id: number;
      stage: ApplicationStage;
      reason?: string;
      notes?: string;
    }) => recruitmentApi.changeStage(id, { stage, reason, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useCreateCandidate() {
  return useMutation({
    mutationFn: (request: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber?: string;
    }) => recruitmentApi.createCandidate(request),
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: {
      candidateId: number;
      jobOpeningId: number;
      source: number;
      expectedSalary?: number;
      expectedSalaryCurrencyCode?: string;
      availableFrom?: string;
      coverLetter?: string;
    }) => recruitmentApi.submitApplication(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: {
      employmentApplicationId: number;
      type: number;
      startsOn: string;
      endsOn: string;
      locationOrMeetingUrl?: string;
      leadEmployeeId: number;
    }) => recruitmentApi.scheduleInterview(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.completeInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useEvaluateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: SubmitInterviewEvaluationMutation;
    }) => recruitmentApi.evaluateInterview(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useScorecardTemplate(interviewId: number) {
  return useQuery({
    queryKey: [...recruitmentKeys.all, 'scorecard-template', interviewId],
    queryFn: () => recruitmentApi.getScorecardTemplate(interviewId),
    enabled: interviewId > 0,
  });
}

export function useCreateJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: {
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
    }) => recruitmentApi.createOffer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useIssueJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.issueOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useHireCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      hireDate,
      notes,
    }: {
      id: number;
      hireDate?: string;
      notes?: string;
    }) => recruitmentApi.hireCandidate(id, { hireDate, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useJobRequisitions(params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: JobRequisitionStatus;
}) {
  return useQuery({
    queryKey: recruitmentKeys.requisitions(params),
    queryFn: () => recruitmentApi.getRequisitions(params),
  });
}

export function useJobRequisition(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.requisition(id),
    queryFn: () => recruitmentApi.getRequisitionById(id),
    enabled: id > 0,
  });
}

export function usePositionHeadcountSummary(positionId?: number | null) {
  return useQuery({
    queryKey: [...recruitmentKeys.all, 'position-headcount-summary', positionId],
    queryFn: () => recruitmentApi.getPositionHeadcountSummary(positionId!),
    enabled: !!positionId && positionId > 0,
  });
}

export function useCreateJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: import('../types').JobRequisitionMutation) =>
      recruitmentApi.createRequisition(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useApproveJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => recruitmentApi.approveRequisition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useRejectJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      recruitmentApi.rejectRequisition(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useRecruitmentSettings() {
  return useQuery({
    queryKey: recruitmentKeys.settings(),
    queryFn: () => recruitmentApi.getSettings(),
    initialData: DEFAULT_RECRUITMENT_SETTINGS,
  });
}

export function useUpdateRecruitmentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: RecruitmentSettingsDto) =>
      recruitmentApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.settings() });
    },
  });
}

