export const recruitmentEndpoints = {
  dashboard: {
    summary: 'recruitment/dashboard/summary',
  },
  openings: {
    base: 'recruitment/openings',
    byId: (id: number) => `recruitment/openings/${id}`,
    open: (id: number) => `recruitment/openings/${id}/open`,
    pause: (id: number) => `recruitment/openings/${id}/pause`,
    close: (id: number) => `recruitment/openings/${id}/close`,
  },
  candidates: {
    base: 'recruitment/candidates',
    byId: (id: number) => `recruitment/candidates/${id}`,
  },
  applications: {
    base: 'recruitment/applications',
    byId: (id: number) => `recruitment/applications/${id}`,
    moveStage: (id: number) => `recruitment/applications/${id}/move-stage`,
    hire: (id: number) => `recruitment/applications/${id}/hire`,
  },
  interviews: {
    base: 'recruitment/interviews',
    byId: (id: number) => `recruitment/interviews/${id}`,
    complete: (id: number) => `recruitment/interviews/${id}/complete`,
    evaluations: (id: number) => `recruitment/interviews/${id}/evaluations`,
    scorecardTemplate: (id: number) => `recruitment/interviews/${id}/scorecard-template`,
  },
  offers: {
    base: 'recruitment/offers',
    byId: (id: number) => `recruitment/offers/${id}`,
    issue: (id: number) => `recruitment/offers/${id}/issue`,
    accept: (id: number) => `recruitment/offers/${id}/accept`,
    decline: (id: number) => `recruitment/offers/${id}/decline`,
  },
  requisitions: {
    base: 'recruitment/requisitions',
    byId: (id: number) => `recruitment/requisitions/${id}`,
    headcountSummary: (positionId: number) => `recruitment/requisitions/positions/${positionId}/headcount-summary`,
    approve: (id: number) => `recruitment/requisitions/${id}/approve`,
    reject: (id: number) => `recruitment/requisitions/${id}/reject`,
  },
  settings: {
    base: 'recruitment/settings',
  },
} as const;
