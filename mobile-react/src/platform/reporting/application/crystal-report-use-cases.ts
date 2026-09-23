import type {
  GlobalCrystalReportRenderRequest,
  CrystalReportRenderRequest,
} from '../domain/models/crystal-report';
import type { CrystalReportRepository } from '../domain/repositories/crystal-report-repository';

export function createCrystalReportUseCases(repository: CrystalReportRepository) {
  return {
    listPublished: (entityKey?: string) => repository.listPublished(entityKey),
    render: (id: string, request: CrystalReportRenderRequest) => repository.render(id, request),
    listGlobal: (entityKey: string) => repository.listGlobal(entityKey),
    renderGlobal: (sourceId: string, request: GlobalCrystalReportRenderRequest) =>
      repository.renderGlobal(sourceId, request),
  };
}

export type CrystalReportUseCases = ReturnType<typeof createCrystalReportUseCases>;
