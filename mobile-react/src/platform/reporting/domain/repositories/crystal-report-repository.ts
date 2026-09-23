import type {
  CrystalReportListItem,
  GlobalCrystalReportRenderRequest,
  CrystalReportRenderRequest,
} from '../models/crystal-report';

export interface CrystalReportRepository {
  listPublished(entityKey?: string): Promise<CrystalReportListItem[]>;
  render(id: string, request: CrystalReportRenderRequest): Promise<ArrayBuffer>;
  listGlobal(entityKey: string): Promise<CrystalReportListItem[]>;
  renderGlobal(sourceId: string, request: GlobalCrystalReportRenderRequest): Promise<ArrayBuffer>;
}
