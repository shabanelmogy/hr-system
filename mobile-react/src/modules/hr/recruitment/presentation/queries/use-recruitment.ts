import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recruitmentUseCases } from '../../composition/recruitment-container';
import type {
  ApplicationQuery,
  ChangeApplicationStageMutation,
  CreateCandidateMutation,
  CreateJobOfferMutation,
  HireCandidateMutation,
  InterviewQuery,
  JobOfferQuery,
  JobRequisitionMutation,
  ScheduleInterviewMutation,
  SubmitApplicationMutation,
  JobOpeningStatus,
  JobRequisitionStatus,
  RecruitmentSettingsDto,
  SubmitInterviewEvaluationMutation,
} from '../../domain/models/recruitment';
import { recruitmentKeys } from './recruitment-keys';

export function useRecruitmentSummary() {
  return useQuery({
    queryKey: recruitmentKeys.summary(),
    queryFn: () => recruitmentUseCases.getSummary(),
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
    queryFn: () => recruitmentUseCases.getOpenings(params),
  });
}

export function useJobOpening(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.opening(id),
    queryFn: () => recruitmentUseCases.getOpeningById(id),
    enabled: id > 0,
  });
}

export function useOpenJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.openOpening(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function usePauseJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, reason }: { id: number; reason: string }) => recruitmentUseCases.pauseOpening(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useCloseJobOpening() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, reason }: { id: number; reason: string }) => recruitmentUseCases.closeOpening(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useApplications(params?: ApplicationQuery) {
  return useQuery({
    queryKey: recruitmentKeys.applications(params),
    queryFn: () => recruitmentUseCases.getApplications(params),
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.application(id),
    queryFn: () => recruitmentUseCases.getApplicationById(id),
    enabled: id > 0,
  });
}

export function useJobOffers(params?: JobOfferQuery) {
  return useQuery({ queryKey: recruitmentKeys.offers(params), queryFn: () => recruitmentUseCases.getOffers(params) });
}

export function useChangeApplicationStage() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, ...request }: { id: number } & ChangeApplicationStageMutation) =>
      recruitmentUseCases.changeStage(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useCreateCandidate() {
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: CreateCandidateMutation) => recruitmentUseCases.createCandidate(request),
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: SubmitApplicationMutation) => recruitmentUseCases.submitApplication(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: ScheduleInterviewMutation) => recruitmentUseCases.scheduleInterview(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useInterviews(params?: InterviewQuery, enabled = true) {
  return useQuery({
    queryKey: recruitmentKeys.interviews(params),
    queryFn: () => recruitmentUseCases.getInterviews(params),
    enabled,
  });
}

export function useCompleteInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.completeInterview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useEvaluateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({
      id,
      request,
    }: {
      id: number;
      request: SubmitInterviewEvaluationMutation;
    }) => recruitmentUseCases.evaluateInterview(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useScorecardTemplate(interviewId: number) {
  return useQuery({
    queryKey: recruitmentKeys.scorecardTemplate(interviewId),
    queryFn: () => recruitmentUseCases.getScorecardTemplate(interviewId),
    enabled: interviewId > 0,
  });
}

export function useCreateJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: CreateJobOfferMutation) => recruitmentUseCases.createOffer(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useIssueJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.issueOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useSubmitJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.submitOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useApproveJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.approveOffer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useRejectJobOffer() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      recruitmentUseCases.rejectOffer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useHireCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, ...request }: { id: number } & HireCandidateMutation) =>
      recruitmentUseCases.hireCandidate(id, request),
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
    queryFn: () => recruitmentUseCases.getRequisitions(params),
  });
}

export function useJobRequisition(id: number) {
  return useQuery({
    queryKey: recruitmentKeys.requisition(id),
    queryFn: () => recruitmentUseCases.getRequisitionById(id),
    enabled: id > 0,
  });
}

export function usePositionHeadcountSummary(positionId?: number | null) {
  return useQuery({
    queryKey: recruitmentKeys.positionHeadcountSummary(positionId),
    queryFn: () => recruitmentUseCases.getPositionHeadcountSummary(positionId!),
    enabled: !!positionId && positionId > 0,
  });
}

export function useCreateJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (request: JobRequisitionMutation) =>
      recruitmentUseCases.createRequisition(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useApprovedStaffingRequestOptions(enabled = true) {
  return useQuery({
    queryKey: recruitmentKeys.staffingRequestOptions(),
    queryFn: () => recruitmentUseCases.getApprovedStaffingRequestOptions(),
    enabled,
  });
}

export function useSubmitJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.submitRequisition(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }); },
  });
}

export function useCancelJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, reason }: { id: number; reason: string }) => recruitmentUseCases.cancelRequisition(id, reason),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }); },
  });
}

export function useApproveJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (id: number) => recruitmentUseCases.approveRequisition(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useRejectJobRequisition() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      recruitmentUseCases.rejectRequisition(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.all });
    },
  });
}

export function useRecruitmentSettings() {
  return useQuery({
    queryKey: recruitmentKeys.settings(),
    queryFn: () => recruitmentUseCases.getSettings(),
  });
}

export function useUpdateRecruitmentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    networkMode: 'always',
    mutationFn: (settings: RecruitmentSettingsDto) =>
      recruitmentUseCases.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentKeys.settings() });
    },
  });
}
