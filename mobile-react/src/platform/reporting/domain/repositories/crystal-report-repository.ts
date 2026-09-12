import type {
  CrystalReportListItem,
  CrystalReportRenderRequest,
} from '../models/crystal-report';

export interface CrystalReportRepository {
  listPublished(entityKey?: string): Promise<CrystalReportListItem[]>;
  render(id: string, request: CrystalReportRenderRequest): Promise<ArrayBuffer>;
}
