import type {
  ApplicationQuery,
  ChangeApplicationStageMutation,
  CreateCandidateMutation,
  CreateJobOfferMutation,
  HireCandidateMutation,
  JobOfferQuery,
  JobOpeningQuery,
  JobRequisitionMutation,
  JobRequisitionQuery,
  RecruitmentSettingsDto,
  ScheduleInterviewMutation,
  SubmitApplicationMutation,
  SubmitInterviewEvaluationMutation,
} from '../domain/models/recruitment';
import type { RecruitmentRepository } from '../domain/repositories/recruitment-repository';

export function createRecruitmentUseCases(repository: RecruitmentRepository) {
  return {
    getSummary: () => repository.getSummary(),
    getOpenings: (params?: JobOpeningQuery) => repository.getOpenings(params),
    getOpeningById: (id: number) => repository.getOpeningById(id),
    openOpening: (id: number) => repository.openOpening(id),
    pauseOpening: (id: number, reason?: string) => repository.pauseOpening(id, reason),
    closeOpening: (id: number, reason?: string) => repository.closeOpening(id, reason),

    getApplications: (params?: ApplicationQuery) => repository.getApplications(params),
    getApplicationById: (id: number) => repository.getApplicationById(id),
    changeStage: (id: number, request: ChangeApplicationStageMutation) => repository.changeStage(id, request),
    createCandidate: (request: CreateCandidateMutation) => repository.createCandidate(request),
    submitApplication: (request: SubmitApplicationMutation) => repository.submitApplication(request),
    hireCandidate: (id: number, request: HireCandidateMutation) => repository.hireCandidate(id, request),

    scheduleInterview: (request: ScheduleInterviewMutation) => repository.scheduleInterview(request),
    completeInterview: (id: number) => repository.completeInterview(id),
    evaluateInterview: (id: number, request: SubmitInterviewEvaluationMutation) => repository.evaluateInterview(id, request),
    getScorecardTemplate: (interviewId: number) => repository.getScorecardTemplate(interviewId),

    getOffers: (params?: JobOfferQuery) => repository.getOffers(params),
    createOffer: (request: CreateJobOfferMutation) => repository.createOffer(request),
    issueOffer: (id: number) => repository.issueOffer(id),
    submitOffer: (id: number) => repository.submitOffer(id),
    approveOffer: (id: number) => repository.approveOffer(id),
    rejectOffer: (id: number, reason: string) => repository.rejectOffer(id, reason),

    getRequisitions: (params?: JobRequisitionQuery) => repository.getRequisitions(params),
    getRequisitionById: (id: number) => repository.getRequisitionById(id),
    getPositionHeadcountSummary: (positionId: number) => repository.getPositionHeadcountSummary(positionId),
    getApprovedStaffingRequestOptions: () => repository.getApprovedStaffingRequestOptions(),
    createRequisition: (request: JobRequisitionMutation) => repository.createRequisition(request),
    submitRequisition: (id: number) => repository.submitRequisition(id),
    approveRequisition: (id: number) => repository.approveRequisition(id),
    rejectRequisition: (id: number, reason: string) => repository.rejectRequisition(id, reason),
    cancelRequisition: (id: number, reason: string) => repository.cancelRequisition(id, reason),

    getSettings: () => repository.getSettings(),
    updateSettings: (settings: RecruitmentSettingsDto) => repository.updateSettings(settings),
  };
}

export type RecruitmentUseCases = ReturnType<typeof createRecruitmentUseCases>;
