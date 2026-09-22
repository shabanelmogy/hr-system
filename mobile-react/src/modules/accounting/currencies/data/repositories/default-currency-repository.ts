import type { CurrencyRepository } from '../../domain/repositories/currency-repository';
import type { CurrencyRemoteDataSource } from '../remote/currency-remote-data-source';

export class DefaultCurrencyRepository implements CurrencyRepository {
  constructor(private readonly remote: CurrencyRemoteDataSource) {}
  getPage(query: Parameters<CurrencyRepository['getPage']>[0]) { return this.remote.getPage(query); }
  getById(id: number) { return this.remote.getById(id); }
  getLookup() { return this.remote.getLookup(); }
  create(request: Parameters<CurrencyRepository['create']>[0]) { return this.remote.create(request); }
  update(id: number, request: Parameters<CurrencyRepository['update']>[1], rowVersion: string) { return this.remote.update(id, request, rowVersion); }
  archive(id: number, rowVersion: string) { return this.remote.archive(id, rowVersion); }
  restore(id: number, rowVersion: string) { return this.remote.restore(id, rowVersion); }
}
