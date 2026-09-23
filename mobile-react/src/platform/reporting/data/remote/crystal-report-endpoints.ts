export const crystalReportEndpoints = {
  base: 'crystal-reports',
  render: (id: string) => `crystal-reports/${id}/render`,
  globalBase: 'global-crystal-reports',
  renderGlobal: (sourceId: string) => `global-crystal-reports/${sourceId}/render`,
} as const;
