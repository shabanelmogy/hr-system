import { apiService, axiosClient } from '@/src/core/api';

import {
  publishedCrystalReportsSchema,
  type CrystalReportListItem,
  type CrystalReportRenderRequest,
} from './crystal-report-schemas';

export type { CrystalReportListItem, CrystalReportRenderRequest };

const RENDER_TIMEOUT_MS = 120_000;

export const crystalReportEndpoints = {
  base: 'crystal-reports',
  render: (id: string) => `crystal-reports/${id}/render`,
} as const;

export const crystalReportsApi = {
  async listPublished(entityKey?: string): Promise<CrystalReportListItem[]> {
    return publishedCrystalReportsSchema.parse(await apiService.get<unknown>(
      crystalReportEndpoints.base,
      entityKey ? { params: { entityKey } } : undefined,
    ));
  },

  async render(id: string, request: CrystalReportRenderRequest): Promise<ArrayBuffer> {
    const response = await axiosClient.post<ArrayBuffer>(
      crystalReportEndpoints.render(id),
      request,
      {
        responseType: 'arraybuffer',
        timeout: RENDER_TIMEOUT_MS,
        allowWhenReadOnly: true,
        headers: { Accept: 'application/pdf' },
      },
    );
    return response.data;
  },
};
