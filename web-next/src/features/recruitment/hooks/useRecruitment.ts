import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import RecruitmentService from "../services/recruitmentService";
import type {
  CandidateMutation,
  JobOpeningMutation,
  JobOfferMutation,
  JobRequisitionMutation,
  ScheduleInterviewMutation,
  SubmitInterviewEvaluationMutation,
  SubmitApplicationMutation,
  HireCandidateMutation,
  ApplicationStatus,
} from "../types";

export const recruitmentKeys = {
  all: ["recruitment"] as const,
  dashboard: () => [...recruitmentKeys.all, "dashboard"] as const,
  openings: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "openings", params] as const,
  opening: (id: number) => [...recruitmentKeys.all, "opening", id] as const,
  applications: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "applications", params] as const,
  application: (id: number) => [...recruitmentKeys.all, "application", id] as const,
  candidates: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "candidates", params] as const,
  candidate: (id: number) => [...recruitmentKeys.all, "candidate", id] as const,
  interviews: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "interviews", params] as const,
  offers: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "offers", params] as const,
  requisitions: (params?: Record<string, unknown>) => [...recruitmentKeys.all, "requisitions", params] as const,
};

// --- Queries ---

export const useRecruitmentSummary = () =>
  useQuery({
    queryKey: recruitmentKeys.dashboard(),
    queryFn: () => RecruitmentService.getDashboardSummary(),
    staleTime: 15_000,
  });

export const useJobOpenings = (params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: number;
  departmentId?: number;
}) =>
  useQuery({
    queryKey: recruitmentKeys.openings(params),
    queryFn: () => RecruitmentService.getJobOpenings(params),
    staleTime: 30_000,
  });

export const useJobOpening = (id: number) =>
  useQuery({
    queryKey: recruitmentKeys.opening(id),
    queryFn: () => RecruitmentService.getJobOpeningById(id),
    enabled: id > 0,
  });

export const useApplications = (params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  jobOpeningId?: number;
  status?: number;
}) =>
  useQuery({
    queryKey: recruitmentKeys.applications(params),
    queryFn: () => RecruitmentService.getApplications(params),
    staleTime: 15_000,
  });

export const useApplication = (id: number) =>
  useQuery({
    queryKey: recruitmentKeys.application(id),
    queryFn: () => RecruitmentService.getApplicationById(id),
    enabled: id > 0,
  });

export const useCandidates = (params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
}) =>
  useQuery({
    queryKey: recruitmentKeys.candidates(params),
    queryFn: () => RecruitmentService.getCandidates(params),
    staleTime: 30_000,
  });

export const useInterviews = (params?: {
  pageNumber?: number;
  pageSize?: number;
  applicationId?: number;
  status?: number;
}) =>
  useQuery({
    queryKey: recruitmentKeys.interviews(params),
    queryFn: () => RecruitmentService.getInterviews(params),
    staleTime: 15_000,
  });

export const useJobOffers = (params?: {
  pageNumber?: number;
  pageSize?: number;
  applicationId?: number;
  status?: number;
}) =>
  useQuery({
    queryKey: recruitmentKeys.offers(params),
    queryFn: () => RecruitmentService.getJobOffers(params),
    staleTime: 15_000,
  });

export const useJobRequisitions = (params?: {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  status?: number;
}) =>
  useQuery({
    queryKey: recruitmentKeys.requisitions(params),
    queryFn: () => RecruitmentService.getJobRequisitions(params),
    staleTime: 30_000,
  });

// --- Mutations ---

export const useCreateJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobOpeningMutation) => RecruitmentService.createJobOpening(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useOpenJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.openJobOpening(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const usePauseJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => RecruitmentService.pauseJobOpening(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useCloseJobOpening = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => RecruitmentService.closeJobOpening(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SubmitApplicationMutation) => RecruitmentService.submitApplication(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useMoveApplicationStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      targetStatus,
      reason,
    }: {
      id: number;
      targetStatus: ApplicationStatus;
      reason?: string;
    }) => RecruitmentService.moveApplicationStage(id, targetStatus, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useHireApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HireCandidateMutation }) =>
      RecruitmentService.hireApplication(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useRejectApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      RecruitmentService.rejectApplication(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      RecruitmentService.withdrawApplication(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useCreateCandidate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CandidateMutation) => RecruitmentService.createCandidate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScheduleInterviewMutation) => RecruitmentService.scheduleInterview(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useCompleteInterview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.completeInterview(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useSubmitInterviewEvaluation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      interviewId,
      data,
    }: {
      interviewId: number;
      data: SubmitInterviewEvaluationMutation;
    }) => RecruitmentService.submitInterviewEvaluation(interviewId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useInterviewScorecardTemplate = (interviewId: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...recruitmentKeys.all, "interview-scorecard-template", interviewId],
    queryFn: () => RecruitmentService.getInterviewScorecardTemplate(interviewId),
    enabled: !!interviewId && (options?.enabled ?? true),
  });
};

export const useCreateJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobOfferMutation) => RecruitmentService.createJobOffer(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useIssueJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.issueJobOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useAcceptJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.acceptJobOffer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useDeclineJobOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      RecruitmentService.declineJobOffer(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const usePositionHeadcountSummary = (
  positionId?: number | null,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [...recruitmentKeys.all, "position-headcount-summary", positionId],
    queryFn: () => RecruitmentService.getPositionHeadcountSummary(positionId!),
    enabled: !!positionId && (options?.enabled ?? true),
  });
};

export const useCreateJobRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobRequisitionMutation) => RecruitmentService.createJobRequisition(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useSubmitJobRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.submitJobRequisition(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useApproveJobRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => RecruitmentService.approveJobRequisition(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useRejectJobRequisition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      RecruitmentService.rejectJobRequisition(id, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recruitmentKeys.all }),
  });
};

export const useOrgLookup = (
  resource: "branches" | "departments" | "positions",
  enabled = true
) =>
  useQuery({
    queryKey: [...recruitmentKeys.all, "org-lookup", resource],
    queryFn: () => RecruitmentService.getOrgLookup(resource),
    enabled,
    staleTime: 5 * 60_000,
    refetchOnMount: "always",
  });

export const useRecruitmentSettingsQuery = () =>
  useQuery({
    queryKey: [...recruitmentKeys.all, "settings"],
    queryFn: () => RecruitmentService.getSettings(),
    staleTime: 30_000,
  });

export const useUpdateRecruitmentSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: import("../types/recruitmentSettingsTypes").RecruitmentSettingsDto) =>
      RecruitmentService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...recruitmentKeys.all, "settings"] });
    },
  });
};


