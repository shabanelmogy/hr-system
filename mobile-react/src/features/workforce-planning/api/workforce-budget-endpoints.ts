export const workforceBudgetEndpoints = {
  base: 'workforce-planning/budgets',
  create: 'workforce-planning/budgets',
  byId: (id: number) => `workforce-planning/budgets/${id}`,
  submit: (id: number) => `workforce-planning/budgets/${id}/submit`,
  approve: (id: number) => `workforce-planning/budgets/${id}/approve`,
  reject: (id: number) => `workforce-planning/budgets/${id}/reject`,
  sourcePlans: 'workforce-planning/budgets/source-plans',
  sourcePlanById: (planId: number) => `workforce-planning/budgets/source-plans/${planId}`,
  envelopes: 'workforce-planning/position-envelopes',
  envelopeById: (id: number) => `workforce-planning/position-envelopes/${id}`,
} as const;
