export const staffingEndpoints = {
  amendments: 'workforce-planning/envelope-amendments',
  amendmentById: (id: number) => `workforce-planning/envelope-amendments/${id}`,
  amendmentSubmit: (id: number) => `workforce-planning/envelope-amendments/${id}/submit`,
  amendmentApprove: (id: number) => `workforce-planning/envelope-amendments/${id}/approve`,
  amendmentReject: (id: number) => `workforce-planning/envelope-amendments/${id}/reject`,
  requests: 'workforce-planning/staffing-requests',
  requestById: (id: number) => `workforce-planning/staffing-requests/${id}`,
  requestSubmit: (id: number) => `workforce-planning/staffing-requests/${id}/submit`,
  requestApprove: (id: number) => `workforce-planning/staffing-requests/${id}/approve`,
  requestReject: (id: number) => `workforce-planning/staffing-requests/${id}/reject`,
  requestClose: (id: number) => `workforce-planning/staffing-requests/${id}/close`,
} as const;
