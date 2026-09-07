import { version } from "./constants";
import type { Id } from "./types";

const recruitmentBase = `${version}/recruitment`;

export const recruitment = {
  dashboard: `${recruitmentBase}/dashboard/summary`,
  requisitions: {
    page: `${recruitmentBase}/requisitions`,
    getById: (id: Id) => `${recruitmentBase}/requisitions/${id}`,
    headcountSummary: (positionId: Id) => `${recruitmentBase}/requisitions/positions/${positionId}/headcount-summary`,
    staffingRequestOptions: `${recruitmentBase}/requisitions/staffing-request-options`,
    create: `${recruitmentBase}/requisitions`,
    submit: (id: Id) => `${recruitmentBase}/requisitions/${id}/submit`,
    approve: (id: Id) => `${recruitmentBase}/requisitions/${id}/approve`,
    reject: (id: Id) => `${recruitmentBase}/requisitions/${id}/reject`,
    cancel: (id: Id) => `${recruitmentBase}/requisitions/${id}/cancel`,
  },
  openings: {
    page: `${recruitmentBase}/openings`,
    getById: (id: Id) => `${recruitmentBase}/openings/${id}`,
    create: `${recruitmentBase}/openings`,
    open: (id: Id) => `${recruitmentBase}/openings/${id}/open`,
    pause: (id: Id) => `${recruitmentBase}/openings/${id}/pause`,
    close: (id: Id) => `${recruitmentBase}/openings/${id}/close`,
  },
  postings: {
    page: `${recruitmentBase}/postings`,
    getById: (id: Id) => `${recruitmentBase}/postings/${id}`,
    create: `${recruitmentBase}/postings`,
    update: (id: Id) => `${recruitmentBase}/postings/${id}`,
    publish: (id: Id) => `${recruitmentBase}/postings/${id}/publish`,
    close: (id: Id) => `${recruitmentBase}/postings/${id}/close`,
  },
  candidates: {
    page: `${recruitmentBase}/candidates`,
    getById: (id: Id) => `${recruitmentBase}/candidates/${id}`,
    create: `${recruitmentBase}/candidates`,
    update: (id: Id) => `${recruitmentBase}/candidates/${id}`,
  },
  applications: {
    page: `${recruitmentBase}/applications`,
    getById: (id: Id) => `${recruitmentBase}/applications/${id}`,
    submit: `${recruitmentBase}/applications`,
    moveStage: (id: Id) => `${recruitmentBase}/applications/${id}/move-stage`,
    reject: (id: Id) => `${recruitmentBase}/applications/${id}/reject`,
    withdraw: (id: Id) => `${recruitmentBase}/applications/${id}/withdraw`,
    hire: (id: Id) => `${recruitmentBase}/applications/${id}/hire`,
  },
  interviews: {
    page: `${recruitmentBase}/interviews`,
    getById: (id: Id) => `${recruitmentBase}/interviews/${id}`,
    schedule: `${recruitmentBase}/interviews`,
    cancel: (id: Id) => `${recruitmentBase}/interviews/${id}/cancel`,
    complete: (id: Id) => `${recruitmentBase}/interviews/${id}/complete`,
    evaluations: (id: Id) => `${recruitmentBase}/interviews/${id}/evaluations`,
    scorecardTemplate: (id: Id) => `${recruitmentBase}/interviews/${id}/scorecard-template`,
  },
  offers: {
    page: `${recruitmentBase}/offers`,
    getById: (id: Id) => `${recruitmentBase}/offers/${id}`,
    create: `${recruitmentBase}/offers`,
    submit: (id: Id) => `${recruitmentBase}/offers/${id}/submit`,
    approve: (id: Id) => `${recruitmentBase}/offers/${id}/approve`,
    reject: (id: Id) => `${recruitmentBase}/offers/${id}/reject`,
    issue: (id: Id) => `${recruitmentBase}/offers/${id}/issue`,
    accept: (id: Id) => `${recruitmentBase}/offers/${id}/accept`,
    decline: (id: Id) => `${recruitmentBase}/offers/${id}/decline`,
  },
  settings: {
    base: `${recruitmentBase}/settings`,
  },
} as const;
