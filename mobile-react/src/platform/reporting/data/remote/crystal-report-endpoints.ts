export const crystalReportEndpoints = {
  base: 'crystal-reports',
  render: (id: string) => `crystal-reports/${id}/render`,
} as const;
