import type { StateRepository } from '../../domain/repositories/state-repository';
import type { StateRemoteDataSource } from '../remote/state-remote-data-source';

export class DefaultStateRepository implements StateRepository {
  constructor(private readonly remote: StateRemoteDataSource) {}

  getPage(query: Parameters<StateRepository['getPage']>[0]) { return this.remote.getPage(query); }
  getLookup(countryId?: number) { return this.remote.getLookup(countryId); }
  getByCountry(countryId: number) { return this.remote.getByCountry(countryId); }
  getById(id: number) { return this.remote.getById(id); }
  getWithDistricts(id: number) { return this.remote.getWithDistricts(id); }
  create(request: Parameters<StateRepository['create']>[0]) { return this.remote.create(request); }
  update(id: number, request: Parameters<StateRepository['update']>[1]) { return this.remote.update(id, request); }
  archive(id: number) { return this.remote.archive(id); }
  restore(id: number) { return this.remote.restore(id); }
  bulkArchive(ids: readonly number[]) { return this.remote.bulkArchive(ids); }
  bulkCreate(requests: Parameters<StateRepository['bulkCreate']>[0]) { return this.remote.bulkCreate(requests); }
}
