import type { CrystalReportRenderRequest } from '../domain/models/crystal-report';
import type { CrystalReportRepository } from '../domain/repositories/crystal-report-repository';

export function createCrystalReportUseCases(repository: CrystalReportRepository) {
  return {
    listPublished: (entityKey?: string) => repository.listPublished(entityKey),
    render: (id: string, request: CrystalReportRenderRequest) => repository.render(id, request),
  };
}

export type CrystalReportUseCases = ReturnType<typeof createCrystalReportUseCases>;
