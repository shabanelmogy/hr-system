export const workforceTraceEndpoints = {
  application: (id: number) => `workforce-planning/trace/application/${id}`,
  offer: (id: number) => `workforce-planning/trace/offer/${id}`,
  employee: (id: number) => `workforce-planning/trace/employee/${id}`,
  commitment: 'workforce-planning/trace/plan-commitment',
} as const;
