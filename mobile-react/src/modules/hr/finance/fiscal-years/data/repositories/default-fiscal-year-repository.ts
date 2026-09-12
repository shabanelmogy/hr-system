import type { FiscalYearRepository } from '../../domain/repositories/fiscal-year-repository';
import type { FiscalYearRemoteDataSource } from '../remote/fiscal-year-remote-data-source';

export class DefaultFiscalYearRepository implements FiscalYearRepository {
  constructor(private readonly remote: FiscalYearRemoteDataSource) {}
  getPage(query: Parameters<FiscalYearRepository['getPage']>[0]) { return this.remote.getPage(query); }
  getById(id: number) { return this.remote.getById(id); }
  getLookup() { return this.remote.getLookup(); }
  create(request: Parameters<FiscalYearRepository['create']>[0]) { return this.remote.create(request); }
  update(id: number, request: Parameters<FiscalYearRepository['update']>[1], rowVersion: string) { return this.remote.update(id, request, rowVersion); }
  archive(id: number) { return this.remote.archive(id); }
  restore(id: number, rowVersion: string) { return this.remote.restore(id, rowVersion); }
  lifecycle(id: number, rowVersion: string, action: Parameters<FiscalYearRepository['lifecycle']>[2]) { return this.remote.lifecycle(id, rowVersion, action); }
}
