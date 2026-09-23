import { apiService, axiosClient } from '@/src/core/api';

import type {
  CrystalReportListItem,
  GlobalCrystalReportRenderRequest,
  CrystalReportRenderRequest,
} from '../../domain/models/crystal-report';
import { crystalReportEndpoints } from './crystal-report-endpoints';
import { globalCrystalReportsSchema, publishedCrystalReportsSchema } from './crystal-report-schemas';

const RENDER_TIMEOUT_MS = 120_000;

export interface CrystalReportRemoteDataSource {
  listPublished(entityKey?: string): Promise<CrystalReportListItem[]>;
  render(id: string, request: CrystalReportRenderRequest): Promise<ArrayBuffer>;
  listGlobal(entityKey: string): Promise<CrystalReportListItem[]>;
  renderGlobal(sourceId: string, request: GlobalCrystalReportRenderRequest): Promise<ArrayBuffer>;
}

export const crystalReportRemoteDataSource: CrystalReportRemoteDataSource = {
  async listPublished(entityKey) {
    return publishedCrystalReportsSchema.parse(await apiService.get<unknown>(
      crystalReportEndpoints.base,
      entityKey ? { params: { entityKey } } : undefined,
    ));
  },

  async render(id, request) {
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

  async listGlobal(entityKey) {
    return globalCrystalReportsSchema.parse(await apiService.get<unknown>(
      crystalReportEndpoints.globalBase,
      { params: { entityKey } },
    ));
  },

  async renderGlobal(sourceId, request) {
    const response = await axiosClient.post<ArrayBuffer>(
      crystalReportEndpoints.renderGlobal(sourceId),
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
