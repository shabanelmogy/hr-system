import type {
  ApplicationQuery,
  JobOfferQuery,
  JobOpeningQuery,
  JobRequisitionQuery,
} from '../../domain/models/recruitment';

export const recruitmentKeys = {
  all: ['recruitment'] as const,
  summary: () => [...recruitmentKeys.all, 'summary'] as const,
  openings: (params?: JobOpeningQuery) => [...recruitmentKeys.all, 'openings', params] as const,
  opening: (id: number) => [...recruitmentKeys.all, 'opening', id] as const,
  requisitions: (params?: JobRequisitionQuery) => [...recruitmentKeys.all, 'requisitions', params] as const,
  requisition: (id: number) => [...recruitmentKeys.all, 'requisition', id] as const,
  staffingRequestOptions: () => [...recruitmentKeys.all, 'staffing-request-options'] as const,
  settings: () => [...recruitmentKeys.all, 'settings'] as const,
  applications: (params?: ApplicationQuery) => [...recruitmentKeys.all, 'applications', params] as const,
  application: (id: number) => [...recruitmentKeys.all, 'application', id] as const,
  offers: (params?: JobOfferQuery) => [...recruitmentKeys.all, 'offers', params] as const,
  scorecardTemplate: (interviewId: number) => [...recruitmentKeys.all, 'scorecard-template', interviewId] as const,
  positionHeadcountSummary: (positionId?: number | null) => [...recruitmentKeys.all, 'position-headcount-summary', positionId] as const,
};
