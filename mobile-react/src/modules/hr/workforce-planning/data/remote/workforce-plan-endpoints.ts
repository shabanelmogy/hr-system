export const workforcePlanEndpoints = {
  base: 'workforce-planning/plans',
  create: 'workforce-planning/plans',
  byId: (id: number) => `workforce-planning/plans/${id}`,
  restore: (id: number) => `workforce-planning/plans/${id}/restore`,
  submit: (id: number) => `workforce-planning/plans/${id}/submit`,
  beginReview: (id: number) => `workforce-planning/plans/${id}/begin-review`,
  approve: (id: number) => `workforce-planning/plans/${id}/approve`,
  reject: (id: number) => `workforce-planning/plans/${id}/reject`,
  revisions: (id: number) => `workforce-planning/plans/${id}/revisions`,
} as const;
