import { apiService } from '@/src/core/api';
import { z } from 'zod';

import type {
  ApplicationQuery,
  ChangeApplicationStageMutation,
  CreateCandidateMutation,
  CreateJobOfferMutation,
  HireCandidateMutation,
  InterviewQuery,
  JobOfferQuery,
  JobOpeningQuery,
  JobRequisitionMutation,
  JobRequisitionQuery,
  ScheduleInterviewMutation,
  SubmitApplicationMutation,
  SubmitInterviewEvaluationMutation,
} from '../../domain/models/recruitment';
import type { RecruitmentRepository } from '../../domain/repositories/recruitment-repository';
import { recruitmentEndpoints } from './recruitment-endpoints';
import {
  approvedStaffingRequestOptionSchema,
  candidateSchema,
  employmentApplicationSchema,
  interviewScorecardTemplateSchema,
  interviewSchema,
  jobOfferSchema,
  jobOpeningSchema,
  jobRequisitionSchema,
  positionHeadcountSummarySchema,
  recruitmentPageSchema,
  recruitmentSettingsSchema,
  recruitmentSummarySchema,
} from './recruitment-schemas';

export type RecruitmentRemoteDataSource = RecruitmentRepository;

async function getParsed<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await apiService.get<unknown>(url));
}

async function postParsed<T, Request>(url: string, body: Request, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await apiService.post<unknown, Request>(url, body));
}

async function putParsed<T, Request>(url: string, body: Request, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(await apiService.put<unknown, Request>(url, body));
}

function buildQuery(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const encoded = query.toString();
  return encoded ? `?${encoded}` : '';
}

export const recruitmentRemoteDataSource: RecruitmentRemoteDataSource = {
  getSummary: () => getParsed(recruitmentEndpoints.dashboard.summary, recruitmentSummarySchema),

  getOpenings: (params?: JobOpeningQuery) => getParsed(
    recruitmentEndpoints.openings.base + buildQuery({
      pageNumber: params?.pageNumber || undefined,
      pageSize: params?.pageSize || undefined,
      search: params?.search?.trim() || undefined,
      status: params?.status,
    }),
    recruitmentPageSchema(jobOpeningSchema),
  ),

  getOpeningById: (id) => getParsed(recruitmentEndpoints.openings.byId(id), jobOpeningSchema),

  openOpening: (id) => postParsed(recruitmentEndpoints.openings.open(id), undefined, jobOpeningSchema),

  pauseOpening: (id, reason) => postParsed(
    recruitmentEndpoints.openings.pause(id),
    { reason },
    jobOpeningSchema,
  ),

  closeOpening: (id, reason) => postParsed(
    recruitmentEndpoints.openings.close(id),
    { reason },
    jobOpeningSchema,
  ),

  getOffers: (params?: JobOfferQuery) => getParsed(
    recruitmentEndpoints.offers.base + buildQuery({
      pageNumber: params?.pageNumber || undefined,
      pageSize: params?.pageSize || undefined,
      applicationId: params?.applicationId || undefined,
      status: params?.status,
    }),
    recruitmentPageSchema(jobOfferSchema),
  ),

  getApplications: (params?: ApplicationQuery) => getParsed(
    recruitmentEndpoints.applications.base + buildQuery({
      pageNumber: params?.pageNumber || undefined,
      pageSize: params?.pageSize || undefined,
      jobOpeningId: params?.jobOpeningId || undefined,
      status: params?.status,
      search: params?.search?.trim() || undefined,
    }),
    recruitmentPageSchema(employmentApplicationSchema),
  ),

  getApplicationById: (id) => getParsed(recruitmentEndpoints.applications.byId(id), employmentApplicationSchema),

  changeStage: (id, request: ChangeApplicationStageMutation) => {
    return postParsed(
      recruitmentEndpoints.applications.moveStage(id),
      request,
      employmentApplicationSchema,
    );
  },

  createCandidate: (request: CreateCandidateMutation) => postParsed(
    recruitmentEndpoints.candidates.base,
    request,
    candidateSchema,
  ),

  submitApplication: (request: SubmitApplicationMutation) => postParsed(
    recruitmentEndpoints.applications.base,
    request,
    employmentApplicationSchema,
  ),

  scheduleInterview: (request: ScheduleInterviewMutation) => postParsed(
    recruitmentEndpoints.interviews.base,
    request,
    interviewSchema,
  ),

  getInterviews: (params?: InterviewQuery) => getParsed(
    recruitmentEndpoints.interviews.base + buildQuery({
      pageNumber: params?.pageNumber || undefined,
      pageSize: params?.pageSize || undefined,
      applicationId: params?.applicationId || undefined,
      status: params?.status,
    }),
    recruitmentPageSchema(interviewSchema),
  ),

  completeInterview: (id) => postParsed(
    recruitmentEndpoints.interviews.complete(id),
    undefined,
    interviewSchema,
  ),

  evaluateInterview: (id, request: SubmitInterviewEvaluationMutation) => postParsed(
    recruitmentEndpoints.interviews.evaluations(id),
    request,
    interviewSchema,
  ),

  getScorecardTemplate: (interviewId) => getParsed(
    recruitmentEndpoints.interviews.scorecardTemplate(interviewId),
    interviewScorecardTemplateSchema,
  ),

  createOffer: (request: CreateJobOfferMutation) => postParsed(
    recruitmentEndpoints.offers.base,
    request,
    jobOfferSchema,
  ),

  issueOffer: (id) => postParsed(recruitmentEndpoints.offers.issue(id), undefined, jobOfferSchema),

  submitOffer: (id) => postParsed(recruitmentEndpoints.offers.submit(id), undefined, jobOfferSchema),

  approveOffer: (id) => postParsed(recruitmentEndpoints.offers.approve(id), undefined, jobOfferSchema),

  rejectOffer: (id, reason) => postParsed(
    recruitmentEndpoints.offers.reject(id),
    { reason },
    jobOfferSchema,
  ),

  hireCandidate: (id: number, request: HireCandidateMutation) => postParsed(
      recruitmentEndpoints.applications.hire(id),
      request,
      employmentApplicationSchema,
  ),

  getRequisitions: (params?: JobRequisitionQuery) => getParsed(
    recruitmentEndpoints.requisitions.base + buildQuery({
      pageNumber: params?.pageNumber || undefined,
      pageSize: params?.pageSize || undefined,
      search: params?.search?.trim() || undefined,
      status: params?.status,
    }),
    recruitmentPageSchema(jobRequisitionSchema),
  ),

  getRequisitionById: (id) => getParsed(recruitmentEndpoints.requisitions.byId(id), jobRequisitionSchema),

  getPositionHeadcountSummary: (positionId) => getParsed(
    recruitmentEndpoints.requisitions.headcountSummary(positionId),
    positionHeadcountSummarySchema,
  ),

  getApprovedStaffingRequestOptions: () => getParsed(
    recruitmentEndpoints.requisitions.staffingRequestOptions,
    z.array(approvedStaffingRequestOptionSchema),
  ),

  createRequisition: (request: JobRequisitionMutation) => postParsed(
    recruitmentEndpoints.requisitions.base,
    request,
    jobRequisitionSchema,
  ),

  submitRequisition: (id) => postParsed(
    recruitmentEndpoints.requisitions.submit(id),
    undefined,
    jobRequisitionSchema,
  ),

  approveRequisition: (id) => postParsed(
    recruitmentEndpoints.requisitions.approve(id),
    undefined,
    jobRequisitionSchema,
  ),

  rejectRequisition: (id, reason) => postParsed(
    recruitmentEndpoints.requisitions.reject(id),
    { reason },
    jobRequisitionSchema,
  ),

  cancelRequisition: (id, reason) => postParsed(
    recruitmentEndpoints.requisitions.cancel(id),
    { reason },
    jobRequisitionSchema,
  ),

  getSettings: () => getParsed(recruitmentEndpoints.settings.base, recruitmentSettingsSchema),

  updateSettings: (settings) => putParsed(
    recruitmentEndpoints.settings.base,
    settings,
    recruitmentSettingsSchema,
  ),
};
