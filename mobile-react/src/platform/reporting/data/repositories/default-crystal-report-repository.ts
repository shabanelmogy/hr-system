import type { CrystalReportRepository } from '../../domain/repositories/crystal-report-repository';
import type { CrystalReportRemoteDataSource } from '../remote/crystal-report-remote-data-source';

export class DefaultCrystalReportRepository implements CrystalReportRepository {
  constructor(
    private readonly remote: CrystalReportRemoteDataSource,
    private readonly isOnline: () => boolean = () => true,
  ) {}

  private requireOnline(): void {
    if (!this.isOnline()) throw new Error('Reporting requires an internet connection.');
  }

  listPublished(entityKey?: string) {
    this.requireOnline();
    return this.remote.listPublished(entityKey);
  }

  render(id: string, request: Parameters<CrystalReportRepository['render']>[1]) {
    this.requireOnline();
    return this.remote.render(id, request);
  }
}
